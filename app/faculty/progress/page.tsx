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
        // 1. Fetch students under this faculty
        const resStudents = await fetch(`/api/faculty/${user.id}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const studentsData = await resStudents.json()

        // 2. For each student, fetch their projects
        const studentsWithProjects = await Promise.all(
          studentsData.map(async (student: any) => {
            const resProjects = await fetch(`/api/students/${student._id}/projects`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const projectsData = await resProjects.json()

            // 3. For each project, fetch latest project info and ALL progress updates
            const projectsWithProgress = await Promise.all(
              projectsData.map(async (project: any) => {
                // Fetch latest project info (for progress and status)
                const resProject = await fetch(`/api/projects/${project._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                const projectData = await resProject.json()

                // Fetch ALL progress updates
                const resUpdates = await fetch(`/api/progress-updates?projectId=${project._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                const updatesData = await resUpdates.json()
                const updates = updatesData.updates || []
                const latestUpdate = updates[0] || null

                return {
                  name: projectData.name || project.name,
                  status: projectData.progress === 100 ? "completed" : "in_progress",
                  completion: projectData.progress ?? 0,
                  lastUpdate: latestUpdate?.date ? latestUpdate.date.slice(0, 10) : "",
                  eodUpdate: latestUpdate?.updateText || "",
                  updates, // Store all updates
                }
              })
            )

            return {
              id: student._id,
              name: student.name,
              rollNumber: student.rollNumber,
              projects: projectsWithProgress,
            }
          })
        )

        setStudents(studentsWithProjects)
      } catch (error) {
        console.error("Error fetching students/projects:", error)
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
      default:
        return <Badge variant="secondary">Unknown</Badge>
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
            <p className="mt-2 text-gray-600">Track the progress of all students under your guidance</p>
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
              <div className="text-gray-500">No students found.</div>
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
                      {student.projects.map((project: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
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
                              Last updated: {project.lastUpdate}
                            </div>

                            <div>
                              <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Latest EOD Update
                              </h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border">{project.eodUpdate}</p>
                            </div>

                            {/* Show last 3 updates and "View all" button if more */}
                            <div className="space-y-2">
                              {project.updates?.slice(0, 3).map((update: any, idx: number) => (
                                <div key={update._id || idx} className="bg-gray-50 p-2 rounded border">
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
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
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
                    (acc, student) => acc + student.projects.filter((p: any) => p.status === "in_progress").length,
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
                    (acc, student) => acc + student.projects.filter((p: any) => p.status === "completed").length,
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
              {showAllUpdates.updates.map((update: any) => (
                <div
                  key={update._id}
                  className="bg-gray-100 rounded-xl p-4"
                >
                  <div className="text-base font-medium text-gray-900">{update.updateText}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(update.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
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
