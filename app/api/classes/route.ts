import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connect();
    const classes = await Class.find().populate("student");
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const body = await req.json();
    const newClass = await Class.create(body);
    return NextResponse.json(newClass);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}