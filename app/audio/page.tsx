"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Heart,
  Share2,
  Music,
  X,
  Maximize2,
  Minimize2,
  MoreVertical,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"
import { formatTime } from "@/lib/audio-utils"
import { Howl, Howler } from "howler"

type AudioVisualizerProps = {
  audioRef: React.RefObject<Howl | null>
  isPlaying: boolean
}

interface Track {
  track: number
  name: string
  duration: string
  file: string
  artist?: string
  genre?: string
  color?: string
}

const tracks: Track[] = [
  {
    track: 1,
    name: "Ko Hasidin Iza Hasada",
    duration: "06:21",
    file: "koHasidin",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 2,
    name: "Kareemi",
    duration: "11:03",
    file: "kareemi",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-600 to-red-800",
  },
  {
    track: 3,
    name: "Abba Gida Gida",
    duration: "11:03",
    file: "abbaBilly",
    artist: "AKY Digital Hub",
    genre: "Billy-o",
    color: "from-red-500 to-red-800",
  },
  {
    track: 4,
    name: "Allah ga Abba (Ali Jita, Ado Gwanja)",
    duration: "11:03",
    file: "allahGaAbba",
    artist: "Ali Jita & Ado Gwanja",
    genre: "Ali Jita & Ado Gwanja",
    color: "from-red-500 to-red-800",
  },
  {
    track: 5,
    name: "Dan Farin Gida",
    duration: "13:03",
    file: "danFarinGida",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 6,
    name: "Lamba Daya",
    duration: "5:12",
    file: "lambaDaya",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 7,
    name: "Hasbunallahu",
    duration: "5:10",
    file: "hasbunallahu",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 8,
    name: "Oyoyo Abba Kanawa",
    duration: "03:35",
    file: "oyoyoAbbanKanawa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 9,
    name: "Sakona",
    duration: "4:08",
    file: "sakoNa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 10,
    name: "Sunaji suna gani",
    duration: "5:59",
    file: "sunaJiSunaGani",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 11,
    name: "Ga Comrade ga Abba",
    duration: "6:26",
    file: "gaAbbaGaComrd",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-rose-600",
  },
  {
    track: 12,
    name: "Ramadanan Gwamna",
    duration: "9:21",
    file: "ramadan",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 13,
    name: "Abba Zama daram",
    duration: "6:19",
    file: "abbaZamaDaram",
    artist: "AKY Digital Hub",
    genre: "",
    color: "from-red-500 to-red-800",
  },
  {
    track: 14,
    name: "Abba ka cika gwarzo",
    duration: "23:27",
    file: "abbaKacikaGwarzo",
    artist: "AKY Digital Hub",
    genre: "Kosan Waka",
    color: "from-red-500 to-red-800",
  },
  {
    track: 15,
    name: "Gwamna Jikan Dabo",
    duration: "5:33",
    file: "gwamnaJikanDabo",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 16,
    name: "Kanawa ga Abba nan",
    duration: "6:29",
    file: "kanawaGaAbbaNan",
    artist: "Kosan Waka",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 17,
    name: "Gyara Kintse Abba",
    duration: "8:52",
    file: "gyaraKintsiAbba",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 18,
    name: "Allah KaRikawa Abba Gwamnan na Kanawa",
    duration: "07:03",
    file: "allahKaRikawaAbbaGwamnanKanawa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 19,
    name: "Abban Kanawa",
    duration: "19:54",
    file: "abbanKanawa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 20,
    name: "Haske Maganin Duhu",
    duration: "07:32",
    file: "haskeMaganinDuhu",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },

  {
    track: 21,
    name: "Shigar Ranar Rantsuwa",
    duration: "01:42",
    file: "shigarRanarRantsuwa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 22,
    name: "Abba Gida Gida Abba",
    duration: "10:47",
    file: "abbaGidaGidaAbba",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 23,
    name: "Abban Dai Abban Dai",
    duration: "13:34",
    file: "abbanDaiAbbanDai",
    artist: "AKY Digital Hub",
    genre: "Alan Waka",
    color: "from-red-500 to-red-800",
  },
  {
    track: 24,
    name: "Abba Na Kowa",
    duration: "10:19",
    file: "abbaNaKowa",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 25,
    name: "Ko Gezau Abba",
    duration: "07:01",
    file: "koGezauAbba",
    artist: "AKY Digital Hub",
    genre: "",
    color: "from-red-500 to-red-800",
  },
  {
    track: 26,
    name: "Sabon Gwamna Barka Da Sallah",
    duration: "06:15",
    file: "sabonGwamnaBarkaDaSallah",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 27,
    name: "Kwana Dari",
    duration: "05:45",
    file: "kwanaDari",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 28,
    name: "Yanzu Abba Ne Gwamna",
    duration: "05:48",
    file: "yanzuAbbaNeGwamna",
    artist: "AKY Digital Hub",
    genre: "",
    color: "from-red-500 to-red-800",
  },
  {
    track: 29,
    name: "Zama Daram",
    duration: "06:18",
    file: "zamaDaram",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 30,
    name: "Tijjani Gandu Abba K Yusuf",
    duration: "08:44",
    file: "tijjaniGanduAbbaKYusuf",
    artist: "AKY Digital Hub",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  
   
]

const genreColors = {
  "Tijjani Gandu": "bg-red-600 text-red-200",
  "Billy-o": "bg-blue-600 text-blue-200",
  "Kosan Waka": "bg-green-600 text-green-200",
  "Ali Jita & Ado Gwanja": "bg-purple-600 text-purple-200",
}

// Enhanced ads with real-world examples
const ads = [
  {
    id: 1,
    title: "Kano State Development Projects",
    description: "Supporting infrastructure development across Kano State",
    image: "/placeholder.svg?height=300&width=400",
    url: "https://kanostate.gov.ng",
    type: "government",
  },
  {
    id: 2,
    title: "AKY Media Premium",
    description: "Upgrade to premium for ad-free listening and exclusive content",
    image: "/placeholder.svg?height=300&width=400",
    url: "#premium",
    type: "internal",
  },
  {
    id: 3,
    title: "Northern Nigeria Business Hub",
    description: "Connecting businesses across Northern Nigeria",
    image: "/placeholder.svg?height=300&width=400",
    url: "https://example.com/business",
    type: "business",
  },
  {
    id: 4,
    title: "Educational Scholarships",
    description: "Apply for educational scholarships in Kano State",
    image: "/placeholder.svg?height=300&width=400",
    url: "https://example.com/education",
    type: "education",
  },
  {
    id: 5,
    title: "Healthcare Initiative",
    description: "Free healthcare services for Kano residents",
    image: "/placeholder.svg?height=300&width=400",
    url: "https://example.com/health",
    type: "health",
  },
]

// Audio Visualizer Component (simplified for Howler.js compatibility)
const AudioVisualizer = ({ audioRef, isPlaying }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!canvasRef.current) return

    const draw = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width, height)

      // Create animated bars (simulated since we don't have direct access to audio data with Howler)
      const barCount = 64
      const barWidth = width / barCount

      for (let i = 0; i < barCount; i++) {
        const barHeight = isPlaying
          ? Math.random() * height * 0.8 * (0.3 + 0.7 * Math.sin(Date.now() * 0.01 + i * 0.1))
          : 0

        const r = Math.floor((barHeight + 25) * (i / barCount) * 255)
        const g = Math.floor(250 * (i / barCount))
        const b = Math.floor(50)

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      draw()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return (
    <canvas ref={canvasRef} width={400} height={200} className="w-full h-32 rounded-lg bg-black/20 backdrop-blur-sm" />
  )
}

