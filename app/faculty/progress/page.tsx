"use client"

import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock } from "lucide-react"

export default function FacultyProgress() {
  // Mock data
  const students = [
    {
      id: 1,
      name: "Alice Brown",
      rollNumber: "CS2021001",
      projects: [
        {
          name: "E-commerce Platform",
          status: "in_progress",
          completion: 75,
          lastUpdate: "2024-01-15",
          eodUpdate: "Completed user authentication module and started working on payment integration.",
        },
      ],
    },
    {
      id: 2,
      name: "Bob Wilson",
      rollNumber: "CS2021002",
      projects: [
        {
          name: "Task Management App",
          status: "completed",
          completion: 100,
          lastUpdate: "2024-01-14",
          eodUpdate: "Final testing completed. Project ready for deployment.",
        },
      ],
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNumber: "CS2021003",
      projects: [
        {
          name: "Weather Dashboard",
          status: "in_progress",
          completion: 60,
          lastUpdate: "2024-01-13",
          eodUpdate: "Integrated weather API and working on responsive design for mobile devices.",
        },
      ],
    },
    {
      id: 4,
      name: "David Lee",
      rollNumber: "CS2021004",
      projects: [
        {
          name: "Social Media App",
          status: "in_progress",
          completion: 45,
          lastUpdate: "2024-01-12",
          eodUpdate: "Implemented post creation and user profile features. Working on comment system.",
        },
      ],
    },
    {
      id: 5,
      name: "Emma Wilson",
      rollNumber: "CS2021005",
      projects: [
        {
          name: "Learning Management System",
          status: "in_progress",
          completion: 30,
          lastUpdate: "2024-01-11",
          eodUpdate: "Set up database schema and basic user authentication. Starting course management module.",
        },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
            <p className="mt-2 text-gray-600">Track the progress of all students under your guidance</p>
          </div>

          <div className="space-y-6">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>Roll Number: {student.rollNumber}</CardDescription>
                    </div>
                    <Badge variant="outline">{student.projects.length} Project(s)</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{project.name}</h4>
                          {getStatusBadge(project.status)}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-gray-600">{project.completion}%</span>
                            </div>
                            <Progress value={project.completion} className="h-2" />
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            Last updated: {project.lastUpdate}
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Latest EOD Update
                            </h5>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border">{project.eodUpdate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Under your guidance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p) => p.status === "in_progress").length,
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.reduce(
                    (acc, student) => acc + student.projects.filter((p) => p.status === "completed").length,
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Successfully finished</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
