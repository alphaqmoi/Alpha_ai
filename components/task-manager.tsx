"use client"

import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"

export interface Task {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "failed"
  type: "thinking" | "trading" | "learning" | "analyzing" | "processing"
  progress: number
  startTime: Date
  endTime?: Date
  details?: string
}

interface TaskManagerContextValue {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "startTime" | "status" | "progress">) => string
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "startTime">>) => void
  removeTask: (id: string) => void
  getActiveTasksCount: (type?: Task["type"]) => number
  TasksDisplay: () => JSX.Element
}

// Create the context
const TaskManagerContext = createContext<TaskManagerContextValue | undefined>(undefined)

// Provider component
export function TaskManagerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const isInitialized = useRef(false)

  // This would be replaced with actual task management logic
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    // Load any existing tasks from storage
    const storedTasks = localStorage.getItem("alpha_tasks")
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks)
        // Convert string dates back to Date objects
        const processedTasks = parsedTasks.map((task: any) => ({
          ...task,
          startTime: new Date(task.startTime),
          endTime: task.endTime ? new Date(task.endTime) : undefined,
        }))
        setTasks(processedTasks)
      } catch (err) {
        console.error("Error loading tasks:", err)
      }
    }
  }, [])

  // Save tasks to storage when they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("alpha_tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  // Add a new task
  const addTask = (task: Omit<Task, "id" | "startTime" | "status" | "progress">) => {
    const newTask: Task = {
      id: Date.now().toString(),
      status: "running",
      progress: 0,
      startTime: new Date(),
      ...task,
    }
    setTasks((prev) => [...prev, newTask])
    return newTask.id
  }

  // Update a task
  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "startTime">>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            ...updates,
            endTime: updates.status === "completed" || updates.status === "failed" ? new Date() : task.endTime,
          }
        }
        return task
      }),
    )
  }

  // Remove a task
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Get task icon based on type
  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "thinking":
        return <Brain className="h-4 w-4" />
      case "trading":
        return <TrendingUp className="h-4 w-4" />
      case "learning":
        return <Brain className="h-4 w-4" />
      case "analyzing":
        return <RefreshCw className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Get task status icon
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "running":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  // Get active tasks count by type
  const getActiveTasksCount = (type?: Task["type"]) => {
    return tasks.filter((task) => task.status === "running" && (type ? task.type === type : true)).length
  }

  const TasksDisplay = () => {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            Active Tasks
            <Badge variant="outline">{getActiveTasksCount()} running</Badge>
          </CardTitle>
          <CardDescription>Current operations being performed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No active tasks</div>
          ) : (
            tasks
              .filter((task) => task.status !== "completed" || Date.now() - task.endTime!.getTime() < 60000)
              .sort((a, b) => {
                // Sort by status (running first, then pending, then completed, then failed)
                const statusOrder = { running: 0, pending: 1, completed: 2, failed: 3 }
                return statusOrder[a.status] - statusOrder[b.status]
              })
              .map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    task.status === "running"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : task.status === "completed"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : task.status === "failed"
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "bg-yellow-50 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-background">{getTaskIcon(task.type)}</div>
                    <div>
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.details || `${task.type} task`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === "running" && <span className="text-xs">{task.progress}%</span>}
                    {getStatusIcon(task.status)}
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    )
  }

  const value = {
    tasks,
    addTask,
    updateTask,
    removeTask,
    getActiveTasksCount,
    TasksDisplay,
  }

  return <TaskManagerContext.Provider value={value}>{children}</TaskManagerContext.Provider>
}

// Custom hook to use the task manager context
export function useTaskManager() {
  const context = useContext(TaskManagerContext)
  if (context === undefined) {
    throw new Error("useTaskManager must be used within a TaskManagerProvider")
  }
  return context
}
