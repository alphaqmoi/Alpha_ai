"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  VolumeX,
  AudioWaveformIcon as Waveform,
  Ear,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Voice {
  id: string
  name: string
  gender: "male" | "female"
  age: "child" | "young" | "adult" | "senior"
  accent: string
  sampleText: string
  pitch?: number
  rate?: number
}

const availableVoices: Voice[] = [
  {
    id: "emma",
    name: "Emma",
    gender: "female",
    age: "young",
    accent: "American",
    sampleText: "Hello, I'm Emma. I can help you with your questions and tasks.",
    pitch: 1.1,
    rate: 1.0,
  },
  {
    id: "james",
    name: "James",
    gender: "male",
    age: "adult",
    accent: "British",
    sampleText: "Hello, I'm James. How may I assist you today?",
    pitch: 0.9,
    rate: 0.95,
  },
  {
    id: "lily",
    name: "Lily",
    gender: "female",
    age: "child",
    accent: "American",
    sampleText: "Hi! I'm Lily. Let's have fun learning together!",
    pitch: 1.3,
    rate: 1.1,
  },
  {
    id: "michael",
    name: "Michael",
    gender: "male",
    age: "adult",
    accent: "American",
    sampleText: "Hi there, I'm Michael. I'm here to assist you with any questions.",
    pitch: 0.95,
    rate: 1.0,
  },
  {
    id: "sophia",
    name: "Sophia",
    gender: "female",
    age: "young",
    accent: "Australian",
    sampleText: "G'day! I'm Sophia. Let me know what you need help with.",
    pitch: 1.05,
    rate: 1.05,
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    age: "senior",
    accent: "British",
    sampleText: "Hello there. I'm David. I have decades of knowledge to share with you.",
    pitch: 0.85,
    rate: 0.9,
  },
  {
    id: "olivia",
    name: "Olivia",
    gender: "female",
    age: "adult",
    accent: "British",
    sampleText: "Hello! I'm Olivia. I'd be delighted to help you today.",
    pitch: 1.0,
    rate: 0.98,
  },
  {
    id: "alex",
    name: "Alex",
    gender: "male",
    age: "young",
    accent: "American",
    sampleText: "Hey there! I'm Alex. Ready to help you with whatever you need.",
    pitch: 1.05,
    rate: 1.1,
  },
  {
    id: "zoe",
    name: "Zoe",
    gender: "female",
    age: "adult",
    accent: "Australian",
    sampleText: "Hi there! I'm Zoe. Let's work together to solve your problems.",
    pitch: 1.15,
    rate: 1.0,
  },
]

