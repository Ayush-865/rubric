import { NextResponse } from 'next/server';
import connect from '@/utils/db';
import Class from '@/models/Class';

export async function GET(req: Request) {
  await connect();
  const classes = await Class.find().populate('student');
  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  await connect();
  try {
    const data = await req.json();
    const newClass = await Class.create({
      subject: { code: data.courseCode, name: data.courseName },
      academicYear: data.academicYear,
      semester: data.semester,
      department: data.department,
      batch: data.batch,
      facultyName: data.facultyName,
      indicator: data.indicators,
      performanceIndicators: [],
    });
    return NextResponse.json({ classId: newClass._id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}