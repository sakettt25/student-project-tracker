"use client"

import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, FileText, Award } from "lucide-react"

export default function FacultyEvaluation() {
  // Mock data
  const studentsForEvaluation = [
    {
      id: 1,
      name: "Alice Brown",
      rollNumber: "CS2021001",
      project: "E-commerce Platform",
      status: "ready_for_evaluation",
      submissionDate: "2024-01-10",
    },
    {
      id: 2,
      name: "Bob Wilson",
      rollNumber: "CS2021002",
      project: "Task Management App",
      status: "evaluated",
      submissionDate: "2024-01-08",
      grade: "A",
      score: 92,
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNumber: "CS2021003",
      project: "Weather Dashboard",
      status: "ready_for_evaluation",
      submissionDate: "2024-01-12",
    },
  ]

  const evaluationCriteria = [
    { name: "Code Quality", weight: 25 },
    { name: "Functionality", weight: 30 },
    { name: "User Interface", weight: 20 },
    { name: "Documentation", weight: 15 },
    { name: "Innovation", weight: 10 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Project Evaluation</h1>
            <p className="mt-2 text-gray-600">Evaluate and grade student projects</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Students for Evaluation
                  </CardTitle>
                  <CardDescription>Click on a student to start evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {studentsForEvaluation.map((student) => (
                        <Card key={student.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{student.name}</h4>
                                {student.status === "evaluated" ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Award className="h-3 w-3 mr-1" />
                                    {student.grade}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{student.project}</p>
                              <p className="text-xs text-gray-500">Submitted: {student.submissionDate}</p>
                              {student.status === "evaluated" && (
                                <p className="text-xs text-green-600">Score: {student.score}/100</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Evaluation Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Evaluation Form
                  </CardTitle>
                  <CardDescription>Evaluate Alice Brown's "E-commerce Platform" project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Project Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Student:</span> Alice Brown
                      </div>
                      <div>
                        <span className="font-medium">Roll Number:</span> CS2021001
                      </div>
                      <div>
                        <span className="font-medium">Project:</span> E-commerce Platform
                      </div>
                      <div>
                        <span className="font-medium">Submission Date:</span> 2024-01-10
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <div>
                    <h4 className="font-medium mb-4">Evaluation Criteria</h4>
                    <div className="space-y-4">
                      {evaluationCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">
                              {criteria.name} ({criteria.weight}%)
                            </Label>
                          </div>
                          <div className="w-32">
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Score" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">Excellent (10)</SelectItem>
                                <SelectItem value="8">Good (8)</SelectItem>
                                <SelectItem value="6">Average (6)</SelectItem>
                                <SelectItem value="4">Below Average (4)</SelectItem>
                                <SelectItem value="2">Poor (2)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall Grade */}
                  <div>
                    <Label htmlFor="overall-grade" className="text-sm font-medium">
                      Overall Grade
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+ (90-100)</SelectItem>
                        <SelectItem value="A">A (80-89)</SelectItem>
                        <SelectItem value="B+">B+ (70-79)</SelectItem>
                        <SelectItem value="B">B (60-69)</SelectItem>
                        <SelectItem value="C+">C+ (50-59)</SelectItem>
                        <SelectItem value="C">C (40-49)</SelectItem>
                        <SelectItem value="F">F (Below 40)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comments */}
                  <div>
                    <Label htmlFor="comments" className="text-sm font-medium">
                      Evaluation Comments
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="Provide detailed feedback on the project..."
                      className="mt-1 min-h-24"
                    />
                  </div>

                  {/* Recommendations */}
                  <div>
                    <Label htmlFor="recommendations" className="text-sm font-medium">
                      Recommendations for Improvement
                    </Label>
                    <Textarea
                      id="recommendations"
                      placeholder="Suggest areas for improvement..."
                      className="mt-1 min-h-20"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button className="flex-1">Submit Evaluation</Button>
                    <Button variant="outline">Save as Draft</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Evaluation Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">B+</div>
                <p className="text-xs text-muted-foreground">Class average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Award className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Awaiting evaluation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Grade Projects</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Excellent work</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