export function AdvancedVoiceSystem() {
  const [selectedVoice, setSelectedVoice] = useState<string>("emma")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(80)
  const [pitch, setPitch] = useState<number>(1.0)
  const [rate, setRate] = useState<number>(1.0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [continuousListening, setContinuousListening] = useState(false)
  const [streamingASR, setStreamingASR] = useState(true)
  const [activeTab, setActiveTab] = useState("voices")
  const [audioLevel, setAudioLevel] = useState(0)
  const [isVADActive, setIsVADActive] = useState(false)

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.")
      return
    }

    // Initialize recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = streamingASR
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
          // Process final result
          processVoiceCommand(event.results[i][0].transcript)
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (continuousListening && isListening) {
        recognition.start()
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuousListening, streamingASR, isListening])

  // Set up audio analyzer for VAD
  useEffect(() => {
    if (!isListening) return

    const setupAudioAnalyzer = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }

        if (!micStreamRef.current) {
          micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
        }

        const audioContext = audioContextRef.current
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8

        const source = audioContext.createMediaStreamSource(micStreamRef.current)
        source.connect(analyser)

        analyserRef.current = analyser

        // Start monitoring audio levels
        monitorAudioLevels()
      } catch (err) {
        console.error("Error setting up audio analyzer:", err)
        setError("Could not access microphone for voice activity detection")
      }
    }

    setupAudioAnalyzer()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isListening])

  const monitorAudioLevels = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume level
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length

      // Update audio level state
      setAudioLevel(average)

      // Simple VAD - if average is above threshold, consider it speech
      const threshold = 20 // Adjust based on testing
      setIsVADActive(average > threshold)

      animationFrameRef.current = requestAnimationFrame(updateLevels)
    }

    updateLevels()
  }

  const processVoiceCommand = (command: string) => {
    // Simple command processing
    const lowerCommand = command.toLowerCase().trim()

    if (lowerCommand.includes("hello") || lowerCommand.includes("hi")) {
      speakResponse("Hello! How can I help you today?")
    } else if (lowerCommand.includes("what is your name")) {
      speakResponse("My name is Alpha AI. I'm your intelligent assistant.")
    } else if (lowerCommand.includes("thank you") || lowerCommand.includes("thanks")) {
      speakResponse("You're welcome! Is there anything else I can help with?")
    } else if (lowerCommand.includes("stop listening")) {
      stopListening()
      speakResponse("Voice recognition stopped.")
    } else if (lowerCommand.length > 0) {
      // For any other command, acknowledge receipt
      setSuccess(`Received: "${command}". Processing...`)
    }
  }

  const speakResponse = (text: string) => {
    try {
      if (!window.speechSynthesis) {
        setError("Speech synthesis is not supported in your browser.")
        return
      }

      // Stop any current speech
      window.speechSynthesis.cancel()

      // Get the selected voice data
      const voiceData = availableVoices.find((v) => v.id === selectedVoice) || availableVoices[0]

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.volume = volume / 100
      utterance.pitch = pitch * (voiceData.pitch || 1.0)
      utterance.rate = rate * (voiceData.rate || 1.0)

      // Try to find a matching system voice
      const voices = window.speechSynthesis.getVoices()

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
        setError("Error playing voice. Please try again.")
        setPlayingVoice(null)
      }

      // Store reference and play
      speechSynthRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setSuccess(null)
    } catch (err) {
      console.error("Error in voice playback:", err)
      setError("Failed to play voice. Your browser may not support speech synthesis.")
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (window.speechSynthesis && speechSynthRef.current) {
      speechSynthRef.current.volume = value[0] / 100
    }
  }

  const handlePitchChange = (value: number[]) => {
    setPitch(value[0])
  }

  const handleRateChange = (value: number[]) => {
    setRate(value[0])
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
      utterance.pitch = pitch * (voiceData.pitch || 1.0)
      utterance.rate = rate * (voiceData.rate || 1.0)

      // Try to find a matching system voice
      const voices = window.speechSynthesis.getVoices()

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

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not available")
      return
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      setError(null)
      setSuccess("Listening...")
    } catch (err) {
      console.error("Error starting speech recognition:", err)
      setError("Could not start speech recognition")
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
      setSuccess(null)
    } catch (err) {
      console.error("Error stopping speech recognition:", err)
    }
  }

  const applyVoiceSettings = () => {
    setSuccess("Voice settings applied successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Advanced Voice System</CardTitle>
        <CardDescription>Configure and test voice input and output</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="voices">Voice Selection</TabsTrigger>
            <TabsTrigger value="settings">Voice Settings</TabsTrigger>
            <TabsTrigger value="recognition">Speech Recognition</TabsTrigger>
          </TabsList>

          <TabsContent value="voices" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span>Voice Volume:</span>
              <div className="flex items-center gap-2">
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
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
                        {voice.gender}, {voice.accent}, {voice.age}
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
              <Button size="sm" onClick={applyVoiceSettings} disabled={!selectedVoice}>
                Apply Voice
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pitch">Voice Pitch</Label>
                  <span className="text-sm">{pitch.toFixed(2)}x</span>
                </div>
                <Slider id="pitch" value={[pitch]} min={0.5} max={2.0} step={0.05} onValueChange={handlePitchChange} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lower</span>
                  <span>Default</span>
                  <span>Higher</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate">Speech Rate</Label>
                  <span className="text-sm">{rate.toFixed(2)}x</span>
                </div>
                <Slider id="rate" value={[rate]} min={0.5} max={2.0} step={0.05} onValueChange={handleRateChange} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slower</span>
                  <span>Default</span>
                  <span>Faster</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noise-reduction" className="text-base">
                      Noise Reduction
                    </Label>
                    <p className="text-xs text-muted-foreground">Filter background noise for clearer speech</p>
                  </div>
                  <Switch id="noise-reduction" checked={noiseReduction} onCheckedChange={setNoiseReduction} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="streaming-asr" className="text-base">
                      Streaming Recognition
                    </Label>
                    <p className="text-xs text-muted-foreground">Start responding before you finish speaking</p>
                  </div>
                  <Switch id="streaming-asr" checked={streamingASR} onCheckedChange={setStreamingASR} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="continuous-listening" className="text-base">
                      Continuous Listening
                    </Label>
                    <p className="text-xs text-muted-foreground">Keep listening after processing a command</p>
                  </div>
                  <Switch
                    id="continuous-listening"
                    checked={continuousListening}
                    onCheckedChange={setContinuousListening}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={applyVoiceSettings} className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Save Voice Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recognition" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span>Microphone Status:</span>
              <Badge variant={isListening ? "default" : "outline"}>{isListening ? "Listening" : "Idle"}</Badge>
            </div>

            {isListening && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audio Level:</span>
                  <div className="flex items-center gap-2">
                    <Waveform className={`h-4 w-4 ${isVADActive ? "text-primary" : "text-muted-foreground"}`} />
                    <Progress value={audioLevel} max={255} className="w-[100px] h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Activity:</span>
                  <Badge variant={isVADActive ? "default" : "outline"}>
                    {isVADActive ? "Speaking Detected" : "Silent"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4 min-h-[100px] bg-muted/20">
              <p className="font-medium mb-2">Transcript:</p>
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {isListening ? "Listening... Say something!" : "Click 'Start Listening' to begin"}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {isListening ? (
                <Button onClick={stopListening} variant="destructive" className="flex-1">
                  Stop Listening
                </Button>
              ) : (
                <Button onClick={startListening} className="flex-1">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Listening
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  if (transcript) {
                    speakResponse(`I heard you say: ${transcript}`)
                  } else {
                    speakResponse("I haven't heard anything yet. Please speak after clicking Start Listening.")
                  }
                }}
              >
                <Ear className="mr-2 h-4 w-4" />
                Test Response
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Try saying: "Hello", "What is your name?", or "Thank you"</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Voice capabilities use your browser's built-in speech synthesis and recognition APIs. Some features may not be
          available in all browsers.
        </p>
      </CardFooter>
    </Card>
  )
}
