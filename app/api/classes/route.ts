import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connect();
  try {
    // Allow unauthenticated access to /share route
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/classes/share")) {
      // No auth required for share route
      // You may want to add your share logic here if needed
      return NextResponse.json({ message: "Share route - no auth required" });
    }
    // Auth required for all other routes
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let userEmail;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userEmail = decoded.email;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Find user by email to get ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Only fetch classes created by this user
    const classes = await Class.find({ createdBy: user._id }).populate(
      "students"
    );
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
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let userEmail;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userEmail = decoded.email;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find user by email to get ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
      createdBy: user._id, // Use ObjectId
    });

    return NextResponse.json({ classId: newClass._id }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
