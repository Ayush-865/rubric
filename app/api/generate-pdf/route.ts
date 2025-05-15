import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Marks from "@/models/Marks";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Get SAP ID and Class ID from query parameters
    const url = new URL(request.url);
    const sapId = url.searchParams.get("sapId");
    const classId = url.searchParams.get("classId");

    if (!sapId) {
      return NextResponse.json(
        { error: "SAP ID is required" },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Find the student by SAP ID
    const student = await Student.findOne({ sapId });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Find the specific class by ID
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Verify that the student is in this class
    const isStudentInClass = classDoc.students.some(
      (studentId: any) => studentId.toString() === student._id.toString()
    );

    if (!isStudentInClass) {
      return NextResponse.json(
        { error: "Student is not enrolled in this class" },
        { status: 404 }
      );
    } // Get marks for this student in this class using our imported Marks model
    const marks = await Marks.findOne({
      classId: classDoc._id,
      studentId: student._id,
    });

    // Process the marks data to ensure it's in the correct format
    let processedExperiments: Record<string, any> = {};
    let experimentTotals: Record<string, any> = {};

    if (marks && marks.experiments) {
      // Convert Map to regular object if needed
      const experiments =
        marks.experiments instanceof Map
          ? Object.fromEntries(marks.experiments)
          : marks.experiments;

      // Process each experiment
      for (const [expKey, indicators] of Object.entries(experiments)) {
        // Convert nested Map to object if needed
        processedExperiments[expKey] =
          indicators instanceof Map
            ? Object.fromEntries(indicators)
            : indicators;
      }

      // Process experiment totals
      experimentTotals =
        marks.experimentTotals instanceof Map
          ? Object.fromEntries(marks.experimentTotals)
          : marks.experimentTotals || {};
    }

    // Get all raw data without processing it
    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          sapId: student.sapId,
          rollNo: student.rollNo,
          batch: student.batch,
        },
        class: {
          id: classDoc._id,
          courseName: classDoc.courseName,
          courseCode: classDoc.courseCode,
          year: classDoc.year,
          semester: classDoc.semester,
          batch: classDoc.batch,
          department: classDoc.department,
          academicYear: classDoc.academicYear,
          facultyName: classDoc.facultyName,
          indicators: classDoc.indicators,
        },
        marks: marks
          ? {
              experiments: processedExperiments,
              experimentTotals: experimentTotals,
              totalMarks: marks.totalMarks || null,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching student data:", error);

    // Enhanced error logging for debugging
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Mongoose validation error:", error.errors);
      return NextResponse.json(
        { error: "Invalid data format: " + error.message },
        { status: 400 }
      );
    }

    if (error.name === "CastError") {
      console.error("Cast error (probably invalid ID):", error);
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Return more specific error message when possible
    const errorMessage = error.message || "Failed to fetch student data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
