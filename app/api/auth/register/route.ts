import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb"; // adjust if needed
import { jwtSecret } from "@/utils/envVariables";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // Insert user and get insertedId
    const result = await db.collection("users").insertOne(newUser);

    // Generate JWT token for the new user
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      { token, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
