import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Directory for trading data
const TRADING_DIR = path.join(process.cwd(), "trading")

// Ensure trading directory exists
if (!fs.existsSync(TRADING_DIR)) {
  fs.mkdirSync(TRADING_DIR, { recursive: true })
}

// Default Bitget credentials
const DEFAULT_CREDENTIALS = {
  apiKey: "bg_1d7ea7c56644fb5da18a400c92a425d7",
  secretKey: "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13",
  passphrase: "Victor9798",
  label: "Alpha's bitget credentials",
}

// Auto-trading configuration
let isAutoTradingEnabled = false
let maxConcurrentTrades = 4
let activeTrades = 0
let learningProgress = 0

// Initialize with default credentials
const credentialsPath = path.join(TRADING_DIR, "credentials.json")
if (!fs.existsSync(credentialsPath)) {
  fs.writeFileSync(
    credentialsPath,
    JSON.stringify(
      {
        ...DEFAULT_CREDENTIALS,
        connected: false,
        connectedAt: null,
      },
      null,
      2,
    ),
  )
}

export async function POST(request: NextRequest) {
  try {
    const { action, credentials, pair, amount, options } = await request.json()

    if (!action) {
      return NextResponse.json({
        success: false,
        message: "No action specified",
      })
    }

    switch (action) {
      case "connect":
        return handleConnect(credentials || DEFAULT_CREDENTIALS)
      case "trade":
        return handleTrade(pair, amount, options)
      case "analyze":
        return handleAnalyze(pair, options)
      case "status":
        return handleStatus(options)
      case "auto-trading":
        return handleAutoTrading(options)
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`,
        })
    }
  } catch (error) {
    console.error("Error processing trading request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing trading request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")

  if (!action) {
    return NextResponse.json({
      success: false,
      message: "No action specified",
    })
  }

  try {
    switch (action) {
      case "pairs":
        return NextResponse.json({
          success: true,
          pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT", "DOGE/USDT"],
        })
      case "history":
        return getTradeHistory()
      case "balance":
        return getBalance()
      case "status":
        return handleStatus({})
      case "active-trades":
        return NextResponse.json({
          success: true,
          activeTrades,
          maxConcurrentTrades,
          isAutoTradingEnabled,
        })
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`,
        })
    }
  } catch (error) {
    console.error("Error processing trading request:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing trading request",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Handler functions
async function handleConnect(credentials: any) {
  if (!credentials || !credentials.apiKey || !credentials.secretKey) {
    return NextResponse.json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Simulate API connection
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Save credentials (in a real app, these would be encrypted)
  const credentialsPath = path.join(TRADING_DIR, "credentials.json")
  fs.writeFileSync(
    credentialsPath,
    JSON.stringify(
      {
        apiKey: credentials.apiKey,
        secretKey: credentials.secretKey,
        passphrase: credentials.passphrase,
        label: credentials.label || "Alpha's bitget credentials",
        connected: true,
        connectedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )

  // Initialize learning progress
  learningProgress = Math.random() * 30 + 50 // 50-80%

  return NextResponse.json({
    success: true,
    message: "Successfully connected to trading API",
    balance: {
      USDT: 1250.75,
      BTC: 0.025,
      ETH: 0.5,
    },
    learningProgress,
  })
}

async function handleTrade(pair: string, amount: number, options: any = {}) {
  if (!pair || !amount) {
    return NextResponse.json({
      success: false,
      message: "Pair and amount are required",
    })
  }

  // Check if connected
  const credentialsPath = path.join(TRADING_DIR, "credentials.json")
  if (!fs.existsSync(credentialsPath)) {
    return NextResponse.json({
      success: false,
      message: "Not connected to trading API",
    })
  }

  // Check if we're at max concurrent trades for auto-trading
  if (options.type === "auto" && activeTrades >= maxConcurrentTrades) {
    return NextResponse.json({
      success: false,
      message: `Max concurrent trades (${maxConcurrentTrades}) reached`,
    })
  }

  // Increment active trades
  activeTrades++

  try {
    // Simulate trade execution
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 70% chance of profit for simulated trades
    const isProfit = Math.random() < 0.7
    const price = pair.includes("BTC")
      ? 50000 + (Math.random() * 2000 - 1000)
      : pair.includes("ETH")
        ? 3000 + (Math.random() * 200 - 100)
        : pair.includes("SOL")
          ? 100 + (Math.random() * 10 - 5)
          : 20 + (Math.random() * 2 - 1)

    const profitAmount = isProfit
      ? Number.parseFloat((amount * (Math.random() * 0.05 + 0.01)).toFixed(2))
      : Number.parseFloat((-amount * (Math.random() * 0.03 + 0.01)).toFixed(2))

    // Create trade record
    const trade = {
      id: Date.now().toString(),
      pair,
      type: options.type || (isProfit ? "buy" : "sell"),
      amount: Number.parseFloat(amount.toFixed(6)),
      price: Number.parseFloat(price.toFixed(2)),
      timestamp: new Date().toISOString(),
      profit: profitAmount,
      isProfit,
      status: "completed",
    }

    // Save trade to history
    const historyPath = path.join(TRADING_DIR, "history.json")
    let history = []

    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
      } catch (error) {
        console.error("Error reading trade history:", error)
      }
    }

    history.unshift(trade)
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))

    return NextResponse.json({
      success: true,
      message: `Trade executed: ${isProfit ? "Profit" : "Loss"} of ${Math.abs(profitAmount).toFixed(2)} USDT`,
      trade,
    })
  } catch (error) {
    console.error("Error executing trade:", error)
    return NextResponse.json({
      success: false,
      message: `Trade failed: ${error instanceof Error ? error.message : String(error)}`,
    })
  } finally {
    // Always decrement active trades
    activeTrades = Math.max(0, activeTrades - 1)
  }
}

async function handleAnalyze(pair: string, options: any = {}) {
  if (!pair) {
    return NextResponse.json({
      success: false,
      message: "Pair is required",
    })
  }

  // Simulate analysis
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Generate simulated analysis
  const analysis = {
    pair,
    timestamp: new Date().toISOString(),
    currentPrice: pair.includes("BTC")
      ? 50000 + (Math.random() * 2000 - 1000)
      : pair.includes("ETH")
        ? 3000 + (Math.random() * 200 - 100)
        : pair.includes("SOL")
          ? 100 + (Math.random() * 10 - 5)
          : 20 + (Math.random() * 2 - 1),
    priceChange24h: (Math.random() * 10 - 5).toFixed(2) + "%",
    volume24h: Math.floor(Math.random() * 1000000) + 500000,
    marketCap: Math.floor(Math.random() * 1000000000) + 100000000,
    recommendation: Math.random() > 0.5 ? "buy" : "sell",
    confidence: (Math.random() * 0.3 + 0.6).toFixed(2),
    technicalIndicators: {
      rsi: Math.floor(Math.random() * 100),
      macd: Math.random() > 0.5 ? "bullish" : "bearish",
      movingAverages: Math.random() > 0.5 ? "above" : "below",
    },
    sentimentAnalysis: {
      social: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
      news: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
    },
    predictedPriceRange: {
      low: (Math.random() * 0.9 + 0.8).toFixed(2),
      high: (Math.random() * 0.3 + 1.1).toFixed(2),
    },
  }

  return NextResponse.json({
    success: true,
    analysis,
  })
}

async function handleStatus(options: any = {}) {
  // Check if connected
  const credentialsPath = path.join(TRADING_DIR, "credentials.json")
  if (!fs.existsSync(credentialsPath)) {
    return NextResponse.json({
      success: false,
      message: "Not connected to trading API",
    })
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"))

    // Get trade history
    const historyPath = path.join(TRADING_DIR, "history.json")
    let history = []

    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
      } catch (error) {
        console.error("Error reading trade history:", error)
      }
    }

    // Calculate statistics
    const totalTrades = history.length
    const profitableTrades = history.filter((trade: any) => trade.isProfit).length
    const totalProfit = history.reduce((sum: number, trade: any) => sum + (trade.profit || 0), 0)

    // Update learning progress
    learningProgress = Math.min(100, learningProgress + Math.random() * 0.5)

    return NextResponse.json({
      success: true,
      status: {
        connected: true,
        totalTrades,
        profitableTrades,
        winRate: totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(2) + "%" : "0%",
        totalProfit: totalProfit.toFixed(2),
        lastTradeTime: history[0]?.timestamp || null,
        activeTrades,
        maxConcurrentTrades,
        isAutoTradingEnabled,
      },
      learningProgress,
    })
  } catch (error) {
    console.error("Error getting status:", error)
    return NextResponse.json({
      success: false,
      message: `Error getting status: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

async function handleAutoTrading(options: any = {}) {
  if (options.enabled !== undefined) {
    isAutoTradingEnabled = options.enabled
  }

  if (options.maxConcurrentTrades !== undefined) {
    maxConcurrentTrades = options.maxConcurrentTrades
  }

  return NextResponse.json({
    success: true,
    isAutoTradingEnabled,
    maxConcurrentTrades,
    activeTrades,
  })
}

async function getTradeHistory() {
  const historyPath = path.join(TRADING_DIR, "history.json")

  if (!fs.existsSync(historyPath)) {
    return NextResponse.json({
      success: true,
      history: [],
    })
  }

  try {
    const history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error retrieving trade history",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function getBalance() {
  // Check if connected
  const credentialsPath = path.join(TRADING_DIR, "credentials.json")
  if (!fs.existsSync(credentialsPath)) {
    return NextResponse.json({
      success: false,
      message: "Not connected to trading API",
    })
  }

  // Simulate balance retrieval
  return NextResponse.json({
    success: true,
    balance: {
      USDT: 1250.75 + (Math.random() * 100 - 50),
      BTC: 0.025 + (Math.random() * 0.005 - 0.0025),
      ETH: 0.5 + (Math.random() * 0.1 - 0.05),
    },
  })
}
