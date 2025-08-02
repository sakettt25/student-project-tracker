"use client"

import type React from "react"

import { useState } from "react"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    techStack: "",
    realLifeApplication: "",
    expectedCompletion: "",
  })

  // Mock data
  const projects = {
    inReview: [
      {
        id: 1,
        name: "E-commerce Platform",
        description: "A full-stack e-commerce platform with payment integration",
        techStack: "React, Node.js, MongoDB, Stripe",
        status: "in_review",
        submittedDate: "2024-01-10",
        feedback: [
          {
            message: "Great work on the user interface! Consider adding more error handling for the payment flow.",
            date: "2024-01-12",
            faculty: "Dr. John Smith",
          },
        ],
      },
      {
        id: 2,
        name: "Social Media App",
        description: "A social media application with real-time messaging",
        techStack: "Vue.js, Express.js, Socket.io",
        status: "in_review",
        submittedDate: "2024-01-08",
        feedback: [],
      },
    ],
    pending: [
      {
        id: 3,
        name: "Weather Dashboard",
        description: "Real-time weather monitoring dashboard",
        techStack: "React, Python, FastAPI",
        status: "pending",
        submittedDate: "2024-01-15",
        feedback: [],
      },
    ],
    approved: [
      {
        id: 4,
        name: "Task Management App",
        description: "A collaborative task management application",
        techStack: "Vue.js, Express.js, PostgreSQL",
        status: "approved",
        submittedDate: "2024-01-05",
        approvedDate: "2024-01-07",
        feedback: [
          {
            message: "Excellent implementation! The user experience is smooth and the code is well-structured.",
            date: "2024-01-07",
            faculty: "Dr. John Smith",
          },
        ],
      },
      {
        id: 5,
        name: "Portfolio Website",
        description: "Personal portfolio website with blog functionality",
        techStack: "Next.js, Tailwind CSS, MDX",
        status: "approved",
        submittedDate: "2024-01-01",
        approvedDate: "2024-01-03",
        feedback: [],
      },
    ],
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Project submitted:", projectForm)
    setProjectForm({
      name: "",
      description: "",
      techStack: "",
      realLifeApplication: "",
      expectedCompletion: "",
    })
    setIsDialogOpen(false)
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
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const ProjectCard = ({ project, onClick }: { project: any; onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{project.name}</h4>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between">
            {getStatusBadge(project.status)}
            <span className="text-xs text-gray-500">{project.submittedDate}</span>
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
                  <Badge variant="secondary">{projects.inReview.length}</Badge>
                </CardTitle>
                <CardDescription>Projects being reviewed by faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projects.inReview.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pending Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending
                  <Badge variant="secondary">{projects.pending.length}</Badge>
                </CardTitle>
                <CardDescription>Projects awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projects.pending.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Approved Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Approved
                  <Badge variant="secondary">{projects.approved.length}</Badge>
                </CardTitle>
                <CardDescription>Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projects.approved.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                    ))}
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
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>Project details and feedback</DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedProject.status)}
                <span className="text-sm text-gray-500">Submitted: {selectedProject.submittedDate}</span>
                {selectedProject.approvedDate && (
                  <span className="text-sm text-green-600">Approved: {selectedProject.approvedDate}</span>
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

              {selectedProject.feedback && selectedProject.feedback.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Faculty Feedback</h4>
                  <div className="space-y-3">
                    {selectedProject.feedback.map((feedback: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm text-gray-700">{feedback.message}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{feedback.faculty}</span>
                          <span>{feedback.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
