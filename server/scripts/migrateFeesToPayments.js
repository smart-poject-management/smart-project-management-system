import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/user.js";

const migrateFeesToPayments = async () => {
  await connectDb();

  const students = await User.find({
    role: "Student",
    fees: { $exists: true, $ne: [] },
  }).select("_id name fees");

  let updatedStudents = 0;
  let migratedFeeEntries = 0;

  for (const student of students) {
    let hasChanges = false;

    student.fees = (student.fees || []).map((fee) => {
      const payments = Array.isArray(fee.payments) ? fee.payments : [];
      const paidAmount = Number(fee.paidAmount || 0);

      if (!payments.length && paidAmount > 0) {
        hasChanges = true;
        migratedFeeEntries += 1;
        return {
          ...fee.toObject(),
          payments: [{ amount: paidAmount, date: new Date() }],
        };
      }

      return fee;
    });

    if (hasChanges) {
      await student.save();
      updatedStudents += 1;
    }
  }

  console.log(`Migration completed.`);
  console.log(`Updated students: ${updatedStudents}`);
  console.log(`Migrated fee entries: ${migratedFeeEntries}`);

  await mongoose.connection.close();
  process.exit(0);
};

migrateFeesToPayments().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
