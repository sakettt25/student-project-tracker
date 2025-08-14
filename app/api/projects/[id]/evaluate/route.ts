import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/Project"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const { id } = params

  try {
    const body = await req.json()
    // You may want to validate body here

    // Update the project with evaluation details
    const updated = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          evaluation: body.criteriaScores,
          score: body.totalScore,
          grade: body.grade,
          comments: body.comments,
          recommendations: body.recommendations,
          status: "evaluated",
        },
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Evaluation submitted",
      grade: updated.grade,
      score: updated.score,
      status: updated.status,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit evaluation" }, { status: 500 })
  }
}