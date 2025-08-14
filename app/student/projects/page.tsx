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
import { Plus, Eye, MessageSquare } from "lucide-react"

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
    inReview: projects.filter((p) => p.status === "in_review"),
    pending: projects.filter((p) => p.status === "pending"),
    approved: projects.filter((p) => p.status === "approved"),
  }

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
      }
    } catch (error) {
      console.error("Project submission failed:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "in_review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const ProjectCard = ({ project, onClick }: { project: any; onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{project.name || project.project}</h4>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between">
            {getStatusBadge(project.status)}
            <span className="text-xs text-gray-500">
              {formatDate(project.createdAt || project.submittedDate)}
            </span>
          </div>
          {project.feedback && project.feedback.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MessageSquare className="h-3 w-3" />
              {project.feedback.length} feedback(s)
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
    return date.toISOString().slice(0, 10)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-2 text-gray-600">Manage and track all your project submissions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* New Project Submission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  New Project
                  <Plus className="h-5 w-5" />
                </CardTitle>
                <CardDescription>Submit a new project for review</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Project
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
              </CardContent>
            </Card>

            {/* Projects in Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  In Review
                  <Badge variant="secondary">{groupedProjects.inReview.length}</Badge>
                </CardTitle>
                <CardDescription>Projects being reviewed by faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-gray-400">Loading...</div>
                    ) : groupedProjects.inReview.length === 0 ? (
                      <div className="text-gray-400">No projects in review</div>
                    ) : (
                      groupedProjects.inReview.map((project) => (
                        <ProjectCard key={project._id} project={project} onClick={() => setSelectedProject(project)} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pending Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending
                  <Badge variant="secondary">{groupedProjects.pending.length}</Badge>
                </CardTitle>
                <CardDescription>Projects awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-gray-400">Loading...</div>
                    ) : groupedProjects.pending.length === 0 ? (
                      <div className="text-gray-400">No pending projects</div>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Approved
                  <Badge variant="secondary">{groupedProjects.approved.length}</Badge>
                </CardTitle>
                <CardDescription>Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-gray-400">Loading...</div>
                    ) : groupedProjects.approved.length === 0 ? (
                      <div className="text-gray-400">No approved projects</div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name || selectedProject?.project}</DialogTitle>
            <DialogDescription>Project details and feedback</DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedProject.status)}
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(selectedProject.createdAt || selectedProject.submittedDate)}
                </span>
                {selectedProject.approvedDate && (
                  <span className="text-sm text-green-600">
                    Approved: {formatDate(selectedProject.approvedDate)}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tech Stack</h4>
                <p className="text-sm text-gray-600">{selectedProject.techStack}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Real-life Application</h4>
                <p className="text-sm text-gray-600">{selectedProject.realLifeApplication}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Faculty Feedback</h4>
                {selectedProject.feedback && selectedProject.feedback.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProject.feedback.map((feedback: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {feedback.facultyName || feedback.faculty || "Faculty"}
                          </span>
                          <span
                            className={
                              feedback.action === "approve"
                                ? "text-green-600 text-xs"
                                : feedback.action === "reject"
                                ? "text-red-600 text-xs"
                                : "text-gray-500 text-xs"
                            }
                          >
                            {feedback.action === "approve"
                              ? "Approved"
                              : feedback.action === "reject"
                              ? "Rejected"
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{feedback.message}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(feedback.createdAt || feedback.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No feedback yet</div>
                )}
              </div>

              <Button onClick={() => setSelectedProject(null)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
