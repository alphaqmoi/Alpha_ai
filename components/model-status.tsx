"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ModelStatus() {
  const [status, setStatus] = useState({
    modelReady: false,
    loading: true,
    error: null,
  })

  const fetchStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }))
      const response = await fetch("/api/chat")
      const data = await response.json()
      setStatus({
        modelReady: data.modelReady,
        loading: false,
        error: null,
      })
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch model status",
      }))
    }
  }

  const preloadModel = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }))
      await fetch("/api/training/preload", { method: "POST" })
      fetchStatus()
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to preload model",
      }))
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Model Status</span>
          <Button variant="ghost" size="icon" onClick={fetchStatus} disabled={status.loading}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardTitle>
        <CardDescription>
          {status.modelReady ? (
            <Badge variant="success">
              <CheckCircle className="mr-2 h-4 w-4" />
              Ready
            </Badge>
          ) : status.error ? (
            <Badge variant="destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              Error: {status.error}
            </Badge>
          ) : (
            <Badge variant="secondary">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This dashboard shows the current status of the AI model.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={preloadModel} disabled={status.loading || status.modelReady}>
          Preload Model
        </Button>
      </CardFooter>
    </Card>
  )
}
