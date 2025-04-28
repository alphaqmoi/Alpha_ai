"use client"

import { Brain, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type AIStatus = "training" | "testing" | "fixing" | "ready" | "error"

interface AIStatusIndicatorProps {
  status: AIStatus
}

export function AIStatusIndicator({ status }: AIStatusIndicatorProps) {
  const getStatusDetails = () => {
    switch (status) {
      case "training":
        return {
          icon: <Brain className="h-4 w-4" />,
          color: "bg-blue-500",
          text: "Training",
          description: "AI is currently training",
        }
      case "testing":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-yellow-500",
          text: "Testing",
          description: "AI is being tested",
        }
      case "fixing":
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          color: "bg-orange-500",
          text: "Fixing",
          description: "AI is being fixed",
        }
      case "ready":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-500",
          text: "Ready",
          description: "AI is ready for use",
        }
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-red-500",
          text: "Error",
          description: "AI has encountered an error",
        }
      default:
        return {
          icon: <Brain className="h-4 w-4" />,
          color: "bg-gray-500",
          text: "Unknown",
          description: "AI status unknown",
        }
    }
  }

  const { icon, color, text, description } = getStatusDetails()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border">
            <div className={`${color} text-white p-1 rounded-full`}>{icon}</div>
            <span className="text-sm font-medium">{text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
