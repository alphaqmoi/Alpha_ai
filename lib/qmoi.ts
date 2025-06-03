// Qmoi model integration: real model call
import { Trade } from "./background-trading"
import { spawn } from "child_process"

export async function getQmoiTradeRecommendation({
  assetValue,
  openTrades,
  maxConcurrent,
}: {
  assetValue: number
  openTrades: Trade[]
  maxConcurrent: number
}): Promise<{ symbol: string; side: "buy" | "sell"; amount: number }> {
  return new Promise((resolve, reject) => {
    // Path to your real Qmoi Python inference script
    const scriptPath = process.cwd() + "/Qmoi/qmoi_infer.py"
    const py = spawn("python3", [scriptPath])
    let output = ""
    let error = ""
    py.stdout.on("data", (data) => {
      output += data.toString()
    })
    py.stderr.on("data", (data) => {
      error += data.toString()
    })
    py.on("close", (code) => {
      if (code !== 0 || error) {
        reject(new Error(error || `Qmoi model exited with code ${code}`))
      } else {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (err) {
          reject(new Error("Failed to parse Qmoi model output: " + err))
        }
      }
    })
    // Send input as JSON
    py.stdin.write(
      JSON.stringify({ assetValue, openTrades, maxConcurrent }) + "\n"
    )
    py.stdin.end()
  })
}

// --- HuggingFace Inference API integration ---
const HF_API_URL =
  process.env.HF_QMOI_API_URL ||
  "https://api-inference.huggingface.co/models/YOUR_USERNAME/YOUR_QMOI_MODEL"
const HF_API_TOKEN = process.env.HF_QMOI_TOKEN

export async function getQmoiChatResponse(
  prompt: string,
  context: string[] = []
): Promise<string> {
  if (!HF_API_TOKEN) {
    throw new Error(
      "HuggingFace API token not set. Set HF_QMOI_TOKEN in your environment."
    )
  }
  const input = {
    inputs: prompt,
    parameters: { context },
    options: { wait_for_model: true },
  }
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `HuggingFace API error: ${res.status} ${await res.text()}`
    )
  }
  const data = await res.json()
  // HuggingFace text-generation returns [{ generated_text: ... }]
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text
  }
  // Some models return { generated_text: ... }
  if (data.generated_text) return data.generated_text
  // Fallback: return stringified data
  return typeof data === "string" ? data : JSON.stringify(data)
}
