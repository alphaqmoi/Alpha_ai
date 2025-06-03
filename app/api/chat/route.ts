import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isModelLoaded, preloadModel } from "@/lib/model-preloader"

// Explicitly define the type for conversationHistory
interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

let conversationHistory: ConversationMessage[] = [];

export async function POST(req: Request) {
  try {
    // Ensure the model is loaded
    if (!isModelLoaded()) {
      const modelLoaded = await preloadModel().catch((err) => {
        console.error("Error preloading model:", err);
        throw new Error("Model failed to load. Please try again later.");
      });
      if (!modelLoaded) {
        return NextResponse.json({ error: "Model failed to load." }, { status: 500 });
      }
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format." }, { status: 400 });
    }

    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    // Generate response using AI SDK
    let text;
    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        prompt: message,
        system: "You are a helpful assistant.",
      });
      text = result.text;
    } catch (error) {
      console.error("Error generating text:", error);
      return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }

    // Add assistant response to history
    conversationHistory.push({ role: "assistant", content: text });

    // Keep history to a reasonable size
    if (conversationHistory.length > 100) {
      conversationHistory = conversationHistory.slice(-100);
    }

    return NextResponse.json({
      reply: text, // Updated to match the Home page's expectations
      history: conversationHistory,
    });
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
