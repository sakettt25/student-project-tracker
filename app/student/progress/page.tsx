"use client"

import { useEffect, useState } from "react"
import { StudentNavbar } from "@/components/student-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Calendar, Plus, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Input } from "@/components/ui/input"

interface ProgressUpdate {
  _id: string
  updateText: string
  date: string
  createdAt: string
}

interface Project {
  _id: string
  name: string
  description: string
  techStack: string
  approvedDate?: string
  expectedCompletionDate: string
  progress: number
  status: string
  updates: ProgressUpdate[]
}

export default function StudentProgress() {
  const { user, token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newUpdate, setNewUpdate] = useState("")
  const [newProgress, setNewProgress] = useState<number | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [showAllUpdatesProject, setShowAllUpdatesProject] = useState<Project | null>(null)

  // Fetch approved projects and their progress updates
  useEffect(() => {
    if (!token) return

    const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        // Only approved projects
        const approved = data.projects.filter((p: any) => p.status === "approved")
        // Fetch progress updates for each project
        const projectsWithUpdates = await Promise.all(
          approved.map(async (proj: any) => {
            const resUpdates = await fetch(`/api/progress-updates?projectId=${proj._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const updatesData = await resUpdates.json()
            return {
              _id: proj._id,
              name: proj.name,
              description: proj.description,
              techStack: proj.techStack,
              approvedDate: proj.updatedAt ? proj.updatedAt.slice(0, 10) : "",
              expectedCompletionDate: proj.expectedCompletion,
              progress: proj.progress ?? 0,
              status: proj.status,
              updates: updatesData.updates || [],
            }
          })
        )
        setProjects(projectsWithUpdates)
      } catch (err) {
        setProjects([])
      }
      setLoading(false)
    }

    fetchProjects()
  }, [token])

  const handleUpdateSubmit = async () => {
    if (!newUpdate.trim() || !selectedProject || !token || newProgress === "") return
    setSubmitting(true)
    try {
      const res = await fetch("/api/progress-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject._id,
          updateText: newUpdate,
          progress: Number(newProgress),
        }),
      })
      if (res.ok) {
        // Fetch the latest project info after update
        const resProject = await fetch(`/api/projects/${selectedProject._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const projectData = await resProject.json()

        // Fetch the latest updates for this project
        const resUpdates = await fetch(`/api/progress-updates?projectId=${selectedProject._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const updatesData = await resUpdates.json()

        setProjects((prev) =>
          prev.map((p) =>
            p._id === selectedProject._id
              ? {
                  ...p,
                  updates: updatesData.updates || [],
                  progress: projectData.progress ?? 0, // <-- Use backend value
                }
              : p
          )
        )
        setNewUpdate("")
        setNewProgress("")
        setSelectedProject(null)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Project Progress</h1>
            <p className="mt-2 text-gray-600">Track and update progress on your approved projects</p>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter((p) => p.progress < 100).length}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter((p) => p.progress === 100).length}</div>
                <p className="text-xs text-muted-foreground">Successfully finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.length > 0
                    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Progress Cards */}
          <div className="space-y-6">
            {projects.map((project) => (
              <Card key={project._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      {project.progress === 100 ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tech Stack:</span> {project.techStack}
                    </div>
                    <div>
                      <span className="font-medium">Approved:</span> {project.approvedDate}
                    </div>
                    <div>
                      <span className="font-medium">Expected Completion:</span> {project.expectedCompletionDate}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Recent Updates */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Recent Updates</h4>
                      <Dialog
                        open={selectedProject?._id === project._id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setSelectedProject(null)
                            setNewUpdate("")
                            setNewProgress("")
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedProject(project)}
                            disabled={project.progress === 100}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Progress Update</DialogTitle>
                            <DialogDescription>Update your progress on "{project.name}"</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Today's Progress Update</label>
                              <Textarea
                                value={newUpdate}
                                onChange={(e) => setNewUpdate(e.target.value)}
                                placeholder="Describe what you accomplished today..."
                                className="mt-1 min-h-24"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Add Progress (%)</label>
                              <Input
                                type="number"
                                min={1}
                                max={100 - project.progress}
                                value={newProgress}
                                onChange={(e) =>
                                  setNewProgress(
                                    e.target.value === ""
                                      ? ""
                                      : Math.max(1, Math.min(100 - project.progress, Number(e.target.value)))
                                  )
                                }
                                placeholder={`Add progress (max ${100 - project.progress})`}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleUpdateSubmit}
                                className="flex-1"
                                disabled={submitting || newUpdate.trim() === "" || newProgress === ""}
                              >
                                {submitting ? "Submitting..." : "Submit Update"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(null)
                                  setNewUpdate("")
                                  setNewProgress("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {project.updates.slice(0, 3).map((update, index) => (
                        <div key={update._id || index} className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm text-gray-700">{update.updateText}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {update.date ? update.date.slice(0, 10) : ""}
                          </p>
                        </div>
                      ))}
                      {project.updates.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowAllUpdatesProject(project)}
                        >
                          View all {project.updates.length} updates
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Projects</h3>
                <p className="text-gray-600">
                  Once your projects are approved by faculty, you can track their progress here.
                </p>
              </CardContent>
            </Card>
          )}

          {/* View All Updates Dialog */}
          <Dialog open={!!showAllUpdatesProject} onOpenChange={() => setShowAllUpdatesProject(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  All Updates for "{showAllUpdatesProject?.name}"
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {showAllUpdatesProject?.updates.map((update, idx) => (
                  <div key={update._id || idx} className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm text-gray-700">{update.updateText}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {update.date ? update.date.slice(0, 10) : ""}
                    </p>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" onClick={() => setShowAllUpdatesProject(null)}>
                Close
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
