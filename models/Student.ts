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
  },
});

// First try to get the existing model to prevent OverwriteModelError
const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
