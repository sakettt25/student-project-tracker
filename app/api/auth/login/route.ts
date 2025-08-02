import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import { compare } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    // Log incoming request
    console.log("Login request received for email:", email)

    // Find user
    const user = await User.findOne({ email }).populate("facultyId", "name")
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Compare passwords using bcryptjs
    const isMatch = await compare(password, user.password)
    console.log("Password validation result:", isMatch) // Debug password comparison

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.NEXTAUTH_SECRET!, {
      expiresIn: "7d",
    })

    // Return user data and token
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      university: user.university,
      rollNumber: user.rollNumber,
      semester: user.semester,
      facultyId: user.facultyId?._id,
      facultyName: user.facultyId?.name,
    }

    return NextResponse.json({ user: userData, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
