import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  try {
    // Only fetch users with role 'student'
    const student = await User.findOne({ _id: params.id, role: "student" })
      .select("-password") // Exclude sensitive fields
      .lean()
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 })
  }
}