import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const userData = await request.json()
    console.log("Received userData:", userData); // Keep this for now, remove after fix

    // Explicitly check for rollNumber if role is student
    if (userData.role === "student" && (!userData.roll_number || userData.roll_number.trim() === "")) {
      return NextResponse.json({ error: "Roll number is required for students" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // For students, find a faculty member to assign
    let facultyId = null
    if (userData.role === "student") {
      const faculty = await User.findOne({ role: "faculty" })
      if (faculty) {
        facultyId = faculty._id
      }
    }

    // Create new user
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      name: userData.name,
      university: userData.university,
      rollNumber: userData.roll_number, // Changed from userData.rollNumber to userData.roll_number
      semester: userData.semester,
      facultyId: facultyId,
    })

    await newUser.save()

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" },
    )

    // Return user data and token
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      university: newUser.university,
      rollNumber: newUser.roll_number, // Changed from newUser.rollNumber to newUser.roll_number
      semester: newUser.semester,
      facultyId: newUser.facultyId,
    }

    return NextResponse.json({ user: userResponse, token })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
