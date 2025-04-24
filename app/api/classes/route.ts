import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";

export async function GET(req: Request) {
  await connect();
  try {
    const classes = await Class.find().populate("students");

    // Transform data to match frontend expectations
    const formattedClasses = classes.map((cls) => ({
      id: cls._id,
      courseName: cls.courseName,
      courseCode: cls.courseCode,
      year: cls.year,
      semester: cls.semester,
      batch: cls.batch,
      department: cls.department,
      academicYear: cls.academicYear,
      facultyName: cls.facultyName,
      indicators: cls.indicators,
      students: cls.students?.length || 0,
    }));

    return NextResponse.json(formattedClasses);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connect();
  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      "courseName",
      "courseCode",
      "year",
      "semester",
      "batch",
      "department",
      "academicYear",
      "facultyName",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure indicators array has exactly 5 elements
    if (!Array.isArray(data.indicators) || data.indicators.length !== 5) {
      return NextResponse.json(
        { error: "Exactly 5 performance indicators are required" },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      courseName: data.courseName,
      courseCode: data.courseCode,
      year: data.year,
      semester: data.semester,
      batch: data.batch,
      department: data.department,
      academicYear: data.academicYear,
      facultyName: data.facultyName,
      indicators: data.indicators,
      students: [],
    });

    return NextResponse.json({ classId: newClass._id }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
