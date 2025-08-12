import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid faculty ID' },
        { status: 400 }
      )
    }

    // Count students with facultyId matching params.id
    const count = await User.countDocuments({
      facultyId: params.id,
      role: 'student',
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching student count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}