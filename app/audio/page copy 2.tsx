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
  Download,
  Music,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

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
    name: "Ko Hasidin",
    duration: "06:21",
    file: "koHasidin",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 2,
    name: "Kareemi",
    duration: "11:03",
    file: "kareemi",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-600 to-red-800",
  },
  {
    track: 3,
    name: "Abba Gida Gida",
    duration: "11:03",
    file: "abbaBilly",
    artist: "AKY Media",
    genre: "Billy-o" ,
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
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 6,
    name: "Lamba Daya",
    duration: "5:12",
    file: "lambaDaya",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 7,
    name: "Hasbunallahu",
    duration: "5:10",
    file: "hasbunallahu",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 8,
    name: "Sakona",
    duration: "4:08",
    file: "sakoNa",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 9,
    name: "Sunaji suna gani",
    duration: "5:59",
    file: "sunaJiSunaGani",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 10,
    name: "Ga Comrade ga Abba",
    duration: "6:26",
    file: "gaAbbaGaComrd",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-rose-600",
  },
  {
    track: 11,
    name: "Ramadanan Gwamna",
    duration: "9:21",
    file: "ramadanan",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 12,
    name: "Zama daram dakam abba",
    duration: "6:19",
    file: "ZAMA_DARAM_DAƘAU_ABBA_KABIR_YUSUF__BY_TIJJANI_GANDU(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 13,
    name: "Abba ka cika gwarzo",
    duration: "23:27",
    file: "Abba Kacika Gwarzo",
    artist: "AKY Media",
    genre: "Kosan Waka",
    color: "from-red-500 to-red-800",
  },
  {
    track: 14,
    name: "Gwamna Jikan Dabo",
    duration: "5:33",
    file: "GWAMNA_JIKAN_DABO_ABBA_GIDA_GIDA(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 15,
    name: "Kanawa ga Abba nan",
    duration: "6:29",
    file: "KANAWA_GA_ABBA_NAN_SABUWAR_WAKAR_KOSAN_WAKA(128k)",
    artist: "Kosan Waka",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 16,
    name: "Gyara Kintse Abba",
    duration: "8:52",
    file: "Gyara_KINTSI_ABBA_GIDA_GIDA_Sabon_Gwamna(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 17,
    name: "Barka da Sallah Abba",
    duration: "12:31",
    file: "BARKA_DA_SALLA_SABON_GWAMNA_ABBA_KABIR_YUSIF_ABBA_GIDA_GIDA(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 18,
    name: "Karshen tika tiki tik",
    duration: "19:54",
    file: "KARSHEN_TIKA_TIKI_TIK_BY_TIJJANI_GANDU(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 19,
    name: "Allah Ka rikawa Abba",
    duration: "14:07",
    file: "Allah_Ka_Riƙawa_Abba_Gwamna_Na_Kanawa_Sabuwar_Wakar_TIJJANI_GANDU,_Abba_gida_gida_KWANKWASIYYA_amana(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
  {
    track: 20,
    name: "Mai gyara bashi barna",
    duration: "15:50",
    file: "Mai_Gyara_Bashi_Barna_Saide_Inba_Gyaran_Yake_Ba,_By_TIJJANI_GANDU(0)",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    color: "from-red-500 to-red-800",
  },
]

