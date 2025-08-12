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

    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        $set: {
          status,
          updatedAt: new Date()
        },
        $push: {
          feedback: {
            id: new mongoose.Types.ObjectId().toString(),
            message: feedback,
            facultyId,
            facultyName,
            createdAt: new Date(),
            action: status === 'approved' ? 'approve' : 'reject'
          }
        }
      },
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}