"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download, Smartphone, Laptop, Check, Wifi, WifiOff } from "lucide-react"

export function AppDownload() {
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("android")
  const [offlineMode, setOfflineMode] = useState(true)
  const [backgroundMode, setBackgroundMode] = useState(true)
  const [downloadSize, setDownloadSize] = useState(1.2) // GB

  const handleDownload = () => {
    setDownloadStarted(true)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloadComplete(true)
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform)

    // Adjust download size based on platform
    switch (platform) {
      case "android":
        setDownloadSize(1.2)
        break
      case "ios":
        setDownloadSize(1.4)
        break
      case "windows":
        setDownloadSize(2.1)
        break
      case "mac":
        setDownloadSize(1.8)
        break
    }
  }

  const handleOfflineModeChange = (checked: boolean) => {
    setOfflineMode(checked)

    // Adjust download size based on offline mode
    if (checked) {
      setDownloadSize((prev) => prev + 0.8)
    } else {
      setDownloadSize((prev) => Math.max(0.8, prev - 0.8))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Alpha AI</CardTitle>
        <CardDescription>Get Alpha AI on your device for enhanced capabilities and offline access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="android" value={selectedPlatform} onValueChange={handlePlatformChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="android">
              <Smartphone className="h-4 w-4 mr-2" />
              Android
            </TabsTrigger>
            <TabsTrigger value="ios">
              <Smartphone className="h-4 w-4 mr-2" />
              iOS
            </TabsTrigger>
            <TabsTrigger value="windows">
              <Laptop className="h-4 w-4 mr-2" />
              Windows
            </TabsTrigger>
            <TabsTrigger value="mac">
              <Laptop className="h-4 w-4 mr-2" />
              macOS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="android" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Android App</h3>
                <p className="text-sm text-muted-foreground">For phones and tablets running Android 8.0+</p>
              </div>
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
          </TabsContent>

          <TabsContent value="ios" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">iOS App</h3>
                <p className="text-sm text-muted-foreground">For iPhone and iPad running iOS 14+</p>
              </div>
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
          </TabsContent>

          <TabsContent value="windows" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Windows App</h3>
                <p className="text-sm text-muted-foreground">For Windows 10 and 11 devices</p>
              </div>
              <Laptop className="h-10 w-10 text-primary" />
            </div>
          </TabsContent>

          <TabsContent value="mac" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">macOS App</h3>
                <p className="text-sm text-muted-foreground">For macOS 11 Big Sur and newer</p>
              </div>
              <Laptop className="h-10 w-10 text-primary" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Download Options</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="offline-mode" checked={offlineMode} onCheckedChange={handleOfflineModeChange} />
              <div>
                <Label htmlFor="offline-mode">Offline Mode</Label>
                <p className="text-xs text-muted-foreground">Download all required data for offline use</p>
              </div>
            </div>
            {offlineMode ? (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Wifi className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="background-mode" checked={backgroundMode} onCheckedChange={setBackgroundMode} />
              <div>
                <Label htmlFor="background-mode">Background Mode</Label>
                <p className="text-xs text-muted-foreground">Allow app to run in the background</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Download Size:</span>
              <span className="text-sm font-medium">{downloadSize.toFixed(1)} GB</span>
            </div>
          </div>
        </div>

        {downloadStarted && !downloadComplete && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Downloading...</span>
              <span className="text-sm font-medium">{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} />
          </div>
        )}

        {downloadComplete && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            <span>Download complete! Check your device for installation instructions.</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleDownload} disabled={downloadStarted && !downloadComplete}>
          <Download className="mr-2 h-4 w-4" />
          {downloadStarted ? (downloadComplete ? "Downloaded" : "Downloading...") : "Download Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
