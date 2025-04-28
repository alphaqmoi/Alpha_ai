import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Directory for memory storage
const MEMORY_DIR = path.join(process.cwd(), "memory")

// Simulated memory stats
const memoryStats = {
  total: 10, // GB
  used: 2.4, // GB
  training: 1.8, // GB
  models: 0.6, // GB
  lastUpdated: new Date().toISOString(),
  conversations: 247,
}

export async function GET() {
  try {
    // Create memory directory if it doesn't exist
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true })
    }

    // Check if we have stored memory stats
    const statsPath = path.join(MEMORY_DIR, "stats.json")
    if (fs.existsSync(statsPath)) {
      const storedStats = JSON.parse(fs.readFileSync(statsPath, "utf8"))
      return NextResponse.json(storedStats)
    }

    // Otherwise return the default stats
    return NextResponse.json(memoryStats)
  } catch (error) {
    console.error("Error accessing memory stats:", error)
    return NextResponse.json(memoryStats)
  }
}

export async function POST(request: Request) {
  try {
    const { action, conversation } = await request.json()

    if (action === "save_conversation" && conversation) {
      // Create memory directory if it doesn't exist
      if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true })
      }

      // Create conversations directory if it doesn't exist
      const conversationsDir = path.join(MEMORY_DIR, "conversations")
      if (!fs.existsSync(conversationsDir)) {
        fs.mkdirSync(conversationsDir, { recursive: true })
      }

      // Save the conversation with a timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const conversationPath = path.join(conversationsDir, `conversation-${timestamp}.json`)

      fs.writeFileSync(
        conversationPath,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            ...conversation,
          },
          null,
          2,
        ),
      )

      // Update memory stats
      memoryStats.conversations += 1
      memoryStats.lastUpdated = new Date().toISOString()

      // Save updated stats
      const statsPath = path.join(MEMORY_DIR, "stats.json")
      fs.writeFileSync(statsPath, JSON.stringify(memoryStats, null, 2))

      return NextResponse.json({
        success: true,
        message: "Conversation saved successfully",
      })
    }

    return NextResponse.json({
      success: false,
      message: "Invalid action",
    })
  } catch (error) {
    console.error("Error processing memory request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
