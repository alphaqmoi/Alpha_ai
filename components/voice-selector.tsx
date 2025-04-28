"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, Play, Pause } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Voice {
  id: string
  name: string
  gender: "male" | "female"
  accent: string
  sampleText: string
}

const availableVoices: Voice[] = [
  {
    id: "emma",
    name: "Emma",
    gender: "female",
    accent: "American",
    sampleText: "Hello, I'm Emma. I can help you with your questions and tasks.",
  },
  {
    id: "james",
    name: "James",
    gender: "male",
    accent: "British",
    sampleText: "Hello, I'm James. How may I assist you today?",
  },
  {
    id: "sophia",
    name: "Sophia",
    gender: "female",
    accent: "Australian",
    sampleText: "G'day! I'm Sophia. Let me know what you need help with.",
  },
  {
    id: "michael",
    name: "Michael",
    gender: "male",
    accent: "American",
    sampleText: "Hi there, I'm Michael. I'm here to assist you with any questions.",
  },
  {
    id: "olivia",
    name: "Olivia",
    gender: "female",
    accent: "British",
    sampleText: "Hello! I'm Olivia. I'd be delighted to help you today.",
  },
]

export function VoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState<string>("emma")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(80)
  const [error, setError] = useState<string | null>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (window.speechSynthesis && speechSynthRef.current) {
      speechSynthRef.current.volume = value[0] / 100
    }
  }

  const playVoiceSample = (voiceId: string) => {
    try {
      // Check if speech synthesis is available
      if (!window.speechSynthesis) {
        setError("Speech synthesis is not supported in your browser.")
        return
      }

      // If already playing, stop it
      if (playingVoice === voiceId) {
        window.speechSynthesis.cancel()
        setPlayingVoice(null)
        return
      }

      // Stop any currently playing voice
      window.speechSynthesis.cancel()

      // Find the voice data
      const voiceData = availableVoices.find((v) => v.id === voiceId)
      if (!voiceData) return

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(voiceData.sampleText)
      utterance.volume = volume / 100

      // Try to find a matching system voice
      const voices = window.speechSynthesis.getVoices()

      // Set a voice based on gender and accent if possible
      if (voices.length > 0) {
        // Try to match gender and accent
        const matchingVoice = voices.find(
          (v) =>
            ((voiceData.gender === "female" && v.name.toLowerCase().includes("female")) ||
              v.name.toLowerCase().includes("woman") ||
              v.name.toLowerCase().includes(voiceData.name.toLowerCase())) &&
            v.lang.startsWith(
              voiceData.accent === "British" ? "en-GB" : voiceData.accent === "Australian" ? "en-AU" : "en-US",
            ),
        )

        // If no specific match, try any voice of the right gender
        const genderMatch = !matchingVoice
          ? voices.find(
              (v) =>
                (voiceData.gender === "female" &&
                  (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman"))) ||
                (voiceData.gender === "male" &&
                  (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("man"))),
            )
          : null

        // Fall back to any English voice
        const anyEnglishVoice = !matchingVoice && !genderMatch ? voices.find((v) => v.lang.startsWith("en")) : null

        // Use the best match we found
        utterance.voice = matchingVoice || genderMatch || anyEnglishVoice || voices[0]
      }

      // Set up events
      utterance.onend = () => {
        setPlayingVoice(null)
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        setError("Error playing voice sample. Please try again.")
        setPlayingVoice(null)
      }

      // Store reference and play
      speechSynthRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setPlayingVoice(voiceId)
      setError(null)
    } catch (err) {
      console.error("Error in voice playback:", err)
      setError("Failed to play voice sample. Your browser may not support speech synthesis.")
      setPlayingVoice(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <span>Voice Volume:</span>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            className="w-[100px]"
            onValueChange={handleVolumeChange}
          />
          <span className="w-8 text-sm">{volume}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableVoices.map((voice) => (
          <Card
            key={voice.id}
            className={`p-3 cursor-pointer ${selectedVoice === voice.id ? "border-primary bg-primary/5" : ""}`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs text-muted-foreground">
                  {voice.gender}, {voice.accent}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  playVoiceSample(voice.id)
                }}
              >
                {playingVoice === voice.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="sm" disabled={!selectedVoice}>
          Apply Voice
        </Button>
      </div>
    </div>
  )
}
