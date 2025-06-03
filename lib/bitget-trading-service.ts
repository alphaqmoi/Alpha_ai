// Bitget API credentials
const BITGET_API_KEY = process.env.BITGET_API_KEY
const BITGET_SECRET_KEY = process.env.BITGET_SECRET_KEY
const BITGET_PASSPHRASE = process.env.BITGET_PASSPHRASE

// Trading state
let isTrading = false
let activeTrades = 0
const MAX_TRADES = 4
let totalAssetValue = 0
const THRESHOLD_VALUE = 0.7

// Store for transactions
type Transaction = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: string;
  timestamp: string;
  status?: string;
};
const transactions: Transaction[] = []

// Function to sign API requests
function signRequest(timestamp: string, method: string, requestPath: string, body = "") {
  const crypto = require("crypto")
  const message = timestamp + method + requestPath + body
  return crypto.createHmac("sha256", BITGET_SECRET_KEY || "",).update(message).digest("base64")
}

// Function to make API requests to Bitget
async function bitgetRequest(method: string, endpoint: string, body: any = null) {
  const timestamp = Date.now().toString()
  const requestPath = `/api/spot/v1${endpoint}`
  const bodyString = body ? JSON.stringify(body) : ""
  const signature = signRequest(timestamp, method, requestPath, bodyString)
  const headers = {
    "ACCESS-KEY": BITGET_API_KEY || "",
    "ACCESS-SIGN": signature,
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-PASSPHRASE": BITGET_PASSPHRASE || "",
    "Content-Type": "application/json",
  } as Record<string, string>;
  const url = `https://api.bitget.com${requestPath}`
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: bodyString ? bodyString : undefined,
    })
    return await response.json()
  } catch (error) {
    const errMsg = (error && typeof error === "object" && "message" in error) ? (error as any).message : String(error)
    console.error("Bitget API request failed:", errMsg)
    return { error: "API request failed", details: errMsg }
  }
}

// Function to get account information
export async function getAccountInfo() {
  try {
    const response = await bitgetRequest("GET", "/account/assets")
    if (response.code === "00000") {
      // Calculate total asset value
      totalAssetValue = response.data.reduce((total: number, asset: any) => {
        return total + Number.parseFloat(asset.available) * Number.parseFloat(asset.usdPrice || "0")
      }, 0)
      return {
        success: true,
        totalAssetValue,
        assets: response.data,
        canTrade: totalAssetValue >= THRESHOLD_VALUE,
      }
    } else {
      return {
        success: false,
        error: response.msg || "Failed to get account information",
        canTrade: false,
      }
    }
  } catch (error) {
    const errMsg = (error && typeof error === "object" && "message" in error) ? (error as any).message : String(error)
    console.error("Error getting account info:", errMsg)
    return {
      success: false,
      error: "Failed to get account information",
      canTrade: false,
    }
  }
}

// Function to place a trade
export async function placeTrade(symbol: string, side: "buy" | "sell", quantity: string) {
  if (activeTrades >= MAX_TRADES) {
    return {
      success: false,
      error: "Maximum number of trades reached",
    }
  }

  try {
    const accountInfo = await getAccountInfo()

    if (!accountInfo.success || !accountInfo.canTrade) {
      return {
        success: false,
        error: "Account not ready for trading or below threshold value",
      }
    }

    const orderParams = {
      symbol,
      side,
      orderType: "market",
      quantity,
    }

    const response = await bitgetRequest("POST", "/trade/orders", orderParams)

    if (response.code === "00000") {
      activeTrades++

      // Store transaction
      transactions.push({
        id: response.data.orderId,
        symbol,
        side,
        quantity,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        orderId: response.data.orderId,
      }
    } else {
      return {
        success: false,
        error: response.msg || "Failed to place trade",
      }
    }
  } catch (error) {
    console.error("Error placing trade:", error)
    return {
      success: false,
      error: "Failed to place trade",
    }
  }
}

// Function to check order status
export async function checkOrderStatus(orderId: string) {
  try {
    const response = await bitgetRequest("GET", `/trade/orders/${orderId}`)

    if (response.code === "00000") {
      if (["filled", "canceled", "expired"].includes(response.data.status.toLowerCase())) {
        activeTrades = Math.max(0, activeTrades - 1)
      }

      return {
        success: true,
        status: response.data.status,
        filledQuantity: response.data.filledQty,
        price: response.data.price,
      }
    } else {
      return {
        success: false,
        error: response.msg || "Failed to check order status",
      }
    }
  } catch (error) {
    console.error("Error checking order status:", error)
    return {
      success: false,
      error: "Failed to check order status",
    }
  }
}

// Function to get all transactions
export function getTransactions() {
  return transactions
}

// Import Qmoi trade decision function
import { getQmoiTradeRecommendation } from "./qmoi"

// Placeholder for Qmoi model trade decision
async function getQmoiTradeDecisionBitget(assetValue: number, openTrades: any[]): Promise<{symbol: string, side: "buy" | "sell", quantity: string}> {
  try {
    // Try to use the shared Qmoi HuggingFace integration
    const recommendation = await getQmoiTradeRecommendation({
      assetValue,
      openTrades,
      maxConcurrent: MAX_TRADES,
    })
    if (
      recommendation &&
      typeof recommendation.symbol === "string" &&
      (recommendation.side === "buy" || recommendation.side === "sell") &&
      typeof recommendation.amount === "number"
    ) {
      // Bitget expects quantity as a string
      return {
        symbol: recommendation.symbol.replace("/", ""),
        side: recommendation.side,
        quantity: recommendation.amount.toString(),
      }
    }
    throw new Error("Qmoi model returned invalid recommendation")
  } catch (error) {
    console.warn("Qmoi/HuggingFace trade decision failed, falling back to random logic:", error)
    // Fallback to random logic if Qmoi fails
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const side = Math.random() > 0.5 ? "buy" : "sell"
    const quantity = "0.001"
    return { symbol, side, quantity }
  }
}

// Function to start background trading
export async function startBackgroundTrading() {
  if (isTrading) return

  isTrading = true

  // Check account status first
  const accountInfo = await getAccountInfo()

  if (!accountInfo.success || !accountInfo.canTrade) {
    isTrading = false
    return {
      success: false,
      error: "Account not ready for trading or below threshold value",
    }
  }

  // Start background trading logic
  setInterval(async () => {
    if (!isTrading || activeTrades >= MAX_TRADES) return

    // Use Qmoi model for trade decision
    const { symbol, side, quantity } = await getQmoiTradeDecisionBitget(totalAssetValue, transactions.filter(t => t.status !== "closed"))
    await placeTrade(symbol, side, quantity)
  }, 60000) // Check every minute

  return {
    success: true,
    message: "Background trading started",
  }
}

// Function to stop background trading
export function stopBackgroundTrading() {
  isTrading = false
  return {
    success: true,
    message: "Background trading stopped",
  }
}

// Function to get trading status
export function getTradingStatus() {
  return {
    isTrading,
    activeTrades,
    maxTrades: MAX_TRADES,
    totalAssetValue,
    thresholdValue: THRESHOLD_VALUE,
    canTrade: totalAssetValue >= THRESHOLD_VALUE,
  }
}

// Initialize background trading on module load
startBackgroundTrading().catch(console.error)
