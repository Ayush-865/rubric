import { NextResponse } from 'next/server';
import connect from '@/utils/db';
import { Student } from '@/models/Student';
import csv from 'csvtojson';

export async function POST(req: Request) {
  await connect();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('classId') as string;

    if (!file || !classId) {
      return NextResponse.json({ error: 'Missing file or classId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonArray = await csv().fromString(buffer.toString());

    interface CsvStudent {
      Name: string;
      'SAP ID': string;
      'Roll Number': string;
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
      sapId: item['SAP ID'],
      rollNo: item['Roll Number'],
      batch: item.Batch || '',
    }));

    const created = await Student.insertMany(students, { ordered: false });
    // Optionally link students to class by updating Class.student array if schema allows
    return NextResponse.json({ insertedCount: created.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
