"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCwIcon as ReloadIcon, PlayIcon, ClockIcon } from "lucide-react"

interface ScheduledJob {
  id: string
  name: string
  lastRun: string
  nextRun: string
  interval: number
  status: "pending" | "running" | "completed" | "failed"
}

export default function JobScheduler() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Function to fetch jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to run a job
  const runJob = async (jobId: string) => {
    try {
      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: "running" } : job)))

      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", jobId }),
      })

      // Refresh jobs after a short delay
      setTimeout(fetchJobs, 1000)
    } catch (error) {
      console.error(`Error running job ${jobId}:`, error)
      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: "failed" } : job)))
    }
  }

  // Function to check and run due jobs
  const checkJobs = async () => {
    try {
      setRefreshing(true)
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      })
      await fetchJobs()
    } catch (error) {
      console.error("Error checking jobs:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Load jobs on component mount
  useEffect(() => {
    fetchJobs()

    // Set up interval to check jobs every minute
    const interval = setInterval(checkJobs, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Background Jobs</CardTitle>
          <CardDescription>Loading scheduled jobs...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <ReloadIcon className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Jobs</CardTitle>
        <CardDescription>Manage and monitor background tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{job.name}</h3>
                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Last run: {formatDate(job.lastRun)}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Next run: {formatDate(job.nextRun)}</span>
                </div>
              </div>
              <div className="mt-3">
                <Button size="sm" onClick={() => runJob(job.id)} disabled={job.status === "running"}>
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Run Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={checkJobs} disabled={refreshing} className="w-full">
          {refreshing ? (
            <>
              <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <ReloadIcon className="h-4 w-4 mr-2" />
              Check & Run Due Jobs
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
