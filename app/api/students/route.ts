import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { Student } from "@/models/Student";
import Class from "@/models/Class";
import csv from "csvtojson";

export async function POST(req: Request) {
  await connect();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const classId = formData.get("classId") as string;

    if (!file || !classId) {
      return NextResponse.json(
        { error: "Missing file or classId" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonArray = await csv().fromString(buffer.toString());

    interface CsvStudent {
      Name: string;
      "SAP ID": string;
      "Roll Number": string;
      Batch?: string;
    }

    interface StudentData {
      name: string;
      sapId: string;
      rollNo: string;
      batch: string;
    }

    const students: StudentData[] = jsonArray.map((item: CsvStudent) => ({
      name: item.Name,
      sapId: item["SAP ID"],
      rollNo: item["Roll Number"],
      batch: item.Batch || classDoc.batch, // Use class batch if not specified
    }));

    // Array to store student IDs
    const studentIds = [];

    // Insert students one by one to handle unique constraint errors better
    for (const studentData of students) {
      try {
        // Try to find existing student by SAP ID
        let student = await Student.findOne({ sapId: studentData.sapId });

        // If no student found, create a new one
        if (!student) {
          student = await Student.create(studentData);
        }

        // Add student ID to array
        studentIds.push(student._id);
      } catch (error) {
        console.error(`Error processing student ${studentData.sapId}:`, error);
        // Continue with next student
      }
    }

    // Update class with student IDs
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: { $each: studentIds } },
    });

    return NextResponse.json({
      message: "Students uploaded and linked to class successfully",
      insertedCount: studentIds.length,
    });
  } catch (err: any) {
    console.error("Error uploading students:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