const genreColors = {
  Music: "bg-gradient-to-r from-red-100 to-red-800 text-red-800 border border-red-200",
  // Music: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200",
  // Music: "bg-gradient-to-r from-blue-100 to-red-100 text-blue-800 border border-blue-200",
  // Music: "bg-gradient-to-r from-green-100 to-red-100 text-green-800 border border-green-200",
  // Music: "bg-gradient-to-r from-indigo-100 to-red-100 text-indigo-800 border border-indigo-200",
  // Music: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200",
  // Music: "bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border border-teal-200",
  // Music: "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200",
  // Music: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200",
  // Music: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200",
  // Music: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200",
  // Music: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200",
  // Music: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border border-violet-200",
  // Music: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200",
  // Music: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200",
  // Music: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border border-rose-200",
  // Music: "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200",
  // Music: "bg-gradient-to-r from-lime-100 to-green-100 text-lime-800 border border-lime-200",
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

// Audio Visualizer Component
const AudioVisualizer = ({
  audioRef,
  isPlaying,
}: { audioRef: React.RefObject<HTMLAudioElement>; isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()
  const audioContextRef = useRef<AudioContext>()

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return

    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContextRef.current.createMediaElementSource(audioRef.current!)
        analyserRef.current = audioContextRef.current.createAnalyser()

        source.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)

        analyserRef.current.fftSize = 256
        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)
      }
    }

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!
      const width = canvas.width
      const height = canvas.height

      analyserRef.current.getByteFrequencyData(dataArrayRef.current)

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width, height)

      const barWidth = (width / dataArrayRef.current.length) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * height * 0.8

        const r = Math.floor((barHeight + 25) * (i / dataArrayRef.current.length) * 255)
        const g = Math.floor(250 * (i / dataArrayRef.current.length))
        const b = Math.floor(50)

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      setupAudioContext()
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume()
      }
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
  }, [isPlaying, audioRef])

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
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaPath = "https://archive.org/download/aky_20250624/"

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

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading()
    }, 1200)
    return () => clearTimeout(timer)
  }, [stopLoading])

  // Enhanced Media Session API for better mobile control
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

      // Enhanced action handlers for better mobile support
      navigator.mediaSession.setActionHandler("play", () => {
        if (audioRef.current) {
          audioRef.current.play()
          setIsPlaying(true)
        }
      })

      navigator.mediaSession.setActionHandler("pause", () => {
        if (audioRef.current) {
          audioRef.current.pause()
          setIsPlaying(false)
        }
      })

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        if (currentTrack > 0) {
          setCurrentTrack(currentTrack - 1)
          setIsPlaying(true)
        }
      })

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        if (currentTrack < tracks.length - 1) {
          setCurrentTrack(currentTrack + 1)
          setIsPlaying(true)
        }
      })

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime
          setCurrentTime(details.seekTime)
        }
      })

      // Additional handlers for better mobile support
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        if (audioRef.current) {
          const seekOffset = details.seekOffset || 10
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seekOffset)
        }
      })

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        if (audioRef.current) {
          const seekOffset = details.seekOffset || 10
          audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seekOffset)
        }
      })
    }
  }, [currentTrack, isPlaying, duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      // Enhanced position state for mobile controls
      if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration || 0,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          })
        } catch (error) {
          console.log("Position state not supported")
        }
      }
    }

    const updateDuration = () => setDuration(audio.duration)

    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0
        audio.play()
      } else if (currentTrack < tracks.length - 1) {
        setCurrentTrack(currentTrack + 1)
      } else {
        setIsPlaying(false)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [currentTrack, isRepeating])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `${mediaPath}${encodeURIComponent(tracks[currentTrack].file)}.mp3`
      audioRef.current.load() // Ensure proper loading
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentTrack])

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
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [isPlaying])

  const playTrack = (index: number) => {
    setCurrentTrack(index)
    setIsPlaying(true)
  }

  const previousTrack = useCallback(() => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1)
      setIsPlaying(true)
    }
  }, [currentTrack])

  const nextTrack = useCallback(() => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1)
      setIsPlaying(true)
    }
  }, [currentTrack])

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

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

  // Enhanced Ad Page Component
  const AdPage = () => {
    if (!showAds || adDisplayMode !== "page") return null

    const currentAd = ads[currentAdIndex % ads.length]

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-4xl w-full border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold">Advertisement ({currentAdIndex + 1}/10)</h2>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  <span className="font-mono text-lg">{adTimer}s</span>
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
                    className="bg-white text-red-600 hover:bg-gray-100"
                    size="lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="cursor-pointer group" onClick={() => handleAdClick(currentAd)}>
              <div className="relative overflow-hidden rounded-xl mb-6">
                <Image
                  src={currentAd.image || "/placeholder.svg"}
                  alt={currentAd.title}
                  width={800}
                  height={500}
                  className="w-full h-96 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-4">{currentAd.title}</h3>
                <p className="text-xl text-gray-300 mb-6">{currentAd.description}</p>
                <div className="inline-flex items-center text-red-400 text-lg font-semibold">
                  Click anywhere to visit →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <Header />

        {/* Enhanced Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-orange-600/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-2xl">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    Audio
                  </h1>
                </div>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Experience the rich political sounds and leadership messages from Kano State with our premium audio
                  collection
                </p>
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="hover:text-red-400 transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} className="text-red-400" />
                  <span className="text-red-400">Audio Collection</span>
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl"></div>
                  <div className="relative z-10">
                    <Image
                      src="/pictures/logo.png"
                      alt="AKY Audio Collection"
                      width={500}
                      height={400}
                      className="w-full h-auto rounded-2xl shadow-xl"
                    />
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                      {tracks.length} Tracks
                    </div>
                    {/* <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                      Political Collection
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="py-20 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Enhanced Audio Player with Visualizer */}
            <Card className="mb-12 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-r ${tracks[currentTrack].color || "from-red-500 to-pink-500"} p-8 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    {/* Enhanced Now Playing Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden border-2 border-white/30 shadow-xl">
                          <Image
                            src="/pictures/logo.png"
                            alt="Now Playing"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">{isPlaying ? "Now Playing" : "Paused"}</h2>
                          <p className="text-white/80 text-lg">AKY Media Center</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => toggleFavorite(currentTrack)}
                          className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 ${favorites.includes(currentTrack) ? "text-red-400 scale-110" : "text-white"}`}
                          size="lg"
                        >
                          <Heart className={`w-6 h-6 ${favorites.includes(currentTrack) ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          onClick={() => handleShare(tracks[currentTrack])}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white transition-all duration-300 hover:scale-105"
                          size="lg"
                        >
                          <Share2 className="w-6 h-6" />
                        </Button>
                        <Button
                          onClick={() => handleDownload(tracks[currentTrack])}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white transition-all duration-300 hover:scale-105"
                          size="lg"
                        >
                          <Download className="w-6 h-6" />
                        </Button>
                        <Button
                          onClick={() => setShowVisualizer(!showVisualizer)}
                          className="bg-white/20 hover:bg-white/30 border-0 text-white transition-all duration-300"
                          size="lg"
                        >
                          {showVisualizer ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
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
                      <h3 className="text-4xl font-bold text-white mb-3">{tracks[currentTrack].name}</h3>
                      <div className="flex items-center space-x-4">
                        <p className="text-white/90 text-xl">{tracks[currentTrack].artist}</p>
                        <Badge
                          className={`${genreColors[tracks[currentTrack].genre as keyof typeof genreColors] || "bg-white/20 text-white"} text-sm px-3 py-1`}
                        >
                          {tracks[currentTrack].genre}
                        </Badge>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="mb-8">
                      <div
                        className="w-full h-4 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm border border-white/30 shadow-inner"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-white to-red-200 rounded-full transition-all duration-300 shadow-lg relative"
                          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                        >
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-white/80 text-lg mt-4 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex items-center justify-center space-x-8 mb-8">
                      <Button
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 ${isShuffled ? "text-red-400 scale-110" : "text-white"}`}
                        size="lg"
                      >
                        <Shuffle size={24} />
                      </Button>
                      <Button
                        onClick={previousTrack}
                        disabled={currentTrack === 0}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 transition-all duration-300 hover:scale-105"
                        size="lg"
                      >
                        <SkipBack size={28} />
                      </Button>
                      <Button
                        onClick={togglePlay}
                        className="w-24 h-24 rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-white/30"
                        size="lg"
                      >
                        {isPlaying ? <Pause size={36} /> : <Play size={36} />}
                      </Button>
                      <Button
                        onClick={nextTrack}
                        disabled={currentTrack === tracks.length - 1}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50 transition-all duration-300 hover:scale-105"
                        size="lg"
                      >
                        <SkipForward size={28} />
                      </Button>
                      <Button
                        onClick={() => setIsRepeating(!isRepeating)}
                        className={`bg-white/20 hover:bg-white/30 border-0 transition-all duration-300 ${isRepeating ? "text-red-400 scale-110" : "text-white"}`}
                        size="lg"
                      >
                        <Repeat size={24} />
                      </Button>
                    </div>

                    {/* Enhanced Volume Control */}
                    <div className="flex items-center justify-center space-x-6">
                      <Volume2 className="text-white" size={24} />
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
                            if (audioRef.current) {
                              audioRef.current.volume = newVolume
                            }
                          }}
                          className="w-40 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider border border-white/30"
                        />
                      </div>
                      <span className="text-white/80 text-lg font-mono w-12">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                </div>

                <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
              </CardContent>
            </Card>

            {/* Enhanced Playlist */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-700 to-red-800 p-8 border-b border-red-600">
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <Music className="w-8 h-8 mr-4 text-red-400" />
                    Political Audio Collection ({tracks.length} tracks)
                  </h2>
                  <p className="text-white/80 mt-2">Leadership messages and political content from Kano State</p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {tracks.map((track, index) => (
                    <div
                      key={track.track}
                      className={`flex items-center justify-between p-6 border-b border-slate-700/50 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-slate-700/50 ${
                        index === currentTrack
                          ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-l-4 border-l-red-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-6 flex-1" onClick={() => playTrack(index)}>
                        <div className="relative">
                          <span className="text-slate-400 font-mono text-lg w-10 block text-center">
                            {track.track.toString().padStart(2, "0")}
                          </span>
                          {index === currentTrack && isPlaying && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                          )}
                        </div>

                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${track.color || "from-red-600 to-red-700"} flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-lg`}
                        >
                          <Image
                            src="/pictures/logo.png"
                            alt={track.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-white text-xl mb-1">{track.name}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-slate-400 text-lg">{track.artist}</p>
                            <Badge
                              className={`${genreColors[track.genre as keyof typeof genreColors] || "bg-slate-600 text-slate-200"} text-sm`}
                            >
                              {track.genre}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(index)
                          }}
                          className={`bg-transparent hover:bg-slate-700 border-0 transition-all duration-300 ${favorites.includes(index) ? "text-red-400 scale-110" : "text-slate-400"}`}
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(track)
                          }}
                          className="bg-transparent hover:bg-slate-700 border-0 text-slate-400 transition-all duration-300 hover:scale-105"
                          size="sm"
                        >
                          <Download className="w-5 h-5" />
                        </Button>
                        <span className="text-slate-400 text-lg font-mono min-w-[60px]">{track.duration}</span>
                        {index === currentTrack && isPlaying && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-6 bg-red-400 rounded animate-pulse"></div>
                            <div className="w-1 h-8 bg-red-400 rounded animate-pulse delay-100"></div>
                            <div className="w-1 h-4 bg-red-400 rounded animate-pulse delay-200"></div>
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
        <AdPage />
      </div>
    </PageLoader>
  )
}
