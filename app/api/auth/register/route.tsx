import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const userData = await request.json()
    console.log("Received userData:", userData)

    if (userData.role === "student") {
      if (!userData.rollNumber || userData.rollNumber.trim() === "") {
        return NextResponse.json({ error: "Roll number is required for students" }, { status: 400 })
      }
      if (!userData.facultyId) {
        return NextResponse.json({ error: "Faculty selection is required for students" }, { status: 400 })
      }
      // Verify if selected faculty exists
      const faculty = await User.findOne({ _id: userData.facultyId, role: "faculty" })
      if (!faculty) {
        return NextResponse.json({ error: "Selected faculty not found" }, { status: 400 })
      }
    }

    // Check existing user
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user with facultyId
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      name: userData.name,
      university: userData.university,
      rollNumber: userData.rollNumber,
      semester: userData.semester,
      facultyId: userData.role === "student" ? userData.facultyId : undefined
    })

    await newUser.save()

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        university: newUser.university,
        rollNumber: newUser.rollNumber,
        semester: newUser.semester,
        facultyId: newUser.facultyId
      },
      token
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
