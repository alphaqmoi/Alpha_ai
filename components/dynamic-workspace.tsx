"use client"

import { useState, useEffect, useRef } from "react"
import { Music, Video, Code, Smartphone, Gamepad, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Add import for the AdvancedWorkspace component
import { AdvancedWorkspace } from "@/components/advanced-workspace"

type ProjectType = "coding" | "app" | "game" | "music" | "video" | "story"

interface StatusUpdate {
  id: number
  message: string
  timestamp: Date
  type: "info" | "action" | "thinking" | "error" | "success"
}

// Modify the DynamicWorkspace component to include the AdvancedWorkspace
export function DynamicWorkspace() {
  const [projectType, setProjectType] = useState<ProjectType>("coding")
  const [projectName, setProjectName] = useState("My Project")
  const [instruction, setInstruction] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [workspaceColor, setWorkspaceColor] = useState("#f8fafc") // Default light color
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [autoStretch, setAutoStretch] = useState(true)
  const [workspaceHeight, setWorkspaceHeight] = useState(500)
  const [useAdvancedWorkspace, setUseAdvancedWorkspace] = useState(false)

  const statusEndRef = useRef<HTMLDivElement>(null)
  const colorChangeInterval = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when status updates change
  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [statusUpdates])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (colorChangeInterval.current) {
        clearInterval(colorChangeInterval.current)
      }
    }
  }, [])

  // Change workspace color based on project type
  useEffect(() => {
    let baseColor: string

    switch (projectType) {
      case "coding":
        baseColor = "#f0f9ff" // Light blue
        break
      case "app":
        baseColor = "#f0fdf4" // Light green
        break
      case "game":
        baseColor = "#fef2f2" // Light red
        break
      case "music":
        baseColor = "#fdf4ff" // Light purple
        break
      case "video":
        baseColor = "#fff7ed" // Light orange
        break
      case "story":
        baseColor = "#f8fafc" // Light gray
        break
      default:
        baseColor = "#f8fafc"
    }

    setWorkspaceColor(baseColor)

    // Clear any existing interval
    if (colorChangeInterval.current) {
      clearInterval(colorChangeInterval.current)
    }

    // Start subtle color variations
    colorChangeInterval.current = setInterval(() => {
      // Create subtle variations of the base color
      const r = Number.parseInt(baseColor.slice(1, 3), 16)
      const g = Number.parseInt(baseColor.slice(3, 5), 16)
      const b = Number.parseInt(baseColor.slice(5, 7), 16)

      // Add small random variations
      const variation = 5
      const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * variation * 2) - variation))
      const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * variation * 2) - variation))
      const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * variation * 2) - variation))

      const newColor = `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
      setWorkspaceColor(newColor)
    }, 3000)
  }, [projectType])

  // Auto-stretch workspace based on content
  useEffect(() => {
    if (autoStretch) {
      // Base height on number of status updates
      const baseHeight = 500
      const heightPerUpdate = 40
      const newHeight = Math.max(baseHeight, 300 + statusUpdates.length * heightPerUpdate)
      setWorkspaceHeight(newHeight)
    }
  }, [statusUpdates, autoStretch])

  const handleSubmitInstruction = () => {
    if (!instruction.trim()) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    // Add user instruction to status updates
    addStatusUpdate({
      message: instruction,
      type: "info",
    })

    // Simulate AI processing with realistic status updates
    simulateProcessing(instruction)

    // Clear instruction
    setInstruction("")
  }

  const addStatusUpdate = ({
    message,
    type,
  }: { message: string; type: "info" | "action" | "thinking" | "error" | "success" }) => {
    setStatusUpdates((prev) => [
      ...prev,
      {
        id: Date.now(),
        message: message,
        timestamp: new Date(),
        type: type,
      },
    ])
  }

  // Simulate AI processing (replace with actual API calls)
  const simulateProcessing = (userInstruction: string) => {
    const thinkingMessages = [
      "Analyzing requirements...",
      "Generating code...",
      "Compiling assets...",
      "Optimizing performance...",
      "Testing for errors...",
    ]

    const progressIncrement = 10
    let currentProgress = 0

    const interval = setInterval(() => {
      if (currentProgress < 90) {
        const randomIndex = Math.floor(Math.random() * thinkingMessages.length)
        addStatusUpdate({
          message: thinkingMessages[randomIndex],
          type: "thinking",
        })

        currentProgress += progressIncrement
        setProgress(currentProgress)
      } else {
        clearInterval(interval)

        // Simulate success or failure
        const successChance = 0.8
        if (Math.random() < successChance) {
          setSuccess("Project generated successfully!")
          addStatusUpdate({
            message: "Project generated successfully!",
            type: "success",
          })
          setProgress(100)
        } else {
          setError("Project generation failed. Please try again.")
          addStatusUpdate({
            message: "Project generation failed. Please try again.",
            type: "error",
          })
          setProgress(0)
        }

        setIsProcessing(false)
      }
    }, 1500)
  }

  const getProjectIcon = (type: ProjectType) => {
    switch (type) {
      case "coding":
        return <Code className="h-5 w-5" />
      case "app":
        return <Smartphone className="h-5 w-5" />
      case "game":
        return <Gamepad className="h-5 w-5" />
      case "music":
        return <Music className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "story":
        return <BookOpen className="h-5 w-5" />
    }
  }

  // Add a toggle button for switching between basic and advanced workspace
  if (useAdvancedWorkspace) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setUseAdvancedWorkspace(false)}>Switch to Basic Workspace</Button>
        </div>
        <AdvancedWorkspace />
      </div>
    )
  }

  return (
    <Card
      className="w-full transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: workspaceColor,
        height: autoStretch ? `${workspaceHeight}px` : "500px",
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getProjectIcon(projectType)}
            <span>Dynamic Workspace</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAutoStretch(!autoStretch)}>
            {autoStretch ? "Fixed Height" : "Auto Height"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type</label>
              <Tabs
                defaultValue={projectType}
                onValueChange={(value) => setProjectType(value as ProjectType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="coding">Coding</TabsTrigger>
                  <TabsTrigger value="app">App</TabsTrigger>
                  <TabsTrigger value="game">Game</TabsTrigger>
                  <TabsTrigger value="music">Music</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="story">Story</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="instruction" className="text-sm font-medium">
            Instructions
          </label>
          <div className="flex gap-2">
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter your instructions for the AI..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button onClick={handleSubmitInstruction} disabled={!instruction.trim() || isProcessing}>
              {isProcessing ? "Processing..." : "Submit"}
            </Button>
          </div>
        </div>

        {(error || success) && (
          <Alert variant={error ? "destructive" : "default"}>
            <AlertDescription>{error || success}</AlertDescription>
          </Alert>
        )}

        {isProcessing && <Progress value={progress} className="h-2" />}

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Status Updates</h3>
          <div className="bg-white/50 rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
            {statusUpdates.map((update) => (
              <div
                key={update.id}
                className={`flex justify-between items-center p-2 rounded-md ${
                  update.type === "error"
                    ? "bg-red-50 text-red-700"
                    : update.type === "success"
                      ? "bg-green-50 text-green-700"
                      : update.type === "thinking"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      update.type === "error"
                        ? "destructive"
                        : update.type === "success"
                          ? "default"
                          : update.type === "thinking"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {update.type}
                  </Badge>
                  <span>{update.message}</span>
                </div>
                <span className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
            <div ref={statusEndRef} />
          </div>
        </div>
      </CardContent>
      {/* Add a button to switch to advanced workspace */}
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setUseAdvancedWorkspace(true)}>
          Switch to Advanced Workspace
        </Button>
      </div>
    </Card>
  )
}
