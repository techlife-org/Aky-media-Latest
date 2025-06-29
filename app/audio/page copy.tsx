"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    genre: "Traditional",
    color: "from-red-500 to-orange-500",
  },
  {
    track: 2,
    name: "Kareemi",
    duration: "11:03",
    file: "kareemi",
    artist: "AKY Media",
    genre: "Spiritual",
    color: "from-red-600 to-pink-500",
  },
  {
    track: 3,
    name: "Abba Gida Gida (Billy-o)",
    duration: "11:03",
    file: "abbaBilly",
    artist: "AKY Media",
    genre: "Folk",
    color: "from-rose-500 to-red-500",
  },
  {
    track: 4,
    name: "Allah ga Abba (Ali Jita, Ado Gwanja)",
    duration: "11:03",
    file: "allahGaAbba",
    artist: "Ali Jita & Ado Gwanja",
    genre: "Collaboration",
    color: "from-red-500 to-rose-500",
  },
  {
    track: 5,
    name: "Dan Farin Gida",
    duration: "13:03",
    file: "danFarinGida",
    artist: "AKY Media",
    genre: "Traditional",
    color: "from-orange-500 to-red-600",
  },
  {
    track: 6,
    name: "Lamba Daya",
    duration: "5:12",
    file: "lambaDaya",
    artist: "AKY Media",
    genre: "Contemporary",
    color: "from-pink-500 to-red-500",
  },
  {
    track: 7,
    name: "Hasbunallahu",
    duration: "5:10",
    file: "hasbunallahu",
    artist: "AKY Media",
    genre: "Spiritual",
    color: "from-red-500 to-pink-600",
  },
  {
    track: 8,
    name: "Sakona",
    duration: "4:08",
    file: "sakoNa",
    artist: "AKY Media",
    genre: "Folk",
    color: "from-rose-600 to-red-500",
  },
  {
    track: 9,
    name: "Sunaji suna gani",
    duration: "5:59",
    file: "sunaJiSunaGani",
    artist: "AKY Media",
    genre: "Traditional",
    color: "from-red-600 to-orange-500",
  },
  {
    track: 10,
    name: "Ga Comrade ga Abba",
    duration: "6:26",
    file: "gaAbbaGaComrd",
    artist: "AKY Media",
    genre: "Political",
    color: "from-red-500 to-rose-600",
  },
  {
    track: 11,
    name: "Ramadanan Gwamna",
    duration: "9:21",
    file: "ramadanan",
    artist: "AKY Media",
    genre: "Seasonal",
    color: "from-pink-600 to-red-500",
  },
  {
    track: 12,
    name: "Zama daram dakam abba",
    duration: "6:19",
    file: "ZAMA_DARAM_DAƘAU_ABBA_KABIR_YUSUF__BY_TIJJANI_GANDU(0)",
    artist: "Tijjani Gandu",
    genre: "Traditional",
    color: "from-red-500 to-orange-600",
  },
  {
    track: 13,
    name: "Abba ka cika gwarzo",
    duration: "23:27",
    file: "Abba Kacika Gwarzo",
    artist: "AKY Media",
    genre: "Epic",
    color: "from-orange-600 to-red-500",
  },
  {
    track: 14,
    name: "Gwamna Jikan Dabo",
    duration: "5:33",
    file: "GWAMNA_JIKAN_DABO_ABBA_GIDA_GIDA(0)",
    artist: "AKY Media",
    genre: "Political",
    color: "from-red-600 to-pink-500",
  },
  {
    track: 15,
    name: "Kanawa ga Abba nan",
    duration: "6:29",
    file: "KANAWA_GA_ABBA_NAN_SABUWAR_WAKAR_KOSAN_WAKA(128k)",
    artist: "Kosan Waka",
    genre: "Contemporary",
    color: "from-rose-500 to-red-600",
  },
  {
    track: 16,
    name: "Gyara Kintse Abba",
    duration: "8:52",
    file: "Gyara_KINTSI_ABBA_GIDA_GIDA_Sabon_Gwamna(0)",
    artist: "AKY Media",
    genre: "Reform",
    color: "from-red-500 to-pink-500",
  },
  {
    track: 17,
    name: "Barka da Sallah Abba",
    duration: "12:31",
    file: "BARKA_DA_SALLA_SABON_GWAMNA_ABBA_KABIR_YUSIF_ABBA_GIDA_GIDA(0)",
    artist: "AKY Media",
    genre: "Celebration",
    color: "from-orange-500 to-red-500",
  },
  {
    track: 18,
    name: "Karshen tika tiki tik",
    duration: "19:54",
    file: "KARSHEN_TIKA_TIKI_TIK_BY_TIJJANI_GANDU(0)",
    artist: "Tijjani Gandu",
    genre: "Narrative",
    color: "from-red-600 to-rose-500",
  },
  {
    track: 19,
    name: "Allah Ka rikawa Abba",
    duration: "14:07",
    file: "Allah_Ka_Riƙawa_Abba_Gwamna_Na_Kanawa_Sabuwar_Wakar_TIJJANI_GANDU,_Abba_gida_gida_KWANKWASIYYA_amana(0)",
    artist: "Tijjani Gandu",
    genre: "Prayer",
    color: "from-pink-500 to-red-600",
  },
  {
    track: 20,
    name: "Mai gyara bashi barna",
    duration: "15:50",
    file: "Mai_Gyara_Bashi_Barna_Saide_Inba_Gyaran_Yake_Ba,_By_TIJJANI_GANDU(0)",
    artist: "Tijjani Gandu",
    genre: "Social",
    color: "from-red-500 to-orange-500",
  },
]

