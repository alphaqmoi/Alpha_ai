import { type NextRequest, NextResponse } from "next/server"
import { processPythonFile } from "@/lib/python-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file content
    const content = await file.text()

    // Process the Python file
    const result = await processPythonFile(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing Python file:", error)
    return NextResponse.json({ error: "Failed to process Python file" }, { status: 500 })
  }
}
