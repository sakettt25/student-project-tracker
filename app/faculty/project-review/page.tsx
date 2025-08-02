"use client"

import { useState } from "react"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, MessageSquare } from "lucide-react"

export default function ProjectReview() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [feedback, setFeedback] = useState("")

  // Mock data
  const projectsInReview = [
    { id: 1, student: "Alice Brown", project: "E-commerce Platform", status: "in_review" },
    { id: 2, student: "David Lee", project: "Social Media App", status: "in_review" },
    { id: 3, student: "Emma Wilson", project: "Learning Management System", status: "in_review" },
  ]

  const projectsPending = [
    { id: 4, student: "Frank Miller", project: "Inventory System", status: "pending" },
    { id: 5, student: "Grace Chen", project: "Chat Application", status: "pending" },
    { id: 6, student: "Henry Davis", project: "Portfolio Website", status: "pending" },
    { id: 7, student: "Ivy Johnson", project: "Recipe Finder", status: "pending" },
    { id: 8, student: "Jack Brown", project: "Expense Tracker", status: "pending" },
  ]

  const projectsApproved = [
    { id: 9, student: "Bob Wilson", project: "Task Management App", status: "approved" },
    { id: 10, student: "Carol Davis", project: "Weather Dashboard", status: "approved" },
    { id: 11, student: "Lisa Wang", project: "Blog Platform", status: "approved" },
    { id: 12, student: "Mike Johnson", project: "Quiz App", status: "approved" },
  ]

  const handleProjectClick = (project: any) => {
    setSelectedProject({
      ...project,
      description: "A comprehensive project description would go here...",
      techStack: "React, Node.js, MongoDB",
      realLifeApplication: "This project can be used in real business scenarios...",
      expectedCompletion: "2024-12-15",
    })
  }

  const handleFeedbackSubmit = () => {
    // In real app, this would submit feedback to API
    console.log("Feedback submitted:", feedback)
    setFeedback("")
    setSelectedProject(null)
  }

  const ProjectCard = ({ project, onClick }: { project: any; onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{project.student}</h4>
            <p className="text-sm text-gray-600">{project.project}</p>
          </div>
          <Eye className="h-4 w-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Project Review</h1>
            <p className="mt-2 text-gray-600">Review and provide feedback on student projects</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* In Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Projects in Review
                  <Badge variant="secondary">{projectsInReview.length}</Badge>
                </CardTitle>
                <CardDescription>Projects currently being reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projectsInReview.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project)} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pending Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Review
                  <Badge variant="secondary">{projectsPending.length}</Badge>
                </CardTitle>
                <CardDescription>New project submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projectsPending.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project)} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Approved */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Approved Projects
                  <Badge variant="secondary">{projectsApproved.length}</Badge>
                </CardTitle>
                <CardDescription>Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {projectsApproved.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project)} />
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
            <DialogTitle>{selectedProject?.project}</DialogTitle>
            <DialogDescription>Submitted by {selectedProject?.student}</DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
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
                <h4 className="font-medium mb-2">Expected Completion</h4>
                <p className="text-sm text-gray-600">{selectedProject.expectedCompletion}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Provide Feedback</h4>
                <Textarea
                  placeholder="Enter your feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleFeedbackSubmit} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
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
