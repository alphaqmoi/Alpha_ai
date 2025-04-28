import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isModelLoaded, preloadModel } from "@/lib/model-preloader"

// Mock conversation history
let conversationHistory = []

export async function POST(req: Request) {
  try {
    // Ensure the model is loaded
    if (!isModelLoaded()) {
      await preloadModel()
    }

    const { message } = await req.json()

    // Add user message to history
    conversationHistory.push({ role: "user", content: message })

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: message,
      system: "You are a helpful assistant.",
    })

    // Add assistant response to history
    conversationHistory.push({ role: "assistant", content: text })

    // Keep history to a reasonable size
    if (conversationHistory.length > 100) {
      conversationHistory = conversationHistory.slice(-100)
    }

    return NextResponse.json({
      response: text,
      history: conversationHistory,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    history: conversationHistory,
    modelReady: isModelLoaded(),
  })
}
