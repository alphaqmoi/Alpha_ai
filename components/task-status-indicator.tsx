"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, RefreshCw } from "lucide-react"
import { useTaskManager } from "./task-manager"

export function TaskStatusIndicator() {
  const { tasks, getActiveTasksCount } = useTaskManager()
  const [activeTasksCount, setActiveTasksCount] = useState(0)
  const [thinkingCount, setThinkingCount] = useState(0)
  const [tradingCount, setTradingCount] = useState(0)
  const [processingCount, setProcessingCount] = useState(0)

  useEffect(() => {
    // Update counts
    setActiveTasksCount(getActiveTasksCount())
    setThinkingCount(tasks.filter((t) => t.status === "running" && t.type === "thinking").length)
    setTradingCount(tasks.filter((t) => t.status === "running" && t.type === "trading").length)
    setProcessingCount(
      tasks.filter(
        (t) => t.status === "running" && (t.type === "processing" || t.type === "analyzing" || t.type === "learning"),
      ).length,
    )
  }, [tasks, getActiveTasksCount])

  if (activeTasksCount === 0) {
    return (
      <Badge variant="outline" className="ml-2">
        Idle
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {thinkingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          <span>Thinking: {thinkingCount}</span>
        </Badge>
      )}

      {tradingCount > 0 && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          <TrendingUp className="h-3 w-3" />
          <span>Trading: {tradingCount}</span>
        </Badge>
      )}

      {processingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Processing: {processingCount}</span>
        </Badge>
      )}
    </div>
  )
}
