import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/Project"
import jwt from "jsonwebtoken"

async function verifyToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) throw new Error("No token provided")
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
    return decoded
  } catch {
    throw new Error("Invalid token")
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(req)
    await dbConnect()
    const body = await req.json()
    const projectId = params.id

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only faculty can evaluate
    if (user.role !== "faculty" || project.facultyId.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Save evaluation
    project.evaluation = {
      criteriaScores: body.criteriaScores,
      comments: body.comments,
      recommendations: body.recommendations,
      totalScore: body.totalScore,
      grade: body.grade,
      evaluatedAt: new Date().toISOString(),
    }
    project.status = "evaluated"
    project.score = body.totalScore
    project.grade = body.grade
    project.comments = body.comments
    project.recommendations = body.recommendations

    // Ensure deadline is present before saving
    if (!project.deadline) {
      // Set a default deadline if missing (choose a sensible default or throw an error)
      project.deadline = new Date() // or any default value you want
    }

    await project.save()

    return NextResponse.json({
      ...project.toObject(),
      evaluation: project.evaluation || null,
    })
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}