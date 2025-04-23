import mongoose from "mongoose";

const PerformanceIndicatorSchema = new mongoose.Schema({
  CO1: {
    type: [Number],
    default: Array(10).fill(0), // Optional default
    status:false
  },
  CO2: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
  CO3: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
  CO4: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
  CO5: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
  CO6: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
  CO7: {
    type: [Number],
    default: Array(10).fill(0),
    status:false
  },
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
  performanceIndicators: [PerformanceIndicatorSchema],
  total: Number,
  remarks: String,
});
// Indexing for faster queries
ClassSchema.index({ student: 1, subject: 1, academicYear: 1, semester: 1, group: 1, experiment: 1 });

export default mongoose.models.RubricClass || mongoose.model("RubricEval", ClassSchema);

