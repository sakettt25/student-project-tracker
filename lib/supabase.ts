import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  role: "student" | "faculty"
  name: string
  university?: string
  roll_number?: string
  semester?: number
  faculty_id?: string
}

export type Project = {
  id: string
  student_id: string
  faculty_id: string
  name: string
  description: string
  tech_stack: string
  real_life_application: string
  expected_completion_date: string
  status: "pending" | "in_review" | "approved" | "rejected"
  created_at: string
  student?: User
}

export type Feedback = {
  id: string
  project_id: string
  faculty_id: string
  message: string
  created_at: string
  faculty?: User
}

export type ProgressUpdate = {
  id: string
  project_id: string
  student_id: string
  update_text: string
  date: string
  created_at: string
}
