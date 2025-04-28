"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Search,
  Globe,
  ExternalLink,
  Download,
  Brain,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface WebBrowserProps {
  query?: string
}

interface SearchResult {
  title: string
  description: string
  url: string
  isTrainingData?: boolean
}

export function WebBrowser({ query = "" }: WebBrowserProps) {
  const [url, setUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>(query)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentPage, setCurrentPage] = useState<SearchResult | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLearning, setIsLearning] = useState(false)
  const [learningProgress, setLearningProgress] = useState(0)
  const [learningSuccess, setLearningSuccess] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [query])

  const handleSearch = (q: string) => {
    if (!q.trim()) return

    setIsLoading(true)
    setError(null)
    setCurrentPage(null)

    // Add to history
    const newUrl = `https://search.example.com?q=${encodeURIComponent(q)}`
    setUrl(newUrl)

    if (historyIndex < history.length - 1) {
      // If we're not at the end of history, truncate it
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newUrl])
    } else {
      setHistory((prev) => [...prev, newUrl])
    }
    setHistoryIndex((prev) => prev + 1)

    // Generate mock search results
    setTimeout(() => {
      setIsLoading(false)

      // Generate mock search results with some training data
      const mockResults: SearchResult[] = [
        {
          title: `Understanding ${q} - A Comprehensive Guide`,
          description: `Learn everything about ${q} with our detailed guide covering all aspects and latest developments.`,
          url: `https://example.com/guide/${q.toLowerCase().replace(/\s+/g, "-")}`,
        },
        {
          title: `${q} Tutorial for Beginners`,
          description: `Start your journey with ${q} using our step-by-step tutorial designed for beginners.`,
          url: `https://example.com/tutorial/${q.toLowerCase().replace(/\s+/g, "-")}`,
        },
        {
          title: `${q} Training Dataset`,
          description: `High-quality training data for AI models related to ${q}. Contains labeled examples and test cases.`,
          url: `https://example.com/data/${q.toLowerCase().replace(/\s+/g, "-")}/dataset`,
          isTrainingData: true,
        },
        {
          title: `Latest Developments in ${q}`,
          description: `Stay updated with the most recent advancements and research in ${q}.`,
          url: `https://example.com/news/${q.toLowerCase().replace(/\s+/g, "-")}`,
        },
        {
          title: `${q} Documentation and References`,
          description: `Official documentation and reference materials for ${q}.`,
          url: `https://example.com/docs/${q.toLowerCase().replace(/\s+/g, "-")}`,
        },
      ]

      setSearchResults(mockResults)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const handleOpenResult = (result: SearchResult) => {
    setIsLoading(true)
    setCurrentPage(result)
    setSearchResults([])

    // Add to history
    if (historyIndex < history.length - 1) {
      // If we're not at the end of history, truncate it
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), result.url])
    } else {
      setHistory((prev) => [...prev, result.url])
    }
    setHistoryIndex((prev) => prev + 1)

    setUrl(result.url)

    setTimeout(() => {
      setIsLoading(false)

      // If this is training data, automatically start learning
      if (result.isTrainingData) {
        handleLearnFromPage(result)
      }
    }, 1000)
  }

  const handleLearnFromPage = (page: SearchResult) => {
    setIsLearning(true)
    setLearningProgress(0)
    setLearningSuccess(null)

    // Simulate learning process
    const interval = setInterval(() => {
      setLearningProgress((prev) => {
        const newProgress = prev + Math.random() * 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsLearning(false)
          setLearningSuccess(`Successfully learned from "${page.title}"`)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleGoBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      const prevUrl = history[historyIndex - 1]
      setUrl(prevUrl)
      setCurrentPage(null)
      setSearchResults([])

      // Simulate loading
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // If it was a search URL, perform search again
        if (prevUrl.includes("search.example.com")) {
          const params = new URLSearchParams(prevUrl.split("?")[1])
          const q = params.get("q")
          if (q) {
            setSearchQuery(q)
            handleSearch(q)
          }
        }
      }, 500)
    }
  }

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      const nextUrl = history[historyIndex + 1]
      setUrl(nextUrl)
      setCurrentPage(null)
      setSearchResults([])

      // Simulate loading
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // If it was a search URL, perform search again
        if (nextUrl.includes("search.example.com")) {
          const params = new URLSearchParams(nextUrl.split("?")[1])
          const q = params.get("q")
          if (q) {
            setSearchQuery(q)
            handleSearch(q)
          }
        }
      }, 500)
    }
  }

  const handleDownloadPage = () => {
    if (!currentPage) return

    // Simulate download
    alert(`Downloading content from: ${currentPage.url}`)
  }

  const handleLearnCurrentPage = () => {
    if (!currentPage) return
    handleLearnFromPage(currentPage)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={isLoading || historyIndex <= 0} onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || historyIndex >= history.length - 1}
          onClick={handleGoForward}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          onClick={() => {
            if (url.includes("search.example.com")) {
              handleSearch(searchQuery)
            } else if (currentPage) {
              handleOpenResult(currentPage)
            }
          }}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={url || searchQuery}
              onChange={(e) => {
                if (url.includes("search.example.com")) {
                  setSearchQuery(e.target.value)
                }
                setUrl(e.target.value)
              }}
              placeholder="Search or enter website"
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit" disabled={isLoading}>
            {url.includes("search.example.com") ? "Search" : "Go"}
          </Button>
        </form>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {learningSuccess && (
        <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{learningSuccess}</AlertDescription>
        </Alert>
      )}

      {isLearning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm">Learning from page content...</span>
            </div>
            <span className="text-sm font-medium">{Math.round(learningProgress)}%</span>
          </div>
          <Progress value={learningProgress} className="h-1" />
        </div>
      )}

      <div className="border rounded-lg p-4 min-h-[400px] bg-background">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-medium">Search Results for: {searchQuery}</span>
            </div>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <Card
                  key={index}
                  className={`p-3 hover:bg-muted/50 cursor-pointer ${result.isTrainingData ? "border-primary" : ""}`}
                  onClick={() => handleOpenResult(result)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-primary font-medium">{result.title}</h3>
                        {result.isTrainingData && (
                          <Badge className="bg-primary text-primary-foreground">Training Data</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{result.url}</p>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenResult(result)
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : currentPage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="font-medium">{currentPage.title}</h2>
                {currentPage.isTrainingData && (
                  <Badge className="bg-primary text-primary-foreground">Training Data</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadPage}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleLearnCurrentPage}>
                  <Brain className="h-4 w-4 mr-1" />
                  Learn
                </Button>
              </div>
            </div>

            <div className="border rounded p-4 min-h-[300px]">
              <div className="prose max-w-none dark:prose-invert">
                <h1>{currentPage.title}</h1>
                <p className="text-sm text-muted-foreground mb-4">URL: {currentPage.url}</p>
                <p>{currentPage.description}</p>

                {/* Simulated page content */}
                <p>
                  This is a simulated page content for demonstration purposes. In a real application, this would display
                  the actual content of the webpage or file.
                </p>

                {currentPage.isTrainingData && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded">
                    <h3 className="text-primary">Training Data Information</h3>
                    <p>This page contains structured training data that can be used to improve the AI model.</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Dataset size: 2,450 samples</li>
                      <li>Format: JSON/CSV</li>
                      <li>Categories: 12</li>
                      <li>Last updated: 2 days ago</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Enter a search query or URL to browse</p>
          </div>
        )}
      </div>
    </div>
  )
}
