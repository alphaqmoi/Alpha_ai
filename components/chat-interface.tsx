"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedback?: "positive" | "negative" | null
  thinking?: string[]
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Alpha AI. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinking, setThinking] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [conversationContext, setConversationContext] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    // Initialize recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      setInput(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("alphaAI_conversation", JSON.stringify(messages))
    }
  }, [messages])

  // Load conversation from localStorage
  useEffect(() => {
    const savedConversation = localStorage.getItem("alphaAI_conversation")
    if (savedConversation) {
      try {
        const parsedMessages = JSON.parse(savedConversation)
        // Convert string timestamps back to Date objects
        const processedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(processedMessages)
      } catch (err) {
        console.error("Error loading saved conversation:", err)
      }
    }
  }, [])

  // Update conversation context when messages change
  useEffect(() => {
    // Extract the last 5 messages for context
    const contextMessages = messages.slice(-5).map((msg) => `${msg.role}: ${msg.content}`)
    setConversationContext(contextMessages)
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)
    setIsThinking(true)
    setThinking([])
    setError(null)

    // Simulate AI thinking process
    simulateThinking(input)

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      generateResponse(input, conversationContext)
    }, 2000)
  }

  const simulateThinking = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()
    const thinkingSteps: string[] = []

    // Generate thinking steps based on input
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      thinkingSteps.push("Detecting greeting pattern")
      thinkingSteps.push("Formulating appropriate response")
    } else if (lowerInput.includes("weather")) {
      thinkingSteps.push("Identifying weather-related query")
      thinkingSteps.push("Checking if location is specified")
      thinkingSteps.push("Would need to access weather API for real data")
    } else if (lowerInput.includes("help")) {
      thinkingSteps.push("User is requesting assistance")
      thinkingSteps.push("Analyzing context to determine specific needs")
      thinkingSteps.push("Preparing helpful response options")
    } else {
      thinkingSteps.push("Analyzing user input")
      thinkingSteps.push("Identifying key concepts and intent")
      thinkingSteps.push("Formulating appropriate response")
    }

    // Display thinking steps with delays
    let stepIndex = 0
    const thinkingInterval = setInterval(() => {
      if (stepIndex < thinkingSteps.length) {
        setThinking((prev) => [...prev, thinkingSteps[stepIndex]])
        stepIndex++
      } else {
        clearInterval(thinkingInterval)
      }
    }, 800)
  }

  const generateResponse = (userInput: string, context: string[]) => {
    const lowerInput = userInput.toLowerCase()
    let response = ""

    // Generate response based on input
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      response = "Hello! How can I assist you today?"
    } else if (lowerInput.includes("weather")) {
      response = "I don't have access to real-time weather data, but I'd be happy to help with other questions!"
    } else if (lowerInput.includes("help")) {
      response =
        "I'm here to help! You can ask me questions, request information, or just chat. What would you like assistance with?"
    } else if (lowerInput.includes("github")) {
      response =
        "I can help you with GitHub integration. Would you like to connect your GitHub account or learn more about our GitHub features?"
    } else if (lowerInput.includes("voice")) {
      response =
        "Our voice features allow you to interact with the AI using speech. You can customize voice settings in the settings page."
    } else if (lowerInput.includes("train") || lowerInput.includes("training")) {
      response =
        "You can upload training data to help me learn and improve. Would you like to know more about the training process?"
    } else {
      response =
        "I understand you're asking about " + userInput + ". Could you provide more details so I can assist you better?"
    }

    // Add AI response
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      thinking: thinking,
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsProcessing(false)
    setIsThinking(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
        setError(null)
      } catch (err) {
        console.error("Error starting speech recognition:", err)
        setError("Could not start speech recognition")
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Handle file upload (in a real app, this would process the file)
    setInput(`I've uploaded a file: ${file.name}`)
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm Alpha AI. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    localStorage.removeItem("alphaAI_conversation")
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-background rounded-lg border shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Alpha AI Chat</h2>
        <button onClick={clearConversation} className="text-sm text-muted-foreground hover:text-foreground">
          Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === "assistant" ? "items-start" : "items-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "assistant"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p>{message.content}</p>
              {message.thinking && message.thinking.length > 0 && (
                <div className="mt-2 text-xs opacity-70">
                  <details>
                    <summary>Thinking process</summary>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {message.thinking.map((thought, i) => (
                        <li key={i}>{thought}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>

            <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
              <span>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {message.role === "assistant" && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleFeedback(message.id, "positive")}
                    className={`p-1 rounded hover:bg-secondary ${
                      message.feedback === "positive" ? "text-green-500" : ""
                    }`}
                    aria-label="Positive feedback"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback(message.id, "negative")}
                    className={`p-1 rounded hover:bg-secondary ${
                      message.feedback === "negative" ? "text-red-500" : ""
                    }`}
                    aria-label="Negative feedback"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex flex-col items-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Thinking</div>
                <div className="flex space-x-1">
                  <div
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>

              {thinking.length > 0 && (
                <ul className="list-disc pl-4 mt-2 space-y-1 text-xs opacity-70">
                  {thinking.map((thought, i) => (
                    <li key={i}>{thought}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && <div className="p-2 text-sm text-red-500 bg-red-50 border-t">{error}</div>}

      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center space-x-2">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

        <button
          type="button"
          onClick={triggerFileUpload}
          className="p-2 rounded-full hover:bg-secondary"
          aria-label="Upload file"
        >
          📎
        </button>

        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2 rounded-full hover:bg-secondary ${isRecording ? "text-red-500 animate-pulse" : ""}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          🎤
        </button>

        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isProcessing}
        />

        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
