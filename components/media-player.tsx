"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface MediaPlayerProps {
  src: string
  type: "video" | "audio"
}

export function MediaPlayer({ src, type }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const updateProgress = () => {
      if (media.duration) {
        setProgress((media.currentTime / media.duration) * 100)
        setCurrentTime(media.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(media.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    media.addEventListener("timeupdate", updateProgress)
    media.addEventListener("loadedmetadata", handleLoadedMetadata)
    media.addEventListener("ended", handleEnded)

    return () => {
      media.removeEventListener("timeupdate", updateProgress)
      media.removeEventListener("loadedmetadata", handleLoadedMetadata)
      media.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const media = mediaRef.current
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressChange = (value: number[]) => {
    const media = mediaRef.current
    if (!media) return

    const newTime = (value[0] / 100) * duration
    media.currentTime = newTime
    setProgress(value[0])
    setCurrentTime(newTime)
  }

  const toggleMute = () => {
    const media = mediaRef.current
    if (!media) return

    media.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const media = mediaRef.current
    if (!media) return

    media.volume = value[0]
    setVolume(value[0])
    if (value[0] === 0) {
      setIsMuted(true)
      media.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      media.muted = false
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="space-y-4">
      {type === "video" ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          className="w-full rounded-lg"
          onClick={togglePlay}
        />
      ) : (
        <div className="flex items-center justify-center bg-muted h-24 rounded-lg">
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} className="hidden" />
          <div className="text-center">
            <p className="text-sm font-medium">Audio Player</p>
            <p className="text-xs text-muted-foreground">{src.split("/").pop()}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button variant="outline" size="icon" onClick={toggleMute} className="ml-auto">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <div className="w-24">
            <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} />
          </div>
        </div>

        <Slider value={[progress]} min={0} max={100} step={0.1} onValueChange={handleProgressChange} />
      </div>
    </div>
  )
}
