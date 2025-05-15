import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Student from "@/models/Student";
import Class from "@/models/Class";
import csv from "csvtojson";
import jwt from "jsonwebtoken";
import { jwtSecret } from "@/utils/envVariables";

export async function POST(req: Request) {
  await connect();

  // --- AUTH CHECK ---
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, jwtSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

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
    const fileContent = buffer.toString();

    // Validate that the CSV isn't empty
    if (!fileContent.trim()) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Process CSV to JSON
    let jsonArray;
    try {
      jsonArray = await csv().fromString(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid CSV format" },
        { status: 400 }
      );
    }

    // Validate the CSV has data
    if (!jsonArray || jsonArray.length === 0) {
      return NextResponse.json(
        { error: "No student records found in CSV" },
        { status: 400 }
      );
    }

    // Get first row to check headers
    const firstRow = jsonArray[0];
    const headers = Object.keys(firstRow);

    // Normalize header keys for case-insensitive matching
    const normalizedHeaders: Record<string, string> = {};
    headers.forEach((header) => {
      normalizedHeaders[header.toLowerCase().replace(/\s+/g, "")] = header;
    });

    // Define required fields and their possible matches
    const requiredFields = [
      { field: "name", matches: ["name", "studentname", "fullname"] },
      {
        field: "sapId",
        matches: ["sapid", "sap", "sapnumber", "sap id", "sapno"],
      },
      {
        field: "rollNo",
        matches: [
          "rollno",
          "roll",
          "rollnumber",
          "roll no",
          "roll number",
          "studentid",
        ],
      },
    ];

    // Map the actual CSV headers to our expected fields
    const fieldMappings: Record<string, string> = {};

    for (const { field, matches } of requiredFields) {
      const matchedHeader = matches.find((match) =>
        Object.keys(normalizedHeaders).includes(
          match.toLowerCase().replace(/\s+/g, "")
        )
      );

      if (matchedHeader) {
        fieldMappings[field] =
          normalizedHeaders[matchedHeader.toLowerCase().replace(/\s+/g, "")];
      } else {
        return NextResponse.json(
          { error: `Missing required field in CSV: ${field}` },
          { status: 400 }
        );
      }
    }

    // Now map the CSV data to our expected format
    const students = jsonArray.map((item) => {
      const studentData = {
        name: item[fieldMappings.name] || "",
        sapId: item[fieldMappings.sapId] || "",
        rollNo: item[fieldMappings.rollNo] || "",
        batch: item[normalizedHeaders["batch"]] || classDoc.batch,
      };

      // Validate required fields
      if (!studentData.name || !studentData.sapId || !studentData.rollNo) {
        throw new Error(`Invalid student data: ${JSON.stringify(studentData)}`);
      }

      return studentData;
    });

    // Array to store student IDs
    const studentIds = [];
    const errors = [];

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
      } catch (error: any) {
        console.error(`Error processing student ${studentData.sapId}:`, error);
        errors.push({
          student: studentData,
          error: error.message || "Unknown error",
        });
        // Continue with next student
      }
    }

    // Update class with student IDs
    if (studentIds.length > 0) {
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: { $each: studentIds } },
      });
    }

    return NextResponse.json({
      message: "Students uploaded and linked to class successfully",
      insertedCount: studentIds.length,
      totalRows: students.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Error uploading students:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
