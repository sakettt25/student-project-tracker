import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ProgressUpdate from "@/lib/models/ProgressUpdate"
import jwt from "jsonwebtoken"

async function verifyToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new Error("No token provided")
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    await connectDB()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 })
    }

    const updates = await ProgressUpdate.find({ projectId }).populate("studentId", "name rollNumber").sort({ date: -1 })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("Get progress updates error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    await connectDB()

    if (user.role !== "student") {
      return NextResponse.json({ error: "Only students can add progress updates" }, { status: 403 })
    }

    const { projectId, updateText, date } = await request.json()

    const newUpdate = new ProgressUpdate({
      projectId,
      studentId: user.userId,
      updateText,
      date: date ? new Date(date) : new Date(),
    })

    await newUpdate.save()
    await newUpdate.populate("studentId", "name rollNumber")

    return NextResponse.json({ update: newUpdate })
  } catch (error) {
    console.error("Create progress update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
