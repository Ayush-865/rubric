import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sapId: {
    type: String,
    required: true,
    unique: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  }
});

export const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
