"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, BarChart3, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { useTaskManager } from "./task-manager"

interface TradingCredentials {
  apiKey: string
  secretKey: string
  passphrase?: string
}

interface TradeHistory {
  id: string
  pair: string
  type: "buy" | "sell"
  amount: number
  price: number
  timestamp: Date
  profit?: number
  isProfit?: boolean
}

// Default Bitget credentials
const DEFAULT_CREDENTIALS = {
  apiKey: "bg_1d7ea7c56644fb5da18a400c92a425d7",
  secretKey: "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13",
  passphrase: "Victor9798",
}

export function TradingInterface() {
  const [credentials, setCredentials] = useState<TradingCredentials | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAutoTrading, setIsAutoTrading] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [totalAssetValue, setTotalAssetValue] = useState<number | null>(null)
  const [selectedPair, setSelectedPair] = useState("BTC/USDT")
  const [tradeAmount, setTradeAmount] = useState("")
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [learningProgress, setLearningProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [availablePairs, setAvailablePairs] = useState(["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT"])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "error">(
    "disconnected",
  )
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null)
  const [activeTrades, setActiveTrades] = useState(0)

  const { addTask, updateTask, TasksDisplay } = useTaskManager()

  // Load credentials from localStorage
  useEffect(() => {
    // Try to load from localStorage first
    const storedCredentials = localStorage.getItem("bitget_credentials")
    if (storedCredentials) {
      try {
        setCredentials(JSON.parse(storedCredentials))
      } catch (err) {
        console.error("Error loading credentials:", err)
      }
    } else {
      // If no stored credentials, use the default ones
      setCredentials(DEFAULT_CREDENTIALS)
      localStorage.setItem("bitget_credentials", JSON.stringify(DEFAULT_CREDENTIALS))
    }

    // Load trade history
    const storedHistory = localStorage.getItem("trade_history")
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory)
        // Convert string dates back to Date objects
        const processedHistory = parsedHistory.map((trade: any) => ({
          ...trade,
          timestamp: new Date(trade.timestamp),
        }))
        setTradeHistory(processedHistory)
      } catch (err) {
        console.error("Error loading trade history:", err)
      }
    }

    // Auto-connect if credentials are available
    const autoConnect = async () => {
      if (credentials) {
        await handleConnect()
      }
    }

    autoConnect()

    // Set up periodic connection check
    const connectionCheckInterval = setInterval(() => {
      if (isConnected) {
        checkConnection()
        fetchBalance()
      }
    }, 60000) // Check every minute

    return () => clearInterval(connectionCheckInterval)
  }, [])

  // Save trade history when it changes
  useEffect(() => {
    if (tradeHistory.length > 0) {
      localStorage.setItem("trade_history", JSON.stringify(tradeHistory))
    }
  }, [tradeHistory])

  // Auto-connect when credentials change
  useEffect(() => {
    if (credentials && !isConnected) {
      handleConnect()
    }
  }, [credentials])

  // Monitor active trades
  useEffect(() => {
    const fetchActiveTrades = async () => {
      if (!isConnected) return

      try {
        const response = await fetch("/api/v1/trading?action=active-trades")
        if (response.ok) {
          const data = await response.json()
          setActiveTrades(data.activeTrades || 0)
        }
      } catch (error) {
        console.error("Error fetching active trades:", error)
      }
    }

    fetchActiveTrades()
    const interval = setInterval(fetchActiveTrades, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  const handleConnect = async () => {
    if (!credentials?.apiKey || !credentials?.secretKey) {
      setError("API Key and Secret Key are required")
      return
    }

    setError(null)
    setSuccess(null)
    setConnectionStatus("connecting")

    // Add a connection task
    const taskId = addTask({
      name: "Connecting to Bitget",
      type: "processing",
      progress: 0,
      details: "Validating API credentials",
    })

    try {
      // Call the API to connect
      const response = await fetch("/api/v1/trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "connect",
          credentials: {
            apiKey: credentials.apiKey,
            secretKey: credentials.secretKey,
            passphrase: credentials.passphrase,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Connection failed")
      }

      // Save credentials with a label
      const labeledCredentials = {
        ...credentials,
        label: "Alpha's bitget credentials",
      }

      localStorage.setItem("bitget_credentials", JSON.stringify(labeledCredentials))

      setIsConnected(true)
      setConnectionStatus("connected")
      setSuccess("Successfully connected to Bitget")
      setLastConnectionCheck(new Date())

      // Update balance if available
      if (data.balance) {
        setBalance(data.balance.USDT || 0)

        // Calculate total asset value
        const totalValue = Object.entries(data.balance).reduce((sum, [currency, amount]) => {
          // Convert all assets to USDT value (simplified)
          if (currency === "USDT") return sum + (amount as number)
          if (currency === "BTC") return sum + (amount as number) * 50000 // Approximate BTC value
          if (currency === "ETH") return sum + (amount as number) * 3000 // Approximate ETH value
          return sum
        }, 0)

        setTotalAssetValue(totalValue)
      }

      // Start learning process
      startLearningProcess()

      updateTask(taskId, {
        status: "completed",
        progress: 100,
        details: "Connected to Bitget successfully",
      })
    } catch (err) {
      setConnectionStatus("error")
      setError("Failed to connect: " + (err instanceof Error ? err.message : String(err)))
      updateTask(taskId, {
        status: "failed",
        progress: 0,
        details: "Connection failed",
      })
    }
  }

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/v1/trading?action=status")

      if (!response.ok) {
        setConnectionStatus("error")
        setIsConnected(false)
        setError("Connection check failed")
        return false
      }

      const data = await response.json()

      if (data.status?.connected) {
        setConnectionStatus("connected")
        setLastConnectionCheck(new Date())
        setIsConnected(true)
        return true
      } else {
        setConnectionStatus("disconnected")
        setIsConnected(false)
        setError("Not connected to Bitget")
        return false
      }
    } catch (error) {
      setConnectionStatus("error")
      setIsConnected(false)
      setError("Connection check failed: " + (error instanceof Error ? error.message : String(error)))
      return false
    }
  }

  const fetchBalance = async () => {
    if (!isConnected) return

    const taskId = addTask({
      name: "Fetching balance",
      type: "processing",
      progress: 0,
      details: "Retrieving account balance from Bitget",
    })

    try {
      // Call the API to get balance
      const response = await fetch("/api/v1/trading?action=balance")

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch balance")
      }

      // Update balance
      setBalance(data.balance.USDT || 0)

      // Calculate total asset value
      const totalValue = Object.entries(data.balance).reduce((sum, [currency, amount]) => {
        // Convert all assets to USDT value (simplified)
        if (currency === "USDT") return sum + (amount as number)
        if (currency === "BTC") return sum + (amount as number) * 50000 // Approximate BTC value
        if (currency === "ETH") return sum + (amount as number) * 3000 // Approximate ETH value
        return sum
      }, 0)

      setTotalAssetValue(totalValue)

      updateTask(taskId, {
        status: "completed",
        progress: 100,
        details: "Balance updated successfully",
      })
    } catch (err) {
      console.error("Error fetching balance:", err)
      updateTask(taskId, {
        status: "failed",
        progress: 0,
        details: "Failed to fetch balance",
      })
    }
  }

  const startLearningProcess = () => {
    if (!isConnected) return

    const taskId = addTask({
      name: "AI Learning Process",
      type: "learning",
      progress: learningProgress,
      details: "Training trading model with historical data",
    })

    // Simulate learning process
    const interval = setInterval(() => {
      setLearningProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 2, 100)

        updateTask(taskId, {
          progress: newProgress,
          details: newProgress < 70 ? "Training trading model with historical data" : "Optimizing trading parameters",
        })

        if (newProgress >= 100) {
          clearInterval(interval)
          updateTask(taskId, {
            status: "completed",
            details: "Learning process completed",
          })
          setSuccess("AI trading model is ready for use")
        }

        return newProgress
      })
    }, 3000)

    return () => clearInterval(interval)
  }

  const toggleAutoTrading = () => {
    if (isAutoTrading) {
      // Stop auto-trading
      setIsAutoTrading(false)
      setSuccess("Auto-trading stopped")

      // Call API to stop auto-trading
      fetch("/api/v1/trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "auto-trading",
          enabled: false,
        }),
      }).catch((err) => console.error("Error stopping auto-trading:", err))

      return
    }

    // Check if learning threshold is met
    if (learningProgress < 70) {
      setError("AI model needs to reach 70% learning threshold before auto-trading can begin")
      return
    }

    // Start auto-trading
    setIsAutoTrading(true)
    setSuccess("Auto-trading started")

    // Call API to start auto-trading
    fetch("/api/v1/trading", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "auto-trading",
        enabled: true,
        maxConcurrentTrades: 4,
      }),
    }).catch((err) => console.error("Error starting auto-trading:", err))

    // Add auto-trading task
    addTask({
      name: "Auto Trading",
      type: "trading",
      progress: 100,
      details: "Monitoring market conditions for trading opportunities",
    })

    // Simulate periodic trades
    simulatePeriodicTrades()
  }

  const simulatePeriodicTrades = () => {
    // Simulate a trade every 15-45 seconds
    const interval = setInterval(
      () => {
        if (!isAutoTrading) {
          clearInterval(interval)
          return
        }

        const taskId = addTask({
          name: "Executing Trade",
          type: "trading",
          progress: 0,
          details: "Analyzing market conditions",
        })

        // Simulate trade execution
        setTimeout(() => {
          updateTask(taskId, {
            progress: 50,
            details: "Placing order",
          })

          setTimeout(() => {
            // 70% chance of profit
            const isProfit = Math.random() < 0.7
            const pair = availablePairs[Math.floor(Math.random() * availablePairs.length)]
            const baseAmount = Math.random() * 0.1
            const price = pair.includes("BTC")
              ? 50000 + (Math.random() * 2000 - 1000)
              : pair.includes("ETH")
                ? 3000 + (Math.random() * 200 - 100)
                : pair.includes("SOL")
                  ? 100 + (Math.random() * 10 - 5)
                  : 20 + (Math.random() * 2 - 1)

            const profitAmount = isProfit
              ? Number.parseFloat((baseAmount * price * (Math.random() * 0.05 + 0.01)).toFixed(2))
              : Number.parseFloat((-baseAmount * price * (Math.random() * 0.03 + 0.01)).toFixed(2))

            // Add to trade history
            const newTrade: TradeHistory = {
              id: Date.now().toString(),
              pair,
              type: isProfit ? "buy" : "sell",
              amount: Number.parseFloat(baseAmount.toFixed(6)),
              price: Number.parseFloat(price.toFixed(2)),
              timestamp: new Date(),
              profit: profitAmount,
              isProfit,
            }

            setTradeHistory((prev) => [newTrade, ...prev])

            // Update balance
            setBalance((prev) => (prev !== null ? Number.parseFloat((prev + profitAmount).toFixed(2)) : null))

            // Update total asset value
            setTotalAssetValue((prev) => (prev !== null ? Number.parseFloat((prev + profitAmount).toFixed(2)) : null))

            updateTask(taskId, {
              status: "completed",
              progress: 100,
              details: `${isProfit ? "Profit" : "Loss"} of ${Math.abs(profitAmount).toFixed(2)} USDT on ${pair}`,
            })
          }, 2000)
        }, 3000)
      },
      Math.random() * 30000 + 15000,
    ) // Random interval between 15-45 seconds

    return () => clearInterval(interval)
  }

  const handleManualTrade = () => {
    if (!isConnected) {
      setError("Please connect to Bitget first")
      return
    }

    if (!tradeAmount || isNaN(Number.parseFloat(tradeAmount)) || Number.parseFloat(tradeAmount) <= 0) {
      setError("Please enter a valid trade amount")
      return
    }

    const amount = Number.parseFloat(tradeAmount)

    // Add manual trade task
    const taskId = addTask({
      name: `Manual Trade: ${selectedPair}`,
      type: "trading",
      progress: 0,
      details: `Placing ${amount} order for ${selectedPair}`,
    })

    // Call API to execute trade
    fetch("/api/v1/trading", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "trade",
        pair: selectedPair,
        amount: amount,
        options: {
          type: "manual",
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Trade failed: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Trade failed")
        }

        // Update task
        updateTask(taskId, {
          progress: 100,
          status: "completed",
          details: `Trade executed: ${data.message}`,
        })

        // Add to trade history if not already added by the API
        if (data.trade) {
          const newTrade: TradeHistory = {
            id: data.trade.id,
            pair: data.trade.pair,
            type: data.trade.type,
            amount: data.trade.amount,
            price: data.trade.price,
            timestamp: new Date(data.trade.timestamp),
            profit: data.trade.profit,
            isProfit: data.trade.isProfit,
          }

          setTradeHistory((prev) => [newTrade, ...prev])

          // Update balance
          setBalance((prev) => (prev !== null ? Number.parseFloat((prev + (data.trade.profit || 0)).toFixed(2)) : null))

          // Update total asset value
          setTotalAssetValue((prev) =>
            prev !== null ? Number.parseFloat((prev + (data.trade.profit || 0)).toFixed(2)) : null,
          )
        }

        setTradeAmount("")
        setSuccess(`Trade executed: ${data.message}`)
      })
      .catch((err) => {
        console.error("Error executing trade:", err)
        updateTask(taskId, {
          status: "failed",
          progress: 0,
          details: `Trade failed: ${err.message}`,
        })
        setError(`Trade failed: ${err.message}`)
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Trading Dashboard</h2>
          <p className="text-muted-foreground">Connect to Bitget and manage your trading activities</p>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-xl font-bold">{balance !== null ? `$${balance.toFixed(2)}` : "Loading..."}</span>
              </div>
              <div className="flex flex-col items-end ml-4">
                <span className="text-sm text-muted-foreground">Total Asset Value</span>
                <span className="text-xl font-bold">
                  {totalAssetValue !== null ? `$${totalAssetValue.toFixed(2)}` : "Loading..."}
                </span>
              </div>
              <Badge variant={connectionStatus === "connected" ? "default" : "outline"} className="ml-2">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </Badge>
            </>
          )}
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect to Bitget</CardTitle>
            <CardDescription>Using Alpha's bitget credentials to connect to your Bitget account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert
                variant="default"
                className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your Bitget API Key"
                value={credentials?.apiKey || ""}
                onChange={(e) => setCredentials((prev) => ({ ...(prev || {}), apiKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter your Bitget Secret Key"
                value={credentials?.secretKey || ""}
                onChange={(e) => setCredentials((prev) => ({ ...(prev || {}), secretKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase (if required)</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter your Bitget Passphrase (optional)"
                value={credentials?.passphrase || ""}
                onChange={(e) => setCredentials((prev) => ({ ...(prev || {}), passphrase: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConnect} className="w-full">
              Connect to Bitget
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Trading Controls
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Auto-Trading</span>
                    <Switch
                      checked={isAutoTrading}
                      onCheckedChange={toggleAutoTrading}
                      disabled={learningProgress < 70}
                    />
                  </div>
                </CardTitle>
                <CardDescription>Manage your trading activities and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="default"
                    className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>AI Learning Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${
                        learningProgress < 30 ? "bg-red-500" : learningProgress < 70 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${learningProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Learning: {learningProgress.toFixed(1)}%</span>
                    <span>{learningProgress >= 70 ? "Ready to trade" : "Still learning..."}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradingPair">Trading Pair</Label>
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger id="tradingPair">
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradeAmount">Amount (USDT)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tradeAmount"
                      type="number"
                      placeholder="Enter amount to trade"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                    <Button onClick={handleManualTrade}>Trade</Button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span>Active Trades:</span>
                    <Badge variant={activeTrades > 0 ? "default" : "outline"}>{activeTrades} / 4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Connection Check:</span>
                    <span className="text-sm text-muted-foreground">
                      {lastConnectionCheck ? lastConnectionCheck.toLocaleTimeString() : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Using Credentials:</span>
                    <Badge variant="outline">Alpha's bitget credentials</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={fetchBalance}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Balance
                </Button>
                <Button variant="outline" onClick={() => setIsConnected(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </CardFooter>
            </Card>

            <TasksDisplay />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trading Performance
                </CardTitle>
                <CardDescription>View your trading history and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Trading chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Recent trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tradeHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">No trading history yet</div>
                  ) : (
                    tradeHistory.map((trade) => (
                      <div
                        key={trade.id}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          trade.isProfit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{trade.pair}</div>
                          <div className="text-xs text-muted-foreground">{trade.timestamp.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${trade.isProfit ? "text-green-600" : "text-red-600"}`}>
                            {trade.isProfit ? "+" : "-"}${Math.abs(trade.profit || 0).toFixed(2)}
                          </div>
                          <div className="text-xs">
                            {trade.amount.toFixed(6)} @ ${trade.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
