"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function BackupStatus() {
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch backup status on component mount
    fetchBackupStatus()
  }, [])

  const fetchBackupStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/backup")

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Error fetching backup status: ${response.status} ${errorText}`)
        setError(`Server error: ${response.status}. Please try again later.`)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.lastBackupTime) {
        setLastBackup(data.lastBackupTime)
      }
      setIsBackingUp(data.backupInProgress)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch backup status:", error)
      setError("Failed to fetch backup status. Please check your connection and try again.")
      setLoading(false)
    }
  }

  const startBackup = async () => {
    try {
      setIsBackingUp(true)
      setError(null)

      const response = await fetch("/api/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Error starting backup: ${response.status} ${errorText}`)
        setError(`Failed to start backup: ${response.status}`)
        setIsBackingUp(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        // Poll for backup completion
        const checkInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch("/api/backup")

            if (!statusResponse.ok) {
              clearInterval(checkInterval)
              setError("Failed to check backup status")
              setIsBackingUp(false)
              return
            }

            const statusData = await statusResponse.json()

            if (!statusData.backupInProgress) {
              clearInterval(checkInterval)
              setIsBackingUp(false)
              setLastBackup(statusData.lastBackupTime)
            }
          } catch (pollError) {
            console.error("Error polling backup status:", pollError)
            clearInterval(checkInterval)
            setIsBackingUp(false)
          }
        }, 1000)
      } else {
        setIsBackingUp(false)
        setError(data.message || "Failed to start backup")
      }
    } catch (error) {
      console.error("Failed to start backup:", error)
      setIsBackingUp(false)
      setError("Failed to start backup. Please try again.")
    }
  }

  const formatBackupTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Backup
        </CardTitle>
        <CardDescription>Automatic backup to GitHub repository</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <Badge variant={isBackingUp ? "secondary" : "outline"}>
              {loading ? "Loading..." : isBackingUp ? "Backing up..." : "Ready"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Last backup:</span>
            <span className="text-sm">
              {loading ? "Loading..." : lastBackup ? formatBackupTime(lastBackup) : "Never"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Repository:</span>
            <span className="text-sm">simtwov/Alpha</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Backup frequency:</span>
            <span className="text-sm">Every 6 hours</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={startBackup} disabled={isBackingUp || loading} className="w-full">
          {isBackingUp ? "Backing up..." : "Backup Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
