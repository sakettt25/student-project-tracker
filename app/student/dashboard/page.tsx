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
import { User, GraduationCap, BookOpen, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"

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

  // Replace the existing stats mock data with:
  const [stats, setStats] = useState({
    total: 0,
    inReview: 0,
    pending: 0,
    approved: 0,
  })

  type Project = {
    name: string
    description: string
    techStack: string
    realLifeApplication: string
    expectedCompletionDate: string
    status: string
    // Add other fields as needed
  }

  const [projects, setProjects] = useState<Project[]>([])

  // Add this useEffect after the existing useAuth call:
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

          // Calculate stats
          const total = data.projects.length
          const inReview = data.projects.filter((p: any) => p.status === "in_review").length
          const pending = data.projects.filter((p: any) => p.status === "pending").length
          const approved = data.projects.filter((p: any) => p.status === "approved").length

          setStats({ total, inReview, pending, approved })
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    fetchProjects()
  }, [token])

  // Update the handleFormSubmit function:
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
                  <span className="font-medium">Faculty:</span> Dr. John Smith
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest project updates and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Your "Task Management App" was approved</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Faculty provided feedback on "E-commerce Platform"</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">You submitted "Weather Dashboard" for review</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
