"use client"

import { useState, useEffect } from "react"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Eye, MessageSquare, CheckCircle, XCircle, Loader2, Search, FileText, Clock, User, Calendar, Code } from "lucide-react"
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
  studentRoll?: string         
  studentSemester?: string     
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
      console.log('Raw project data:', data)
      setProjects(data.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectAction = async (action: 'approve' | 'reject') => {
    if (!selectedProject || !feedback.trim()) {
      toast.error('Please provide feedback before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Selected Project ID:', selectedProject._id)

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
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02] group"
      onClick={() => setSelectedProject(project)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.project || "Untitled Project"}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-3 w-3" />
                <span className="font-medium">Student:</span> 
                <span className="text-gray-800">{project.studentName || "Unknown"}</span>
              </div>
              
              {project.studentRoll && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Roll:</span> 
                  <span className="text-gray-800">{project.studentRoll}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Expected:</span> 
                <span className="text-gray-800">{formatDate(project.expectedCompletion)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <Badge variant={
              project.status === 'approved' ? 'default' :
              project.status === 'rejected' ? 'destructive' :
              'secondary'
            } className="shadow-sm">
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading projects...</p>
        </div>
      </div>
    )
  }

  const FeedbackHistory = ({ feedback }: { feedback: FeedbackItem[] }) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        Feedback History
      </h4>
      {feedback?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant={item.action === 'approve' ? 'default' : 'destructive'} className="shadow-sm">
                    {item.action === 'approve' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </>
                    )}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">By {item.facultyName}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
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

  const filteredProjects = projects.filter(
    (project) =>
      (project.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (project.studentRoll || "").toLowerCase().includes(search.toLowerCase()) ||
      (project.project || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <FacultyNavbar />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Project Review
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Review and provide feedback on student projects</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
                  placeholder="Search by student name, roll number, or project..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Review */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Pending Review
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1 font-semibold">
                    {filteredProjects.filter(p => p.status === 'pending').length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">New project submissions awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.status === 'pending').map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                    {filteredProjects.filter(p => p.status === 'pending').length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No pending projects</p>
                      </div>
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
                    Approved Projects
                  </div>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-800 px-3 py-1 font-semibold">
                    {filteredProjects.filter(p => p.status === 'approved').length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">Successfully approved projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.status === 'approved').map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                    {filteredProjects.filter(p => p.status === 'approved').length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No approved projects</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
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
                    Rejected Projects
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 px-3 py-1 font-semibold">
                    {filteredProjects.filter(p => p.status === 'rejected').length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">Projects requiring modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.status === 'rejected').map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                    {filteredProjects.filter(p => p.status === 'rejected').length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No rejected projects</p>
                      </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              {selectedProject?.project}
            </DialogTitle>
            <DialogDescription className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Submitted by <span className="font-semibold">{selectedProject?.studentName}</span>
              {selectedProject?.studentRoll && <span className="text-gray-500">({selectedProject.studentRoll})</span>}
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6 pt-4">
              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                      <FileText className="h-4 w-4" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.description}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-800">
                      <Code className="h-4 w-4" />
                      Tech Stack
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.techStack}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      Real-life Application
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.realLifeApplication}</p>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800">
                      <Calendar className="h-4 w-4" />
                      Expected Completion
                    </h4>
                    <p className="text-sm text-gray-700 font-medium">
                      {formatDate(selectedProject?.expectedCompletion)}
                    </p>
                  </div>
                </div>
              </div>

              <FeedbackHistory feedback={selectedProject.feedback || []} />

              {/* Feedback Form */}
              {(selectedProject.status === "pending" || selectedProject.status === "in_review") && (
                <div className="border-t pt-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Provide Feedback
                    </h4>
                    <Textarea
                      placeholder="Enter your detailed feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-32 bg-white border-0 shadow-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={() => handleProjectAction('approve')} 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
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
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg"
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
                    
                    <Button variant="outline" onClick={() => setSelectedProject(null)} className="shadow-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Close button for completed projects */}
              {(selectedProject.status === "approved" || selectedProject.status === "rejected") && (
                <div className="flex justify-end border-t pt-6">
                  <Button variant="outline" onClick={() => setSelectedProject(null)} className="shadow-sm">
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
