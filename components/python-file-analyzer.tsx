"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCwIcon as ReloadIcon, FileIcon, CodeIcon } from "lucide-react"

interface PythonAnalysis {
  imports: string[]
  functions: {
    name: string
    signature: string
    body: string[]
  }[]
  classes: {
    name: string
    signature: string
    body: string[]
  }[]
}

export default function PythonFileAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<PythonAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setAnalysis(null)
      setError(null)
    }
  }

  // Function to analyze the Python file
  const analyzePythonFile = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/python", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing Python file:", error)
      setError("Failed to analyze Python file. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Python File Analyzer</CardTitle>
        <CardDescription>Upload and analyze Python files</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => document.getElementById("python-file-input")?.click()}>
              <FileIcon className="h-4 w-4 mr-2" />
              Select Python File
            </Button>
            <input id="python-file-input" type="file" accept=".py" onChange={handleFileChange} className="hidden" />
            {file && (
              <span className="text-sm text-gray-500">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
            )}
          </div>

          {file && !analysis && !loading && (
            <Button onClick={analyzePythonFile}>
              <CodeIcon className="h-4 w-4 mr-2" />
              Analyze File
            </Button>
          )}

          {loading && (
            <div className="flex items-center space-x-2">
              <ReloadIcon className="h-4 w-4 animate-spin" />
              <span>Analyzing file...</span>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {analysis && (
            <Tabs defaultValue="imports">
              <TabsList>
                <TabsTrigger value="imports">Imports ({analysis.imports.length})</TabsTrigger>
                <TabsTrigger value="functions">Functions ({analysis.functions.length})</TabsTrigger>
                <TabsTrigger value="classes">Classes ({analysis.classes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="imports" className="mt-4">
                <div className="bg-gray-100 p-4 rounded-md">
                  {analysis.imports.map((imp, index) => (
                    <div key={index} className="font-mono text-sm">
                      {imp}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="functions" className="mt-4">
                <div className="space-y-4">
                  {analysis.functions.map((func, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-md">
                      <div className="font-mono text-sm font-bold">{func.signature}</div>
                      <div className="font-mono text-sm mt-2">{func.body.slice(1).join("\n")}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="classes" className="mt-4">
                <div className="space-y-4">
                  {analysis.classes.map((cls, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-md">
                      <div className="font-mono text-sm font-bold">{cls.signature}</div>
                      <div className="font-mono text-sm mt-2">{cls.body.slice(1).join("\n")}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
