import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/lib/models/Project"
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    await connectDB()

    const { status, progress } = await request.json()
    const projectId = params.id

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check authorization
    if (user.role === "faculty" && project.facultyId.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (user.role === "student" && project.studentId.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update fields based on user role
    if (user.role === "faculty" && status) {
      project.status = status
    }

    if (user.role === "student" && progress !== undefined) {
      project.progress = progress
    }

    await project.save()
    await project.populate("studentId", "name rollNumber email")
    await project.populate("facultyId", "name email")

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
