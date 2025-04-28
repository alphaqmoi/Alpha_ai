"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Save, Mic } from "lucide-react"
import Link from "next/link"
import { VoiceSelector } from "@/components/voice-selector"

export default function VoiceSettingsPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceActivation, setVoiceActivation] = useState("button")
  const [sensitivity, setSensitivity] = useState(70)
  const [wakeWord, setWakeWord] = useState("Alpha")

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link href="/settings" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Voice Settings</h1>
          </Link>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voice Input Settings</CardTitle>
            <CardDescription>Configure how Alpha AI listens to your voice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-enabled">Enable Voice Input</Label>
              <Switch id="voice-enabled" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-activation">Voice Activation Method</Label>
              <Select value={voiceActivation} onValueChange={setVoiceActivation} disabled={!voiceEnabled}>
                <SelectTrigger id="voice-activation">
                  <SelectValue placeholder="Select activation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="button">Button Press</SelectItem>
                  <SelectItem value="wake-word">Wake Word</SelectItem>
                  <SelectItem value="always">Always Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {voiceActivation === "wake-word" && (
              <div className="space-y-2">
                <Label htmlFor="wake-word">Wake Word</Label>
                <Input
                  id="wake-word"
                  value={wakeWord}
                  onChange={(e) => setWakeWord(e.target.value)}
                  disabled={!voiceEnabled}
                />
                <p className="text-xs text-muted-foreground">Say this word to activate voice recognition</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sensitivity">Microphone Sensitivity</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="sensitivity"
                  value={[sensitivity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setSensitivity(value[0])}
                  disabled={!voiceEnabled}
                  className="flex-1"
                />
                <span className="w-8 text-sm">{sensitivity}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
              <Switch id="noise-cancellation" defaultChecked disabled={!voiceEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="continuous-listening">Continuous Listening</Label>
              <Switch id="continuous-listening" disabled={!voiceEnabled || voiceActivation !== "always"} />
            </div>

            <Button variant="outline" className="w-full" disabled={!voiceEnabled}>
              <Mic className="mr-2 h-4 w-4" />
              Test Microphone
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Output Settings</CardTitle>
            <CardDescription>Configure how Alpha AI speaks to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <VoiceSelector />

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="speech-rate">Speech Rate</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Slow</span>
                <Slider id="speech-rate" defaultValue={[50]} min={0} max={100} step={1} className="flex-1" />
                <span className="text-sm">Fast</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitch">Voice Pitch</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Low</span>
                <Slider id="pitch" defaultValue={[50]} min={0} max={100} step={1} className="flex-1" />
                <span className="text-sm">High</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-response">Automatic Voice Responses</Label>
              <Switch id="auto-response" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
