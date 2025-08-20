"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogOut, Menu } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/faculty/dashboard", label: "Dashboard" },
  { href: "/faculty/project-review", label: "Project Review" },
  { href: "/faculty/progress", label: "Progress" },
  { href: "/faculty/evaluation", label: "Evaluation" },
]

export function FacultyNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("user")
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/auth/login")
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Branding & Desktop Links */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Faculty Portal
              </h1>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2 py-1 rounded transition-colors text-sm font-medium",
                    pathname === item.href
                      ? "text-blue-600 bg-gray-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {/* User & Actions */}
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-800">{user?.name || "Faculty"}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            {/* Mobile Menu button */}
            <button
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-3 bg-white rounded-md shadow">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 text-sm rounded font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gray-100 text-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              <Button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 flex justify-center items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
