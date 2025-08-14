import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
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
    await dbConnect()

    const body = await request.json()
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
    if (user.role === "faculty") {
      if (body.status) project.status = body.status
      if (body.evaluation) project.evaluation = body.evaluation
      if (body.score !== undefined) project.score = body.score
      if (body.grade) project.grade = body.grade
      if (body.comments) project.comments = body.comments
      if (body.recommendations) project.recommendations = body.recommendations
    }

    if (user.role === "student" && body.progress !== undefined) {
      project.progress = body.progress
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const { id } = params

  try {
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
