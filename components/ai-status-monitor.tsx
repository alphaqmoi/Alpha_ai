"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { AIStatusIndicator } from "@/components/ai-status-indicator"

export function AIStatusMonitor() {
  const [status, setStatus] = useState<"training" | "testing" | "fixing" | "ready" | "error">("ready")
  const [health, setHealth] = useState(100)
  const [accuracy, setAccuracy] = useState(98)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = () => {
    setIsChecking(true)

    // Simulate status check
    setTimeout(() => {
      // Randomly determine if we need to fix something
      const needsFix = Math.random() > 0.7

      if (needsFix) {
        setStatus("fixing")
        setHealth(Math.floor(Math.random() * 30) + 60)
        setAccuracy(Math.floor(Math.random() * 10) + 85)

        // Simulate fixing
        setTimeout(() => {
          setStatus("ready")
          setHealth(100)
          setAccuracy(98)
        }, 3000)
      } else {
        setStatus("ready")
        setHealth(Math.floor(Math.random() * 10) + 90)
        setAccuracy(Math.floor(Math.random() * 5) + 95)
      }

      setLastChecked(new Date())
      setIsChecking(false)
    }, 2000)
  }

  useEffect(() => {
    // Check status on component mount
    checkStatus()

    // Set up interval to check status every 5 minutes
    const interval = setInterval(
      () => {
        checkStatus()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Status Monitor
          </CardTitle>
          <AIStatusIndicator status={status} />
        </div>
        <CardDescription>Monitor the health and status of your AI model</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Health:</span>
            <span>{health}%</span>
          </div>
          <Progress
            value={health}
            className={`${health < 70 ? "bg-red-100" : health < 90 ? "bg-yellow-100" : "bg-green-100"}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Accuracy:</span>
            <span>{accuracy}%</span>
          </div>
          <Progress
            value={accuracy}
            className={`${accuracy < 90 ? "bg-red-100" : accuracy < 95 ? "bg-yellow-100" : "bg-green-100"}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex items-center gap-2 mt-1">
              {status === "ready" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : status === "error" ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <RefreshCw className="h-4 w-4 text-yellow-500" />
              )}
              <span className="font-medium capitalize">{status}</span>
            </div>
          </div>

          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Last Checked</div>
            <div className="mt-1 font-medium">{lastChecked.toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={checkStatus} disabled={isChecking}>
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
