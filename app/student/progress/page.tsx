"use client"

import { useState } from "react"
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

export default function StudentProgress() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [newUpdate, setNewUpdate] = useState("")

  // Mock data - only approved projects
  const approvedProjects = [
    {
      id: 1,
      name: "Task Management App",
      description: "A collaborative task management application",
      techStack: "Vue.js, Express.js, PostgreSQL",
      approvedDate: "2024-01-07",
      expectedCompletion: "2024-02-15",
      progress: 85,
      updates: [
        {
          date: "2024-01-15",
          update:
            "Completed user authentication and authorization system. Started working on task creation and assignment features.",
        },
        {
          date: "2024-01-14",
          update: "Set up the database schema and implemented basic CRUD operations for users and tasks.",
        },
        {
          date: "2024-01-13",
          update:
            "Initialized the project structure and set up the development environment with Vue.js and Express.js.",
        },
      ],
    },
    {
      id: 2,
      name: "Portfolio Website",
      description: "Personal portfolio website with blog functionality",
      techStack: "Next.js, Tailwind CSS, MDX",
      approvedDate: "2024-01-03",
      expectedCompletion: "2024-01-30",
      progress: 100,
      updates: [
        {
          date: "2024-01-12",
          update: "Website is now live! Added final touches to the blog section and optimized for SEO.",
        },
        {
          date: "2024-01-10",
          update: "Completed the portfolio section with project showcases and integrated contact form.",
        },
        {
          date: "2024-01-08",
          update: "Finished the responsive design and added dark mode toggle functionality.",
        },
      ],
    },
  ]

  const handleUpdateSubmit = () => {
    if (!newUpdate.trim()) return

    // In real app, this would submit to API
    console.log("Progress update submitted:", {
      projectId: selectedProject.id,
      update: newUpdate,
      date: new Date().toISOString().split("T")[0],
    })

    setNewUpdate("")
    setSelectedProject(null)
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
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
                <div className="text-2xl font-bold">{approvedProjects.filter((p) => p.progress < 100).length}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedProjects.filter((p) => p.progress === 100).length}</div>
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
                  {Math.round(approvedProjects.reduce((acc, p) => acc + p.progress, 0) / approvedProjects.length)}%
                </div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Progress Cards */}
          <div className="space-y-6">
            {approvedProjects.map((project) => (
              <Card key={project.id}>
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
                      <span className="font-medium">Expected Completion:</span> {project.expectedCompletion}
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
                      <Dialog>
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
                            <div className="flex gap-2">
                              <Button onClick={handleUpdateSubmit} className="flex-1">
                                Submit Update
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {project.updates.slice(0, 3).map((update, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm text-gray-700">{update.update}</p>
                          <p className="text-xs text-gray-500 mt-1">{update.date}</p>
                        </div>
                      ))}
                      {project.updates.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full">
                          View all {project.updates.length} updates
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {approvedProjects.length === 0 && (
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
        </div>
      </div>
    </div>
  )
}
