import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Directory for voice storage
const VOICE_DIR = path.join(process.cwd(), "voice")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob

    if (!audioBlob) {
      return NextResponse.json({
        success: false,
        message: "No audio data provided",
      })
    }

    // Create voice directory if it doesn't exist
    if (!fs.existsSync(VOICE_DIR)) {
      fs.mkdirSync(VOICE_DIR, { recursive: true })
    }

    // Save the audio file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const audioPath = path.join(VOICE_DIR, `recording-${timestamp}.wav`)

    const buffer = Buffer.from(await audioBlob.arrayBuffer())
    fs.writeFileSync(audioPath, buffer)

    // In a real implementation, you would process the audio here
    // For now, we'll just simulate a response

    return NextResponse.json({
      success: true,
      message: "Audio received and processed",
      response: {
        text: "I've received your audio message and processed it.",
        audioUrl: `/api/voice/response?id=${timestamp}`,
      },
    })
  } catch (error) {
    console.error("Error processing voice request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing voice request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function GET(request: Request) {
  // This would normally return a generated audio response
  // For now, we'll just return a simple text response
  return NextResponse.json({
    success: true,
    message: "This is where audio responses would be served",
  })
}
