"use client"

import { useState, useEffect } from "react"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FeedbackItem {
  id: string
  message: string
  facultyId: string
  facultyName: string
  createdAt: string
  action: 'approve' | 'reject'
}

interface Project {
  _id: string
  studentId: string
  studentName: string
  studentRoll?: string         // <-- Add roll number
  studentSemester?: string     // <-- Add semester
  project: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  description: string
  techStack: string
  realLifeApplication: string
  expectedCompletion: string
  feedback: FeedbackItem[]
}

export default function ProjectReview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch projects')
      
      const data = await response.json()
      console.log('Raw project data:', data) // Add this for debugging
      setProjects(data.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleProjectAction function
  const handleProjectAction = async (action: 'approve' | 'reject') => {
    if (!selectedProject || !feedback.trim()) {
      toast.error('Please provide feedback before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Selected Project ID:', selectedProject._id) // Add this for debugging

      const response = await fetch(`/api/projects/${selectedProject._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          feedback,
          facultyId: localStorage.getItem('facultyId'),
          facultyName: localStorage.getItem('facultyName')
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${action} project`)
      }

      toast.success(`Project ${action}ed successfully`)
      setSelectedProject(null)
      setFeedback('')
      await fetchProjects()
    } catch (error) {
      console.error(`Error ${action}ing project:`, error)
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : `Failed to ${action} project`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedProject(project)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{project.project || "Untitled Project"}</div>
            <div className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Student:</span> {project.studentName || "Unknown"}
            </div>
            {project.studentRoll && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Roll:</span> {project.studentRoll}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={
              project.status === 'approved' ? 'default' :
              project.status === 'rejected' ? 'destructive' :
              'secondary'
            }>
              {project.status}
            </Badge>
            <Eye className="h-4 w-4 text-gray-400 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Add console logging to debug
  const filterProjects = (status: Project['status']) =>
    projects.filter(project => project.status === status)

  const FeedbackHistory = ({ feedback }: { feedback: FeedbackItem[] }) => (
    <div className="space-y-4">
      <h4 className="font-medium mb-2">Feedback History</h4>
      {feedback?.length === 0 ? (
        <p className="text-sm text-gray-500">No feedback yet</p>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Badge variant={item.action === 'approve' ? 'default' : 'destructive'}>
                    {item.action === 'approve' ? 'Approved' : 'Rejected'}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">By {item.facultyName}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Utility function to format date
  function formatDate(dateString?: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // fallback if invalid
    return date.toISOString().slice(0, 10)
  }

  // Filter projects by name or roll
  const filteredProjects = projects.filter(
    (project) =>
      (project.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (project.studentRoll || "").toLowerCase().includes(search.toLowerCase()) ||
      (project.project || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Project Review</h1>
            <p className="mt-2 text-gray-600">Review and provide feedback on student projects</p>
            {/* Filter/Search input */}
            <div className="mt-4 max-w-sm">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded shadow-sm"
                placeholder="Search by student name or roll number"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Review
                  <Badge variant="secondary">{filteredProjects.filter(p => p.status === 'pending').length}</Badge>
                </CardTitle>
                <CardDescription>New project submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredProjects.filter(p => p.status === 'pending').map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Approved Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Approved Projects
                  <Badge variant="default">{filteredProjects.filter(p => p.status === 'approved').length}</Badge>
                </CardTitle>
                <CardDescription>Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredProjects.filter(p => p.status === 'approved').map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Rejected Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Rejected Projects
                  <Badge variant="destructive">{filteredProjects.filter(p => p.status === 'rejected').length}</Badge>
                </CardTitle>
                <CardDescription>Projects needing changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredProjects.filter(p => p.status === 'rejected').map((project) => (
                      <ProjectCard key={project._id} project={project} />
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
            <DialogDescription>Submitted by {selectedProject?.studentName}</DialogDescription>
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
                <span className="font-bold">Expected Completion</span>
                <div className="text-gray-600">
                  {formatDate(selectedProject?.expectedCompletion)}
                </div>
              </div>

              <FeedbackHistory feedback={selectedProject.feedback || []} />

              {/* Only show feedback form if project is pending or in_review */}
              {(selectedProject.status === "pending" || selectedProject.status === "in_review") && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Provide Feedback</h4>
                    <Textarea
                      placeholder="Enter your feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-24"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleProjectAction('approve')} 
                      className="flex-1"
                      variant="default"
                      disabled={isSubmitting || !feedback.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve Project
                    </Button>
                    
                    <Button 
                      onClick={() => handleProjectAction('reject')} 
                      className="flex-1"
                      variant="destructive"
                      disabled={isSubmitting || !feedback.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Request Changes
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedProject(null)}>
                      Close
                    </Button>
                  </div>
                </>
              )}

              {/* Always show Close button */}
              {(selectedProject.status === "approved" || selectedProject.status === "rejected") && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedProject(null)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
