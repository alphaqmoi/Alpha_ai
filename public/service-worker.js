// Service worker for background processing
const CACHE_NAME = "alpha-ai-cache-v1"
const API_CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Files to cache
const urlsToCache = ["/", "/index.html", "/globals.css"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  // Take control of clients immediately
  self.clients.claim()
})

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Handle API requests differently
  if (event.request.url.includes("/api/")) {
    // For API requests, use network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Open cache and store response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
        }),
    )
  } else {
    // For non-API requests, use cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return from cache if found
        if (response) {
          return response
        }

        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Open cache and store response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      }),
    )
  }
})

// Background sync for trading
self.addEventListener("sync", (event) => {
  if (event.tag === "trading-sync") {
    event.waitUntil(executeTradingSync())
  }
})

// Execute trading in background
async function executeTradingSync() {
  try {
    // Fetch trading status
    const response = await fetch("/api/v1/trading?action=status", {
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
      await fetch("/api/v1/trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "trade",
          pair: "BTC/USDT",
          amount: 10,
          options: {
            type: "auto",
          },
        }),
      })
    }
  } catch (error) {
    console.error("Error in background trading sync:", error)
  }
}

// Periodic background sync
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "trading-periodic-sync") {
    event.waitUntil(executeTradingSync())
  }
})
