import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  try {
    // Find students where facultyId matches params.id
    const students = await User.find({ role: "student", facultyId: params.id }).select("name rollNumber email _id")
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}