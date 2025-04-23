import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Student",
  },
  branch: {
    type: String,
  },
});
