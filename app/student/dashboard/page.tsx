"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { StudentNavbar } from "@/components/student-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { User, GraduationCap, BookOpen, Clock, CheckCircle, AlertCircle, Plus, XCircle } from "lucide-react"

export default function StudentDashboard() {
  const { user, token } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    techStack: "",
    realLifeApplication: "",
    expectedCompletion: "",
  })

  const [stats, setStats] = useState({
    total: 0,
    inReview: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  type FeedbackItem = {
    message: string
    facultyName?: string
    createdAt?: string
    action?: string
  }

  type Project = {
    _id?: string
    name: string
    description: string
    techStack: string
    realLifeApplication: string
    expectedCompletionDate: string
    status: string
    feedback?: FeedbackItem[]
  }

  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return

      try {
        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)

          // Calculate stats for this student
          const total = data.projects.length
          const inReview = data.projects.filter((p: any) => p.status === "in_review").length
          const pending = data.projects.filter((p: any) => p.status === "pending").length
          const approved = data.projects.filter((p: any) => p.status === "approved").length
          const rejected = data.projects.filter((p: any) => p.status === "rejected").length

          setStats({ total, inReview, pending, approved, rejected })
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    fetchProjects()
  }, [token])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectForm.name,
          description: projectForm.description,
          techStack: projectForm.techStack,
          realLifeApplication: projectForm.realLifeApplication,
          expectedCompletionDate: projectForm.expectedCompletion,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProjects([data.project, ...projects])
        setProjectForm({
          name: "",
          description: "",
          techStack: "",
          realLifeApplication: "",
          expectedCompletion: "",
        })
        setIsDialogOpen(false)

        // Update stats
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }))
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }))
  }

  // Utility function to format date
  function formatDate(dateString?: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toISOString().slice(0, 10)
  }

  // Generate dynamic recent activity from projects and feedback
  const getRecentActivity = () => {
    const activities: { type: string; text: string; date: string; color: string }[] = []

    projects.forEach((project) => {
      // Submission
      const projectTitle = project.name || (project as any).project || "Untitled Project"

      activities.push({
        type: "submission",
        text: `You submitted "${projectTitle}" for review`,
        date: project._id ? project._id.toString().slice(0, 8) : "",
        color: "blue",
      })
      if (project.status === "approved") {
        activities.push({
          type: "approved",
          text: `Your "${projectTitle}" was approved`,
          date: project.expectedCompletionDate,
          color: "green",
        })
      }
      if (project.status === "rejected") {
        activities.push({
          type: "rejected",
          text: `Your "${projectTitle}" was rejected`,
          date: project.expectedCompletionDate,
          color: "red",
        })
      }
      if (project.feedback && project.feedback.length > 0) {
        project.feedback.forEach((fb) => {
          activities.push({
            type: "feedback",
            text: `Faculty provided feedback on "${projectTitle}": "${fb.message}"`,
            date: fb.createdAt || "",
            color: "orange",
          })
        })
      }
    })

    // Sort by date descending (most recent first)
    return activities.sort((a, b) => (b.date > a.date ? 1 : -1))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's your project overview</p>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {user?.name}
                </div>
                <div>
                  <span className="font-medium">Roll Number:</span> {user?.rollNumber}
                </div>
                <div>
                  <span className="font-medium">Semester:</span> {user?.semester}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user?.email}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit New Project</DialogTitle>
                      <DialogDescription>Fill in the details for your new project submission</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                          id="projectName"
                          value={projectForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={projectForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Describe your project"
                          className="min-h-24"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="techStack">Tech Stack Used</Label>
                        <Input
                          id="techStack"
                          value={projectForm.techStack}
                          onChange={(e) => handleInputChange("techStack", e.target.value)}
                          placeholder="e.g., React, Node.js, MongoDB"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="realLifeApplication">Real-life Application</Label>
                        <Textarea
                          id="realLifeApplication"
                          value={projectForm.realLifeApplication}
                          onChange={(e) => handleInputChange("realLifeApplication", e.target.value)}
                          placeholder="How can this project be used in real life?"
                          className="min-h-20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="expectedCompletion">Expected Completion Date</Label>
                        <Input
                          id="expectedCompletion"
                          type="date"
                          value={projectForm.expectedCompletion}
                          onChange={(e) => handleInputChange("expectedCompletion", e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Submit Project
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Total Projects</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approved</span>
                    <Badge className="bg-green-100 text-green-800">{stats.approved}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All time submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inReview}</div>
                <p className="text-xs text-muted-foreground">Being reviewed by faculty</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Successfully approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Rejected by faculty</p>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest project updates and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentActivity().length === 0 ? (
                  <div className="text-gray-500 text-sm">No recent activity yet.</div>
                ) : (
                  getRecentActivity().map((activity, idx) => (
                    <div className="flex items-center space-x-4" key={idx}>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.color === "green"
                            ? "bg-green-500"
                            : activity.color === "blue"
                            ? "bg-blue-500"
                            : activity.color === "red"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project List */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Your Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="text-gray-500 text-sm">No projects submitted yet.</div>
              ) : (
                projects.map((project) => (
                  <Card key={project._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {project.name}
                        <Badge
                          className={
                            project.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : project.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : project.status === "in_review"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Expected Completion: {formatDate(project.expectedCompletionDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="font-medium">Description:</span> {project.description}
                      </div>
                      <div>
                        <span className="font-medium">Tech Stack:</span> {project.techStack}
                      </div>
                      <div>
                        <span className="font-medium">Real-life Application:</span> {project.realLifeApplication}
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Feedback:</span>
                        {project.feedback && project.feedback.length > 0 ? (
                          <ul className="list-disc ml-6">
                            {project.feedback.map((fb, idx) => (
                              <li key={idx} className="text-sm">
                                <span className="font-semibold">{fb.facultyName ? fb.facultyName + ": " : ""}</span>
                                {fb.message}{" "}
                                <span className="text-xs text-gray-400">
                                  ({fb.action === "approve" ? "Approved" : "Rejected"} on {formatDate(fb.createdAt)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500 ml-2">No feedback yet</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
