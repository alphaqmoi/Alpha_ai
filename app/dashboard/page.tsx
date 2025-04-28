"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Settings,
  Users,
  Download,
  Mic,
  Globe,
  Smartphone,
  Laptop,
  HardDrive,
  Brain,
  Code,
} from "lucide-react"
import { ApiCapabilities } from "@/components/api-capabilities"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Alpha</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Platform</TabsTrigger>
            <TabsTrigger value="status">AI Status</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="browser">Web Browser</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Ready to grow</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Alpha project initialized</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">No data available yet</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Follow these steps to set up your Alpha project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Create a GitHub repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by creating a new GitHub repository to host your project code.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">2. Clone the repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Clone your repository to your local machine to start development.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">3. Add this project code</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy this project code to your repository and push the changes.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button asChild>
                    <Link href="/settings/voice">
                      <Mic className="mr-2 h-4 w-4" />
                      Configure Voice
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/download">
                      <Download className="mr-2 h-4 w-4" />
                      Download App
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiCapabilities />

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    API Integration Guide
                  </CardTitle>
                  <CardDescription>How to integrate with the Alpha AI Platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate an API key in the settings page to authenticate your requests.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Make API Calls</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the unified endpoint at /api/v1 and specify the desired capability in your request.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Handle Responses</h3>
                    <p className="text-sm text-muted-foreground">
                      Process the standardized JSON responses from the API in your application.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <Link href="/api-docs">View Full API Documentation</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Sample Integration
                  </CardTitle>
                  <CardDescription>Example code for using the Alpha AI API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm h-[300px]">
                    {`// Example using fetch with the Alpha AI API
async function callAlphaAPI(endpoint, data = {}, options = {}) {
  try {
    const response = await fetch('/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        endpoint,
        data,
        options
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('Error calling Alpha API:', error);
    throw error;
  }
}

// Example: Using the chat endpoint
async function sendChatMessage(message) {
  const result = await callAlphaAPI('/chat', {
    message,
    conversationId: sessionStorage.getItem('conversationId')
  });
  
  // Save conversation ID for future messages
  if (result.conversationId) {
    sessionStorage.setItem('conversationId', result.conversationId);
  }
  
  return result.response;
}`}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Status</CardTitle>
                  <CardDescription>Current state of your AI system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Training Status:</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Complete
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Testing Status:</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Readiness:</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Updated:</span>
                      <span className="text-sm text-muted-foreground">Today at 10:30 AM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Performance</CardTitle>
                  <CardDescription>Monitor your AI's performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Response Time:</span>
                      <span className="font-medium">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">98.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Error Rate:</span>
                      <span className="font-medium">0.3%</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Recent Improvements</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-green-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Response time improved by 15%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Accuracy increased from 97.5% to 98.2%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Error rate reduced by 0.2%</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="github" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GitHub Integration</CardTitle>
                <CardDescription>Manage your GitHub repositories and workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Repository Status</div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Connected
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Your GitHub repository is connected and syncing properly.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Recent Activity</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Updated training data files (2 hours ago)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Created new model version (yesterday)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Merged pull request #42 (3 days ago)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button>Sync Repository</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browser" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Web Browser
                </CardTitle>
                <CardDescription>Browse the web to train and verify information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter URL to browse"
                      />
                    </div>
                    <Button>Browse</Button>
                  </div>

                  <div className="rounded-md border h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Globe className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Enter a URL above to start browsing</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Recent Browsing History</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-gray-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>github.com/documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-gray-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>developer.mozilla.org</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-gray-500 rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>stackoverflow.com/questions/12345</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Download Options</CardTitle>
                  <CardDescription>Get Alpha AI on your devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <Button asChild className="h-auto py-4 flex flex-col">
                      <Link href="/download">
                        <Smartphone className="h-8 w-8 mb-2" />
                        <span>Mobile App</span>
                      </Link>
                    </Button>
                    <Button asChild className="h-auto py-4 flex flex-col">
                      <Link href="/download">
                        <Laptop className="h-8 w-8 mb-2" />
                        <span>Desktop App</span>
                      </Link>
                    </Button>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Features</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Offline access to AI capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Enhanced performance with native code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>Background processing and notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary rounded-full h-2 w-2 mt-1.5 shrink-0"></span>
                        <span>System-level integration</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Requirements</CardTitle>
                  <CardDescription>Minimum specifications for optimal performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Laptop className="h-4 w-4" /> Desktop
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>OS: Windows 10/11, macOS 11+, Linux</li>
                        <li>CPU: 4-core processor, 2.5GHz+</li>
                        <li>RAM: 8GB minimum, 16GB recommended</li>
                        <li>Storage: 2GB free space</li>
                        <li>Internet: Broadband connection</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Smartphone className="h-4 w-4" /> Mobile
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>OS: iOS 14+, Android 10+</li>
                        <li>RAM: 4GB minimum</li>
                        <li>Storage: 500MB free space</li>
                        <li>Internet: 4G/5G or WiFi</li>
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        <HardDrive className="mr-2 h-4 w-4" />
                        Check Compatibility
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Offline Mode</CardTitle>
                <CardDescription>Download data for offline use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Full Data Package</h3>
                      <p className="text-sm text-muted-foreground">
                        Download all necessary data for complete offline functionality
                      </p>
                    </div>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download (4.2GB)
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Essential Package</h3>
                      <p className="text-sm text-muted-foreground">Download core functionality only</p>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download (1.8GB)
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Background Processing</h3>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Enable background processing
                      </label>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Allow Alpha AI to continue processing tasks in the background when the app is minimized
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
