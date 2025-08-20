"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Building,
  IdCard,
  BookOpen,
  Users,
  RefreshCw
} from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "",
    university: "",
    rollNumber: "",
    semester: "",
    facultyId: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Define a Faculty type for better type safety
  type Faculty = {
    _id: string
    name: string
    university?: string
    // add other fields if needed
  }

  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [facultyLoading, setFacultyLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register } = useAuth()
  const router = useRouter()

  // Fetch faculties function
  const fetchFaculties = async () => {
    setFacultyLoading(true)
    try {
      console.log("Fetching faculties...")
      const response = await fetch("/api/faculty")
      console.log("Faculty API response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Faculty data received:", data)
        
        // Handle different possible response structures
        if (Array.isArray(data)) {
          setFaculties(data)
        } else if (data.faculties && Array.isArray(data.faculties)) {
          setFaculties(data.faculties)
        } else if (data.users && Array.isArray(data.users)) {
          // In case the API returns all users, filter for faculty
          const facultyUsers = data.users.filter((user: any) => user.role === 'faculty')
          setFaculties(facultyUsers)
        } else {
          console.error("Unexpected faculty data structure:", data)
          setFaculties([])
        }
      } else {
        console.error("Failed to fetch faculties, status:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        setFaculties([])
      }
    } catch (error) {
      console.error("Error fetching faculty list:", error)
      setFaculties([])
    } finally {
      setFacultyLoading(false)
    }
  }

  useEffect(() => {
    if (formData.role === "student") {
      fetchFaculties()
    } else {
      setFaculties([])
    }
  }, [formData.role])

  useEffect(() => {
    // Calculate password strength
    const password = formData.password
    let strength = 0
    
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(strength)
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please use a stronger password.")
      setLoading(false)
      return
    }

    const userData = {
      role: formData.role as "student" | "faculty",
      name: formData.name,
      university: formData.role === "faculty" ? formData.university : undefined,
      rollNumber: formData.role === "student" && formData.rollNumber.trim() !== "" ? formData.rollNumber : undefined,
      semester: formData.role === "student" && formData.semester.trim() !== "" ? Number.parseInt(formData.semester) : undefined,
      facultyId: formData.role === "student" && formData.facultyId.trim() !== "" ? formData.facultyId : undefined,
    }

    console.log("Submitting registration data:", userData)

    const success = await register(formData.email, formData.password, userData)

    if (success) {
      router.push("/")
    } else {
      setError("Registration failed. Please try again.")
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-white/60 backdrop-blur-sm transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Register Card */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Join Our Platform
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg mt-2">
              Create your account to start managing projects
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="pl-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="pl-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Faculty
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty-specific fields */}
              {formData.role === "faculty" && (
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    University
                  </Label>
                  <div className="relative">
                    <Input
                      id="university"
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange("university", e.target.value)}
                      required
                      placeholder="Enter your university name"
                      className="pl-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                    />
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Student-specific fields */}
              {formData.role === "student" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-blue-600" />
                      Roll Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="rollNumber"
                        type="text"
                        value={formData.rollNumber}
                        onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                        required
                        placeholder="Enter your roll number"
                        className="pl-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                      />
                      <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      Semester
                    </Label>
                    <Select value={formData.semester} onValueChange={(value) => handleInputChange("semester", value)}>
                      <SelectTrigger className="h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Select Faculty
                      {facultyLoading && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                    </Label>
                    <Select
                      value={formData.facultyId}
                      onValueChange={(value) => handleInputChange("facultyId", value)}
                      disabled={facultyLoading}
                    >
                      <SelectTrigger className="h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder={
                          facultyLoading ? "Loading faculty..." : 
                          faculties.length === 0 ? "No faculty available" :
                          "Choose a faculty mentor"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.length === 0 && !facultyLoading ? (
                          <SelectItem value="no-faculty" disabled>
                            <div className="flex items-center gap-2 text-gray-500">
                              <AlertCircle className="h-4 w-4" />
                              No faculty members found
                            </div>
                          </SelectItem>
                        ) : (
                          faculties.map((faculty: any) => (
                            <SelectItem key={faculty._id} value={faculty._id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{faculty.name}</span>
                                <span className="text-xs text-gray-500">{faculty.university || 'University not specified'}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {/* Debug info */}
                    <div className="text-xs text-gray-500">
                      {faculties.length > 0 ? `Found ${faculties.length} faculty member(s)` : 
                       !facultyLoading ? "No faculty members available" : "Loading..."}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="pl-12 pr-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength <= 2 ? "text-red-600" : 
                        passwordStrength <= 3 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="pl-12 pr-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg font-semibold" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link href="/auth/login">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-lg font-semibold"
                >
                  Sign In Instead
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 text-center">
                <strong>Welcome to the platform!</strong><br />
                {formData.role === "student" 
                  ? "Start submitting and tracking your academic projects."
                  : formData.role === "faculty"
                  ? "Begin reviewing and mentoring student projects."
                  : "Choose your role to get started with project management."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
