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
  const [previousVolume, setPreviousVolume] = useState(1)
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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [crossfade, setCrossfade] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [isVolumeSliderDragging, setIsVolumeSliderDragging] = useState(false)

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
    // Update previous volume when volume changes (but not when muting)
    if (volume > 0) {
      setPreviousVolume(volume)
    }
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
          // Check if it's a 404 error (file not found)
          if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
            setAudioError(`Audio file not found: ${track.name}. This track may not be available yet.`)
          } else {
            setAudioError("Failed to load audio. Please check your connection and try again.")
          }
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
        // Check if the audio is loaded before trying to play
        if (audioRef.current.state() === "loaded") {
          audioRef.current.play()
        } else if (audioRef.current.state() === "unloaded") {
          // If unloaded, try to load and play
          audioRef.current.load()
          // Set a timeout to try playing after loading
          setTimeout(() => {
            if (audioRef.current && audioRef.current.state() === "loaded") {
              audioRef.current.play()
            }
          }, 500)
        } else {
          audioRef.current.play()
        }
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields or when volume slider is being dragged
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || isVolumeSliderDragging) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Left: Previous track
            previousTrack()
          } else {
            // Left: Seek backward 10 seconds
            if (audioRef.current) {
              const newTime = Math.max(0, currentTime - 10)
              audioRef.current.seek(newTime)
              setCurrentTime(newTime)
            }
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Right: Next track
            nextTrack()
          } else {
            // Right: Seek forward 10 seconds
            if (audioRef.current) {
              const newTime = Math.min(duration, currentTime + 10)
              audioRef.current.seek(newTime)
              setCurrentTime(newTime)
            }
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          // Up: Volume up
          setVolume(prev => Math.min(1, prev + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          // Down: Volume down
          setVolume(prev => Math.max(0, prev - 0.1))
          break
        case 'KeyM':
          e.preventDefault()
          // M: Mute/unmute
          if (volume === 0) {
            setVolume(previousVolume || 1)
          } else {
            setPreviousVolume(volume)
            setVolume(0)
          }
          break
        case 'KeyS':
          e.preventDefault()
          // S: Toggle shuffle
          setIsShuffled(!isShuffled)
          break
        case 'KeyR':
          e.preventDefault()
          // R: Toggle repeat
          setIsRepeating(!isRepeating)
          break
        case 'KeyF':
          e.preventDefault()
          // F: Toggle fullscreen
          toggleFullScreen()
          break
        case 'KeyV':
          e.preventDefault()
          // V: Toggle visualizer
          setShowVisualizer(!showVisualizer)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlay, previousTrack, nextTrack, currentTime, duration, volume, isShuffled, isRepeating, toggleFullScreen, showVisualizer, isVolumeSliderDragging])

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
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
                      <Music className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                      Audio
                    </h1>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-red-300 text-sm font-medium">LIVE STREAMING</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                  <p className="text-xl text-white mb-4 leading-relaxed">
                    Experience the rich political sounds and leadership messages from Kano State with our premium audio collection
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-white/80">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>High Quality Audio</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>24/7 Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Free Access</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="text-white/80 hover:text-white transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} className="text-white/60" />
                  <span className="text-white font-medium">Audio Collection</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative">
                  {/* Floating Elements */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float delay-1000">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="relative z-10 transform hover:scale-105 transition-all duration-500">
                    <Image
                      src="/pictures/logo1.png"
                      alt="AKY Audio Collection"
                      width={500}
                      height={400}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                    <div className="absolute -top-6 -right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <Music className="w-5 h-5" />
                        <span>{tracks.length} Tracks</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10"></div>
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
              className={`mb-12 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl relative ${
                isFullScreen ? "fixed inset-0 z-50 rounded-none" : "rounded-3xl"
              }`}
            >
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-sm -z-10 animate-pulse"></div>
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-r ${
                    tracks[currentTrack].color || "from-red-500 to-pink-500"
                  } p-4 md:p-8 relative overflow-hidden`}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
                    </div>
                  </div>
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
                          className={`bg-white/20 hover:bg-white/30 border-0 control-button p-2 md:p-3 ${
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
                          className="bg-white/20 hover:bg-white/30 border-0 text-white control-button p-2 md:p-3"
                          size="sm"
                        >
                          <Share2 className="w-4 h-4 md:w-6 md:h-6" />
                        </Button>
                        <DropdownMenu open={showPlaybackMenu} onOpenChange={setShowPlaybackMenu}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="bg-white/20 hover:bg-white/30 border-0 text-white control-button p-2 md:p-3"
                              size="sm"
                            >
                              <MoreVertical className="w-4 h-4 md:w-6 md:h-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600 text-slate-200 min-w-48">
                            <DropdownMenuItem
                              onClick={() => setShowVisualizer(!showVisualizer)}
                              className="hover:bg-slate-700 focus:bg-slate-700"
                            >
                              <Music className="w-4 h-4 mr-2" />
                              {showVisualizer ? 'Hide' : 'Show'} Visualizer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setAutoPlay(!autoPlay)}
                              className="hover:bg-slate-700 focus:bg-slate-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Auto-play: {autoPlay ? 'On' : 'Off'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCrossfade(!crossfade)}
                              className="hover:bg-slate-700 focus:bg-slate-700"
                            >
                              <Shuffle className="w-4 h-4 mr-2" />
                              Crossfade: {crossfade ? 'On' : 'Off'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShowKeyboardHelp(true)}
                              className="hover:bg-slate-700 focus:bg-slate-700"
                            >
                              <span className="w-4 h-4 mr-2 text-xs font-bold border border-slate-400 rounded flex items-center justify-center">?</span>
                              Keyboard Shortcuts
                            </DropdownMenuItem>
                            <div className="px-2 py-1 text-xs text-slate-400 border-t border-slate-600 mt-1">
                              Playback Speed
                            </div>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <DropdownMenuItem
                                key={rate}
                                onClick={() => {
                                  setPlaybackRate(rate)
                                  if (audioRef.current) {
                                    audioRef.current.rate(rate)
                                  }
                                }}
                                className={`hover:bg-slate-700 focus:bg-slate-700 ${
                                  playbackRate === rate ? 'bg-slate-700 text-red-400' : ''
                                }`}
                              >
                                <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs">
                                  {playbackRate === rate ? '•' : ''}
                                </span>
                                {rate}x {rate === 1 ? '(Normal)' : ''}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={toggleFullScreen}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white control-button p-2 md:p-3"
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
                        {playbackRate !== 1 && (
                          <Badge className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1 self-start">
                            {playbackRate}x Speed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Error Display */}
                    {audioError && (
                      <Alert className="mb-4 bg-red-500/20 border-red-500/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">{audioError}</AlertDescription>
                        <div className="mt-2">
                          <Button 
                            onClick={() => {
                              // Reset the audio and try to reload
                              if (audioRef.current) {
                                audioRef.current.unload()
                                setIsLoaded(false)
                                setAudioError(null)
                                setIsBuffering(true)
                                // Create a new Howl instance
                                audioRef.current = createHowlInstance(currentTrack)
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white mt-2"
                            size="sm"
                          >
                            Retry
                          </Button>
                        </div>
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
                        className={`bg-white/20 hover:bg-white/30 border-0 control-button p-2 md:p-3 ${
                          isShuffled ? "text-red-400 scale-110" : "text-white"
                        }`}
                        size="sm"
                      >
                        <Shuffle size={20} className="md:w-6 md:h-6" />
                      </Button>
                      <Button
                        onClick={previousTrack}
                        disabled={currentTrack === 0}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 control-button p-2 md:p-3"
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
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 control-button p-2 md:p-3"
                        size="sm"
                      >
                        <SkipForward size={24} className="md:w-7 md:h-7" />
                      </Button>
                      <Button
                        onClick={() => setIsRepeating(!isRepeating)}
                        className={`bg-white/20 hover:bg-white/30 border-0 control-button p-2 md:p-3 ${
                          isRepeating ? "text-red-400 scale-110" : "text-white"
                        }`}
                        size="sm"
                      >
                        <Repeat size={20} className="md:w-6 md:h-6" />
                      </Button>
                    </div>

                    {/* Enhanced Volume Control */}
                    <div className="flex items-center justify-center space-x-4 md:space-x-6">
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (volume === 0) {
                            setVolume(previousVolume || 1)
                          } else {
                            setPreviousVolume(volume)
                            setVolume(0)
                          }
                        }}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white control-button p-2"
                        size="sm"
                        type="button"
                      >
                        {volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.617.816zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            <path d="M15.536 15.536L4.464 4.464" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </Button>
                      <div className="relative flex-1 max-w-32 md:max-w-40">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => {
                            e.stopPropagation()
                            const newVolume = Number.parseFloat(e.target.value)
                            setVolume(newVolume)
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsVolumeSliderDragging(true)
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation()
                            setIsVolumeSliderDragging(false)
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            setIsVolumeSliderDragging(true)
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation()
                            setIsVolumeSliderDragging(false)
                          }}
                          className="w-full h-2 md:h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider border border-white/30 volume-slider"
                          style={{
                            background: `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                      </div>
                      <span className="text-white/80 text-sm md:text-lg font-mono w-10 md:w-12 text-center">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Responsive Playlist */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-slate-800/95 backdrop-blur-xl rounded-3xl relative">
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 rounded-3xl blur-sm -z-10 animate-pulse delay-500"></div>
              
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-700 p-4 md:p-8 border-b border-red-600/50 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-xl md:text-3xl font-bold text-white flex items-center mb-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-2xl flex items-center justify-center mr-3 md:mr-4 backdrop-blur-sm">
                            <Music className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          Political Audio Collection
                        </h2>
                        <p className="text-white/80 text-sm md:text-base leading-relaxed">
                          Leadership messages and political content from Kano State
                        </p>
                      </div>
                      
                      <div className="mt-4 md:mt-0">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                          <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-white">{tracks.length}</div>
                            <div className="text-xs md:text-sm text-white/80 font-medium">Total Tracks</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-white">
                          {tracks.filter(t => t.genre === 'Tijjani Gandu').length}
                        </div>
                        <div className="text-xs text-white/70">Tijjani Gandu</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-white">
                          {Math.floor(tracks.reduce((sum, t) => {
                            const [min, sec] = t.duration.split(':').map(Number)
                            return sum + min + (sec / 60)
                          }, 0) / 60)}h
                        </div>
                        <div className="text-xs text-white/70">Total Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-white">
                          {new Set(tracks.map(t => t.genre)).size}
                        </div>
                        <div className="text-xs text-white/70">Genres</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  {tracks.map((track, index) => (
                    <div
                      key={track.track}
                      className={`playlist-item flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-6 border-b border-slate-700/50 last:border-b-0 cursor-pointer ${
                        index === currentTrack
                          ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-l-4 border-l-red-400"
                          : "hover:bg-slate-700/30"
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
        
        {/* Keyboard Shortcuts Help Modal */}
        <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-600 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <span className="w-6 h-6 text-sm font-bold border border-slate-400 rounded flex items-center justify-center">?</span>
                Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Playback Controls</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Play/Pause</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Space</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Previous Track</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Shift + ←</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Track</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Shift + →</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Seek Backward (10s)</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">←</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Seek Forward (10s)</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">→</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Audio Controls</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Volume Up</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↑</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Volume Down</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↓</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mute/Unmute</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">M</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Shuffle</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">S</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Repeat</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">R</kbd>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-3">Display Controls</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Toggle Fullscreen</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">F</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Visualizer</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">V</kbd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300">
                <strong>Note:</strong> Keyboard shortcuts work when not typing in input fields. 
                Use these shortcuts for quick control of your audio experience.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Custom CSS for enhanced audio controls and animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.6);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(239, 68, 68, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.2);
          background: linear-gradient(135deg, #ffffff, #fef2f2);
        }
        
        .volume-slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 6px rgba(239, 68, 68, 0.3);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          cursor: pointer;
          border: 3px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(239, 68, 68, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.2);
          background: linear-gradient(135deg, #ffffff, #fef2f2);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4), 0 0 0 6px rgba(239, 68, 68, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          cursor: pointer;
          border: 3px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
        }
        
        /* Track styling */
        .volume-slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        /* Playlist item hover effects */
        .playlist-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .playlist-item:hover {
          transform: translateX(4px);
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
        }
        
        /* Button hover effects */
        .control-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .control-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .control-button:active {
          transform: translateY(0px);
        }
        
        @media (max-width: 768px) {
          .volume-slider::-webkit-slider-thumb {
            width: 16px;
            height: 16px;
          }
          
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </PageLoader>
  )
}
