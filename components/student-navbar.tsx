"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"

const navItems = [
	{ href: "/student/dashboard", label: "Dashboard" },
	{ href: "/student/projects", label: "Projects" },
	{ href: "/student/progress", label: "Progress" },
]

export function StudentNavbar() {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout } = useAuth()

	const handleLogout = async () => {
		try {
			// Call the logout function from auth context
			await logout()

			// Clear any local storage items
			localStorage.removeItem("token")
			localStorage.removeItem("user")

			// Clear session storage as well
			sessionStorage.removeItem("token")
			sessionStorage.removeItem("user")

			// Redirect to auth/login page
			router.push("/auth/login")
			router.refresh()
		} catch (error) {
			console.error("Logout error:", error)
			// Force redirect even if logout fails
			router.push("/auth/login")
		}
	}

	return (
		<nav className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center space-x-8">
						<div className="flex-shrink-0">
							<h1 className="text-xl font-bold text-green-600">
								Student Portal
							</h1>
						</div>
						<div className="hidden md:flex space-x-8">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
										pathname === item.href
											? "border-green-500 text-green-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
									)}
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-sm text-gray-700">
							Welcome, {user?.name || "Student"}
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
					</div>
				</div>
			</div>
		</nav>
	)
}
