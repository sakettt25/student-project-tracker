"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Award, 
  FileText,
  ArrowRight,
  Star,
  BookOpen,
  MessageSquare
} from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "faculty") {
        router.push("/faculty/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Student Project Tracker
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Project Management System</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Modern Project Management
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                Streamline Your<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Academic Projects</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                A comprehensive platform designed to enhance collaboration between students and faculty, 
                making project management efficient and transparent.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl w-fit mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">1000+</h3>
                  <p className="text-gray-600">Active Students</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl w-fit mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">5000+</h3>
                  <p className="text-gray-600">Projects Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl w-fit mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">200+</h3>
                  <p className="text-gray-600">Faculty Members</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Designed for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Everyone</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're a student managing projects or faculty overseeing submissions, 
                our platform provides the tools you need for success.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Faculty Features */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <div className="flex items-center gap-4 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">For Faculty</h3>
                      <p className="text-indigo-100">Comprehensive project oversight</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Review & Approve Projects</h4>
                        <p className="text-gray-600 text-sm">Efficiently review student submissions and provide approvals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Track Student Progress</h4>
                        <p className="text-gray-600 text-sm">Monitor real-time progress across all student projects</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Provide Structured Feedback</h4>
                        <p className="text-gray-600 text-sm">Give detailed feedback and evaluations to help students improve</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Monitor Statistics</h4>
                        <p className="text-gray-600 text-sm">Access comprehensive analytics and project statistics</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Features */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                  <div className="flex items-center gap-4 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Target className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">For Students</h3>
                      <p className="text-emerald-100">Seamless project management</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Submit Projects Easily</h4>
                        <p className="text-gray-600 text-sm">Simple and intuitive project submission process</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Track Status in Real-time</h4>
                        <p className="text-gray-600 text-sm">Monitor your project status and approval progress instantly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Receive Instant Feedback</h4>
                        <p className="text-gray-600 text-sm">Get timely feedback from faculty to improve your work</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Award className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Showcase Progress</h4>
                        <p className="text-gray-600 text-sm">Update and showcase your project development journey</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-12 text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of students and faculty already using our platform to streamline their project management.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 border-white text-black hover:bg-white hover:text-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Student Project Tracker</h3>
                  <p className="text-sm text-gray-600">Empowering academic excellence</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm">
           Crafted & coded by <i className="text-gray-800">Natasha</i> &{" "}
          <i className="text-gray-800">Saket Saurav</i>
        </p>
                <p className="text-sm text-gray-500">© 2025 Student Project Tracker. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
