import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Project from "@/lib/models/Project"
import mongoose from "mongoose"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    // Validate the ID
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const { status, feedback, facultyId, facultyName } = await request.json()

    const project = await Project.findById(params.id)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    project.status = status
    project.feedback = project.feedback || []
    project.feedback.push({
      message: feedback,
      facultyId,
      facultyName,
      createdAt: new Date(),
      action: status === "approved" ? "approve" : "reject"
    })

    await project.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}