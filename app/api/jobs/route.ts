import { type NextRequest, NextResponse } from "next/server"
import { getScheduledJobs, runJob, checkAndRunDueJobs } from "@/lib/job-scheduler"

export async function GET() {
  try {
    const jobs = await getScheduledJobs()
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error getting scheduled jobs:", error)
    return NextResponse.json({ error: "Failed to get scheduled jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, jobId } = await request.json()

    if (action === "run" && jobId) {
      await runJob(jobId)
      return NextResponse.json({ success: true, message: `Job ${jobId} started` })
    } else if (action === "check") {
      await checkAndRunDueJobs()
      return NextResponse.json({ success: true, message: "Checked and ran due jobs" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing job action:", error)
    return NextResponse.json({ error: "Failed to process job action" }, { status: 500 })
  }
}
