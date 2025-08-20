"use client"

import { useEffect, useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Eye, MessageSquare, FileText, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Code, Target, Loader2 } from "lucide-react"

export default function StudentProjects() {
  const { token } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    techStack: "",
    realLifeApplication: "",
    expectedCompletion: "",
  })
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects for the logged-in student
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return
      setLoading(true)
      try {
        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [token])

  // Group projects by status
  const groupedProjects = {
    rejected: projects.filter((p) => p.status === "rejected"),
    pending: projects.filter((p) => p.status === "pending"),
    approved: projects.filter((p) => p.status === "approved"),
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("Authentication required. Please log in again.")
      return
    }

    setSubmitting(true)
    setError(null)

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to submit project" }))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

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
    } catch (error) {
      console.error("Project submission failed:", error)
      setError(error instanceof Error ? error.message : "Failed to submit project")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "in_review":
        return (
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            In Review
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 shadow-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="shadow-sm">Unknown</Badge>
    }
  }

  const ProjectCard = ({ project, onClick }: { project: any; onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-[1.02] group" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {project.name || project.project}
              </h4>
            </div>
            <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Eye className="h-3 w-3 text-gray-400 group-hover:text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{project.description}</p>
          </div>
          
          <div className="flex items-center justify-between">
            {getStatusBadge(project.status)}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDate(project.createdAt || project.submittedDate)}
            </div>
          </div>
          
          {project.feedback && project.feedback.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <MessageSquare className="h-3 w-3" />
              {project.feedback.length} feedback message{project.feedback.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

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
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  My Projects
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Manage and track all your project submissions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* New Project Submission */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    New Project
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-600">Submit a new project for faculty review</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg h-12">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Project
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
                      {error && (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-semibold text-gray-800">Project Name</Label>
                        <Input
                          id="projectName"
                          value={projectForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter project name"
                          className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          required
                          disabled={submitting}
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
                          disabled={submitting}
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
                          disabled={submitting}
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
                          disabled={submitting}
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
                          disabled={submitting}
                        />
                      </div>
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg" 
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Submit Project
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false)
                            setError(null)
                          }}
                          disabled={submitting}
                          className="shadow-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Rejected Projects */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    Rejected
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 px-3 py-1 font-semibold">
                    {groupedProjects.rejected.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">Projects that need revision</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading projects...</p>
                      </div>
                    ) : groupedProjects.rejected.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No rejected projects</p>
                        <p className="text-sm">All your projects are on track!</p>
                      </div>
                    ) : (
                      groupedProjects.rejected.map((project) => (
                        <ProjectCard key={project._id} project={project} onClick={() => setSelectedProject(project)} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pending Projects */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Pending
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1 font-semibold">
                    {groupedProjects.pending.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">Projects awaiting faculty review</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading projects...</p>
                      </div>
                    ) : groupedProjects.pending.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No pending projects</p>
                        <p className="text-sm">Submit your first project!</p>
                      </div>
                    ) : (
                      groupedProjects.pending.map((project) => (
                        <ProjectCard key={project._id} project={project} onClick={() => setSelectedProject(project)} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Approved Projects */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    Approved
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1 font-semibold">
                    {groupedProjects.approved.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading projects...</p>
                      </div>
                    ) : groupedProjects.approved.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No approved projects</p>
                        <p className="text-sm">Keep working on your submissions!</p>
                      </div>
                    ) : (
                      groupedProjects.approved.map((project) => (
                        <ProjectCard key={project._id} project={project} onClick={() => setSelectedProject(project)} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-blue-600" />
              {selectedProject?.name || selectedProject?.project}
            </DialogTitle>
            <DialogDescription className="text-base">
              Project details and faculty feedback
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selectedProject.status)}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {formatDate(selectedProject.createdAt || selectedProject.submittedDate)}</span>
                </div>
                {selectedProject.approvedDate && (
                  <div className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Approved: {formatDate(selectedProject.approvedDate)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                    <FileText className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.description}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
                    <Code className="h-4 w-4" />
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.split(',').map((tech: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-800">
                  <Target className="h-4 w-4" />
                  Real-life Application
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.realLifeApplication}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Faculty Feedback
                </h4>
                {selectedProject.feedback && selectedProject.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.feedback.map((feedback: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge 
                              className={
                                feedback.action === "approve"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : feedback.action === "reject"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {feedback.action === "approve" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </>
                              ) : feedback.action === "reject" ? (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejected
                                </>
                              ) : (
                                "Feedback"
                              )}
                            </Badge>
                            <span className="font-semibold text-sm text-gray-900">
                              {feedback.facultyName || feedback.faculty || "Faculty"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                            {formatDate(feedback.createdAt || feedback.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{feedback.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No feedback received yet</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-end">
                <Button onClick={() => setSelectedProject(null)} variant="outline" className="shadow-sm">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
