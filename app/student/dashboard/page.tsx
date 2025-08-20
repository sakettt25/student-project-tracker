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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, GraduationCap, BookOpen, Clock, CheckCircle, AlertCircle, Plus, XCircle, TrendingUp, Calendar, FileText, Target } from "lucide-react"

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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Generate dynamic recent activity from projects and feedback
  const getRecentActivity = () => {
    const activities: { type: string; text: string; date: string; color: string; icon: any }[] = []

    projects.forEach((project) => {
      // Submission
      const projectTitle = project.name || (project as any).project || "Untitled Project"

      activities.push({
        type: "submission",
        text: `You submitted "${projectTitle}" for review`,
        date: project._id ? project._id.toString().slice(0, 8) : "",
        color: "blue",
        icon: FileText,
      })
      if (project.status === "approved") {
        activities.push({
          type: "approved",
          text: `Your "${projectTitle}" was approved`,
          date: project.expectedCompletionDate,
          color: "green",
          icon: CheckCircle,
        })
      }
      if (project.status === "rejected") {
        activities.push({
          type: "rejected",
          text: `Your "${projectTitle}" was rejected`,
          date: project.expectedCompletionDate,
          color: "red",
          icon: XCircle,
        })
      }
      if (project.feedback && project.feedback.length > 0) {
        project.feedback.forEach((fb) => {
          activities.push({
            type: "feedback",
            text: `Faculty provided feedback on "${projectTitle}"`,
            date: fb.createdAt || "",
            color: "orange",
            icon: AlertCircle,
          })
        })
      }
    })

    // Sort by date descending (most recent first)
    return activities.sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <StudentNavbar />
      
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
                  Student Dashboard
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Welcome back! Track your project submissions and progress</p>
              </div>
            </div>
          </div>

          {/* Student Details & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Name</span>
                  <span className="text-gray-900 font-semibold">{user?.name || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Roll Number</span>
                  <span className="text-gray-900 font-semibold">{user?.rollNumber || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Semester</span>
                  <span className="text-gray-900 font-semibold">{user?.semester || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Email</span>
                  <span className="text-gray-900 font-semibold">{user?.email || "Not available"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg h-12">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-xl">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Submit New Project
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Fill in the details for your new project submission
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-semibold text-gray-800">Project Name</Label>
                        <Input
                          id="projectName"
                          value={projectForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter project name"
                          className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-800">Description</Label>
                        <Textarea
                          id="description"
                          value={projectForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Describe your project in detail"
                          className="min-h-24 bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="techStack" className="text-sm font-semibold text-gray-800">Tech Stack Used</Label>
                        <Input
                          id="techStack"
                          value={projectForm.techStack}
                          onChange={(e) => handleInputChange("techStack", e.target.value)}
                          placeholder="e.g., React, Node.js, MongoDB"
                          className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="realLifeApplication" className="text-sm font-semibold text-gray-800">Real-life Application</Label>
                        <Textarea
                          id="realLifeApplication"
                          value={projectForm.realLifeApplication}
                          onChange={(e) => handleInputChange("realLifeApplication", e.target.value)}
                          placeholder="How can this project be used in real life?"
                          className="min-h-20 bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedCompletion" className="text-sm font-semibold text-gray-800">Expected Completion Date</Label>
                        <Input
                          id="expectedCompletion"
                          type="date"
                          value={projectForm.expectedCompletion}
                          onChange={(e) => handleInputChange("expectedCompletion", e.target.value)}
                          className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="flex gap-3 pt-4 border-t">
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Project
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="shadow-sm">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Total Projects</span>
                      <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-sm font-semibold">{stats.total}</Badge>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-800">Approved</span>
                      <Badge className="bg-emerald-100 text-emerald-800 px-2 py-1 text-sm font-semibold">{stats.approved}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Stats */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Project Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Projects</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <p className="text-xs text-blue-700 font-medium">All time submissions</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">In Review</CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-1">{stats.inReview}</div>
                <p className="text-xs text-amber-700 font-medium">Being reviewed by faculty</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
                <p className="text-xs text-yellow-700 font-medium">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Approved</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
                <p className="text-xs text-green-700 font-medium">Successfully approved</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Rejected</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
                <p className="text-xs text-red-700 font-medium">Rejected by faculty</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-600">Your latest project updates</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {getRecentActivity().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No recent activity yet.</p>
                      </div>
                    ) : (
                      getRecentActivity().map((activity, idx) => {
                        const Icon = activity.icon
                        return (
                          <div className="flex items-start space-x-3" key={idx}>
                            <div className={`p-2 rounded-lg ${
                              activity.color === "green" ? "bg-green-100" :
                              activity.color === "blue" ? "bg-blue-100" :
                              activity.color === "red" ? "bg-red-100" :
                              "bg-amber-100"
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                activity.color === "green" ? "text-green-600" :
                                activity.color === "blue" ? "text-blue-600" :
                                activity.color === "red" ? "text-red-600" :
                                "text-amber-600"
                              }`} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.text}</p>
                              <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Project List */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Your Projects
                  </CardTitle>
                  <CardDescription className="text-gray-600">All your submitted projects and their status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {projects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No projects submitted yet</p>
                          <p className="text-sm">Click "Submit New Project" to get started</p>
                        </div>
                      ) : (
                        projects.map((project) => (
                          <Card key={project._id} className="border border-gray-200 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                </div>
                                <Badge className={
                                  project.status === "approved"
                                    ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200"
                                    : project.status === "rejected"
                                    ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
                                    : project.status === "in_review"
                                    ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200"
                                    : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200"
                                }>
                                  {project.status === "in_review" ? "In Review" : 
                                   project.status === "approved" ? "Approved" :
                                   project.status === "rejected" ? "Rejected" : "Pending"}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>Expected: {formatDate(project.expectedCompletionDate)}</span>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-gray-700 line-clamp-2">{project.description}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {project.techStack.split(',').map((tech, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {tech.trim()}
                                    </Badge>
                                  ))}
                                </div>

                                {project.feedback && project.feedback.length > 0 && (
                                  <div className="border-t pt-3 mt-3">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Latest Feedback:</h5>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100">
                                      <p className="text-xs text-gray-700">{project.feedback[0].message}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        By {project.feedback[0].facultyName} on {formatDate(project.feedback[0].createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
