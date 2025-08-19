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
      if (body.evaluation) {
        // Merge all evaluation-related fields into one object
        project.evaluation = {
          ...body.evaluation,
          comments: body.comments ?? body.evaluation.comments,
          recommendations: body.recommendations ?? body.evaluation.recommendations,
          totalScore: body.score ?? body.evaluation.totalScore,
          grade: body.grade ?? body.evaluation.grade,
          evaluatedAt: new Date().toISOString(),
        }
        // Optionally, also update top-level fields for backward compatibility
        project.score = body.score ?? project.score
        project.grade = body.grade ?? project.grade
        project.comments = body.comments ?? project.comments
        project.recommendations = body.recommendations ?? project.recommendations
      }
      if (body.status) project.status = body.status
    }

    if (user.role === "student" && body.progress !== undefined) {
      project.progress = body.progress
    }

    await project.save()
    await project.populate("studentId", "name rollNumber email")
    await project.populate("facultyId", "name email")

    // Return the same structure as GET
    return NextResponse.json({
      ...project.toObject(),
      evaluation: project.evaluation || null,
    })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id
  await dbConnect()
  const project = await Project.findById(projectId)
  if (!project) return new Response("Not found", { status: 404 })

  // Ensure evaluation is included in the response
  return Response.json({
    ...project.toObject(),
    evaluation: project.evaluation || null,
  })
}
