import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Feedback from "@/lib/models/Feedback"
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

    const feedback = await Feedback.find({ projectId }).populate("facultyId", "name email").sort({ createdAt: -1 })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Get feedback error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    await connectDB()

    if (user.role !== "faculty") {
      return NextResponse.json({ error: "Only faculty can provide feedback" }, { status: 403 })
    }

    const { projectId, message } = await request.json()

    const newFeedback = new Feedback({
      projectId,
      facultyId: user.userId,
      message,
    })

    await newFeedback.save()
    await newFeedback.populate("facultyId", "name email")

    return NextResponse.json({ feedback: newFeedback })
  } catch (error) {
    console.error("Create feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
