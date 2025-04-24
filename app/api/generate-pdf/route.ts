import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import { Student } from "@/models/Student";
import Class from "@/models/Class";
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
    }

    // Get marks for this student in this class
    const Marks =
      mongoose.models.Marks || mongoose.model("Marks", new mongoose.Schema({}));
    const marks = await Marks.findOne({
      classId: classDoc._id,
      studentId: student._id,
    });

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
              rawData: marks, // Include the full marks document
              experiments: marks.experiments || {},
              experimentTotals: marks.experimentTotals || {},
              totalMarks: marks.totalMarks || null,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching student data:", error);
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}
