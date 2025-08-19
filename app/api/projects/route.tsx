import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/Project"
import User from "@/lib/models/User"

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
    await dbConnect()

    let projects
    if (user.role === "faculty") {
      // Faculty can see projects assigned to them
      projects = await Project.find({ facultyId: user.userId })
        .populate("studentId", "name rollNumber semester email")
        .populate("facultyId", "name email")
        .sort({ createdAt: -1 })
    } else if (user.role === "student") {
      // Students can see their own projects
      projects = await Project.find({ studentId: user.userId })
        .populate("studentId", "name rollNumber semester email")
        .populate("facultyId", "name email")
        .sort({ createdAt: -1 })
    } else {
      // Admin can see all projects
      projects = await Project.find({})
        .populate("studentId", "name rollNumber semester email")
        .populate("facultyId", "name email")
        .sort({ createdAt: -1 })
    }

    // Map projects to include studentName, studentRoll, studentSemester, project (title)
    const mappedProjects = projects.map((proj: any) => ({
      _id: proj._id,
      studentId: proj.studentId?._id,
      studentName: proj.studentId?.name || "",
      studentRoll: proj.studentId?.rollNumber || "",
      studentSemester: proj.studentId?.semester || "",
      project: proj.name || proj.project || "",
      name: proj.name || proj.project || "",
      status: proj.status,
      description: proj.description,
      techStack: proj.techStack,
      realLifeApplication: proj.realLifeApplication,
      expectedCompletion: proj.expectedCompletionDate || proj.expectedCompletion || "",
      expectedCompletionDate: proj.expectedCompletionDate || proj.expectedCompletion || "",
      submittedDate: proj.submittedDate || proj.createdAt,
      feedback: proj.feedback || [],
      facultyId: proj.facultyId?._id,
      facultyName: proj.facultyId?.name || "",
      facultyEmail: proj.facultyId?.email || "",
      progress: proj.progress || 0,
      score: proj.score,
      grade: proj.grade,
      comments: proj.comments,
      recommendations: proj.recommendations,
      evaluation: proj.evaluation || null,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
    }))

    console.log("Mapped projects for", user.role, ":", mappedProjects.length)
    return NextResponse.json({ projects: mappedProjects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    await dbConnect()

    // Ensure only students can create projects
    if (user.role !== "student") {
      return NextResponse.json({ message: "Only students can submit projects" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, techStack, realLifeApplication, expectedCompletionDate } = body

    // Validate required fields
    if (!name || !description || !techStack || !realLifeApplication) {
      return NextResponse.json({ 
        message: "All fields are required" 
      }, { status: 400 })
    }

    // Get student's assigned faculty first, fallback to any faculty
    const student = await User.findById(user.userId)
    let assignedFaculty = null
    
    if (student?.facultyId) {
      assignedFaculty = await User.findById(student.facultyId)
    }
    
    // If no assigned faculty, find any available faculty
    if (!assignedFaculty) {
      assignedFaculty = await User.findOne({ role: "faculty" })
    }

    const project = new Project({
      name,
      description,
      techStack,
      realLifeApplication,
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      studentId: user.userId,
      facultyId: assignedFaculty?._id, // Assign to student's faculty or default faculty
      status: "pending",
      submittedDate: new Date(),
    })

    await project.save()

    // Populate the project with student and faculty details for response
    await project.populate("studentId", "name email rollNumber semester")
    if (project.facultyId) {
      await project.populate("facultyId", "name email")
    }

    // Return in the same format as GET
    const mappedProject = {
      _id: project._id,
      studentId: project.studentId?._id,
      studentName: project.studentId?.name || "",
      studentRoll: project.studentId?.rollNumber || "",
      studentSemester: project.studentId?.semester || "",
      project: project.name,
      name: project.name,
      status: project.status,
      description: project.description,
      techStack: project.techStack,
      realLifeApplication: project.realLifeApplication,
      expectedCompletion: project.expectedCompletionDate,
      expectedCompletionDate: project.expectedCompletionDate,
      submittedDate: project.submittedDate,
      feedback: project.feedback || [],
      facultyId: project.facultyId?._id,
      facultyName: project.facultyId?.name || "",
      facultyEmail: project.facultyId?.email || "",
      progress: project.progress || 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    return NextResponse.json({
      message: "Project submitted successfully",
      project: mappedProject,
    })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    )
  }
}