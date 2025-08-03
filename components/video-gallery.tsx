"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react"
import { getYouTubeId, getYouTubeEmbedUrl, isYouTubeUrl } from "@/lib/video-utils"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string // Original URL from user
  thumbnail: string | null
  category: string
  createdAt: string
  updatedAt: string
}

// Mobile Video Player Component (YouTube Shorts style)
const MobileVideoPlayer = ({
  video,
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
}: {
  video: Video
  isPlaying: boolean
  togglePlay: () => void
  isMuted: boolean
  toggleMute: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const youtubeId = getYouTubeId(video.videoUrl)
  const isYouTube = isYouTubeUrl(video.videoUrl)

  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((e) => console.error("Video play failed:", e))
      } else {
        videoRef.current.pause()
      }
      videoRef.current.muted = isMuted
    }
  }, [isPlaying, isMuted, isYouTube])

  const handlePlayPauseClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    togglePlay()
  }

  const handleMuteToggleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    toggleMute()
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isPlaying ? (
        isYouTube ? (
          <iframe
            key={video.id} // Key ensures iframe re-renders when video changes
            src={getYouTubeEmbedUrl(youtubeId!, true, isMuted)} // Autoplay and mute based on state
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-contain"
            title={video.title}
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            loop
            playsInline
            webkit-playsinline="true"
            className="w-full h-full object-contain" // Use object-contain for shorts to fit video aspect ratio
            onClick={handlePlayPauseClick}
            muted={isMuted} // Control muted state directly
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <Image
            src={video.thumbnail || "/placeholder.svg?height=720&width=1280&query=video%20thumbnail"}
            alt={video.title}
            fill
            className="object-cover opacity-50"
          />
          <Button
            onClick={handlePlayPauseClick}
            className="relative z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-4"
            size="icon"
          >
            <Play size={32} />
            <span className="sr-only">Play Video</span>
          </Button>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm opacity-90 line-clamp-3 mb-4">{video.description}</p>
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePlayPauseClick}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
            size="icon"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            onClick={handleMuteToggleClick}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
            size="icon"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mobileVideoStates, setMobileVideoStates] = useState<{ isPlaying: boolean; isMuted: boolean }[]>([])
  const [currentMobileVideoIndex, setCurrentMobileVideoIndex] = useState(0)
  const mobileGalleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/dashboard/videos")
        if (!response.ok) throw new Error("Failed to fetch videos")
        const data = await response.json()
        setVideos(data)
        // Initialize video states
        setMobileVideoStates(data.map(() => ({ isPlaying: false, isMuted: true })))
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  // Handle mobile video autoplay/pause on scroll
  useEffect(() => {
    if (videos.length === 0) return

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index") || "0")
            setCurrentMobileVideoIndex(index)

            // Pause all videos first, then play the intersecting one
            setMobileVideoStates((prev) =>
              prev.map((state, i) => ({
                ...state,
                isPlaying: i === index, // Only play the current one
                isMuted: i === index ? state.isMuted : true, // Mute others
              })),
            )
          }
        })
      },
      { threshold: 0.8 }, // Trigger when 80% of the video is visible
    )

    const currentRef = mobileGalleryRef.current
    if (currentRef) {
      const videoElements = currentRef.querySelectorAll(".mobile-video-container")
      videoElements.forEach((el) => observer.observe(el))
    }

    return () => {
      if (currentRef) {
        const videoElements = currentRef.querySelectorAll(".mobile-video-container")
        videoElements.forEach((el) => observer.unobserve(el))
      }
    }
  }, [videos.length]) // Re-run when videos array changes

  const toggleMobilePlay = useCallback((index: number) => {
    setMobileVideoStates((prev) =>
      prev.map((state, i) => ({
        ...state,
        isPlaying: i === index ? !state.isPlaying : false, // Toggle current, pause others
      })),
    )
  }, [])

  const toggleMobileMute = useCallback((index: number) => {
    setMobileVideoStates((prev) =>
      prev.map((state, i) => ({
        ...state,
        isMuted: i === index ? !state.isMuted : state.isMuted, // Toggle mute for current, keep others as is
      })),
    )
  }, [])

  const handleOpenModal = (video: Video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const handleCloseModal = (e: MouseEvent<HTMLDivElement>) => {
    setSelectedVideo(null)
    setIsModalOpen(false)
  }

  const renderVideoPlayerInModal = (video: Video) => {
    const youtubeId = getYouTubeId(video.videoUrl)
    if (youtubeId) {
      const embedUrl = getYouTubeEmbedUrl(youtubeId, true, false) // Autoplay, not muted for modal
      return (
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title={video.title}
        ></iframe>
      )
    } else {
      return (
        <video
          src={video.videoUrl}
          controls
          autoPlay
          playsInline
          webkit-playsinline="true"
          className="w-full h-full object-contain"
        />
      )
    }
  }

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-1 bg-gray-200 rounded w-20 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-video"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're working hard to bring you amazing video content. Check back soon for updates!
            </p>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-8"></div>
            <div className="mt-8">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Video Gallery
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto"></div>
        </div>
        {/* Mobile View: YouTube Shorts Style */}
        <div
          ref={mobileGalleryRef}
          className="md:hidden h-[calc(100vh-120px)] overflow-y-auto snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Hide scrollbar
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="h-full w-full flex-shrink-0 snap-center mobile-video-container"
              data-index={index}
            >
              <MobileVideoPlayer
                video={video}
                isPlaying={mobileVideoStates[index]?.isPlaying || false}
                togglePlay={() => toggleMobilePlay(index)}
                isMuted={mobileVideoStates[index]?.isMuted ?? true}
                toggleMute={() => toggleMobileMute(index)}
              />
            </div>
          ))}
        </div>
        {/* Desktop View: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
              onClick={() => handleOpenModal(video)}
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={video.thumbnail || "/placeholder.svg?height=300&width=500&query=video%20thumbnail"}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-12 h-12 text-white" />
                  <span className="sr-only">Play Video</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{video.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Video Playback Modal for Desktop */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-lg">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-2xl font-bold text-gray-900">{selectedVideo?.title}</DialogTitle>
            <Button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2"
              size="icon"
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black">
            {selectedVideo && renderVideoPlayerInModal(selectedVideo)}
          </div>
          <div className="p-4 text-gray-700">
            <p>{selectedVideo?.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
