"use server"

import { cookies } from "next/headers"

// Constants for Bitget API
const BITGET_API_KEY = process.env.BITGET_API_KEY
const BITGET_SECRET_KEY = process.env.BITGET_SECRET_KEY
const BITGET_PASSPHRASE = process.env.BITGET_PASSPHRASE

// Trading parameters
const THRESHOLD_VALUE = 0.7
const MAX_CONCURRENT_TRADES = 4

// Interface for trading data
interface TradingData {
  assetValue: number
  activeTrades: number
  lastChecked: string
  isTrading: boolean
  trades: Trade[]
}

export type Trade = {
  id: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  timestamp: string
  status: "open" | "closed" | "canceled"
}

// --- Qmoi model integration ---
// Import the Qmoi model (assume it's implemented in lib/qmoi.ts)
import { getQmoiTradeRecommendation } from "@/lib/qmoi"

// --- Notification system integration ---
// Try to use a global event emitter if available, fallback to console
import { EventEmitter } from "events"
const globalEmitter = (global as any).alphaAiEmitter as EventEmitter | undefined
function notifyUser(event: string, details: any) {
  if (globalEmitter) {
    globalEmitter.emit(event, details)
  } else {
    // Fallback to console
    console.log(`[NOTIFY] ${event}:`, details)
  }
}

// --- Qmoi model trade decision ---
// Use the real Qmoi model for trade decision
async function getQmoiTradeDecision(assetValue: number, openTrades: Trade[]): Promise<{symbol: string, side: "buy" | "sell", amount: number}> {
  try {
    // Call the Qmoi model for a trade recommendation
    // The model should return { symbol, side, amount }
    const recommendation = await getQmoiTradeRecommendation({
      assetValue,
      openTrades,
      maxConcurrent: MAX_CONCURRENT_TRADES,
    })
    if (
      recommendation &&
      typeof recommendation.symbol === "string" &&
      (recommendation.side === "buy" || recommendation.side === "sell") &&
      typeof recommendation.amount === "number"
    ) {
      return recommendation
    }
    throw new Error("Qmoi model returned invalid recommendation")
  } catch (error) {
    notifyUser("qmoi_error", { error })
    // Fallback to random logic if Qmoi fails
    const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT"]
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const side = Math.random() > 0.5 ? "buy" : "sell"
    const amount = 0.01 + Math.random() * 0.09
    return { symbol, side, amount }
  }
}

// Mock function to get account balance from Bitget
async function getBitgetAccountBalance(): Promise<number> {
  try {
    // In a real implementation, this would make an API call to Bitget
    // For now, we'll simulate a successful API call
    console.log("Fetching Bitget account balance with credentials:", {
      apiKey: BITGET_API_KEY ? BITGET_API_KEY.substring(0, 5) + "..." : "undefined",
      secretKey: BITGET_SECRET_KEY ? BITGET_SECRET_KEY.substring(0, 5) + "..." : "undefined",
      passphrase: BITGET_PASSPHRASE ? BITGET_PASSPHRASE.substring(0, 3) + "..." : "undefined",
    })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return a random balance between 0.5 and 1.0
    return 0.5 + Math.random() * 0.5
  } catch (error) {
    console.error("Error fetching Bitget account balance:", error)
    return 0
  }
}

// Mock function to place a trade on Bitget
async function placeBitgetTrade(symbol: string, side: "buy" | "sell", amount: number): Promise<Trade | null> {
  try {
    // In a real implementation, this would make an API call to Bitget
    console.log(`Placing ${side} trade for ${amount} ${symbol} on Bitget`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Generate a random price
    const price = 100 + Math.random() * 50

    // Return a mock trade object
    return {
      id: `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol,
      side,
      amount,
      price,
      timestamp: new Date().toISOString(),
      status: "open",
    }
  } catch (error) {
    console.error("Error placing Bitget trade:", error)
    return null
  }
}

// Function to get current trading data
export async function getTradingData(): Promise<TradingData> {
  const cookieStore = await cookies()
  const tradingDataCookie = cookieStore.get("trading-data")

  if (tradingDataCookie) {
    try {
      return JSON.parse(tradingDataCookie.value)
    } catch (error) {
      console.error("Error parsing trading data cookie:", error)
    }
  }

  // Default trading data if cookie doesn't exist
  return {
    assetValue: 0,
    activeTrades: 0,
    lastChecked: new Date().toISOString(),
    isTrading: false,
    trades: [],
  }
}

// Function to save trading data
export async function saveTradingData(data: TradingData): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("trading-data", JSON.stringify(data), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })
}

// Function to update trading status
export async function updateTradingStatus(): Promise<TradingData> {
  // Get current trading data
  const tradingData = await getTradingData()

  // Update last checked timestamp
  tradingData.lastChecked = new Date().toISOString()

  // Get account balance from Bitget
  let assetValue = 0
  try {
    assetValue = await getBitgetAccountBalance()
    tradingData.assetValue = assetValue
  } catch (error) {
    console.error("Error getting Bitget account balance:", error)
    notifyUser("error", { type: "balance", error })
    tradingData.assetValue = 0
  }

  // Check if we should be trading
  if (assetValue >= THRESHOLD_VALUE) {
    tradingData.isTrading = true
    // Count active trades
    const activeTrades = tradingData.trades.filter((trade) => trade.status === "open").length
    tradingData.activeTrades = activeTrades
    // Place new trades if we have capacity
    if (activeTrades < MAX_CONCURRENT_TRADES) {
      const tradesToPlace = MAX_CONCURRENT_TRADES - activeTrades
      for (let i = 0; i < tradesToPlace; i++) {
        try {
          // Use Qmoi model for trade decision
          const { symbol, side, amount } = await getQmoiTradeDecision(assetValue, tradingData.trades.filter(t => t.status === "open"))
          const trade = await placeBitgetTrade(symbol, side, amount)
          if (trade) {
            tradingData.trades.push(trade)
            tradingData.activeTrades++
            notifyUser("trade_placed", { symbol, side, amount, trade })
          } else {
            notifyUser("trade_failed", { symbol, side, amount })
          }
        } catch (tradeError) {
          console.error("Error placing trade:", tradeError)
          notifyUser("trade_error", { error: tradeError })
        }
      }
    }
  } else {
    tradingData.isTrading = false
    notifyUser("trading_paused", { reason: "Below threshold value", assetValue })
  }

  // Save updated trading data
  try {
    await saveTradingData(tradingData)
  } catch (saveError) {
    console.error("Error saving trading data:", saveError)
    notifyUser("error", { type: "save", error: saveError })
  }

  // Emit/Log for monitoring
  notifyUser("trading_status", tradingData)

  return tradingData
}

// Function to check and update trading status periodically
export async function startBackgroundTrading(): Promise<void> {
  try {
    await updateTradingStatus()
    console.log("Background trading check completed")
  } catch (error) {
    console.error("Error in background trading:", error)
  }
}
