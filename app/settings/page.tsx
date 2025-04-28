"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Brain, ChevronLeft, Save } from "lucide-react"
import Link from "next/link"
import { VoiceSelector } from "@/components/voice-selector"
import { WebBrowser } from "@/components/web-browser"
import { GitHubIntegration } from "@/components/github-integration"
import { AppDownload } from "@/components/app-download"

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState("")
  const [backupFrequency, setBackupFrequency] = useState("6")
  const [autoTraining, setAutoTraining] = useState(true)
  const [modelSize, setModelSize] = useState(50)
  const [offlineMode, setOfflineMode] = useState(false)
  const [backgroundRunning, setBackgroundRunning] = useState(true)

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Alpha AI Settings</h1>
          </Link>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </header>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="web">Web Access</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic settings for Alpha AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input id="model-name" defaultValue="Alpha AI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" defaultValue="Natural Language Processing Model" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" defaultValue="1.0.0" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" />
                <Label htmlFor="debug-mode">Enable Debug Mode</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Settings</CardTitle>
              <CardDescription>Configure how the model is trained</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-training" checked={autoTraining} onCheckedChange={setAutoTraining} />
                <Label htmlFor="auto-training">Start Training Automatically on Deployment</Label>
              </div>

              <div className="space-y-2">
                <Label>Model Size</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Small</span>
                  <Slider
                    value={[modelSize]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setModelSize(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">Large</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current: {modelSize < 33 ? "Small" : modelSize < 66 ? "Medium" : "Large"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learning-rate">Learning Rate</Label>
                <Select defaultValue="0.001">
                  <SelectTrigger id="learning-rate">
                    <SelectValue placeholder="Select learning rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.0001">0.0001 (Very Slow)</SelectItem>
                    <SelectItem value="0.001">0.0.001 (Default)</SelectItem>
                    <SelectItem value="0.01">0.01 (Fast)</SelectItem>
                    <SelectItem value="0.1">0.1 (Very Fast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epochs">Training Epochs</Label>
                <Input id="epochs" type="number" defaultValue="10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input id="batch-size" type="number" defaultValue="32" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <GitHubIntegration
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            backupFrequency={backupFrequency}
            setBackupFrequency={setBackupFrequency}
          />
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Configure voice settings for voice interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceSelector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="space-y-4">
          <WebBrowser />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options (use with caution)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input id="api-endpoint" defaultValue="/api" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input id="max-tokens" type="number" defaultValue="2048" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Precise</span>
                  <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
                  <span className="text-sm">Creative</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="use-gpu" defaultChecked />
                <Label htmlFor="use-gpu">Use GPU Acceleration (if available)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="memory-optimization" defaultChecked />
                <Label htmlFor="memory-optimization">Enable Memory Optimization</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="offline-mode" checked={offlineMode} onCheckedChange={setOfflineMode} />
                <Label htmlFor="offline-mode">Enable Offline Mode</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="background-running" checked={backgroundRunning} onCheckedChange={setBackgroundRunning} />
                <Label htmlFor="background-running">Allow Background Running</Label>
              </div>

              <div className="pt-4">
                <Button variant="destructive">Reset All Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-4">
          <AppDownload />
        </TabsContent>
      </Tabs>
    </div>
  )
}
