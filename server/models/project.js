import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    enum: ["general", "file", "positive"],
    default: "general",
  },
  title: {
    type: String,
    required: [true, "Feedback title is required"],
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, "Title cannot be more than 1000 character"],
  },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"],
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
    maxlength: [200, "Title cannot be more than 200 character"],
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    trim: true,
    maxlength: [2000, "Title cannot be more than 2000 character"],
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected", "completed"],
  },
  files: [
    {
      fileType: {
        type: String,
        required: [true, "File type is required"],
      },
      fileUrl: {
        type: String,
        required: [true, "File URL is required"],
      },
      originalName: {
        type: String,
        required: [true, "Original  name is required"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  feedback: [
    feedbackSchema
  ],
  deadline: {
    type: Date,
  }
}, {
  timestamps: true,
});


//indexing for better query performance
projectSchema.index({ student: 1 });
projectSchema.index({ supervisor: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ deadline: 1 });

export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);