export default function AudioPage() {
  const { isLoading, stopLoading } = usePageLoading()
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showAds, setShowAds] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [adTimer, setAdTimer] = useState(30)
  const [downloadTrack, setDownloadTrack] = useState<Track | null>(null)
  const [adDisplayMode, setAdDisplayMode] = useState<"modal" | "page">("modal")
  const [showVisualizer, setShowVisualizer] = useState(true)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  const audioRef = useRef<Howl | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout>()
  const mediaPath = "https://akysongs.netlify.app/assets/"

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("audioFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("audioFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Simulate page loading completion
  useEffect(() => {
    if (!isLoading) {
      stopLoading()
    }
  }, [isLoading, stopLoading])

  // Initialize Howler global settings
  useEffect(() => {
    // Set global volume
    Howler.volume(volume)

    // Enable HTML5 audio for better mobile compatibility
    Howler.html5PoolSize = 10

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.unload()
      }
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current)
      }
    }
  }, [])

  // Update global volume when volume state changes
  useEffect(() => {
    Howler.volume(volume)
  }, [volume])

  const createHowlInstance = useCallback(
    (trackIndex: number) => {
      const track = tracks[trackIndex]
      const audioUrl = `${mediaPath}${encodeURIComponent(track.file)}.mp3`

      return new Howl({
        src: [audioUrl],
        html5: true, // Use HTML5 Audio for better mobile support
        preload: true,
        volume: volume,
        onload: () => {
          setIsLoaded(true)
          setIsBuffering(false)
          setAudioError(null)
          if (audioRef.current) {
            setDuration(audioRef.current.duration())
          }
        },
        onloadstart: () => {
          setIsBuffering(true)
          setIsLoaded(false)
          setAudioError(null)
        },
        onplay: () => {
          setIsPlaying(true)
          setIsBuffering(false)
          // Start time update interval
          if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current)
          }
          timeUpdateInterval.current = setInterval(() => {
            if (audioRef.current && audioRef.current.playing()) {
              const seek = audioRef.current.seek()
              setCurrentTime(typeof seek === "number" ? seek : 0)
            }
          }, 1000)
        },
        onpause: () => {
          setIsPlaying(false)
          if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current)
          }
        },
        onstop: () => {
          setIsPlaying(false)
          setCurrentTime(0)
          if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current)
          }
        },
        onend: () => {
          if (isRepeating) {
            audioRef.current?.play()
          } else {
            nextTrack()
          }
        },
        onloaderror: (id, error) => {
          console.error("Audio load error:", error)
          setAudioError("Failed to load audio. Please check your connection and try again.")
          setIsPlaying(false)
          setIsBuffering(false)
          setIsLoaded(false)
        },
        onplayerror: (id, error) => {
          console.error("Audio play error:", error)
          setAudioError("Failed to play audio. Please try again.")
          setIsPlaying(false)
          setIsBuffering(false)
        },
      })
    },
    [volume, isRepeating],
  )

  const previousTrack = useCallback(() => {
    if (isShuffled) {
      const newTrack = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(newTrack)
    } else {
      setCurrentTrack((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))
    }
    setCurrentTime(0)
  }, [isShuffled])

  const nextTrack = useCallback(() => {
    if (isShuffled) {
      const newTrack = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(newTrack)
    } else {
      setCurrentTrack((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))
    }
    setCurrentTime(0)
  }, [isShuffled])

  // Media Session API setup
  useEffect(() => {
    if ("mediaSession" in navigator) {
      const currentTrackData = tracks[currentTrack]
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrackData.name,
        artist: currentTrackData.artist || "AKY Media",
        album: "AKY Media Collection",
        artwork: [
          { src: "/pictures/logo.png", sizes: "96x96", type: "image/png" },
          { src: "/pictures/logo.png", sizes: "128x128", type: "image/png" },
          { src: "/pictures/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/pictures/logo.png", sizes: "256x256", type: "image/png" },
          { src: "/pictures/logo.png", sizes: "384x384", type: "image/png" },
          { src: "/pictures/logo.png", sizes: "512x512", type: "image/png" },
        ],
      })

      navigator.mediaSession.setActionHandler("play", () => {
        if (audioRef.current && !audioRef.current.playing()) {
          audioRef.current.play()
        }
      })

      navigator.mediaSession.setActionHandler("pause", () => {
        if (audioRef.current && audioRef.current.playing()) {
          audioRef.current.pause()
        }
      })

      navigator.mediaSession.setActionHandler("previoustrack", previousTrack)
      navigator.mediaSession.setActionHandler("nexttrack", nextTrack)

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.seek(details.seekTime)
          setCurrentTime(details.seekTime)
        }
      })

      // Update position state
      if ("setPositionState" in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: duration || 0,
            playbackRate: 1,
            position: currentTime,
          })
        } catch (error) {
          // Position state not supported
        }
      }
    }
  }, [currentTrack, isPlaying, duration, currentTime, previousTrack, nextTrack])

  // Handle track changes
  useEffect(() => {
    // Stop and unload previous track
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current.unload()
    }

    // Clear time update interval
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current)
    }

    // Create new Howl instance
    audioRef.current = createHowlInstance(currentTrack)

    // Reset states
    setCurrentTime(0)
    setDuration(0)
    setIsLoaded(false)
    setAudioError(null)
  }, [currentTrack, createHowlInstance])

  // Ad timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showAds && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1)
      }, 1000)
    } else if (showAds && adTimer === 0) {
      if (currentAdIndex < 9) {
        setCurrentAdIndex((prev) => prev + 1)
        setAdTimer(30)
      } else {
        setShowAds(false)
        if (downloadTrack) {
          handleActualDownload(downloadTrack)
        }
        setCurrentAdIndex(0)
        setAdTimer(30)
        setDownloadTrack(null)
      }
    }
    return () => clearInterval(interval)
  }, [showAds, adTimer, currentAdIndex, downloadTrack])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (audioRef.current.playing()) {
      audioRef.current.pause()
    } else {
      // Handle mobile audio context unlock
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx
          .resume()
          .then(() => {
            audioRef.current?.play()
          })
          .catch((error) => {
            console.error("Failed to resume audio context:", error)
            setAudioError("Failed to start audio. Please try again.")
          })
      } else {
        audioRef.current.play()
      }
    }
  }, [])

  const playTrack = (index: number) => {
    setCurrentTrack(index)
    setAudioError(null)
    // The useEffect will handle creating the new Howl instance
    // We'll play it once it's loaded
    setTimeout(() => {
      if (audioRef.current && audioRef.current.state() === "loaded") {
        audioRef.current.play()
      }
    }, 100)
  }

  const toggleFavorite = (trackIndex: number) => {
    setFavorites((prev) =>
      prev.includes(trackIndex) ? prev.filter((fav) => fav !== trackIndex) : [...prev, trackIndex],
    )
  }

  const handleShare = async (track: Track) => {
    const currentDomain = window.location.origin
    const shareUrl = `${currentDomain}/audio?track=${encodeURIComponent(track.file)}`
    const shareText = `Check out "${track.name}" by ${track.artist} - ${shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: track.name,
          text: `Listen to "${track.name}" by ${track.artist}`,
          url: shareUrl,
        })
      } catch (err) {
        navigator.clipboard.writeText(shareText)
        alert("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(shareText)
      alert("Link copied to clipboard!")
    }
  }

  const handleDownload = (track: Track) => {
    setDownloadTrack(track)
    setCurrentAdIndex(0)
    setAdTimer(30)
    setAdDisplayMode(Math.random() > 0.5 ? "modal" : "page")
    setShowAds(true)
  }

  const handleActualDownload = (track: Track) => {
    const link = document.createElement("a")
    link.href = `${mediaPath}${encodeURIComponent(track.file)}.mp3`
    link.download = `${track.name} - ${track.artist}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAdClick = (ad: (typeof ads)[0]) => {
    if (adDisplayMode === "page") {
      window.open(ad.url, "_blank")
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      audioRef.current.seek(newTime)
      setCurrentTime(newTime)
    }
  }

  const toggleFullScreen = useCallback(() => {
    if (playerRef.current) {
      if (!document.fullscreenElement) {
        playerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
        })
        setIsFullScreen(true)
      } else {
        document.exitFullscreen()
        setIsFullScreen(false)
      }
    }
  }, [])

  // Add event listener for fullscreen change
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange)
    document.addEventListener("mozfullscreenchange", handleFullScreenChange)
    document.addEventListener("MSFullscreenChange", handleFullScreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange)
    }
  }, [])

  // Enhanced Ad Modal Component
  const AdModal = () => {
    if (!showAds || adDisplayMode !== "modal") return null
    const currentAd = ads[currentAdIndex % ads.length]

    return (
      <Dialog open={showAds} onOpenChange={() => {}}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 to-red-900 border-red-500/20">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Advertisement ({currentAdIndex + 1}/10)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  <span className="text-red-300 text-sm font-mono">{adTimer}s</span>
                </div>
                {adTimer === 0 && (
                  <Button
                    onClick={() => {
                      if (currentAdIndex < 9) {
                        setCurrentAdIndex((prev) => prev + 1)
                        setAdTimer(30)
                      } else {
                        setShowAds(false)
                        if (downloadTrack) {
                          handleActualDownload(downloadTrack)
                        }
                        setCurrentAdIndex(0)
                        setAdTimer(30)
                        setDownloadTrack(null)
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="cursor-pointer group" onClick={() => handleAdClick(currentAd)}>
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={currentAd.image || "/placeholder.svg"}
                  alt={currentAd.title}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-2">{currentAd.title}</h3>
                    <p className="text-gray-200">{currentAd.description}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center text-red-300 text-sm">Click to learn more →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                {adTimer > 0 ? `Please wait ${adTimer} seconds...` : "You can now close this ad"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-[url('/bgred.png')]">
        <Header />

        {/* Enhanced Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#f87e7e] flex items-center justify-center mr-4 shadow-2xl">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-6xl lg:text-7xl font-bold text-white">Audio</h1>
                </div>
                <p className="text-xl text-white mb-8 leading-relaxed">
                  Experience the rich political sounds and leadership messages from Kano State with our premium audio
                  collection
                </p>
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} className="text-white" />
                  <span className="text-white">Audio Collection</span>
                </div>
              </div>
              <div className="relative">
                <div>
                  <div className="relative z-10">
                    <Image
                      src="/pictures/logo1.png"
                      alt="AKY Audio Collection"
                      width={500}
                      height={400}
                      className="w-full h-auto"
                    />
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                      {tracks.length} Tracks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="py-20 relative">
          <div className="container mx-auto px-4 max-w-full">
            {/* Enhanced Audio Player with Visualizer */}
            <Card
              ref={playerRef}
              className={`mb-12 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl ${
                isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""
              }`}
            >
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-r ${
                    tracks[currentTrack].color || "from-red-500 to-pink-500"
                  } p-4 md:p-8 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    {/* Enhanced Now Playing Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden border-2 border-white/30 shadow-xl">
                          <Image
                            src="/pictures/logo1.png"
                            alt="Now Playing"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {isPlaying ? "Now Playing" : isBuffering ? "Loading..." : "Paused"}
                          </h2>
                          <p className="text-white/80 text-sm md:text-lg">AKY Media Center</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Button
                          onClick={() => toggleFavorite(currentTrack)}
                          className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 p-2 md:p-3 ${
                            favorites.includes(currentTrack) ? "text-red-400 scale-110" : "text-white"
                          }`}
                          size="sm"
                        >
                          <Heart
                            className={`w-4 h-4 md:w-6 md:h-6 ${
                              favorites.includes(currentTrack) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          onClick={() => handleShare(tracks[currentTrack])}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white transition-all duration-300 hover:scale-105 p-2 md:p-3"
                          size="sm"
                        >
                          <Share2 className="w-4 h-4 md:w-6 md:h-6" />
                        </Button>
                        <Button
                          onClick={toggleFullScreen}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white transition-all duration-300 p-2 md:p-3"
                          size="sm"
                        >
                          {isFullScreen ? (
                            <Minimize2 className="w-4 h-4 md:w-6 md:h-6" />
                          ) : (
                            <Maximize2 className="w-4 h-4 md:w-6 md:h-6" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Audio Visualizer */}
                    {showVisualizer && (
                      <div className="mb-8">
                        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                      </div>
                    )}

                    {/* Enhanced Track Info */}
                    <div className="mb-8">
                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">{tracks[currentTrack].name}</h3>
                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <p className="text-white/90 text-lg md:text-xl">{tracks[currentTrack].artist}</p>
                        <Badge
                          className={`${
                            genreColors[tracks[currentTrack].genre as keyof typeof genreColors] ||
                            "bg-white/20 text-white"
                          } text-sm px-3 py-1 self-start`}
                        >
                          {tracks[currentTrack].genre}
                        </Badge>
                      </div>
                    </div>

                    {/* Error Display */}
                    {audioError && (
                      <Alert className="mb-4 bg-red-500/20 border-red-500/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">{audioError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Buffering Indicator */}
                    {isBuffering && (
                      <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2"></div>
                          Loading audio...
                        </p>
                      </div>
                    )}

                    {/* Enhanced Progress Bar */}
                    <div className="mb-8">
                      <div
                        className="w-full h-3 md:h-4 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm border border-white/30 shadow-inner"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-white to-red-200 rounded-full transition-all duration-300 shadow-lg relative"
                          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                        >
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-white/80 text-sm md:text-lg mt-4 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
                      <Button
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 p-2 md:p-3 ${
                          isShuffled ? "text-red-400 scale-110" : "text-white"
                        }`}
                        size="sm"
                      >
                        <Shuffle size={20} className="md:w-6 md:h-6" />
                      </Button>
                      <Button
                        onClick={previousTrack}
                        disabled={currentTrack === 0}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 transition-all duration-300 hover:scale-105 p-2 md:p-3"
                        size="sm"
                      >
                        <SkipBack size={24} className="md:w-7 md:h-7" />
                      </Button>
                      <Button
                        onClick={togglePlay}
                        disabled={!isLoaded || isBuffering}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-white/30 disabled:opacity-50"
                        size="lg"
                      >
                        {isBuffering ? (
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-gray-900"></div>
                        ) : isPlaying ? (
                          <Pause size={28} className="md:w-9 md:h-9" />
                        ) : (
                          <Play size={28} className="md:w-9 md:h-9" />
                        )}
                      </Button>
                      <Button
                        onClick={nextTrack}
                        disabled={currentTrack === tracks.length - 1}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 transition-all duration-300 hover:scale-105 p-2 md:p-3"
                        size="sm"
                      >
                        <SkipForward size={24} className="md:w-7 md:h-7" />
                      </Button>
                      <Button
                        onClick={() => setIsRepeating(!isRepeating)}
                        className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 p-2 md:p-3 ${
                          isRepeating ? "text-red-400 scale-110" : "text-white"
                        }`}
                        size="sm"
                      >
                        <Repeat size={20} className="md:w-6 md:h-6" />
                      </Button>
                    </div>

                    {/* Enhanced Volume Control */}
                    <div className="flex items-center justify-center space-x-4 md:space-x-6">
                      <Volume2 className="text-white" size={20} />
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => {
                            const newVolume = Number.parseFloat(e.target.value)
                            setVolume(newVolume)
                          }}
                          className="w-32 md:w-40 h-2 md:h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider border border-white/30"
                        />
                      </div>
                      <span className="text-white/80 text-sm md:text-lg font-mono w-10 md:w-12">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Responsive Playlist */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-700 to-red-800 p-4 md:p-8 border-b border-red-600">
                  <h2 className="text-xl md:text-3xl font-bold text-white flex items-center">
                    <Music className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-4 text-red-400" />
                    Political Audio Collection ({tracks.length} tracks)
                  </h2>
                  <p className="text-white/80 mt-2 text-sm md:text-base">
                    Leadership messages and political content from Kano State
                  </p>
                </div>
                <div className="">
                  {tracks.map((track, index) => (
                    <div
                      key={track.track}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-6 border-b border-slate-700/50 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-slate-700/50 ${
                        index === currentTrack
                          ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-l-4 border-l-red-400"
                          : ""
                      }`}
                    >
                      {/* Main track info - clickable area */}
                      <div
                        className="flex items-center space-x-3 md:space-x-6 flex-1 w-full md:w-auto"
                        onClick={() => playTrack(index)}
                      >
                        <div className="relative flex-shrink-0">
                          <span className="text-slate-400 font-mono text-sm md:text-lg w-8 md:w-10 block text-center">
                            {track.track.toString().padStart(2, "0")}
                          </span>
                          {index === currentTrack && isPlaying && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-400 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-br ${
                            track.color || "from-red-600 to-red-700"
                          } flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-lg flex-shrink-0`}
                        >
                          <Image
                            src="/pictures/logo1.png"
                            alt={track.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm md:text-xl mb-1 truncate">{track.name}</h4>
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-1 md:mt-2">
                            <p className="text-slate-400 text-xs md:text-lg truncate">{track.artist}</p>
                            <Badge
                              className={`${
                                genreColors[track.genre as keyof typeof genreColors] || "bg-slate-600 text-slate-200"
                              } text-xs md:text-sm mt-1 md:mt-0 self-start md:self-auto`}
                            >
                              {track.genre}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons and duration */}
                      <div className="flex items-center justify-end w-full md:w-auto mt-3 md:mt-0">
                        {/* Mobile: Only show three dots menu */}
                        <div className="md:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="bg-transparent hover:bg-slate-700 border-0 text-slate-400 p-2"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-600 text-slate-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(index)
                                }}
                                className="hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <Heart className={`w-4 h-4 mr-2 ${favorites.includes(index) ? "fill-current" : ""}`} />
                                Favorite
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShare(track)
                                }}
                                className="hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Desktop: Show all buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(index)
                            }}
                            className={`bg-transparent hover:bg-slate-700 border-0 transition-all duration-300 ${
                              favorites.includes(index) ? "text-red-400 scale-110" : "text-slate-400"
                            }`}
                            size="sm"
                          >
                            <Heart className={`w-5 h-5 ${favorites.includes(index) ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(track)
                            }}
                            className="bg-transparent hover:bg-slate-700 border-0 text-slate-400 transition-all duration-300 hover:scale-105"
                            size="sm"
                          >
                            <Share2 className="w-5 h-5" />
                          </Button>
                          <span className="text-slate-400 text-lg font-mono min-w-[60px]">{track.duration}</span>
                        </div>

                        {/* Playing indicator */}
                        {index === currentTrack && isPlaying && (
                          <div className="flex space-x-1 ml-auto md:ml-0">
                            <div className="w-1 h-4 md:h-6 bg-red-400 rounded animate-pulse"></div>
                            <div className="w-1 h-6 md:h-8 bg-red-400 rounded animate-pulse delay-100"></div>
                            <div className="w-1 h-3 md:h-4 bg-red-400 rounded animate-pulse delay-200"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <NewsletterSection />
        <Footer />
        <ScrollToTop />

        {/* Enhanced Ad Components */}
        <AdModal />
      </div>
    </PageLoader>
  )
}
