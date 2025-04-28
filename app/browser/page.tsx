"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Search, BookOpen, History, Star, Download, RefreshCw } from "lucide-react"

export default function BrowserPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("browser")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Web Browser</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            AI Web Browser
          </CardTitle>
          <CardDescription>Browse the web to train the AI and gather information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter URL or search query"
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                "Browse"
              )}
            </Button>
          </form>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="browser">Browser</TabsTrigger>
              <TabsTrigger value="reader">Reader Mode</TabsTrigger>
              <TabsTrigger value="training">Training Data</TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="min-h-[400px]">
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading content...</p>
                  </div>
                </div>
              ) : url ? (
                <div className="flex h-[400px] items-center justify-center border rounded-md">
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Web content would be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">URL: {url}</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center max-w-md">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Browse the Web</h3>
                    <p className="text-muted-foreground">
                      Enter a URL or search query above to browse the web. The AI will use this information for training
                      and to answer your questions.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reader" className="min-h-[400px]">
              <div className="flex h-[400px] items-center justify-center border rounded-md">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Reader mode would display simplified content here</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training" className="min-h-[400px]">
              <div className="flex h-[400px] items-center justify-center border rounded-md">
                <div className="text-center">
                  <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Training data extracted from the page would be shown here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : url ? "Page loaded" : "Ready to browse"}
          </div>
          <Button variant="outline" size="sm" disabled={!url}>
            <Download className="h-4 w-4 mr-2" />
            Save for Offline
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Browsing History</CardTitle>
          <CardDescription>Pages you've recently visited for AI training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">GitHub Documentation</p>
                  <p className="text-sm text-muted-foreground">https://docs.github.com</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Next.js Documentation</p>
                  <p className="text-sm text-muted-foreground">https://nextjs.org/docs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Yesterday</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">React Documentation</p>
                  <p className="text-sm text-muted-foreground">https://react.dev</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">3 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
