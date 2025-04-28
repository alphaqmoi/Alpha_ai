"use server"

import { promises as fs } from "fs"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execPromise = promisify(exec)

// Function to save a Python script to a temporary file
export async function savePythonScript(content: string): Promise<string> {
  try {
    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp")
    try {
      await fs.mkdir(tempDir)
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate a unique filename
    const filename = `script_${Date.now()}.py`
    const filepath = path.join(tempDir, filename)

    // Write the content to the file
    await fs.writeFile(filepath, content)

    return filepath
  } catch (error) {
    console.error("Error saving Python script:", error)
    throw new Error("Failed to save Python script")
  }
}

// Function to execute a Python script
export async function executePythonScript(filepath: string): Promise<string> {
  try {
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python ${filepath}`)

    if (stderr) {
      console.warn("Python script stderr:", stderr)
    }

    return stdout
  } catch (error) {
    console.error("Error executing Python script:", error)
    throw new Error("Failed to execute Python script")
  }
}

// Function to analyze a Python script
export async function analyzePythonScript(content: string): Promise<any> {
  try {
    // Parse the Python script to extract information
    const lines = content.split("\n")

    // Extract imports
    const imports = lines
      .filter((line) => line.trim().startsWith("import ") || line.trim().startsWith("from "))
      .map((line) => line.trim())

    // Extract functions
    const functions = []
    let currentFunction = null

    for (const line of lines) {
      if (line.trim().startsWith("def ")) {
        if (currentFunction) {
          functions.push(currentFunction)
        }

        currentFunction = {
          name: line.trim().split("def ")[1].split("(")[0],
          signature: line.trim(),
          body: [line.trim()],
        }
      } else if (currentFunction && line.trim() !== "" && (line.startsWith(" ") || line.startsWith("\t"))) {
        currentFunction.body.push(line)
      } else if (currentFunction) {
        functions.push(currentFunction)
        currentFunction = null
      }
    }

    if (currentFunction) {
      functions.push(currentFunction)
    }

    // Extract classes
    const classes = []
    let currentClass = null

    for (const line of lines) {
      if (line.trim().startsWith("class ")) {
        if (currentClass) {
          classes.push(currentClass)
        }

        currentClass = {
          name: line.trim().split("class ")[1].split("(")[0].split(":")[0],
          signature: line.trim(),
          body: [line.trim()],
        }
      } else if (currentClass && line.trim() !== "" && (line.startsWith(" ") || line.startsWith("\t"))) {
        currentClass.body.push(line)
      } else if (currentClass && line.trim() === "") {
        currentClass.body.push(line)
      } else if (currentClass && !line.startsWith(" ") && !line.startsWith("\t")) {
        classes.push(currentClass)
        currentClass = null
      }
    }

    if (currentClass) {
      classes.push(currentClass)
    }

    return {
      imports,
      functions,
      classes,
    }
  } catch (error) {
    console.error("Error analyzing Python script:", error)
    throw new Error("Failed to analyze Python script")
  }
}

// Function to process the attached Python file
export async function processPythonFile(content: string): Promise<any> {
  try {
    // Analyze the script
    const analysis = await analyzePythonScript(content)

    // Save the script to a temporary file
    const filepath = await savePythonScript(content)

    // We won't execute the script directly for security reasons
    // Instead, we'll return the analysis

    return {
      analysis,
      filepath,
    }
  } catch (error) {
    console.error("Error processing Python file:", error)
    throw new Error("Failed to process Python file")
  }
}
