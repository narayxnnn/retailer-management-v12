"use client"

import { useState, useEffect } from "react"
import { TaskDashboard } from "@/components/task-dashboard"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUsername(data.user.username)
        }
      }
    } catch (error) {
      console.error("Session check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setIsAuthenticated(false)
      setUsername("")
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Unable to logout",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        onSuccess={(user) => {
          setUsername(user)
          setIsAuthenticated(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TaskDashboard />
    </div>
  )
}
