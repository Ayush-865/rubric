import mongoose from "mongoose";

const MarksSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  experiments: {
    type: Map,
    of: {
      type: Map,
      of: Number,
    },
  },
  experimentTotals: {
    type: Map,
    of: Number,
  },
  totalMarks: Number,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure uniqueness for class-student combination
MarksSchema.index({ classId: 1, studentId: 1 }, { unique: true });

// Get or create the model
const Marks = mongoose.models.Marks || mongoose.model("Marks", MarksSchema);

export default Marks;
