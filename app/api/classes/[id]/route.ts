import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";
import { Student } from "@/models/Student";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Class ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    await connect();

    // Find the class by ID and populate the students
    const classData = await Class.findById(id).populate({
      path: "students",
      model: Student,
      select: "name sapId rollNo batch", // Only select necessary fields
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Format response with proper typing
    const formattedClass = {
      id: classData._id,
      courseName: classData.courseName,
      courseCode: classData.courseCode,
      year: classData.year,
      semester: classData.semester,
      batch: classData.batch,
      department: classData.department,
      academicYear: classData.academicYear,
      facultyName: classData.facultyName,
      indicators: classData.indicators,
      students: classData.students || [],
      createdAt: classData.createdAt,
    };

    return NextResponse.json(formattedClass);
  } catch (err: any) {
    console.error("Error fetching class:", err);

    // Handle specific error types
    if (err instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to fetch class" },
      { status: 500 }
    );
  }
}
