import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minLength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Student",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    expertise: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Expertise"
    },
    maxStudents: {
      type: Number,
      default: 10,
      min: [1, "min students must be at least 1"],
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("validate", function () {

  if (this.role === "Student") {
    this.expertise = undefined;
    this.assignedStudents = undefined;
    this.maxStudents = undefined;
  }

  if (this.role === "Teacher") {
    this.supervisor = undefined;
    this.project = undefined;
  }

  if (this.role === "Admin") {
    this.expertise = undefined;
    this.assignedStudents = undefined;
    this.supervisor = undefined;
    this.project = undefined;
    this.maxStudents = undefined;
  }
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

userSchema.methods.hasCapacity = function () {
  if (this.role !== "Teacher") return false;
  return this.assignedStudents.length < this.maxStudents;
}

export const User = mongoose.model("User", userSchema);
