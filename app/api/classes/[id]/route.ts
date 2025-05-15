import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";
import Student from "@/models/Student";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { jwtSecret } from "@/utils/envVariables";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connect();
  try {
    // Allow unauthenticated access to /share route
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/classes/share")) {
      return NextResponse.json({ message: "Share route - no auth required" });
    }

    // Auth required for all other routes
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let userEmail;
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      userEmail = decoded.email;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find user by email to get ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the class by ID
    const { id } = params;
    const classData = await Class.findById(id).populate({
      path: "students",
      select: "name sapId rollNo batch",
    });
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Authorize: Only allow if the logged-in user is the creator
    if (String(classData.createdBy) !== String(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json(
      { error: err.message || "Failed to fetch class" },
      { status: 500 }
    );
  }
}
