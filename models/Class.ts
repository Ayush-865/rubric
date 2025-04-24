import mongoose from "mongoose";

const PerformanceIndicatorSchema = new mongoose.Schema({
  label: String,
  scores: [Number],
  status: Boolean,
});

const ClassSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  facultyName: {
    type: String,
    required: true,
  },
  indicators: {
    type: [String],
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Indexing for faster queries
ClassSchema.index({ courseCode: 1, academicYear: 1, semester: 1, batch: 1 });

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
