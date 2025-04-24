import mongoose from "mongoose";


const PerformanceIndicatorSchema = new mongoose.Schema({
  label: String, // e.g., "Knowledge"
  scores: [Number],
  status: Boolean,
});


const ClassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference to the Student model
    required: true,
  },
  subject: {
    code: String,
    name: String,
  },
  academicYear: String,
  semester: String,
  department: String,
  batch: String,
  facultyName: String,
  indicator:[String],
  performanceIndicators: [PerformanceIndicatorSchema],
  total: Number,
  remarks: String,
});
// Indexing for faster queries
ClassSchema.index({ student: 1, subject: 1, academicYear: 1, semester: 1, group: 1, experiment: 1 });

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);

