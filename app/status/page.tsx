"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Brain, Database, RefreshCw, Server, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function StatusPage() {
  const [aiStatus, setAiStatus] = useState({
    training: {
      progress: 87,
      lastUpdated: "2 hours ago",
      status: "healthy", // healthy, warning, error
    },
    memory: {
      used: 68,
      total: 100,
      lastUpdated: "5 minutes ago",
      status: "healthy",
    },
    performance: {
      score: 92,
      lastUpdated: "1 hour ago",
      status: "healthy",
    },
    connectivity: {
      status: "online", // online, limited, offline
      lastChecked: "1 minute ago",
    },
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStatus = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setAiStatus({
        ...aiStatus,
        memory: {
          ...aiStatus.memory,
          used: Math.floor(Math.random() * 30) + 60,
          lastUpdated: "just now",
        },
        connectivity: {
          ...aiStatus.connectivity,
          lastChecked: "just now",
        },
      })
      setIsRefreshing(false)
    }, 1500)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Status Monitor</h1>
        <Button variant="outline" onClick={refreshStatus} disabled={isRefreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Status</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(aiStatus.training.status)}
              <div className="text-2xl font-bold">{aiStatus.training.progress}%</div>
            </div>
            <Progress value={aiStatus.training.progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Last updated: {aiStatus.training.lastUpdated}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(aiStatus.memory.status)}
              <div className="text-2xl font-bold">{aiStatus.memory.used}%</div>
            </div>
            <Progress value={aiStatus.memory.used} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Last updated: {aiStatus.memory.lastUpdated}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(aiStatus.performance.status)}
              <div className="text-2xl font-bold">{aiStatus.performance.score}/100</div>
            </div>
            <Progress value={aiStatus.performance.score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Last updated: {aiStatus.performance.lastUpdated}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connectivity</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  aiStatus.connectivity.status === "online"
                    ? "bg-green-500"
                    : aiStatus.connectivity.status === "limited"
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
              />
              <div className="text-2xl font-bold capitalize">{aiStatus.connectivity.status}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Last checked: {aiStatus.connectivity.lastChecked}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="training">
        <TabsList>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Status</CardTitle>
              <CardDescription>View detailed information about the AI's training progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Current Dataset</h3>
                    <p className="text-sm text-muted-foreground">GitHub Repositories + Web Data</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Training Time</h3>
                    <p className="text-sm text-muted-foreground">14 hours, 32 minutes</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Epochs Completed</h3>
                    <p className="text-sm text-muted-foreground">87/100</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Loss</h3>
                    <p className="text-sm text-muted-foreground">0.0342</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Training Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>New GitHub data integrated</span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Web browsing data processed</span>
                      <span className="text-muted-foreground">4 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Training checkpoint saved</span>
                      <span className="text-muted-foreground">6 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retrain Model
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Management</CardTitle>
              <CardDescription>View and manage the AI's memory usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Total Memory</h3>
                    <p className="text-sm text-muted-foreground">100 GB</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Used Memory</h3>
                    <p className="text-sm text-muted-foreground">{aiStatus.memory.used} GB</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Memory Type</h3>
                    <p className="text-sm text-muted-foreground">Distributed Cloud Storage</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Backup Status</h3>
                    <p className="text-sm text-muted-foreground">Last backup: 1 day ago</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Memory Allocation</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Training Data</span>
                        <span>42 GB</span>
                      </div>
                      <Progress value={42} className="h-2 mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>User Interactions</span>
                        <span>15 GB</span>
                      </div>
                      <Progress value={15} className="h-2 mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>System Files</span>
                        <span>11 GB</span>
                      </div>
                      <Progress value={11} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Clear Cache</Button>
              <Button variant="outline">Backup Now</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>View detailed performance metrics for the AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Response Time</h3>
                    <p className="text-sm text-muted-foreground">0.24 seconds</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Accuracy Score</h3>
                    <p className="text-sm text-muted-foreground">94%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Error Rate</h3>
                    <p className="text-sm text-muted-foreground">0.8%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Uptime</h3>
                    <p className="text-sm text-muted-foreground">99.97%</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Performance History</h3>
                  <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Performance chart would be displayed here</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Run Diagnostics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View system logs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-auto font-mono text-sm">
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:23:25]</span>
                  <span className="text-green-500 mr-2">[INFO]</span>
                  <span>Training checkpoint saved successfully</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:20:12]</span>
                  <span className="text-green-500 mr-2">[INFO]</span>
                  <span>GitHub repository data synchronized</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:15:45]</span>
                  <span className="text-amber-500 mr-2">[WARN]</span>
                  <span>Memory usage approaching 70% threshold</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:10:33]</span>
                  <span className="text-green-500 mr-2">[INFO]</span>
                  <span>Voice model updated to version 2.3.1</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:05:21]</span>
                  <span className="text-green-500 mr-2">[INFO]</span>
                  <span>Web browsing module initialized</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">[2023-04-25 14:00:00]</span>
                  <span className="text-green-500 mr-2">[INFO]</span>
                  <span>System startup complete</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Clear Logs</Button>
              <Button variant="outline">Export Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
