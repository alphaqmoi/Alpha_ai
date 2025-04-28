"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PinAuthProps {
  correctPin: string
  onSuccess: () => void
  onCancel: () => void
}

export function PinAuth({ correctPin, onSuccess, onCancel }: PinAuthProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      return
    }

    if (pin === correctPin) {
      setError(null)
      onSuccess()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        setIsLocked(true)
        setError("Too many incorrect attempts. Please try again later.")

        // Unlock after 30 seconds
        setTimeout(() => {
          setIsLocked(false)
          setAttempts(0)
        }, 30000)
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`)
      }

      setPin("")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Authentication Required
        </CardTitle>
        <CardDescription>Please enter your PIN to access the trading features</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="text-center text-xl tracking-widest"
                disabled={isLocked}
                autoFocus
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={pin.length !== 4 || isLocked}>
          Verify
        </Button>
      </CardFooter>
    </Card>
  )
}