const genreColors = {
  Traditional: "bg-gradient-to-r from-red-100 to-orange-100 text-red-800",
  Spiritual: "bg-gradient-to-r from-pink-100 to-red-100 text-pink-800",
  Folk: "bg-gradient-to-r from-rose-100 to-red-100 text-rose-800",
  Contemporary: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800",
  Political: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800",
  Collaboration: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800",
  Seasonal: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800",
  Epic: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800",
  Reform: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800",
  Celebration: "bg-gradient-to-r from-red-100 to-orange-100 text-red-800",
  Narrative: "bg-gradient-to-r from-pink-100 to-red-100 text-pink-800",
  Prayer: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800",
  Social: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800",
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
  const [isLiked, setIsLiked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const mediaPath = "https://archive.org/download/aky_20250624/"

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading()
    }, 1200)
    return () => clearTimeout(timer)
  }, [stopLoading])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
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

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrack, isRepeating])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `${mediaPath}${encodeURIComponent(tracks[currentTrack].file)}.mp3`
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrack])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playTrack = (index: number) => {
    setCurrentTrack(index)
    setIsPlaying(true)
  }

  const previousTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1)
    }
  }

  const nextTrack = () => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1)
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

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <Header />

        {/* Hero Section */}
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
                  <Music className="w-12 h-12 text-red-400 mr-4" />
                  <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    Audio
                  </h1>
                </div>
                <p className="text-xl text-gray-300 mb-8">
                  Experience the rich sounds of Kano State with our premium audio collection
                </p>
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="hover:text-red-400 transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} className="text-red-400" />
                  <span className="text-red-400">Audio</span> 
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl"></div>
                  <Image
                    src="/pictures/assets/img/he/5.png"
                    alt="Audio Collection"
                    width={500}
                    height={400}
                    className="w-full h-auto rounded-2xl relative z-10"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {tracks.length} Tracks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="py-20 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Enhanced Audio Player */}
            <Card className="mb-12 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-r ${tracks[currentTrack].color || "from-red-500 to-pink-500"} p-8 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    {/* Now Playing Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Music className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{isPlaying ? "Now Playing" : "Paused"}</h2>
                          <p className="text-white/80">AKY Media Center</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setIsLiked(!isLiked)}
                          className={`bg-white/20 hover:bg-white/30 border-0 ${isLiked ? "text-red-400" : "text-white"}`}
                          size="sm"
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                        </Button>
                        <Button className="bg-white/20 hover:bg-white/30 border-0 text-white" size="sm">
                          <Share2 className="w-5 h-5" />
                        </Button>
                        <Button className="bg-white/20 hover:bg-white/30 border-0 text-white" size="sm">
                          <Download className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-white mb-2">{tracks[currentTrack].name}</h3>
                      <div className="flex items-center space-x-4">
                        <p className="text-white/90 text-lg">{tracks[currentTrack].artist}</p>
                        <Badge
                          className={`${genreColors[tracks[currentTrack].genre as keyof typeof genreColors] || "bg-white/20 text-white"} border-0`}
                        >
                          {tracks[currentTrack].genre}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div
                        className="w-full h-3 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-white rounded-full transition-all duration-300 shadow-lg"
                          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-white/80 text-sm mt-3">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <Button
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`bg-white/20 hover:bg-white/30 border-0 ${isShuffled ? "text-red-400" : "text-white"}`}
                        size="lg"
                      >
                        <Shuffle size={20} />
                      </Button>

                      <Button
                        onClick={previousTrack}
                        disabled={currentTrack === 0}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50"
                        size="lg"
                      >
                        <SkipBack size={24} />
                      </Button>

                      <Button
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl transform hover:scale-105 transition-all duration-200"
                        size="lg"
                      >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                      </Button>

                      <Button
                        onClick={nextTrack}
                        disabled={currentTrack === tracks.length - 1}
                        className="bg-white/20 hover:bg-white/30 border-0 text-white disabled:opacity-50"
                        size="lg"
                      >
                        <SkipForward size={24} />
                      </Button>

                      <Button
                        onClick={() => setIsRepeating(!isRepeating)}
                        className={`bg-white/20 hover:bg-white/30 border-0 ${isRepeating ? "text-red-400" : "text-white"}`}
                        size="lg"
                      >
                        <Repeat size={20} />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center justify-center space-x-4">
                      <Volume2 className="text-white" size={20} />
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
                        className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-white/80 text-sm w-8">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                </div>

                <audio ref={audioRef} preload="metadata" />
              </CardContent>
            </Card>

            {/* Enhanced Playlist */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-700 to-red-800 p-6 border-b border-red-600">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Music className="w-6 h-6 mr-3 text-red-400" />
                    Playlist ({tracks.length} tracks)
                  </h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {tracks.map((track, index) => (
                    <div
                      key={track.track}
                      onClick={() => playTrack(index)}
                      className={`flex items-center justify-between p-4 border-b border-slate-700/50 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-slate-700/50 ${
                        index === currentTrack
                          ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-l-4 border-l-red-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          <span className="text-slate-400 font-mono text-sm w-8 block text-center">
                            {track.track.toString().padStart(2, "0")}
                          </span>
                          {index === currentTrack && isPlaying && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                          )}
                        </div>

                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${track.color || "from-red-600 to-red-700"} flex items-center justify-center`}
                        >
                          <Music className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg">{track.name}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-slate-400 text-sm">{track.artist}</p>
                            <Badge
                              className={`${genreColors[track.genre as keyof typeof genreColors] || "bg-slate-600 text-slate-200"} text-xs border-0`}
                            >
                              {track.genre}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-slate-400 text-sm font-mono">{track.duration}</span>
                        {index === currentTrack && isPlaying && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-red-400 rounded animate-pulse"></div>
                            <div className="w-1 h-6 bg-red-400 rounded animate-pulse delay-100"></div>
                            <div className="w-1 h-3 bg-red-400 rounded animate-pulse delay-200"></div>
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
      </div>
    </PageLoader>
  )
}
