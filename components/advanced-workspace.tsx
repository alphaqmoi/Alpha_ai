"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Music,
  Video,
  Code,
  Smartphone,
  Gamepad,
  BookOpen,
  Save,
  Share2,
  RefreshCw,
  Minus,
  Maximize,
  X,
  Search,
  Play,
  Pause,
  CircleStopIcon as Stop,
  PaintbrushIcon as PaintBrush,
  Eraser,
  Type,
  Shapes,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ProjectType = "coding" | "app" | "game" | "music" | "video" | "story"
type PanelType =
  | "code_editor"
  | "terminal"
  | "file_explorer"
  | "chat"
  | "media_player"
  | "canvas"
  | "timeline"
  | "text_editor"
type PanelPosition = "main" | "left" | "right" | "bottom"

interface StatusUpdate {
  id: number
  message: string
  timestamp: Date
  type: "info" | "action" | "thinking" | "error" | "success"
}

interface WorkspacePanel {
  id: string
  type: PanelType
  position: PanelPosition
  title?: string
  content?: any
  minimized?: boolean
  maximized?: boolean
}

interface WorkspaceTemplate {
  id: string
  name: string
  description: string
  layout: string
  panels: WorkspacePanel[]
  tools: string[]
}

interface MediaItem {
  id: string
  title: string
  type: "video" | "audio" | "image" | "document"
  thumbnail?: string
  duration?: number
  url: string
}

interface WorkspaceProps {
  initialWorkspace?: {
    id: string
    name: string
    template: string
    layout: string
    panels: WorkspacePanel[]
    tools: string[]
  }
}

