"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  Brain,
  Database,
  FileText,
  Github,
  Settings,
  Mic,
  Globe,
  Wifi,
  WifiOff,
  Search,
  TrendingUp,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { TrainingStatus } from "@/components/training-status"
import { BackupStatus } from "@/components/backup-status"
import { AIStatusIndicator } from "@/components/ai-status-indicator"
import { WebBrowser } from "@/components/web-browser"
import { TaskStatusIndicator } from "@/components/task-status-indicator"

export default function Home() {
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingStatus, setTrainingStatus] = useState("Initializing")
  const [trainingPhase, setTrainingPhase] = useState("Training model")
  const [isTraining, setIsTraining] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [aiStatus, setAiStatus] = useState<"training" | "testing" | "fixing" | "ready" | "error">("training")
  const [offlineMode, setOfflineMode] = useState(false)
  const [backgroundMode, setBackgroundMode] = useState(true)
  const [downloadSize, setDownloadSize] = useState("4.2 GB")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [selectedVoice, setSelectedVoice] = useState("Emma (Default)")
  const [showBrowser, setShowBrowser] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    // Simulate automatic training start
    const startTraining = setTimeout(() => {
      setIsTraining(true)
      simulateTraining()
    }, 2000)

    // Check for saved training state
    const checkTrainingState = async () => {
      try {
        const response = await fetch("/api/training")
        const data = await response.json()

        if (data.isTraining) {
          setIsTraining(true)
          setTrainingProgress(data.progress)
          setTrainingStatus(data.status)
          setTrainingPhase(data.phase || "Training model")
        }
      } catch (error) {
        console.error("Failed to fetch training state:", error)
      }
    }

    checkTrainingState()

    return () => clearTimeout(startTraining)
  }, [])

  useEffect(() => {
    // Update AI status based on training phase
    if (trainingPhase === "Training model" || trainingPhase === "Getting model ready") {
      setAiStatus("training")
    } else if (trainingPhase === "Testing the model" || trainingPhase === "Retesting the model") {
      setAiStatus("testing")
    } else if (trainingPhase === "Fixing the model") {
      setAiStatus("fixing")
    } else if (trainingPhase === "Model is in use" || trainingPhase === "Continuous learning") {
      setAiStatus("ready")
    }
  }, [trainingPhase])

  const simulateTraining = () => {
    let progress = 0
    const phases = [
      "Training model",
      "Testing the model",
      "Fixing the model",
      "Retesting the model",
      "Getting model ready",
      "Model is in use",
      "Continuous learning",
    ]

    const statuses = [
      "Initializing model",
      "Loading training data",
      "Processing input vectors",
      "Training neural networks",
      "Optimizing parameters",
      "Validating model",
      "Finalizing model",
    ]

    const interval = setInterval(() => {
      progress += Math.random() * 2

      if (progress >= 100) {
        progress = 100
        setTrainingStatus("Training complete")
        setTrainingProgress(100)
        setTrainingPhase("Model is in use")
        setIsTraining(false)
        clearInterval(interval)

        // Start continuous learning phase
        setTimeout(() => {
          setTrainingPhase("Continuous learning")
          setTrainingStatus("Learning from new data")
        }, 5000)
      } else {
        const phaseIndex = Math.min(Math.floor(progress / (100 / phases.length)), phases.length - 1)
        const statusIndex = Math.min(Math.floor(progress / (100 / statuses.length)), statuses.length - 1)

        setTrainingPhase(phases[phaseIndex])
        setTrainingStatus(statuses[statusIndex])
        setTrainingProgress(progress)

        // Simulate model fixing if in the fixing phase
        if (phases[phaseIndex] === "Fixing the model" && Math.random() > 0.7) {
          setTrainingStatus("Correcting model parameters")
        }

        // Simulate retesting
        if (phases[phaseIndex] === "Retesting the model" && Math.random() > 0.7) {
          setTrainingStatus("Verifying model accuracy")
        }
      }
    }, 1000)
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (!audioEnabled) {
      // Request microphone permissions when enabling audio
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          console.log("Microphone access granted")
          // Here you would initialize your audio processing

          // Play a confirmation sound
          try {
            const utterance = new SpeechSynthesisUtterance("Voice mode activated")
            utterance.volume = 0.8
            window.speechSynthesis.speak(utterance)
          } catch (err) {
            console.error("Speech synthesis error:", err)
          }
        })
        .catch((err) => {
          console.log("Error accessing microphone: " + err)
        })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowBrowser(true)
    }
  }

  const startDownload = () => {
    setIsDownloading(true)
    let progress = 0
    const downloadInterval = setInterval(() => {
      progress += Math.random() * 3
      if (progress >= 100) {
        progress = 100
        clearInterval(downloadInterval)
        setTimeout(() => {
          setIsDownloading(false)
          setDownloadProgress(0)
          alert("Download complete! Alpha AI is now installed on your device.")
        }, 500)
      }
      setDownloadProgress(progress)
    }, 300)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Alpha AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <AIStatusIndicator status={aiStatus} />
          <TaskStatusIndicator />

          <form onSubmit={handleSearch} className="relative hidden md:flex">
            <Input
              placeholder="Search or browse the web..."
              className="w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Button variant={audioEnabled ? "default" : "outline"} size="sm" onClick={toggleAudio}>
            <Mic className="mr-2 h-4 w-4" />
            {audioEnabled ? "Voice Active" : "Enable Voice"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="https://github.com/simtwov/Alpha" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </header>

      {isTraining && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Training in Progress</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Phase: {trainingPhase}</span>
                <span>{trainingProgress.toFixed(1)}%</span>
              </div>
              <div>Status: {trainingStatus}</div>
              <Progress value={trainingProgress} className="mt-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showBrowser && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Web Browser
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowBrowser(false)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WebBrowser query={searchQuery} />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-7 md:w-[1050px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="trading">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Model Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isTraining ? "Training" : trainingPhase}</div>
                <p className="text-xs text-muted-foreground">
                  {isTraining ? `${trainingProgress.toFixed(1)}% complete` : "Model is ready for use"}
                </p>
                {isTraining && <Progress value={trainingProgress} className="mt-2" />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4 GB</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12%</span> from last session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Training Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,342</div>
                <p className="text-xs text-muted-foreground">Samples in training dataset</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TrainingStatus />
            <BackupStatus />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your recent interactions with Alpha AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Model Training Started</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Data Backup Completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Training Data Added</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Web Research Completed</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Disk Usage</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Network Status</span>
                      <span className="text-sm font-medium flex items-center">
                        {offlineMode ? (
                          <>
                            <WifiOff className="h-3 w-3 mr-1 text-yellow-500" /> Offline Mode
                          </>
                        ) : (
                          <>
                            <Wifi className="h-3 w-3 mr-1 text-green-500" /> Online
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">Last updated: 2 minutes ago</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Trading Dashboard</h2>
              <p className="text-muted-foreground max-w-md">
                Access the trading dashboard to connect to Bitget and manage your automated trading activities
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/trading">
                <TrendingUp className="mr-2 h-4 w-4" />
                Access Trading Dashboard
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Other TabsContent sections remain the same */}
      </Tabs>
    </div>
  )
}
