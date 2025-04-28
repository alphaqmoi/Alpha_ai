// Background service to keep the AI model warm and ready
import { startTraining, getTrainingStatus } from "@/lib/train"

// Configuration
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000 // 5 minutes
const MAX_CONCURRENT_TRADES = 4
const TRADING_INTERVAL = 30 * 1000 // 30 seconds

// State
let isServiceRunning = false
let keepAliveInterval: NodeJS.Timeout | null = null
let tradingInterval: NodeJS.Timeout | null = null
let activeTrades = 0

// Initialize the background service
export function initBackgroundService() {
  if (isServiceRunning) return

  console.log("Initializing background service...")
  isServiceRunning = true

  // Start the AI model if not already running
  ensureAIReady()

  // Set up keep-alive interval
  keepAliveInterval = setInterval(ensureAIReady, KEEP_ALIVE_INTERVAL)

  // Set up trading interval
  tradingInterval = setInterval(executeTradingCycle, TRADING_INTERVAL)

  // Register service worker if in browser
  if (typeof window !== "undefined") {
    registerServiceWorker()
  }

  return () => {
    // Cleanup function
    if (keepAliveInterval) clearInterval(keepAliveInterval)
    if (tradingInterval) clearInterval(tradingInterval)
    isServiceRunning = false
  }
}

// Ensure AI is ready
async function ensureAIReady() {
  try {
    const status = await getTrainingStatus()

    if (!status.isTraining && status.progress < 100) {
      console.log("AI not ready, starting training...")
      await startTraining()
    } else if (status.phase === "Continuous learning") {
      console.log("AI is in continuous learning mode, ready for use")
    } else {
      console.log(`AI status: ${status.status}, progress: ${status.progress}%`)
    }
  } catch (error) {
    console.error("Error ensuring AI readiness:", error)
  }
}

// Execute trading cycle
async function executeTradingCycle() {
  try {
    // Check if we're at max concurrent trades
    if (activeTrades >= MAX_CONCURRENT_TRADES) {
      console.log(`Max concurrent trades (${MAX_CONCURRENT_TRADES}) reached, waiting...`)
      return
    }

    // Get trading status
    const response = await fetch("/api/v1/trading?action=status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get trading status: ${response.statusText}`)
    }

    const data = await response.json()

    // Check if trading is enabled and threshold is reached
    if (data.status?.connected && data.learningProgress >= 0.7) {
      // Execute a trade
      activeTrades++

      try {
        await executeTrade()
      } finally {
        // Always decrement active trades count
        activeTrades--
      }
    } else {
      console.log("Trading conditions not met, skipping trade cycle")
    }
  } catch (error) {
    console.error("Error in trading cycle:", error)
  }
}

// Execute a single trade
async function executeTrade() {
  try {
    console.log("Executing automated trade...")

    // Get available pairs
    const pairsResponse = await fetch("/api/v1/trading?action=pairs")
    const pairsData = await pairsResponse.json()

    if (!pairsData.success) {
      throw new Error("Failed to get trading pairs")
    }

    // Select a random pair
    const pairs = pairsData.pairs || ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)]

    // Get balance to determine trade amount
    const balanceResponse = await fetch("/api/v1/trading?action=balance")
    const balanceData = await balanceResponse.json()

    if (!balanceData.success) {
      throw new Error("Failed to get balance")
    }

    // Calculate trade amount (1-5% of USDT balance)
    const usdtBalance = balanceData.balance?.USDT || 0
    const tradePercentage = Math.random() * 0.04 + 0.01 // 1-5%
    const tradeAmount = usdtBalance * tradePercentage

    if (tradeAmount < 5) {
      console.log("Trade amount too small, skipping trade")
      return
    }

    // Execute the trade
    const tradeResponse = await fetch("/api/v1/trading", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "trade",
        pair: randomPair,
        amount: tradeAmount,
        options: {
          type: Math.random() > 0.5 ? "buy" : "sell",
        },
      }),
    })

    const tradeData = await tradeResponse.json()

    if (tradeData.success) {
      console.log(`Trade executed: ${tradeData.message}`)
    } else {
      throw new Error(`Trade failed: ${tradeData.message}`)
    }
  } catch (error) {
    console.error("Error executing trade:", error)
  }
}

// Register service worker for background processing
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)
        })
        .catch((err) => {
          console.log("ServiceWorker registration failed: ", err)
        })
    })
  }
}
