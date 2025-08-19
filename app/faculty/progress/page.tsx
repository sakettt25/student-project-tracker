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
import { Calendar, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FacultyProgress() {
  const { user, token } = useAuth()
  const [students, setStudents] = useState<any[]>([])
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
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Filter students by name or roll number
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
            <p className="mt-2 text-gray-600">Track the progress of approved and completed projects under your guidance</p>
          </div>

          {/* Search input */}
          <div className="mb-6 max-w-md">
            <Input
              placeholder="Search by student name or roll number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-gray-500">
                {search ? "No students found matching your search." : "No students with approved or completed projects found."}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>Roll Number: {student.rollNumber}</CardDescription>
                      </div>
                      <Badge variant="outline">{student.projects.length} Project(s)</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.projects.map((project: any) => (
                        <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{project.name}</h4>
                            {getStatusBadge(project.status)}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-gray-600">{project.completion}%</span>
                              </div>
                              <Progress value={project.completion} className="h-2" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              Last updated: {project.lastUpdate || "Not updated yet"}
                            </div>

                            {project.submittedDate && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                Submitted: {new Date(project.submittedDate).toLocaleDateString()}
                              </div>
                            )}

                            <div>
                              <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Latest Update
                              </h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border">{project.eodUpdate}</p>
                            </div>

                            {/* Show last 3 updates and "View all" button if more */}
                            <div className="space-y-2">
                              {project.updates?.slice(0, 3).map((update: any, idx: number) => (
                                <div key={update._id || idx} className="bg-white p-2 rounded border">
                                  <p className="text-sm text-gray-800">{update.updateText}</p>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>{new Date(update.date).toLocaleDateString()}</span>
                                    <span>{new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              ))}

                              {project.updates?.length > 3 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setShowAllUpdates({ projectName: project.name, updates: project.updates })}
                                >
                                  View all {project.updates.length} updates
                                </Button>
                              )}

                              {(!project.updates || project.updates.length === 0) && (
                                <div className="text-sm text-gray-500 italic">No progress updates yet</div>
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

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students with Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Under your guidance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p: any) => 
                      p.status === "in_progress" || p.status === "approved"
                    ).length,
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p: any) => 
                      p.status === "completed" || p.completion === 100
                    ).length,
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Successfully finished</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog to show all updates */}
      {showAllUpdates && (
        <Dialog open={!!showAllUpdates} onOpenChange={() => setShowAllUpdates(null)}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                All Updates for "{showAllUpdates.projectName}"
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable updates list */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {showAllUpdates.updates.length > 0 ? (
                showAllUpdates.updates.map((update: any) => (
                  <div
                    key={update._id}
                    className="bg-gray-100 rounded-xl p-4"
                  >
                    <div className="text-base font-medium text-gray-900">{update.updateText}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">No progress updates available</div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowAllUpdates(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
