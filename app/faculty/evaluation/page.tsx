"use client"

import { useEffect, useState } from "react"
import { FacultyNavbar } from "@/components/faculty-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, FileText, Award, Search, User, Calendar, BarChart3, TrendingUp, CheckCircle, Clock, Edit3, Download } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface StudentProject {
  id: string
  name: string
  rollNumber: string
  projectId: string
  project: string
  status: string
  submissionDate: string
  grade?: string
  score?: number
  evaluation?: {
    criteriaScores: { [k: string]: number }
    comments: string
    recommendations: string
    totalScore: number
    grade: string
    evaluatedAt: string
  }
}

interface EvaluationCriteria {
  name: string
  weight: number
}

const evaluationCriteria: EvaluationCriteria[] = [
  { name: "Code Quality", weight: 25 },
  { name: "Functionality", weight: 30 },
  { name: "User Interface", weight: 20 },
  { name: "Documentation", weight: 15 },
  { name: "Innovation", weight: 10 },
]

export default function FacultyEvaluation() {
  const { user, token } = useAuth()
  const [studentsForEvaluation, setStudentsForEvaluation] = useState<StudentProject[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentProject | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<{ [key: string]: number | "" }>({})
  const [overallGrade, setOverallGrade] = useState<string>("")
  const [comments, setComments] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [search, setSearch] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Export to Excel function
  const exportToExcel = () => {
    setExporting(true)
    try {
      const evaluatedStudents = studentsForEvaluation.filter(s => s.status === "evaluated")
      
      if (evaluatedStudents.length === 0) {
        toast.error("No evaluated students to export")
        setExporting(false)
        return
      }

      // Prepare CSV content
      const headers = [
        "Student Name",
        "Roll Number",
        "Project Name",
        "Submission Date",
        "Code Quality (/25)",
        "Functionality (/30)",
        "User Interface (/20)",
        "Documentation (/15)",
        "Innovation (/10)",
        "Total Score (/100)",
        "Grade",
        "Comments",
        "Recommendations",
        "Evaluated Date"
      ]

      const csvContent = [
        headers.join(","),
        ...evaluatedStudents.map(student => {
          const evaluation = student.evaluation
          return [
            `"${student.name}"`,
            `"${student.rollNumber}"`,
            `"${student.project}"`,
            `"${student.submissionDate ? new Date(student.submissionDate).toLocaleDateString() : ''}"`,
            evaluation?.criteriaScores["Code Quality"] || 0,
            evaluation?.criteriaScores["Functionality"] || 0,
            evaluation?.criteriaScores["User Interface"] || 0,
            evaluation?.criteriaScores["Documentation"] || 0,
            evaluation?.criteriaScores["Innovation"] || 0,
            student.score || evaluation?.totalScore || 0,
            `"${student.grade || evaluation?.grade || ''}"`,
            `"${evaluation?.comments?.replace(/"/g, '""') || ''}"`,
            `"${evaluation?.recommendations?.replace(/"/g, '""') || ''}"`,
            `"${evaluation?.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString() : ''}"`
          ].join(",")
        })
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `evaluation_results_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Evaluation results exported successfully!")
    } catch (error) {
      toast.error("Failed to export evaluation results")
      console.error("Export error:", error)
    }
    setExporting(false)
  }

  // Fetch students and only their 100% completed projects
  useEffect(() => {
    if (!token || !user?.id) {
      setLoading(false)
      setError("You must be logged in as faculty to view evaluations.")
      return
    }
    setLoading(true)
    setError("")
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/faculty/${user.id}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch students")
        const students = await res.json()
        if (!Array.isArray(students) || students.length === 0) {
          setStudentsForEvaluation([])
          setError("No students found for your faculty account.")
          setLoading(false)
          return
        }
        const allProjects: StudentProject[] = []
        for (const student of students) {
          const resProjects = await fetch(`/api/students/${student._id}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!resProjects.ok) continue
          const projects = await resProjects.json()
          for (const project of projects) {
            // Fetch project details to get progress and finalSubmissionDate
            const resProjectDetail = await fetch(`/api/projects/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (!resProjectDetail.ok) continue
            const projectDetail = await resProjectDetail.json()
            // Only include projects with 100% progress
            if (projectDetail.progress === 100) {
              // Force status to "ready_for_evaluation" if not evaluated
              let status = project.status;
              if (status !== "evaluated") status = "ready_for_evaluation";
              allProjects.push({
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                projectId: project._id,
                project: project.name,
                status,
                submissionDate: projectDetail.finalSubmissionDate
                  ? projectDetail.finalSubmissionDate.slice(0, 10)
                  : (project.submissionDate?.slice(0, 10) || ""),
                grade: projectDetail.evaluation?.grade ?? project.grade ?? "",
                score: projectDetail.evaluation?.totalScore ?? project.score ?? 0,
                evaluation: projectDetail.evaluation
                  ? {
                      criteriaScores: Object.fromEntries(
                        Object.entries(projectDetail.evaluation.criteriaScores || {}).map(
                          ([k, v]) => [k, Number(v)]
                        )
                      ),
                      comments: projectDetail.evaluation.comments || "",
                      recommendations: projectDetail.evaluation.recommendations || "",
                      totalScore: projectDetail.evaluation.totalScore ?? 0,
                      grade: projectDetail.evaluation.grade ?? "",
                      evaluatedAt: projectDetail.evaluation.evaluatedAt,
                    }
                  : undefined,
              })
            }
          }
        }
        setStudentsForEvaluation(allProjects)
        if (allProjects.length === 0) {
          setError("No completed student projects found.")
        }
        // Prefer to select a project that is ready for evaluation, else first project
        const pending = allProjects.find((s) => s.status === "ready_for_evaluation")
        const initialStudent = pending || allProjects[0] || null
        setSelectedStudent(initialStudent)
      } catch (e: any) {
        setStudentsForEvaluation([])
        setError("Error fetching students or projects. Please try again later.")
      }
      setLoading(false)
    }
    fetchData()
  }, [token, user?.id])

  // Always fetch latest evaluation and set form fields when selectedStudent changes
  useEffect(() => {
    const loadEvaluation = async () => {
      if (!selectedStudent?.projectId || !token) {
        setCriteriaScores({})
        setOverallGrade("")
        setComments("")
        setRecommendations("")
        setEditMode(false)
        return
      }
      try {
        const res = await fetch(`/api/projects/${selectedStudent.projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          setCriteriaScores({})
          setOverallGrade("")
          setComments("")
          setRecommendations("")
          setEditMode(false)
          return
        }
        const detail = await res.json()
        if (detail.evaluation) {
          // Always set form fields from backend response
          setCriteriaScores(
            Object.fromEntries(
              Object.entries(detail.evaluation.criteriaScores || {}).map(([k, v]) => [k, Number(v)])
            )
          )
          setOverallGrade(detail.evaluation.grade || "")
          setComments(detail.evaluation.comments || "")
          setRecommendations(detail.evaluation.recommendations || "")
          setEditMode(false)
        } else {
          setCriteriaScores({})
          setOverallGrade("")
          setComments("")
          setRecommendations("")
          setEditMode(false)
        }
      } catch {
        setCriteriaScores({})
        setOverallGrade("")
        setComments("")
        setRecommendations("")
        setEditMode(false)
      }
    }
    loadEvaluation()
  }, [selectedStudent?.projectId, token])

  // Filter students by name, roll, or project
  const filteredStudents = studentsForEvaluation.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.project.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate total score (out of 100)
  const totalScore = evaluationCriteria.reduce(
    (acc, c) =>
      acc +
      (criteriaScores[c.name] === "" || criteriaScores[c.name] === undefined
        ? 0
        : Number(criteriaScores[c.name])),
    0
  )

  // Grade calculation helper
  function getGrade(score: number) {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B+"
    if (score >= 60) return "B"
    if (score >= 50) return "C+"
    if (score >= 40) return "C"
    return "F"
  }

  // Handle evaluation submit
  const handleSubmit = async () => {
    if (!selectedStudent || !token) return

    // Check if all criteria are filled and valid
    const missing = evaluationCriteria.find(
      (c) =>
        criteriaScores[c.name] === undefined ||
        criteriaScores[c.name] === "" ||
        isNaN(Number(criteriaScores[c.name]))
    )
    if (missing) {
      toast.error(`Please enter marks for "${missing.name}"`)
      return
    }

    try {
      const res = await fetch(`/api/projects/${selectedStudent.projectId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          criteriaScores,
          totalScore: Math.round(totalScore),
          grade: overallGrade || getGrade(totalScore),
          comments,
          recommendations,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit evaluation")
      toast.success("Evaluation submitted successfully")
      // Refetch project details to get updated score/grade/status
      const resProjectDetail = await fetch(`/api/projects/${selectedStudent.projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const projectDetail = await resProjectDetail.json()
      setStudentsForEvaluation((prev) =>
        prev.map((s) =>
          s.projectId === selectedStudent.projectId
            ? {
                ...s,
                status: "evaluated",
                grade: projectDetail.grade || overallGrade || getGrade(totalScore),
                score: projectDetail.score || Math.round(totalScore),
                evaluation: {
                  criteriaScores: Object.fromEntries(
                    Object.entries(criteriaScores).map(([k, v]) => [k, Number(v)])
                  ),
                  comments,
                  recommendations,
                  totalScore: Math.round(totalScore),
                  grade: projectDetail.grade || overallGrade || getGrade(totalScore),
                  evaluatedAt: new Date().toISOString(),
                },
              }
            : s
        )
      )
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: "evaluated",
              grade: projectDetail.grade || overallGrade || getGrade(totalScore),
              score: projectDetail.score || Math.round(totalScore),
              evaluation: {
                criteriaScores: Object.fromEntries(
                  Object.entries(criteriaScores).map(([k, v]) => [k, Number(v)])
                ),
                comments,
                recommendations,
                totalScore: Math.round(totalScore),
                grade: projectDetail.grade || overallGrade || getGrade(totalScore),
                evaluatedAt: new Date().toISOString(),
              },
            }
          : null
      )
      // NEW: Immediately update form fields with latest evaluation
      setCriteriaScores(
        Object.fromEntries(
          Object.entries(criteriaScores).map(([k, v]) => [k, Number(v)])
        )
      )
      setOverallGrade(projectDetail.grade || overallGrade || getGrade(totalScore))
      setComments(comments)
      setRecommendations(recommendations)
      setEditMode(false)
    } catch (error) {
      toast.error("Failed to submit evaluation")
    }
  }

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Project Evaluation
                  </h1>
                  <p className="mt-2 text-gray-600 text-lg">Evaluate and grade completed student projects</p>
                </div>
              </div>
              
              {/* Export Button */}
              <Button 
                onClick={exportToExcel}
                disabled={exporting || studentsForEvaluation.filter(s => s.status === "evaluated").length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students List */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Students for Evaluation
                  </CardTitle>
                  <CardDescription className="text-gray-600">Click on a student to start evaluation</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, roll, or project"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-sm focus:shadow-md transition-all duration-300"
                    />
                  </div>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-red-300 mx-auto mb-3" />
                          <div className="text-red-500 text-sm">{error}</div>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <div className="text-gray-500">No students found.</div>
                        </div>
                      ) : (
                        filteredStudents.map((student) => (
                          <Card
                            key={student.projectId}
                            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${
                              selectedStudent?.projectId === student.projectId
                                ? "ring-2 ring-blue-500 shadow-lg scale-[1.02]"
                                : "hover:scale-[1.01]"
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                      <div className="text-xs text-gray-500">Roll: {student.rollNumber}</div>
                                    </div>
                                  </div>
                                  {student.status === "evaluated" ? (
                                    <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-sm">
                                      <Award className="h-3 w-3 mr-1" />
                                      {student.grade}
                                    </Badge>
                                  ) : student.status === "ready_for_evaluation" ? (
                                    <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 shadow-sm">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="shadow-sm">{student.status}</Badge>
                                  )}
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <p className="text-sm text-gray-700 font-medium">{student.project}</p>
                                </div>
                                {student.status === "evaluated" && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-emerald-600 font-semibold">
                                      Score: {(student.score ?? student.evaluation?.totalScore)}/100
                                    </span>
                                    {student.submissionDate && (
                                      <span className="text-gray-500">
                                        <Calendar className="h-3 w-3 inline mr-1" />
                                        {new Date(student.submissionDate).toLocaleDateString()}
                                      </span>
                                    )}
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

            {/* Evaluation Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    Evaluation Form
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {selectedStudent
                      ? `Evaluate ${selectedStudent.name}'s "${selectedStudent.project}" project`
                      : "Select a student to evaluate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {selectedStudent ? (
                    <>
                      {/* Project Details */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                          <FileText className="h-4 w-4" />
                          Project Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <span className="font-medium text-gray-700">Student:</span>
                            <p className="text-gray-900 font-semibold">{selectedStudent.name}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <span className="font-medium text-gray-700">Roll Number:</span>
                            <p className="text-gray-900 font-semibold">{selectedStudent.rollNumber}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-blue-100 md:col-span-2">
                            <span className="font-medium text-gray-700">Project:</span>
                            <p className="text-gray-900 font-semibold">{selectedStudent.project}</p>
                          </div>
                          {selectedStudent.submissionDate && (
                            <div className="bg-white p-3 rounded-lg border border-blue-100 md:col-span-2">
                              <span className="font-medium text-gray-700">Submission Date:</span>
                              <p className="text-gray-900 font-semibold">
                                {new Date(selectedStudent.submissionDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Evaluation Criteria */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-purple-800">
                          <BarChart3 className="h-4 w-4" />
                          Evaluation Criteria
                        </h4>
                        <div className="space-y-4">
                          {evaluationCriteria.map((criteria, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-purple-100">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-semibold text-gray-800">
                                  {criteria.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  Max: {criteria.weight} points
                                </Badge>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={criteria.weight}
                                value={
                                  criteriaScores[criteria.name] === undefined
                                    ? ""
                                    : criteriaScores[criteria.name]
                                }
                                onChange={e => {
                                  let val = e.target.value
                                  // Allow empty string for erasing
                                  if (val === "") {
                                    setCriteriaScores(prev => ({
                                      ...prev,
                                      [criteria.name]: "",
                                    }))
                                    return
                                  }
                                  let num = Number(val)
                                  if (num > criteria.weight) num = criteria.weight
                                  if (num < 0) num = 0
                                  setCriteriaScores(prev => ({
                                    ...prev,
                                    [criteria.name]: num,
                                  }))
                                }}
                                disabled={selectedStudent?.status === "evaluated" && !editMode}
                                placeholder={`Enter score (0 - ${criteria.weight})`}
                                className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Score Summary */}
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-800">
                          <TrendingUp className="h-4 w-4" />
                          Score Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{Math.round(totalScore)}</div>
                            <div className="text-xs text-gray-600">Total Score</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{getGrade(totalScore)}</div>
                            <div className="text-xs text-gray-600">Suggested Grade</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{Math.round((totalScore / 100) * 100)}%</div>
                            <div className="text-xs text-gray-600">Percentage</div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Grade */}
                      <div>
                        <Label htmlFor="overall-grade" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Overall Grade
                        </Label>
                        <Select
                          value={overallGrade}
                          onValueChange={setOverallGrade}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
                        >
                          <SelectTrigger className="bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                            <SelectValue placeholder={overallGrade || getGrade(totalScore)} />
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
                        <Label htmlFor="comments" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Evaluation Comments
                        </Label>
                        <Textarea
                          id="comments"
                          placeholder="Provide detailed feedback on the project..."
                          className="min-h-24 bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
                        />
                      </div>

                      {/* Recommendations */}
                      <div>
                        <Label htmlFor="recommendations" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Recommendations for Improvement
                        </Label>
                        <Textarea
                          id="recommendations"
                          placeholder="Suggest areas for improvement..."
                          className="min-h-20 bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                          value={recommendations}
                          onChange={(e) => setRecommendations(e.target.value)}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
                        />
                      </div>

                      {/* Action Buttons */}
                      {selectedStudent.status !== "evaluated" || editMode ? (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg" 
                            onClick={handleSubmit}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editMode ? "Update Evaluation" : "Submit Evaluation"}
                          </Button>
                          {editMode && (
                            <Button variant="outline" onClick={() => setEditMode(false)} className="shadow-sm">
                              Cancel
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-emerald-800 font-semibold flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5" />
                                Evaluation Completed
                              </div>
                              <div className="text-sm text-emerald-700">
                                Score: <span className="font-bold">{selectedStudent.score}</span> / 100 &nbsp;|&nbsp;
                                Grade: <span className="font-bold">{selectedStudent.grade}</span>
                              </div>
                              {selectedStudent.evaluation?.evaluatedAt && (
                                <div className="text-xs text-emerald-600 mt-1">
                                  Evaluated on {new Date(selectedStudent.evaluation.evaluatedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditMode(true)}
                              className="bg-white hover:bg-gray-50 shadow-sm"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Modify
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <div className="text-gray-500 text-lg">Select a student to start evaluation</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Evaluation Statistics */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Evaluations</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {studentsForEvaluation.filter((s) => s.status === "evaluated").length}
                </div>
                <p className="text-xs text-blue-700 font-medium">This semester</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Average Grade</CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {(() => {
                    const evaluated = studentsForEvaluation.filter((s) => s.status === "evaluated")
                    if (!evaluated.length) return "-"
                    const avg = evaluated.reduce((acc, s) => acc + (s.score || 0), 0) / evaluated.length
                    return getGrade(avg)
                  })()}
                </div>
                <p className="text-xs text-amber-700 font-medium">Class average</p>
              </CardContent>
            </Card>

            {/* <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Pending Reviews</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {studentsForEvaluation.filter((s) => s.status === "ready_for_evaluation").length}
                </div>
                <p className="text-xs text-red-700 font-medium">Awaiting evaluation</p>
              </CardContent>
            </Card> */}

            <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">A Grade Projects</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {studentsForEvaluation.filter((s) => ["A+", "A"].includes(s.grade || "")).length}
                </div>
                <p className="text-xs text-emerald-700 font-medium">Excellent work</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
