"use client"

import type React from "react"

import { useRequireAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "employer" | "candidate">
  fallback?: React.ReactNode
}

export function AuthGuard({ children, allowedRoles, fallback }: AuthGuardProps) {
  const { user, loading, authorized } = useRequireAuth(allowedRoles)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">Please sign in to access this page.</p>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  if (!authorized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
              <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
