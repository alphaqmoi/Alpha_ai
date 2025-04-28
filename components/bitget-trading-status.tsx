"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function BitgetTradingStatus() {
  const [status, setStatus] = useState({
    isTrading: false,
    activeTrades: 0,
    maxTrades: 4,
    totalAssetValue: 0,
    thresholdValue: 0.7,
    canTrade: false,
    loading: true,
    error: null,
  })

  const fetchStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }))
      const response = await fetch("/api/v1/bitget?action=status")
      const data = await response.json()
      setStatus({
        ...data,
        loading: false,
        error: null,
      })
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch trading status",
      }))
    }
  }

  const toggleTrading = async () => {
    try {
      const action = status.isTrading ? "stop" : "start"
      const response = await fetch("/api/v1/bitget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchStatus()
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: `Failed to ${status.isTrading ? "stop" : "start"} trading`,
      }))
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bitget Trading Status</span>
          <Button variant="ghost" size="icon" onClick={fetchStatus} disabled={status.loading}>
            <RefreshCw className={`h-4 w-4 ${status.loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <CardDescription>Alpha's Bitget Credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trading Status:</span>
            <Badge variant={status.isTrading ? "success" : "secondary"}>
              {status.isTrading ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Trades:</span>
            <span>
              {status.activeTrades} / {status.maxTrades}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Asset Value:</span>
            <span className="font-mono">${status.totalAssetValue.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Threshold Value:</span>
            <span className="font-mono">${status.thresholdValue.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Can Trade:</span>
            {status.canTrade ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>

          {status.error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{status.error}</div>}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={toggleTrading}
          disabled={status.loading}
          variant={status.isTrading ? "destructive" : "default"}
          className="w-full"
        >
          {status.isTrading ? "Stop Trading" : "Start Trading"}
        </Button>
      </CardFooter>
    </Card>
  )
}
