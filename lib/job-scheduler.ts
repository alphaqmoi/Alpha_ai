"use server"

import { cookies } from "next/headers"
import { startBackgroundTrading } from "./background-trading"

// Interface for scheduled job
interface ScheduledJob {
  id: string
  name: string
  lastRun: string
  nextRun: string
  interval: number // in milliseconds
  status: "pending" | "running" | "completed" | "failed"
}

// Function to get all scheduled jobs
export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  const cookieStore = cookies()
  const jobsCookie = cookieStore.get("scheduled-jobs")

  if (jobsCookie) {
    try {
      return JSON.parse(jobsCookie.value)
    } catch (error) {
      console.error("Error parsing jobs cookie:", error)
    }
  }

  // Default jobs if cookie doesn't exist
  const now = new Date()
  return [
    {
      id: "trading-job",
      name: "Background Trading",
      lastRun: now.toISOString(),
      nextRun: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      interval: 5 * 60 * 1000, // 5 minutes
      status: "pending",
    },
    {
      id: "model-preload-job",
      name: "Model Preloading",
      lastRun: now.toISOString(),
      nextRun: new Date(now.getTime() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
      interval: 15 * 60 * 1000, // 15 minutes
      status: "pending",
    },
  ]
}

// Function to save scheduled jobs
export async function saveScheduledJobs(jobs: ScheduledJob[]): Promise<void> {
  cookies().set("scheduled-jobs", JSON.stringify(jobs), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })
}

// Function to run a specific job
export async function runJob(jobId: string): Promise<void> {
  const jobs = await getScheduledJobs()
  const job = jobs.find((j) => j.id === jobId)

  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`)
  }

  // Update job status
  job.status = "running"
  job.lastRun = new Date().toISOString()
  await saveScheduledJobs(jobs)

  try {
    // Run the job based on its ID
    switch (jobId) {
      case "trading-job":
        await startBackgroundTrading()
        break
      case "model-preload-job":
        // This would call a function to preload the model
        // For now, we'll just simulate it
        await new Promise((resolve) => setTimeout(resolve, 1000))
        break
      default:
        throw new Error(`Unknown job ID: ${jobId}`)
    }

    // Update job status to completed
    job.status = "completed"
    job.nextRun = new Date(Date.now() + job.interval).toISOString()
    await saveScheduledJobs(jobs)
  } catch (error) {
    console.error(`Error running job ${jobId}:`, error)

    // Update job status to failed
    job.status = "failed"
    job.nextRun = new Date(Date.now() + job.interval).toISOString()
    await saveScheduledJobs(jobs)
  }
}

// Function to check and run due jobs
export async function checkAndRunDueJobs(): Promise<void> {
  const jobs = await getScheduledJobs()
  const now = new Date()

  for (const job of jobs) {
    const nextRun = new Date(job.nextRun)

    if (nextRun <= now && job.status !== "running") {
      // Run the job
      await runJob(job.id)
    }
  }
}
