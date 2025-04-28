import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)

// Directory for voice storage
const VOICE_DIR = path.join(process.cwd(), "voice")

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob
    const options = formData.get("options") ? JSON.parse(formData.get("options") as string) : {}

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
    await writeFileAsync(audioPath, buffer)

    // Process the audio based on options
    const result = await processAudio(audioPath, options)

    return NextResponse.json({
      success: true,
      message: "Audio received and processed",
      response: {
        text: result.text,
        confidence: result.confidence,
        speakerIdentity: result.speakerIdentity,
        audioUrl: `/api/v1/voice/response?id=${timestamp}`,
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({
      success: false,
      message: "No recording ID provided",
    })
  }

  const audioPath = path.join(VOICE_DIR, `recording-${id}.wav`)

  if (!fs.existsSync(audioPath)) {
    return NextResponse.json({
      success: false,
      message: "Recording not found",
    })
  }

  try {
    const audioData = await readFileAsync(audioPath)
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="recording-${id}.wav"`,
      },
    })
  } catch (error) {
    console.error("Error retrieving audio:", error)
    return NextResponse.json({
      success: false,
      message: "Error retrieving audio",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Simulated audio processing function
async function processAudio(audioPath: string, options: any) {
  // In a real implementation, this would use a speech recognition API
  // For now, we'll return simulated results

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    text: "This is a simulated transcription of the audio content.",
    confidence: 0.92,
    speakerIdentity: options.identifySpeaker ? "User-1" : null,
    language: "en-US",
  }
}
