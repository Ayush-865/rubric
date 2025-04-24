import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";
import mongoose from "mongoose";

// Define an interface for the marks data
interface MarkUpdate {
  classId: string;
  studentId: string;
  marks: {
    experiments: { [key: string]: { [key: string]: number | null } };
    experimentTotals: { [key: string]: number | null };
    totalMarks: number | null;
  };
}

// Create a model for storing the marks data
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

export async function POST(req: NextRequest) {
  await connect();
  try {
    const data: MarkUpdate = await req.json();

    // Validate the required fields
    if (!data.classId || !data.studentId || !data.marks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the class exists
    const classDoc = await Class.findById(data.classId);
    if (!classDoc) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Prepare data for MongoDB
    const transformedData: {
      experiments: Record<string, Record<string, number>>;
      experimentTotals: Record<string, number>;
      totalMarks: number | null;
    } = {
      experiments: {},
      experimentTotals: {},
      totalMarks: data.marks.totalMarks,
    };

    // Transform experiments data
    for (const [expKey, indicators] of Object.entries(data.marks.experiments)) {
      transformedData.experiments[expKey] = {};
      for (const [indicator, value] of Object.entries(indicators)) {
        if (value !== null) {
          transformedData.experiments[expKey][indicator] = value;
        }
      }
    }

    // Transform experiment totals
    for (const [expKey, value] of Object.entries(data.marks.experimentTotals)) {
      if (value !== null) {
        transformedData.experimentTotals[expKey] = value;
      }
    }

    // Upsert the marks document (update if exists, create if not)
    const result = await Marks.findOneAndUpdate(
      { classId: data.classId, studentId: data.studentId },
      {
        experiments: transformedData.experiments,
        experimentTotals: transformedData.experimentTotals,
        totalMarks: transformedData.totalMarks,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      message: "Marks updated successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error updating marks:", err);

    // Handle specific error types
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Invalid data format", details: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to update marks" },
      { status: 500 }
    );
  }
}

// GET method to fetch marks for a class
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Get class ID from query parameters
    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");

    // Validate required parameters
    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Find the class to verify it exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // If studentId is provided, get marks for a specific student
    const studentId = url.searchParams.get("studentId");

    if (studentId) {
      // Get marks for a specific student in the class
      const marks = await Marks.findOne({ classId, studentId });

      if (!marks) {
        return NextResponse.json(
          { error: "No marks found for this student" },
          { status: 404 }
        );
      }

      return NextResponse.json(marks);
    } else {
      // Get marks for all students in the class
      const marks = await Marks.find({ classId });
      return NextResponse.json(marks);
    }
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json(
      { error: "Failed to fetch marks" },
      { status: 500 }
    );
  }
}
