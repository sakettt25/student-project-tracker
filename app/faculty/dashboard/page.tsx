"use client"

import { useAuth } from "@/lib/auth"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, AlertCircle, Users, TrendingUp, FileText } from "lucide-react"
import { useEffect, useState } from "react"

export default function FacultyDashboard() {
  const { user, token } = useAuth()

  const [stats, setStats] = useState({
    inReview: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
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
          const rejected = data.projects.filter((p: any) => p.status === "rejected").length

          setStats({ inReview, pending, approved, rejected })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <FacultyNavbar />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Faculty Dashboard
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Welcome back! Here's your project overview</p>
              </div>
            </div>
          </div>

          {/* Faculty Details & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Faculty Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Name</span>
                  <span className="text-gray-900 font-semibold">
                    {loadingFaculty
                      ? <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      : (facultyDetails?.name || <span className="text-gray-400">Not available</span>)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">University</span>
                  <span className="text-gray-900 font-semibold">
                    {loadingFaculty
                      ? <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      : (facultyDetails?.university || <span className="text-gray-400">Not available</span>)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Email</span>
                  <span className="text-gray-900 font-semibold">
                    {loadingFaculty
                      ? <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      : (facultyDetails?.email || <span className="text-gray-400">Not available</span>)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Quick Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Total Students</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold">
                    {loadingStudents
                      ? <div className="h-4 w-8 bg-blue-200 rounded animate-pulse"></div>
                      : studentCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-gray-700">Active Projects</span>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1 text-sm font-semibold">
                    {loadingProjects
                      ? <div className="h-4 w-8 bg-amber-200 rounded animate-pulse"></div>
                      : stats.inReview + stats.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-gray-700">Completed Projects</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold">
                    {loadingProjects
                      ? <div className="h-4 w-8 bg-emerald-200 rounded animate-pulse"></div>
                      : stats.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Stats */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Project Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Projects Pending</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {loadingProjects
                    ? <div className="h-8 w-12 bg-yellow-200 rounded animate-pulse"></div>
                    : stats.pending}
                </div>
                <p className="text-xs text-yellow-700 font-medium">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Projects Approved</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {loadingProjects
                    ? <div className="h-8 w-12 bg-green-200 rounded animate-pulse"></div>
                    : stats.approved}
                </div>
                <p className="text-xs text-green-700 font-medium">Completed successfully</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Projects Rejected</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {loadingProjects
                    ? <div className="h-8 w-12 bg-red-200 rounded animate-pulse"></div>
                    : stats.rejected}
                </div>
                <p className="text-xs text-red-700 font-medium">Rejected by you</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Projects</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {loadingProjects
                    ? <div className="h-8 w-12 bg-purple-200 rounded animate-pulse"></div>
                    : projects.length}
                </div>
                <p className="text-xs text-purple-700 font-medium">All time projects</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
