"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause } from "lucide-react"

export function VoiceRecorder({ onRecordingComplete }: { onRecordingComplete?: (audioBlob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <Button onClick={startRecording}>
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}

        {audioURL &&
          !isRecording &&
          (isPlaying ? (
            <Button variant="outline" onClick={pauseAudio}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={playAudio}>
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          ))}
      </div>

      {audioURL && <audio ref={audioRef} src={audioURL} onEnded={handleAudioEnded} className="hidden" />}
    </div>
  )
}
