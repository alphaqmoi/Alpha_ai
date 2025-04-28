import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Simulated backup state
let lastBackupTime = new Date().toISOString()
let backupInProgress = false

// Directory for model storage
const MODEL_DIR = path.join(process.cwd(), "Qmoi")
const BACKUP_DIR = path.join(process.cwd(), "backup")

// Ensure backup directory exists
try {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
} catch (error) {
  console.error("Error creating backup directory:", error)
}

export async function GET() {
  try {
    // Check if we have stored backup stats
    const statsPath = path.join(BACKUP_DIR, "status.json")
    if (fs.existsSync(statsPath)) {
      try {
        const storedStats = JSON.parse(fs.readFileSync(statsPath, "utf8"))
        return NextResponse.json(storedStats)
      } catch (readError) {
        console.error("Error reading backup stats:", readError)
      }
    }

    // Return default state if no stored stats
    return NextResponse.json({
      lastBackupTime,
      backupInProgress,
    })
  } catch (error) {
    console.error("Error accessing backup stats:", error)
    // Always return a valid JSON response even on error
    return NextResponse.json({
      lastBackupTime,
      backupInProgress,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { action } = data

    if (action === "start" && !backupInProgress) {
      // Simulate backup process
      backupInProgress = true

      try {
        // Create backup directory if it doesn't exist
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirSync(BACKUP_DIR, { recursive: true })
        }

        // Simulate backup completion after 3 seconds
        setTimeout(() => {
          backupInProgress = false
          lastBackupTime = new Date().toISOString()

          // Update the status file
          try {
            const statusPath = path.join(BACKUP_DIR, "status.json")
            fs.writeFileSync(
              statusPath,
              JSON.stringify({
                lastBackupTime,
                backupInProgress,
                status: "completed",
              }),
            )
          } catch (writeError) {
            console.error("Error writing backup status:", writeError)
          }
        }, 3000)

        return NextResponse.json({
          success: true,
          message: "Backup started",
          backupInProgress,
        })
      } catch (error) {
        console.error("Error starting backup:", error)
        backupInProgress = false
        return NextResponse.json({
          success: false,
          message: "Failed to start backup",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({
      success: false,
      message: "Invalid action or backup already in progress",
    })
  } catch (error) {
    console.error("Error processing backup request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
