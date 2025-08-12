import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    let query: Record<string, any> = { role: "student" };
    if (facultyId) {
      query.facultyId = facultyId;
    }
    const students = await User.find(query).select("_id name email rollNumber semester facultyId");
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}