"use client"

import { useAuth } from "@/lib/auth"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function FacultyDashboard() {
  const { user, token } = useAuth()

  const [stats, setStats] = useState({
    inReview: 0,
    pending: 0,
    approved: 0,
    rejected: 0, // <-- Add rejected
  })
  const [projects, setProjects] = useState([])
  const [facultyDetails, setFacultyDetails] = useState<{ name: string; university: string; email: string } | null>(null)
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [loadingFaculty, setLoadingFaculty] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return
      setLoadingProjects(true)
      try {
        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)

          // Calculate stats
          const inReview = data.projects.filter((p: any) => p.status === "in_review").length
          const pending = data.projects.filter((p: any) => p.status === "pending").length
          const approved = data.projects.filter((p: any) => p.status === "approved").length
          const rejected = data.projects.filter((p: any) => p.status === "rejected").length // <-- Count rejected

          setStats({ inReview, pending, approved, rejected }) // <-- Add rejected
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
      setLoadingProjects(false)
    }

    fetchProjects()
  }, [token])

  useEffect(() => {
    // Fetch faculty details from backend for latest info
    const fetchFacultyDetails = async () => {
      if (!user?.id || !token) return
      setLoadingFaculty(true)
      try {
        const response = await fetch(`/api/users/faculty/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setFacultyDetails({
            name: data.name,
            university: data.university,
            email: data.email,
          })
        }
      } catch (error) {
        console.error("Failed to fetch faculty details:", error)
      }
      setLoadingFaculty(false)
    }
    fetchFacultyDetails()
  }, [user?.id, token])

  useEffect(() => {
    // Fetch students count under this faculty
    const fetchStudentCount = async () => {
      if (!user?.id || !token) return
      setLoadingStudents(true)
      try {
        const response = await fetch(`/api/faculty/${user.id}/students/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStudentCount(data.count)
        }
      } catch (error) {
        console.error("Failed to fetch student count:", error)
      }
      setLoadingStudents(false)
    }
    fetchStudentCount()
  }, [user?.id, token])

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Overview of your projects and students</p>
          </div>

          {/* Faculty Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Faculty Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {loadingFaculty
                    ? <span className="text-gray-400">Loading...</span>
                    : (facultyDetails?.name || <span className="text-gray-400">Not available</span>)}
                </div>
                <div>
                  <span className="font-medium">University:</span>{" "}
                  {loadingFaculty
                    ? <span className="text-gray-400">Loading...</span>
                    : (facultyDetails?.university || <span className="text-gray-400">Not available</span>)}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {loadingFaculty
                    ? <span className="text-gray-400">Loading...</span>
                    : (facultyDetails?.email || <span className="text-gray-400">Not available</span>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Total Students</span>
                  <Badge variant="secondary">
                    {loadingStudents
                      ? <span className="text-gray-400">Loading...</span>
                      : studentCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Projects</span>
                  <Badge variant="secondary">
                    {loadingProjects
                      ? <span className="text-gray-400">Loading...</span>
                      : stats.inReview + stats.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed Projects</span>
                  <Badge variant="secondary">
                    {loadingProjects
                      ? <span className="text-gray-400">Loading...</span>
                      : stats.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects in Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loadingProjects
                    ? <span className="text-gray-400">Loading...</span>
                    : stats.inReview}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting your feedback</p>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {loadingProjects
                    ? <span className="text-gray-400">Loading...</span>
                    : stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loadingProjects
                    ? <span className="text-gray-400">Loading...</span>
                    : stats.approved}
                </div>
                <p className="text-xs text-muted-foreground">Completed successfully</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Rejected</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loadingProjects
                    ? <span className="text-gray-400">Loading...</span>
                    : stats.rejected}
                </div>
                <p className="text-xs text-muted-foreground">Rejected by you</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
