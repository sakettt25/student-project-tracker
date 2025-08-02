import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/lib/models/Project"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

// Middleware to verify JWT token
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

    let projects
    if (user.role === "faculty") {
      // Faculty can see projects assigned to them
      projects = await Project.find({ facultyId: user.userId })
        .populate("studentId", "name rollNumber email")
        .populate("facultyId", "name email")
        .sort({ createdAt: -1 })
    } else {
      // Students can see their own projects
      projects = await Project.find({ studentId: user.userId })
        .populate("studentId", "name rollNumber email")
        .populate("facultyId", "name email")
        .sort({ createdAt: -1 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    await connectDB()

    if (user.role !== "student") {
      return NextResponse.json({ error: "Only students can create projects" }, { status: 403 })
    }

    const projectData = await request.json()

    // Get student's faculty
    const student = await User.findById(user.userId)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const newProject = new Project({
      studentId: user.userId,
      facultyId: student.facultyId,
      name: projectData.name,
      description: projectData.description,
      techStack: projectData.techStack,
      realLifeApplication: projectData.realLifeApplication,
      expectedCompletionDate: new Date(projectData.expectedCompletionDate),
      status: "pending",
    })

    await newProject.save()
    await newProject.populate("studentId", "name rollNumber email")
    await newProject.populate("facultyId", "name email")

    return NextResponse.json({ project: newProject })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
