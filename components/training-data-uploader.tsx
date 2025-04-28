"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileType, CheckCircle, AlertCircle, RefreshCw, FileText, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

export function TrainingDataUploader() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }))
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }))
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)

    // Simulate file upload with progress
    const totalFiles = files.length
    let uploadedFiles = 0

    for (let i = 0; i < totalFiles; i++) {
      // Simulate upload of each file
      await new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 10
          if (progress >= 100) {
            clearInterval(interval)
            uploadedFiles++
            setUploadProgress((uploadedFiles / totalFiles) * 100)
            resolve()
          }
        }, 200)
      })
    }

    // Upload complete
    setIsUploading(false)
    setSuccess("Files uploaded successfully")

    // Start training process
    startTraining()
  }

  const startTraining = async () => {
    setIsTraining(true)
    setTrainingProgress(0)

    try {
      // Simulate API call to start training
      const response = await fetch("/api/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      })

      if (!response.ok) {
        throw new Error(`Failed to start training: ${response.status}`)
      }

      // Simulate training progress
      const trainingInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          const newProgress = prev + Math.random() * 5
          if (newProgress >= 100) {
            clearInterval(trainingInterval)
            setIsTraining(false)
            setSuccess("Training completed successfully! Model has been updated.")
            return 100
          }
          return newProgress
        })
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start training")
      setIsTraining(false)
    }
  }

  const clearFiles = () => {
    setFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
    else return (bytes / 1073741824).toFixed(1) + " GB"
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileType className="h-4 w-4" />
    if (fileType.startsWith("text/")) return <FileText className="h-4 w-4" />
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <Database className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Data Upload</CardTitle>
        <CardDescription>Upload files to train the AI model</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mb-2">
            Support for text, CSV, JSON, images, and other training data formats
          </p>
          <Button size="sm" variant="outline">
            Select Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
              <Button size="sm" variant="ghost" onClick={clearFiles}>
                Clear All
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.type.split("/")[1] || file.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uploading...</span>
              <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Training model...</span>
              <span className="text-sm font-medium">{Math.round(trainingProgress)}%</span>
            </div>
            <Progress value={trainingProgress} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isUploading || isTraining || files.length === 0} className="w-full">
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isTraining ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Training...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Train
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
