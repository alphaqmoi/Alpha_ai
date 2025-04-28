"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy, Play } from "lucide-react"

interface ApiDocsType {
  name: string
  version: string
  description: string
  baseUrl: string
  categories: {
    name: string
    endpoints: {
      path: string
      description: string
    }[]
  }[]
}

export default function ApiDocsPage() {
  const [apiDocs, setApiDocs] = useState<ApiDocsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null)
  const [requestBody, setRequestBody] = useState("{}")
  const [responseData, setResponseData] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchApiDocs()
  }, [])

  const fetchApiDocs = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/v1")

      if (!response.ok) {
        throw new Error(`Failed to fetch API docs: ${response.status}`)
      }

      const data = await response.json()
      setApiDocs(data)

      // Set default active category and endpoint
      if (data.categories && data.categories.length > 0) {
        setActiveCategory(data.categories[0].name)

        if (data.categories[0].endpoints && data.categories[0].endpoints.length > 0) {
          setActiveEndpoint(data.categories[0].endpoints[0].path)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch API documentation")
      console.error("Error fetching API docs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteRequest = async () => {
    if (!activeEndpoint) return

    try {
      setIsExecuting(true)
      setError(null)

      let requestBodyObj
      try {
        requestBodyObj = JSON.parse(requestBody)
      } catch (err) {
        setError("Invalid JSON in request body")
        setIsExecuting(false)
        return
      }

      // Add the endpoint to the request body
      requestBodyObj.endpoint = activeEndpoint

      const response = await fetch("/api/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBodyObj),
      })

      const data = await response.json()
      setResponseData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute request")
      console.error("Error executing request:", err)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const getDefaultRequestBody = (endpoint: string) => {
    switch (endpoint) {
      case "/voice":
        return JSON.stringify({ data: { audio: "base64_audio_data" }, options: { identifySpeaker: true } }, null, 2)
      case "/chat":
        return JSON.stringify({ message: "Hello, how can you help me?", conversationId: null }, null, 2)
      case "/trading":
        return JSON.stringify({ action: "analyze", pair: "BTC/USDT", options: { timeframe: "1d" } }, null, 2)
      default:
        return JSON.stringify({ data: {}, options: {} }, null, 2)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Loading API Documentation...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchApiDocs} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!apiDocs) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">No API documentation available</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{apiDocs.name}</h1>
          <p className="text-muted-foreground">Version {apiDocs.version}</p>
          <p className="mt-2 max-w-2xl">{apiDocs.description}</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Base URL: {apiDocs.baseUrl}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>API Categories</CardTitle>
              <CardDescription>Select a category to explore endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiDocs.categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={activeCategory === category.name ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveCategory(category.name)
                      if (category.endpoints && category.endpoints.length > 0) {
                        setActiveEndpoint(category.endpoints[0].path)
                        setRequestBody(getDefaultRequestBody(category.endpoints[0].path))
                        setResponseData(null)
                      }
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="endpoints" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="playground">API Playground</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle>{activeCategory ? `${activeCategory} Endpoints` : "Select a category"}</CardTitle>
                  <CardDescription>
                    {activeCategory
                      ? `Available endpoints in the ${activeCategory} category`
                      : "Choose a category from the sidebar to view available endpoints"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeCategory && (
                    <div className="space-y-4">
                      {apiDocs.categories
                        .find((cat) => cat.name === activeCategory)
                        ?.endpoints.map((endpoint) => (
                          <Card key={endpoint.path} className="overflow-hidden">
                            <div
                              className={`p-4 cursor-pointer ${
                                activeEndpoint === endpoint.path
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => {
                                setActiveEndpoint(endpoint.path)
                                setRequestBody(getDefaultRequestBody(endpoint.path))
                                setResponseData(null)
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="font-bold">{endpoint.path}</h3>
                                <Badge variant={activeEndpoint === endpoint.path ? "outline" : "secondary"}>POST</Badge>
                              </div>
                              <p className="mt-1 text-sm">{endpoint.description}</p>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playground">
              <Card>
                <CardHeader>
                  <CardTitle>API Playground</CardTitle>
                  <CardDescription>Test the {activeEndpoint} endpoint with custom parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Request</h3>
                        <div className="relative">
                          <Textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            className="font-mono h-[300px]"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyCode(requestBody)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleExecuteRequest}
                        disabled={isExecuting || !activeEndpoint}
                        className="w-full"
                      >
                        {isExecuting ? "Executing..." : "Execute Request"}
                        {!isExecuting && <Play className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Response</h3>
                      <div className="relative bg-muted p-4 rounded-md h-[300px] overflow-auto">
                        <pre className="font-mono text-sm">
                          {responseData
                            ? JSON.stringify(responseData, null, 2)
                            : "Execute the request to see the response"}
                        </pre>
                        {responseData && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyCode(JSON.stringify(responseData, null, 2))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>Sample code for using the {activeEndpoint} endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript">
                    <TabsList className="mb-4">
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="javascript">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm">
                          {`// Example using fetch with the ${activeEndpoint} endpoint
async function callAlphaAPI() {
  try {
    const response = await fetch('/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '${activeEndpoint}',
        data: {
          // Your data here
        },
        options: {
          // Your options here
        }
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error calling Alpha API:', error);
    throw error;
  }
}`}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            handleCopyCode(`// Example using fetch with the ${activeEndpoint} endpoint
async function callAlphaAPI() {
  try {
    const response = await fetch('/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '${activeEndpoint}',
        data: {
          // Your data here
        },
        options: {
          // Your options here
        }
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error calling Alpha API:', error);
    throw error;
  }
}`)
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="python">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm">
                          {`# Example using requests with the ${activeEndpoint} endpoint
import requests
import json

def call_alpha_api():
    try:
        response = requests.post(
            'https://your-domain.com/api/v1',
            headers={'Content-Type': 'application/json'},
            json={
                'endpoint': '${activeEndpoint}',
                'data': {
                    # Your data here
                },
                'options': {
                    # Your options here
                }
            }
        )
        
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        data = response.json()
        print('Response:', data)
        return data
    except requests.exceptions.RequestException as e:
        print('Error calling Alpha API:', e)
        raise e

# Call the function
result = call_alpha_api()`}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            handleCopyCode(`# Example using requests with the ${activeEndpoint} endpoint
import requests
import json

def call_alpha_api():
    try:
        response = requests.post(
            'https://your-domain.com/api/v1',
            headers={'Content-Type': 'application/json'},
            json={
                'endpoint': '${activeEndpoint}',
                'data': {
                    # Your data here
                },
                'options': {
                    # Your options here
                }
            }
        )
        
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        data = response.json()
        print('Response:', data)
        return data
    except requests.exceptions.RequestException as e:
        print('Error calling Alpha API:', e)
        raise e

# Call the function
result = call_alpha_api()`)
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="curl">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm">
                          {`# Example using curl with the ${activeEndpoint} endpoint
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "${activeEndpoint}",
    "data": {
      // Your data here
    },
    "options": {
      // Your options here
    }
  }' \\
  https://your-domain.com/api/v1`}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            handleCopyCode(`# Example using curl with the ${activeEndpoint} endpoint
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "${activeEndpoint}",
    "data": {
      // Your data here
    },
    "options": {
      // Your options here
    }
  }' \\
  https://your-domain.com/api/v1`)
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}
