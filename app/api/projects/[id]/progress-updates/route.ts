import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ProgressUpdate from "@/lib/models/ProgressUpdate"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  try {
    const { updateText, date, completion, studentId } = await request.json()
    if (!updateText || !studentId) {
      return NextResponse.json({ error: "updateText and studentId are required" }, { status: 400 })
    }

    const newUpdate = await ProgressUpdate.create({
      projectId: params.id,
      updateText,
      date: date || new Date(),
      completion: typeof completion === "number" ? completion : undefined,
      studentId,
    })

    return NextResponse.json(newUpdate, { status: 201 })
  } catch (error) {
    console.error("ProgressUpdate POST error:", error)
    return NextResponse.json({ error: "Failed to submit progress update" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  try {
    const updates = await ProgressUpdate.find({ projectId: params.id }).sort({ date: -1 })
    return NextResponse.json(updates)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress updates" }, { status: 500 })
  }
}

// ProgressUpdate model (for reference, usually in a separate file)
import mongoose from "mongoose"

const ProgressUpdateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  updateText: { type: String, required: true },
  date: { type: Date, default: Date.now },
  completion: { type: Number }, // optional
  studentId: { type: String, required: true },
})

export default mongoose.models.ProgressUpdate ||
  mongoose.model("ProgressUpdate", ProgressUpdateSchema)