// Bitget API credentials
const BITGET_API_KEY = "bg_1d7ea7c56644fb5da18a400c92a425d7"
const BITGET_SECRET_KEY = "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13"
const BITGET_PASSPHRASE = "Victor9798"

// Trading state
let isTrading = false
let activeTrades = 0
const MAX_TRADES = 4
let totalAssetValue = 0
const THRESHOLD_VALUE = 0.7

// Store for transactions
const transactions = []

// Function to sign API requests
function signRequest(timestamp: string, method: string, requestPath: string, body = "") {
  const crypto = require("crypto")
  const message = timestamp + method + requestPath + body
  return crypto.createHmac("sha256", BITGET_SECRET_KEY).update(message).digest("base64")
}

// Function to make API requests to Bitget
async function bitgetRequest(method: string, endpoint: string, body: any = null) {
  const timestamp = Date.now().toString()
  const requestPath = `/api/spot/v1${endpoint}`
  const bodyString = body ? JSON.stringify(body) : ""

  const signature = signRequest(timestamp, method, requestPath, bodyString)

  const headers = {
    "ACCESS-KEY": BITGET_API_KEY,
    "ACCESS-SIGN": signature,
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-PASSPHRASE": BITGET_PASSPHRASE,
    "Content-Type": "application/json",
  }

  const url = `https://api.bitget.com${requestPath}`

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: bodyString ? bodyString : undefined,
    })

    return await response.json()
  } catch (error) {
    console.error("Bitget API request failed:", error)
    return { error: "API request failed", details: error.message }
  }
}

// Function to get account information
export async function getAccountInfo() {
  try {
    const response = await bitgetRequest("GET", "/account/assets")

    if (response.code === "00000") {
      // Calculate total asset value
      totalAssetValue = response.data.reduce((total, asset) => {
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
    console.error("Error getting account info:", error)
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
  // This would typically be implemented with a more sophisticated trading strategy
  // For demonstration purposes, we'll just set up a simple interval

  setInterval(async () => {
    if (!isTrading || activeTrades >= MAX_TRADES) return

    // Simple trading strategy (example only)
    // In a real implementation, this would be much more sophisticated
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    const side = Math.random() > 0.5 ? "buy" : "sell"
    const quantity = "0.001" // Small quantity for safety

    await placeTrade(randomSymbol, side, quantity)
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
