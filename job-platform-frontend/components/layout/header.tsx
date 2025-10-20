"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { User, Settings, LogOut, Briefcase, Menu, X, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import NotificationBell from "@/components/notifications/NotificationBell"

export function Header() {
  const { user, logout, setShowProfileModal } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Debug user role
  useEffect(() => {
    if (user) {
      console.log('🔔 Header - User role:', user.role);
      if (user.role === "candidate") {
        console.log('🔔 Header - Showing notification bell for candidate');
      } else {
        console.log('🔔 Header - Not showing notification bell for role:', user.role);
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const navigationItems = [
    { name: "Jobs", href: "/jobs" },
    { name: "Career Advice", href: "/career-advice" },
    { name: "Companies", href: "/companies", hideForRoles: ["employer", "team_member"] },
    { name: "Candidates", href: "/candidates", showForRoles: ["employer", "team_member"] },
    { name: "Pipeline", href: "/employer/kanban", showForRoles: ["employer", "team_member"] },
    { name: "Dashboard", href: "/candidate/dashboard", showForRoles: ["candidate"] },
    { name: "Pricing", href: "/pricing" },
    { name: "Subscription", href: "/subscription/manage", showForRoles: ["employer", "candidate"] },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user?.role === "super_admin" ? "/admin" : (user ? "/dashboard" : "/")} className="flex items-center space-x-2">
            <Briefcase className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold">JobPlatform</span>
          </Link>

          {/* Desktop Navigation - Hidden for super_admin */}
          {user?.role !== "super_admin" && (
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems
                .filter((item) => {
                  // Hide items for specific roles
                  if (item.hideForRoles && user?.role && item.hideForRoles.includes(user.role)) {
                    return false
                  }
                  // Show items only for specific roles
                  if (item.showForRoles && (!user?.role || !item.showForRoles.includes(user.role))) {
                    return false
                  }
                  return true
                })
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium hover:text-primary transition-colors ${pathname && (pathname === item.href || pathname.startsWith(item.href + "/")) ? "text-primary" : ""}`}
                  >
                    {item.name}
                  </Link>
                ))}
              {user?.role === "employer" && (
                <Link href="/jobs/manage" className="text-sm font-medium hover:text-primary transition-colors">
                  Manage Jobs
                </Link>
              )}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell - Only for candidates */}
                {user.role === "candidate" && (
                  <div className="flex items-center gap-2">
                    <NotificationBell />
                  </div>
                )}
                
                {(user.role === "employer" || user.role === "super_admin") && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/jobs/post">Post A Job</Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "candidate" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/candidate/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Candidate Dashboard
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile Page
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "employer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/jobs/manage">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Manage Jobs
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(user.role === "employer" || user.role === "candidate") && (
                      <DropdownMenuItem asChild>
                        <Link href="/subscription/manage">
                          <Settings className="mr-2 h-4 w-4" />
                          Subscription
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button - Hidden for super_admin */}
            {user?.role !== "super_admin" && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Hidden for super_admin */}
        {isMobileMenuOpen && user?.role !== "super_admin" && (
          <div className="lg:hidden border-t bg-background">
            <nav className="py-4 space-y-2">
              {navigationItems
                .filter((item) => {
                  // Hide items for specific roles
                  if (item.hideForRoles && user?.role && item.hideForRoles.includes(user.role)) {
                    return false
                  }
                  // Show items only for specific roles
                  if (item.showForRoles && (!user?.role || !item.showForRoles.includes(user.role))) {
                    return false
                  }
                  return true
                })
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-4 py-2 text-sm font-medium hover:text-primary transition-colors ${pathname && (pathname === item.href || pathname.startsWith(item.href + "/")) ? "text-primary" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              {user?.role === "employer" && (
                <Link
                  href="/jobs/manage"
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manage Jobs
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
