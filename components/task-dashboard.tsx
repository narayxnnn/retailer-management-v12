"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Search, User, ChevronDown, Filter, SortAsc, SortDesc, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { AddTaskModal } from "@/components/add-task-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Task } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    // Ensure SWR surfaces an error instead of passing a non-array JSON to the UI
    const message = await res.text()
    throw new Error(message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function TaskDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dayFilter, setDayFilter] = useState("all")
  const [loadTypeFilter, setLoadTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("retailer")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  const {
    data: tasks = [],
    error,
    mutate,
  } = useSWR<Task[]>(
    `/api/tasks?search=${encodeURIComponent(searchQuery)}&day=${dayFilter}`,
    fetcher,
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  )

  // Keep the open modal's selectedTask in sync with the latest fetched data
  useEffect(() => {
    if (!isModalOpen || !selectedTask) return
    const updated = tasks.find((t) => t.id === selectedTask.id)
    if (updated) {
      setSelectedTask(updated)
    }
  }, [tasks, isModalOpen, selectedTask?.id])

  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : []

  const filteredAndSortedTasks = safeTasks
    .filter((task) => {
      const matchesLoadType = loadTypeFilter === "all" || task.loadType === loadTypeFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && task.completed) ||
        (statusFilter === "pending" && !task.completed)
      return matchesLoadType && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "retailer":
          aValue = a.retailer
          bValue = b.retailer
          break
        case "day":
          aValue = a.day
          bValue = b.day
          break
        case "fileCount":
          aValue = a.fileCount
          bValue = b.fileCount
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        default:
          aValue = a.retailer
          bValue = b.retailer
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const handleViewMore = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map((task) => task.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })
      mutate() // Refresh the data
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading tasks</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <h1 className="text-xl font-bold">Guide4360</h1>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search retailers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <AddTaskModal onTaskAdded={() => mutate()} />
            <Badge variant="outline" className="hidden sm:inline-flex">
              {selectedTasks.size} selected
            </Badge>
            <ThemeToggle />
            <div className="border-b bg-card">
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row items-center gap-2 sm:gap-4">
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Day filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="Mon - Fri">Mon - Fri</SelectItem>
                    <SelectItem value="Mon - Sun">Mon - Sun</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>

          <Select value={loadTypeFilter} onValueChange={setLoadTypeFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Load type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Load Types</SelectItem>
              <SelectItem value="Direct load">Direct load</SelectItem>
              <SelectItem value="Indirect load">Indirect load</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="fileCount">File Count</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={toggleSort} className="col-span-2 sm:col-span-1 bg-transparent">
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
            <span className="sm:hidden">Sort</span>
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="p-4 sm:p-6">
        {/* Select All Header */}
        <div className="flex items-center gap-4 mb-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
          <Checkbox
            checked={selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            <span className="hidden sm:inline">Select All </span>({filteredAndSortedTasks.length})
          </span>
          {selectedTasks.size > 0 && (
            <Button variant="outline" size="sm" className="ml-auto bg-transparent text-xs sm:text-sm">
              Bulk Actions
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredAndSortedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
                      className="mt-1 sm:mt-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3
                          className={`font-semibold text-base sm:text-lg ${task.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.retailer}
                        </h3>
                        {task.completed && (
                          <Badge variant="default" className="bg-green-500 w-fit">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.day}</p>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:hidden">
                        {task.formats.xlsx} xlsx, {task.formats.csv} csv, {task.formats.txt} txt
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {task.formats.xlsx} xlsx, {task.formats.csv} csv, {task.formats.txt} txt, {task.formats.mail} mail
                    </div>

                    <Badge variant={task.loadType === "Direct load" ? "default" : "secondary"} className="w-fit">
                      {task.loadType}
                    </Badge>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id, !task.completed)}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        {task.completed ? "Mark Pending" : "Mark Complete"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMore(task)}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">view more</span>
                        <span className="sm:hidden">view</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => mutate()}
      />
    </div>
  )
}
