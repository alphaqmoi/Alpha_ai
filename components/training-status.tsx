"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TrainingStatus() {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("idle")
  const [phase, setPhase] = useState("Training model")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch training status on component mount
    fetchTrainingStatus()

    // Poll for updates every second if training is in progress
    const interval = setInterval(() => {
      if (isTraining) {
        fetchTrainingStatus()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isTraining])

  const fetchTrainingStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/training")

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Error fetching training status: ${response.status} ${errorText}`)
        setError(`Server error: ${response.status}. Please try again later.`)
        setLoading(false)
        return
      }

      // Try to parse the response as JSON
      try {
        const data = await response.json()
        setIsTraining(data.isTraining)
        setProgress(data.progress)
        setStatus(data.status)
        if (data.phase) {
          setPhase(data.phase)
        }
      } catch (jsonError) {
        console.error("Failed to parse training status response as JSON:", jsonError)
        setError("Invalid response format from server. Please try again later.")
      }

      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch training status:", error)
      setError("Failed to fetch training status. Please check your connection and try again.")
      setLoading(false)
    }
  }

  const startTraining = async () => {
    try {
      setError(null)
      const response = await fetch("/api/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Error starting training: ${response.status} ${errorText}`)
        setError(`Failed to start training: ${response.status}`)
        return
      }

      const data = await response.json()

      if (data.success) {
        setIsTraining(true)
        fetchTrainingStatus()
      } else {
        setError(data.message || "Failed to start training")
      }
    } catch (error) {
      console.error("Failed to start training:", error)
      setError("Failed to start training. Please try again.")
    }
  }

  const stopTraining = async () => {
    try {
      setError(null)
      const response = await fetch("/api/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stop" }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Error stopping training: ${response.status} ${errorText}`)
        setError(`Failed to stop training: ${response.status}`)
        return
      }

      const data = await response.json()

      if (data.success) {
        setIsTraining(false)
        fetchTrainingStatus()
      } else {
        setError(data.message || "Failed to stop training")
      }
    } catch (error) {
      console.error("Failed to stop training:", error)
      setError("Failed to stop training. Please try again.")
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Training
        </CardTitle>
        <CardDescription>Train your AI model</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <Badge variant={isTraining ? "secondary" : "outline"}>
              {loading ? "Loading..." : formatStatus(status)}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Phase:</span>
            <Badge variant="outline">{loading ? "Loading..." : phase}</Badge>
          </div>
          {isTraining && (
            <>
              <div className="flex justify-between items-center">
                <span>Progress:</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex justify-between items-center">
                <span>Estimated time remaining:</span>
                <span>{Math.max(0, Math.ceil((100 - progress) / 10))} minutes</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isTraining ? (
          <Button onClick={stopTraining} variant="destructive" className="w-full" disabled={loading}>
            Stop Training
          </Button>
        ) : (
          <Button onClick={startTraining} className="w-full" disabled={loading}>
            {phase === "Continuous learning" ? "Force Retrain" : "Start Training"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
