import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { Student } from "@/models/Student";
import csvParser from "csv-parser";
import { Readable } from "stream";

export async function GET() {
  try {
    await connect();
    const students = await Student.find();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connect();

    // Check if the request is a CSV upload
    const contentType = req.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const students: any[] = [];
      const buffer = Buffer.from(await file.arrayBuffer()); // Convert file to buffer
      const stream = Readable.from(buffer); // Create a readable stream from the buffer

      await new Promise((resolve, reject) => {
        interface StudentRow {
          name: string;
          sapId: string;
          rollNo: string;
          batch: string;
        }

        stream
          .pipe(csvParser())
          .on("data", (row: Record<string, string>) => {
            // Validate each row
            if (row.name && row.sapId && row.rollNo && row.batch) {
              const student: StudentRow = {
                name: row.name,
                sapId: row.sapId,
                rollNo: row.rollNo,
                batch: row.batch,
              };
              students.push(student);
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });

      // Insert students into the database
      const insertedStudents = await Student.insertMany(students);
      return NextResponse.json(insertedStudents);
    }

    // Handle single student creation
    const body = await req.json();
    if (!body.name || !body.sapId || !body.rollNo || !body.batch) {
      return NextResponse.json(
        { error: "Missing required fields: name, sapId, rollNo, or batch" },
        { status: 400 }
      );
    }

    const newStudent = await Student.create(body);
    return NextResponse.json(newStudent);
  } catch (error) {
    console.error("Error handling student POST request:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}