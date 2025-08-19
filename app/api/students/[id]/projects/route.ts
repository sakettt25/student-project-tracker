import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/lib/models/Project"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  try {
    // Find projects where studentId matches params.id
    const projects = await Project.find({ studentId: params.id })
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}