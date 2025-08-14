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
import { Star, FileText, Award } from "lucide-react"
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
              allProjects.push({
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                projectId: project._id,
                project: project.name,
                status: project.status,
                submissionDate: projectDetail.finalSubmissionDate
                  ? projectDetail.finalSubmissionDate.slice(0, 10)
                  : (project.submissionDate?.slice(0, 10) || ""),
                grade:
                  project.grade ??
                  projectDetail.evaluation?.grade ??
                  projectDetail.evaluation?.grade,
                score:
                  typeof project.score === "number"
                    ? project.score
                    : projectDetail.evaluation?.totalScore,
                evaluation: projectDetail.evaluation
                  ? {
                      criteriaScores: Object.fromEntries(
                        Object.entries(projectDetail.evaluation.criteriaScores || {}).map(
                          ([k, v]) => [k, Number(v)]
                        )
                      ),
                      comments: projectDetail.evaluation.comments || "",
                      recommendations: projectDetail.evaluation.recommendations || "",
                      totalScore:
                        projectDetail.evaluation.totalScore ??
                        (typeof project.score === "number" ? project.score : 0),
                      grade:
                        projectDetail.evaluation.grade ??
                        project.grade ??
                        "",
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
        setSelectedStudent(pending || allProjects[0] || null)
      } catch (e: any) {
        setStudentsForEvaluation([])
        setError("Error fetching students or projects. Please try again later.")
      }
      setLoading(false)
    }
    fetchData()
  }, [token, user?.id])

  // Reset form when student changes
  useEffect(() => {
    setCriteriaScores({})
    setOverallGrade("")
    setComments("")
    setRecommendations("")
    setEditMode(false)
  }, [selectedStudent])

  // Filter students by name, roll, or project
  // (duplicate declaration removed)

  // Calculate total score (out of 100)
  // (duplicate declaration removed)

  // Grade calculation helper
  // function getGrade(score: number) {
  //   if (score >= 90) return "A+"
  //   if (score >= 80) return "A"
  //   if (score >= 70) return "B+"
  //   if (score >= 60) return "B"
  //   if (score >= 50) return "C+"
  //   if (score >= 40) return "C"
  //   return "F"
  // }

  // Handle evaluation submit
  // (duplicate removed)

  // EFFECT: when selectedStudent changes fetch latest evaluation to prefill
  useEffect(() => {
    const loadEvaluation = async () => {
      if (!selectedStudent?.projectId || !token) return
      try {
        const res = await fetch(`/api/projects/${selectedStudent.projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const detail = await res.json()
        if (detail.evaluation) {
          const cs: { [k: string]: number | "" } = {}
          Object.entries(detail.evaluation.criteriaScores || {}).forEach(([k, v]) => {
            cs[k] = Number(v)
          })
          setCriteriaScores(cs)
          setOverallGrade(detail.evaluation.grade || "")
          setComments(detail.evaluation.comments || "")
          setRecommendations(detail.evaluation.recommendations || "")
          setEditMode(false)
          // Add this: update selectedStudent score/grade if missing
          setSelectedStudent(prev =>
            prev
              ? {
                  ...prev,
                  score:
                    prev.score ??
                    detail.score ??
                    detail.evaluation.totalScore,
                  grade:
                    prev.grade ??
                    detail.grade ??
                    detail.evaluation.grade,
                }
              : prev
          )
        }
      } catch {}
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
            }
          : null
      )
      setEditMode(false)
    } catch (error) {
      toast.error("Failed to submit evaluation")
    }
  }

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
                  <Input
                    placeholder="Search by name, roll, or project"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-3"
                  />
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {loading ? (
                        <div className="text-gray-500">Loading...</div>
                      ) : error ? (
                        <div className="text-red-500">{error}</div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="text-gray-500">No students found.</div>
                      ) : (
                        filteredStudents.map((student) => (
                          <Card
                            key={student.projectId}
                            className={`cursor-pointer hover:shadow-md transition-shadow ${
                              selectedStudent?.projectId === student.projectId
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{student.name}</h4>
                                    <div className="text-xs text-gray-500">Roll: {student.rollNumber}</div>
                                  </div>
                                  {student.status === "evaluated" ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Award className="h-3 w-3 mr-1" />
                                      {student.grade}
                                    </Badge>
                                  ) : student.status === "ready_for_evaluation" ? (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      Pending
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">{student.status}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{student.project}</p>
                                {student.status === "evaluated" && (
                                  <p className="text-xs text-green-600">
                                    Score: {(student.score ?? student.evaluation?.totalScore)}/100
                                  </p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Evaluation Form
                  </CardTitle>
                  <CardDescription>
                    {selectedStudent
                      ? `Evaluate ${selectedStudent.name}'s "${selectedStudent.project}" project`
                      : "Select a student to evaluate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedStudent ? (
                    <>
                      {/* Project Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Project Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Student:</span> {selectedStudent.name}
                          </div>
                          <div>
                            <span className="font-medium">Roll Number:</span> {selectedStudent.rollNumber}
                          </div>
                          <div>
                            <span className="font-medium">Project:</span> {selectedStudent.project}
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
                                  {criteria.name} (out of {criteria.weight})
                                </Label>
                              </div>
                              <div className="w-32">
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
                                  placeholder={`0 - ${criteria.weight}`}
                                />
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
                        <Select
                          value={overallGrade}
                          onValueChange={setOverallGrade}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
                        >
                          <SelectTrigger className="mt-1">
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
                        <div className="mt-2 text-sm text-gray-600">
                          Calculated Score: <span className="font-bold">{Math.round(totalScore)}/100</span> &nbsp;|&nbsp; Suggested Grade: <span className="font-bold">{getGrade(totalScore)}</span>
                        </div>
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
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
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
                          value={recommendations}
                          onChange={(e) => setRecommendations(e.target.value)}
                          disabled={selectedStudent.status === "evaluated" && !editMode}
                        />
                      </div>

                      {/* Action Buttons */}
                      {selectedStudent.status !== "evaluated" || editMode ? (
                        <div className="flex gap-3">
                          <Button className="flex-1" onClick={handleSubmit}>
                            {editMode ? "Update Evaluation" : "Submit Evaluation"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="text-green-700 font-semibold">
                            Evaluation submitted.<br />
                            <span>
                              Score: <span className="font-bold">{selectedStudent.score}</span> / 100 &nbsp;|&nbsp;
                              Grade: <span className="font-bold">{selectedStudent.grade}</span>
                            </span>
                          </div>
                          <Button variant="outline" onClick={() => setEditMode(true)}>
                            Modify Evaluation
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500">Select a student to start evaluation.</div>
                  )}
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
                <div className="text-2xl font-bold">
                  {studentsForEvaluation.filter((s) => s.status === "evaluated").length}
                </div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const evaluated = studentsForEvaluation.filter((s) => s.status === "evaluated")
                    if (!evaluated.length) return "-"
                    const avg = evaluated.reduce((acc, s) => acc + (s.score || 0), 0) / evaluated.length
                    return getGrade(avg)
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">Class average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Award className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentsForEvaluation.filter((s) => s.status === "ready_for_evaluation").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting evaluation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Grade Projects</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentsForEvaluation.filter((s) => ["A+", "A"].includes(s.grade || "")).length}
                </div>
                <p className="text-xs text-muted-foreground">Excellent work</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