export function AdvancedWorkspace({ initialWorkspace }: WorkspaceProps) {
  // Workspace state
  const [workspaceId, setWorkspaceId] = useState(initialWorkspace?.id || "default")
  const [workspaceName, setWorkspaceName] = useState(initialWorkspace?.name || "My Workspace")
  const [templateName, setTemplateName] = useState(initialWorkspace?.template || "Default")
  const [layout, setLayout] = useState(initialWorkspace?.layout || "simple")
  const [panels, setPanels] = useState<WorkspacePanel[]>(
    initialWorkspace?.panels || [
      { id: "main", type: "code_editor", position: "main", title: "Code Editor" },
      { id: "terminal", type: "terminal", position: "bottom", title: "Terminal" },
      { id: "explorer", type: "file_explorer", position: "left", title: "Explorer" },
      { id: "chat", type: "chat", position: "right", title: "AI Assistant" },
    ],
  )
  const [tools, setTools] = useState<string[]>(initialWorkspace?.tools || ["save", "share", "refresh"])

  // UI state
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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([])
  const [mediaItems, setMediaItems] = useState<Record<string, MediaItem[]>>({
    videos: [],
    audio: [],
    images: [],
    documents: [],
  })
  const [activeMediaType, setActiveMediaType] = useState<string>("videos")
  const [mediaSearchQuery, setMediaSearchQuery] = useState("")

  const statusEndRef = useRef<HTMLDivElement>(null)
  const colorChangeInterval = useRef<NodeJS.Timeout | null>(null)
  const canvasRefs = useRef<Record<string, HTMLCanvasElement>>({})
  const canvasContexts = useRef<Record<string, CanvasRenderingContext2D | null>>({})
  const drawingState = useRef<
    Record<
      string,
      {
        isDrawing: boolean
        lastX: number
        lastY: number
        tool: string
        color: string
      }
    >
  >({})

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

  // Load templates
  useEffect(() => {
    // Simulate API call to fetch templates
    const fetchTemplates = async () => {
      try {
        // In a real app, this would be an API call
        const mockTemplates: WorkspaceTemplate[] = [
          {
            id: "development",
            name: "Development",
            description: "Perfect for coding and development tasks",
            layout: "split",
            panels: [
              { id: "code", type: "code_editor", position: "main", title: "Code Editor" },
              { id: "terminal", type: "terminal", position: "bottom", title: "Terminal" },
              { id: "files", type: "file_explorer", position: "left", title: "Files" },
              { id: "chat", type: "chat", position: "right", title: "AI Assistant" },
            ],
            tools: ["save", "share", "refresh", "debug", "deploy"],
          },
          {
            id: "media",
            name: "Media Production",
            description: "For video and audio editing",
            layout: "complex",
            panels: [
              { id: "player", type: "media_player", position: "main", title: "Media Player" },
              { id: "timeline", type: "timeline", position: "bottom", title: "Timeline" },
              { id: "library", type: "file_explorer", position: "left", title: "Media Library" },
              { id: "effects", type: "canvas", position: "right", title: "Effects" },
            ],
            tools: ["save", "export", "import", "preview", "publish"],
          },
          {
            id: "writing",
            name: "Content Creation",
            description: "For writing and content creation",
            layout: "focused",
            panels: [
              { id: "editor", type: "text_editor", position: "main", title: "Text Editor" },
              { id: "research", type: "chat", position: "right", title: "Research Assistant" },
              { id: "outline", type: "file_explorer", position: "left", title: "Outline" },
            ],
            tools: ["save", "export", "publish", "format", "research"],
          },
        ]

        setTemplates(mockTemplates)
      } catch (error) {
        console.error("Error fetching templates:", error)
      }
    }

    fetchTemplates()
  }, [])

  // Load media items
  useEffect(() => {
    // Simulate API call to fetch media items
    const fetchMediaItems = async (type: string, query = "") => {
      try {
        // In a real app, this would be an API call
        const mockItems: MediaItem[] = []

        // Generate mock items based on type
        const count = 12
        for (let i = 1; i <= count; i++) {
          if (query && i % 3 !== 0) continue // Simple filtering for search

          mockItems.push({
            id: `${type}-${i}`,
            title: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} ${i}`,
            type: type === "videos" ? "video" : type === "audio" ? "audio" : type === "images" ? "image" : "document",
            thumbnail: type === "images" ? `/placeholder.svg?height=80&width=120&text=Image+${i}` : undefined,
            duration: type === "videos" || type === "audio" ? 60 + i * 30 : undefined,
            url: `#${type}-${i}`,
          })
        }

        setMediaItems((prev) => ({
          ...prev,
          [type]: mockItems,
        }))
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
      }
    }

    fetchMediaItems(activeMediaType, mediaSearchQuery)
  }, [activeMediaType, mediaSearchQuery])

  // Initialize canvas contexts
  useEffect(() => {
    panels.forEach((panel) => {
      if (panel.type === "canvas") {
        const canvas = canvasRefs.current[panel.id]
        if (canvas) {
          const ctx = canvas.getContext("2d")
          canvasContexts.current[panel.id] = ctx

          // Initialize drawing state
          drawingState.current[panel.id] = {
            isDrawing: false,
            lastX: 0,
            lastY: 0,
            tool: "brush",
            color: "#000000",
          }

          // Set canvas size
          const resizeCanvas = () => {
            const container = canvas.parentElement
            if (container) {
              canvas.width = container.clientWidth
              canvas.height = container.clientHeight - 40 // Subtract toolbar height
            }
          }

          resizeCanvas()
          window.addEventListener("resize", resizeCanvas)

          // Clean up
          return () => {
            window.removeEventListener("resize", resizeCanvas)
          }
        }
      }
    })
  }, [panels])

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
        const successChance = 0.9
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

  const handlePanelControl = (panelId: string, action: "minimize" | "maximize" | "close") => {
    setPanels((prev) =>
      prev.map((panel) => {
        if (panel.id === panelId) {
          switch (action) {
            case "minimize":
              return { ...panel, minimized: !panel.minimized, maximized: false }
            case "maximize":
              return { ...panel, maximized: !panel.maximized, minimized: false }
            case "close":
              return { ...panel, minimized: true }
          }
        }
        // If another panel is being maximized, minimize all others
        if (action === "maximize") {
          return { ...panel, maximized: false }
        }
        return panel
      }),
    )
  }

  const switchTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setTemplateName(template.name)
      setLayout(template.layout)
      setPanels(template.panels)
      setTools(template.tools)
      setIsTemplateModalOpen(false)

      // Show success message
      setSuccess(`Switched to ${template.name} template`)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const saveWorkspace = () => {
    // In a real app, this would be an API call
    console.log("Saving workspace:", {
      id: workspaceId,
      name: workspaceName,
      template: templateName,
      layout,
      panels,
      tools,
    })

    // Show success message
    setSuccess("Workspace saved successfully")
    setTimeout(() => setSuccess(null), 3000)
  }

  const shareWorkspace = () => {
    // In a real app, this would open a share dialog or generate a share link
    const shareUrl = `${window.location.origin}/workspace/${workspaceId}`

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setSuccess("Share link copied to clipboard")
        setTimeout(() => setSuccess(null), 3000)
      })
      .catch((err) => {
        setError("Failed to copy share link")
        setTimeout(() => setError(null), 3000)
      })
  }

  const handleCanvasMouseDown = (panelId: string, e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = drawingState.current[panelId]
    if (state) {
      state.isDrawing = true
      state.lastX = e.nativeEvent.offsetX
      state.lastY = e.nativeEvent.offsetY
    }
  }

  const handleCanvasMouseMove = (panelId: string, e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = drawingState.current[panelId]
    const ctx = canvasContexts.current[panelId]

    if (!state?.isDrawing || !ctx) return

    if (state.tool === "brush") {
      ctx.strokeStyle = state.color
      ctx.lineWidth = 5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(state.lastX, state.lastY)
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
    } else if (state.tool === "eraser") {
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 20
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(state.lastX, state.lastY)
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
    }

    state.lastX = e.nativeEvent.offsetX
    state.lastY = e.nativeEvent.offsetY
  }

  const handleCanvasMouseUp = (panelId: string) => {
    const state = drawingState.current[panelId]
    if (state) {
      state.isDrawing = false
    }
  }

  const handleCanvasMouseOut = (panelId: string) => {
    const state = drawingState.current[panelId]
    if (state) {
      state.isDrawing = false
    }
  }

  const setCanvasTool = (panelId: string, tool: string) => {
    const state = drawingState.current[panelId]
    if (state) {
      state.tool = tool
    }
  }

  const setCanvasColor = (panelId: string, color: string) => {
    const state = drawingState.current[panelId]
    if (state) {
      state.color = color
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const sendChatMessage = (panelId: string, message: string) => {
    if (!message.trim()) return

    // Find the panel
    const panel = panels.find((p) => p.id === panelId)
    if (!panel || panel.type !== "chat") return

    // Initialize content if it doesn't exist
    if (!panel.content) {
      panel.content = {
        messages: [],
      }
    }

    // Add user message
    panel.content.messages.push({
      id: Date.now(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    })

    // Update panels
    setPanels([...panels])

    // Simulate AI response
    setTimeout(() => {
      // Add AI response
      panel.content.messages.push({
        id: Date.now() + 1,
        sender: "assistant",
        text: `I received your message: "${message}". How can I help you further?`,
        timestamp: new Date(),
      })

      // Update panels
      setPanels([...panels])
    }, 1000)
  }

  const renderPanelContent = (panel: WorkspacePanel) => {
    switch (panel.type) {
      case "code_editor":
        return (
          <div className="h-full w-full bg-gray-900 text-gray-100 p-4 font-mono overflow-auto">
            <pre>{`// Welcome to Alpha AI Code Editor
function helloWorld() {
  console.log("Hello, world!");
}

// Start coding here...
`}</pre>
          </div>
        )

      case "terminal":
        return (
          <div className="h-full w-full bg-black text-green-500 p-4 font-mono overflow-auto">
            <div>Welcome to Alpha AI Terminal</div>
            <div>$ _</div>
          </div>
        )

      case "file_explorer":
        return (
          <div className="h-full w-full overflow-auto p-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <Code size={16} />
                <span>index.js</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <Code size={16} />
                <span>styles.css</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <Code size={16} />
                <span>README.md</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <Code size={16} />
                <span>package.json</span>
              </div>
            </div>
          </div>
        )

      case "chat":
        const chatMessages = panel.content?.messages || []
        if (chatMessages.length === 0) {
          // Add welcome message if empty
          chatMessages.push({
            id: Date.now(),
            sender: "assistant",
            text: "Hello! I'm Alpha AI. How can I help you today?",
            timestamp: new Date(),
          })
        }

        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-100 self-start"
                  }`}
                >
                  <div>{message.text}</div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="border-t p-2 flex gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendChatMessage(panel.id, (e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }}
              />
              <Button
                size="sm"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  sendChatMessage(panel.id, input.value)
                  input.value = ""
                }}
              >
                Send
              </Button>
            </div>
          </div>
        )

      case "media_player":
        return (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex gap-2">
              <TabsList>
                <TabsTrigger
                  value="videos"
                  onClick={() => setActiveMediaType("videos")}
                  className={activeMediaType === "videos" ? "bg-blue-500 text-white" : ""}
                >
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  onClick={() => setActiveMediaType("audio")}
                  className={activeMediaType === "audio" ? "bg-blue-500 text-white" : ""}
                >
                  Audio
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  onClick={() => setActiveMediaType("images")}
                  className={activeMediaType === "images" ? "bg-blue-500 text-white" : ""}
                >
                  Images
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  onClick={() => setActiveMediaType("documents")}
                  className={activeMediaType === "documents" ? "bg-blue-500 text-white" : ""}
                >
                  Documents
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-2 border-b flex gap-2">
              <Input
                placeholder={`Search ${activeMediaType}...`}
                value={mediaSearchQuery}
                onChange={(e) => setMediaSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                <Search size={16} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mediaItems[activeMediaType]?.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="h-20 bg-gray-100 flex items-center justify-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {item.type === "video" && <Video size={32} />}
                          {item.type === "audio" && <Music size={32} />}
                          {item.type === "image" && <ImageIcon size={32} />}
                          {item.type === "document" && <BookOpen size={32} />}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      {item.duration && <div className="text-xs text-gray-500">{formatDuration(item.duration)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "canvas":
        return (
          <div className="h-full flex flex-col">
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current[panel.id] = el
              }}
              className="flex-1"
              onMouseDown={(e) => handleCanvasMouseDown(panel.id, e)}
              onMouseMove={(e) => handleCanvasMouseMove(panel.id, e)}
              onMouseUp={() => handleCanvasMouseUp(panel.id)}
              onMouseOut={() => handleCanvasMouseOut(panel.id)}
            />
            <div className="p-2 border-t flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCanvasTool(panel.id, "brush")}
                className={drawingState.current[panel.id]?.tool === "brush" ? "bg-blue-100" : ""}
              >
                <PaintBrush size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCanvasTool(panel.id, "eraser")}
                className={drawingState.current[panel.id]?.tool === "eraser" ? "bg-blue-100" : ""}
              >
                <Eraser size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCanvasTool(panel.id, "text")}
                className={drawingState.current[panel.id]?.tool === "text" ? "bg-blue-100" : ""}
              >
                <Type size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCanvasTool(panel.id, "shape")}
                className={drawingState.current[panel.id]?.tool === "shape" ? "bg-blue-100" : ""}
              >
                <Shapes size={16} />
              </Button>
              <div className="ml-2">
                <input
                  type="color"
                  value={drawingState.current[panel.id]?.color || "#000000"}
                  onChange={(e) => setCanvasColor(panel.id, e.target.value)}
                  className="w-6 h-6 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )

      case "timeline":
        return (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex gap-2 items-center">
              <Button size="sm" variant="outline">
                <Play size={16} />
              </Button>
              <Button size="sm" variant="outline">
                <Pause size={16} />
              </Button>
              <Button size="sm" variant="outline">
                <Stop size={16} />
              </Button>
              <div className="ml-2 font-mono">00:00:00</div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-100 rounded relative">
                  <div className="absolute top-0 left-[20%] h-full w-[30%] bg-blue-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded relative">
                  <div className="absolute top-0 left-[10%] h-full w-[20%] bg-green-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded relative">
                  <div className="absolute top-0 left-[40%] h-full w-[15%] bg-red-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )

      case "text_editor":
        return (
          <div className="h-full w-full p-4 overflow-auto">
            <Textarea
              className="min-h-[200px] font-mono"
              defaultValue="# Welcome to Alpha AI Text Editor

Start writing your content here...

## Features
- Markdown support
- Auto-save
- AI-powered suggestions
"
            />
          </div>
        )

      default:
        return (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-gray-500">
              {panel.type.replace("_", " ").charAt(0).toUpperCase() + panel.type.replace("_", " ").slice(1)} Panel
            </div>
          </div>
        )
    }
  }

  return (
    <Card
      className="w-full transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: workspaceColor,
        height: autoStretch ? `${workspaceHeight}px` : "500px",
      }}
    >
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getProjectIcon(projectType)}
            <CardTitle className="m-0">{workspaceName}</CardTitle>
            <Badge variant="outline">{templateName}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Change Template
            </Button>
            <Button variant="outline" size="sm" onClick={saveWorkspace}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button variant="outline" size="sm" onClick={shareWorkspace}>
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAutoStretch(!autoStretch)}>
              {autoStretch ? "Fixed Height" : "Auto Height"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 space-y-4">
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
        </div>

        <div className="p-4 border-t border-b">
          <h3 className="text-lg font-medium mb-2">Workspace</h3>
          <div
            className={`grid gap-2 ${
              layout === "simple"
                ? "grid-cols-[250px_1fr]"
                : layout === "split"
                  ? "grid-cols-[250px_1fr_250px] grid-rows-[1fr_200px]"
                  : layout === "focused"
                    ? "grid-cols-[200px_1fr_200px]"
                    : "grid-cols-[250px_1fr_250px] grid-rows-[1fr_200px]"
            }`}
            style={{ minHeight: "300px" }}
          >
            {panels
              .filter((panel) => !panel.minimized)
              .map((panel) => (
                <div
                  key={panel.id}
                  className={`bg-white rounded-md shadow overflow-hidden flex flex-col ${
                    panel.maximized
                      ? "col-span-full row-span-full"
                      : panel.position === "main"
                        ? "col-start-2 row-start-1"
                        : panel.position === "left"
                          ? "col-start-1 row-span-full"
                          : panel.position === "right"
                            ? "col-start-3 row-span-full"
                            : panel.position === "bottom"
                              ? "col-start-2 row-start-2"
                              : ""
                  }`}
                >
                  <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium">{panel.title || panel.id}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePanelControl(panel.id, "minimize")}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePanelControl(panel.id, "maximize")}
                      >
                        <Maximize className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePanelControl(panel.id, "close")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">{renderPanelContent(panel)}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4">
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
        </div>
      </CardContent>

      <div className="p-2 border-t flex justify-between items-center">
        <div id="workspace-status-message" className={error ? "text-red-500" : success ? "text-green-500" : ""}>
          {error || success || "Ready"}
        </div>
        <div className="flex gap-2">
          {tools.map((tool) => (
            <Button key={tool} size="sm" variant="ghost" className="h-8">
              {tool === "save" && <Save className="h-4 w-4 mr-1" />}
              {tool === "share" && <Share2 className="h-4 w-4 mr-1" />}
              {tool === "refresh" && <RefreshCw className="h-4 w-4 mr-1" />}
              <span className="text-xs">{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Workspace Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => switchTemplate(template.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
