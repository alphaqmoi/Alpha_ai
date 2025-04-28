"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Github, Plus, RefreshCw, Check, AlertCircle } from "lucide-react"

export function GitHubIntegration() {
  const [token, setToken] = useState("")
  const [repoName, setRepoName] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("connect")

  const handleConnect = () => {
    if (!token) {
      setError("GitHub token is required")
      return
    }

    setIsConnecting(true)
    setError(null)

    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
      setActiveTab("manage")
    }, 2000)
  }

  const handleCreateRepo = () => {
    if (!repoName) {
      setError("Repository name is required")
      return
    }

    setIsConnecting(true)
    setError(null)

    // Simulate repo creation
    setTimeout(() => {
      setIsConnecting(false)
      setError(null)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>Connect to GitHub to backup your model and training data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="manage" disabled={!isConnected}>
              Manage
            </TabsTrigger>
            <TabsTrigger value="create">Create Repo</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4 mt-4">
            {isConnected ? (
              <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <Check className="h-4 w-4" />
                <AlertDescription>Successfully connected to GitHub</AlertDescription>
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a token with 'repo' scope at{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      github.com/settings/tokens
                    </a>
                  </p>
                </div>

                <Button onClick={handleConnect} disabled={isConnecting || !token} className="w-full">
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Github className="mr-2 h-4 w-4" />
                      Connect to GitHub
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    <span className="font-medium">simtwov/Alpha</span>
                  </div>
                  <Badge variant="outline">Connected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Last backup: 2 hours ago</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Backup Now
                </Button>
                <Button variant="outline">Configure Backup</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                placeholder="alpha-ai"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo-description">Description (Optional)</Label>
              <Input id="repo-description" placeholder="My Alpha AI project" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="private-repo" className="rounded" />
              <Label htmlFor="private-repo">Private repository</Label>
            </div>

            <Button onClick={handleCreateRepo} disabled={isConnecting || !repoName} className="w-full">
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Repository
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
