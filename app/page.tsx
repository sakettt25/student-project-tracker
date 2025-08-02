"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "faculty") {
        router.push("/faculty/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Project Tracker</h1>
          <p className="text-xl text-gray-600 mb-8">Streamline project management between students and faculty</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Link href="/auth/login">
            <Button className="w-full" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full bg-transparent" size="lg">
              Register
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">For Faculty</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Review and approve student projects</li>
              <li>• Track student progress</li>
              <li>• Provide feedback and evaluations</li>
              <li>• Monitor project statistics</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-green-600">For Students</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Submit new projects</li>
              <li>• Track project status</li>
              <li>• Receive faculty feedback</li>
              <li>• Update project progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
