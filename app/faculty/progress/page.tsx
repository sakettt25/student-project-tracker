"use client"

import { useEffect, useState } from "react"
import { FacultyNavbar } from "@/components/faculty-navbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, TrendingUp, User, Search, FileText, BarChart3, Target } from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProgressUpdate {
  _id?: string
  updateText: string
  date: string
}

interface Project {
  id: string
  name: string
  status: string
  completion: number
  lastUpdate: string
  eodUpdate: string
  updates: ProgressUpdate[]
  submittedDate?: string
  expectedCompletion?: string
}

interface Student {
  id: string
  name: string
  rollNumber: string
  projects: Project[]
}

export default function FacultyProgress() {
  const { user, token } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllUpdates, setShowAllUpdates] = useState<{ projectName: string, updates: any[] } | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchStudentsWithProjects = async () => {
      if (!token || !user?.id) return
      setLoading(true)
      try {
        // Fetch all projects assigned to this faculty
        const response = await fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        const projects = data.projects || []

        console.log("Fetched projects:", projects)

        // Filter projects that are approved or completed (not rejected or pending)
        const approvedProjects = projects.filter((project: any) => 
          project.status === "approved" || project.status === "completed" || 
          (project.progress && project.progress > 0) // Include projects with progress
        )

        console.log("Approved/completed projects:", approvedProjects)

        // Group projects by student
        const studentProjectMap = new Map()

        for (const project of approvedProjects) {
          const studentId = project.studentId
          const studentName = project.studentName || "Unknown Student"
          const studentRoll = project.studentRoll || "Unknown Roll"

          if (!studentProjectMap.has(studentId)) {
            studentProjectMap.set(studentId, {
              id: studentId,
              name: studentName,
              rollNumber: studentRoll,
              projects: []
            })
          }

          // Fetch progress updates for this project
          try {
            const updatesResponse = await fetch(`/api/progress-updates?projectId=${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            
            let updates = []
            if (updatesResponse.ok) {
              const updatesData = await updatesResponse.json()
              updates = updatesData.updates || []
            }

            const latestUpdate = updates[0] || null
            const progress = project.progress || 0

            studentProjectMap.get(studentId).projects.push({
              id: project._id as string,
              name: (project.name || project.project) as string,
              status: progress === 100 ? "completed" : (project.status === "approved" ? "in_progress" : project.status),
              completion: progress as number,
              lastUpdate: latestUpdate?.date ? new Date(latestUpdate.date).toLocaleDateString() : "",
              eodUpdate: latestUpdate?.updateText || "No updates yet",
              updates: (updates as ProgressUpdate[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // Sort by date desc
              submittedDate: project.submittedDate,
              expectedCompletion: project.expectedCompletionDate
            } as Project)
          } catch (error) {
            console.error(`Error fetching updates for project ${project._id}:`, error)
            // Add project without updates if fetch fails
            studentProjectMap.get(studentId).projects.push({
              id: project._id,
              name: project.name || project.project,
              status: project.progress === 100 ? "completed" : "in_progress",
              completion: project.progress || 0,
              lastUpdate: "",
              eodUpdate: "No updates yet",
              updates: [],
              submittedDate: project.submittedDate,
              expectedCompletion: project.expectedCompletionDate
            })
          }
        }

        // Convert map to array and filter out students with no projects
        const studentsArray = Array.from(studentProjectMap.values()).filter(student => 
          student.projects.length > 0
        )

        console.log("Final students array:", studentsArray)
        setStudents(studentsArray)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
      setLoading(false)
    }

    fetchStudentsWithProjects()
  }, [token, user?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      case "in_progress":
        return <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-sm">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      case "approved":
        return <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      default:
        return <Badge variant="secondary" className="shadow-sm">{status}</Badge>
    }
  }

  const getProgressColor = (completion: number) => {
    if (completion >= 80) return "bg-gradient-to-r from-emerald-500 to-green-500"
    if (completion >= 50) return "bg-gradient-to-r from-blue-500 to-indigo-500"
    if (completion >= 25) return "bg-gradient-to-r from-amber-500 to-orange-500"
    return "bg-gradient-to-r from-red-500 to-rose-500"
  }

  // Filter students by name or roll number
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading progress data...</p>
        </div>
      </div>
    )
  }

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
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Student Progress
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Track the progress of approved and completed projects under your guidance</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
                  placeholder="Search by student name or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Students with Projects</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">{students.length}</div>
                <p className="text-xs text-blue-700 font-medium">Under your guidance</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Projects</CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p: any) => 
                      p.status === "in_progress" || p.status === "approved"
                    ).length,
                    0,
                  )}
                </div>
                <p className="text-xs text-amber-700 font-medium">Currently in progress</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Completed Projects</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p: any) => 
                      p.status === "completed" || p.completion === 100
                    ).length,
                    0,
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-medium">Successfully finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Students List */}
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {search ? "No students found" : "No students with projects"}
                  </h3>
                  <p className="text-gray-500">
                    {search ? "Try adjusting your search criteria." : "Students with approved or completed projects will appear here."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <Card key={student.id} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-900">{student.name}</CardTitle>
                          <CardDescription className="text-gray-600 font-medium">Roll Number: {student.rollNumber}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white shadow-sm">
                        <FileText className="h-3 w-3 mr-1" />
                        {student.projects.length} Project(s)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {student.projects.map((project: Project) => (
                        <div key={project.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Target className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-lg text-gray-900">{project.name}</h4>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Progress</span>
                                <span className="text-sm font-bold text-gray-900">{project.completion}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${getProgressColor(project.completion)}`}
                                  style={{ width: `${project.completion}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Last Updated</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {project.lastUpdate || "Not updated yet"}
                                </p>
                              </div>

                              {project.submittedDate && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Submitted</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {new Date(project.submittedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4" />
                                Latest Update
                              </h5>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {project.eodUpdate}
                              </p>
                            </div>

                            {/* Progress Updates */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                                <BarChart3 className="h-4 w-4" />
                                Recent Updates
                              </h5>
                              
                              {(!project.updates || project.updates.length === 0) ? (
                                <div className="text-center py-6 text-gray-500">
                                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">No progress updates yet</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {project.updates.slice(0, 3).map((update: ProgressUpdate, idx: number) => (
                                    <div key={update._id || idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                                      <p className="text-sm text-gray-800 mb-2">{update.updateText}</p>
                                      <div className="flex justify-between text-xs text-gray-600">
                                        <span className="font-medium">
                                          {new Date(update.date).toLocaleDateString()}
                                        </span>
                                        <span>
                                          {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                  ))}

                                  {project.updates.length > 3 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-3 bg-white hover:bg-gray-50 shadow-sm"
                                      onClick={() => setShowAllUpdates({ projectName: project.name, updates: project.updates })}
                                    >
                                      View all {project.updates.length} updates
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog to show all updates */}
      {showAllUpdates && (
        <Dialog open={!!showAllUpdates} onOpenChange={() => setShowAllUpdates(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                All Updates for "{showAllUpdates.projectName}"
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-4 py-4">
                {showAllUpdates.updates.length > 0 ? (
                  showAllUpdates.updates.map((update: ProgressUpdate, index: number) => (
                    <div
                      key={update._id || index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Update #{showAllUpdates.updates.length - index}
                        </Badge>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{update.updateText}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No progress updates available</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowAllUpdates(null)} className="shadow-sm">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
