"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, X, Volume2, VolumeX, Video, Clock, Eye, ArrowRight, Sparkles, Star } from "lucide-react"
import { getYouTubeId, getYouTubeEmbedUrl, isYouTubeUrl } from "@/lib/video-utils"
import Link from "next/link"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string // Original URL from user
  thumbnail: string | null
  category: string
  createdAt: string
  updatedAt: string
  views?: number
  duration?: string
  featured?: boolean
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

  const handlePlayPauseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    togglePlay()
  }

  const handleMuteToggleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

      {/* Enhanced overlay with better design */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-6 text-white">
        {/* Category badge */}
        <div className="absolute top-6 left-6">
          <Badge className="bg-red-600/90 text-white border-0 backdrop-blur-sm">
            {video.category}
          </Badge>
        </div>
        
        {/* Featured badge */}
        {video.featured && (
          <div className="absolute top-6 right-6">
            <Badge className="bg-yellow-500/90 text-white border-0 backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          </div>
        )}

        {/* Video info */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h3>
          <div className="mb-4">
            <p className="text-sm opacity-90 leading-relaxed">{video.description}</p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-white/80 mb-4">
            {video.views && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {video.views.toLocaleString()} views
              </div>
            )}
            {video.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePlayPauseClick}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm"
              size="icon"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <Button
              onClick={handleMuteToggleClick}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm"
              size="icon"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>
          </div>
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
          
          // Use real data from API
          setVideos(data)
          // Initialize video states
          setMobileVideoStates(data.map(() => ({ isPlaying: false, isMuted: true })))
        } catch (error) {
          console.error("Error fetching videos:", error)
          setVideos([]) // Set empty array on error to show "Coming Soon"
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
      (entries: IntersectionObserverEntry[]) => {
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

  const handleCloseModal = () => {
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
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-1 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
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
      <section className="py-24 md:py-32 bg-gradient-to-br from-red-50 via-white to-red-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-100/40 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Enhanced icon */}
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-8 shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Video className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Enhanced title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent mb-6">
              Coming Soon
            </h2>
            
            {/* Enhanced description */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're working hard to bring you amazing video content showcasing Governor Abba Kabir Yusuf's achievements and Kano State's progress.
            </p>
            
            {/* Decorative line */}
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-12"></div>
            
            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">HD Quality Videos</h3>
                <p className="text-gray-600 text-sm">High-definition content showcasing government achievements</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile Optimized</h3>
                <p className="text-gray-600 text-sm">YouTube Shorts style viewing experience on mobile</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Star className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Featured Content</h3>
                <p className="text-gray-600 text-sm">Curated highlights and important announcements</p>
              </div>
            </div>
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
              
              <Link href="/news">
                <Button 
                  variant="outline"
                  className="border-2 border-red-600/30 bg-red-50/50 text-red-700 hover:bg-red-100 hover:border-red-600/50 px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Video className="w-5 h-5 mr-2" />
                  View News Instead
                </Button>
              </Link>
            </div>
            
            {/* Newsletter signup hint */}
            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-red-200 max-w-2xl mx-auto">
              <p className="text-gray-700 mb-4">
                <strong>Stay Updated!</strong> Subscribe to our newsletter to be notified when videos are available.
              </p>
              <Link href="#newsletter">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Subscribe to Newsletter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-red-800 bg-clip-text text-transparent">
              Our Video Gallery
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover inspiring stories and achievements from Governor Abba Kabir Yusuf's administration
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
        </div>
        
        {/* Mobile View: YouTube Shorts Style */}
        <div
          ref={mobileGalleryRef}
          className="md:hidden h-[calc(100vh-120px)] overflow-y-auto snap-y snap-mandatory rounded-2xl"
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
        
        {/* Desktop View: Enhanced Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer group bg-white/80 backdrop-blur-sm border-0"
              onClick={() => handleOpenModal(video)}
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={video.thumbnail || "/placeholder.svg?height=300&width=500&query=video%20thumbnail"}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Enhanced overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600/90 text-white border-0 backdrop-blur-sm">
                    {video.category}
                  </Badge>
                </div>
                
                {video.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500/90 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                {/* Duration */}
                {video.duration && (
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/70 text-white border-0 text-xs">
                      {video.duration}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
                  {video.title}
                </h3>
                <div className="mb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {video.description.length > 150 
                      ? `${video.description.substring(0, 150)}...` 
                      : video.description
                    }
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {video.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.views.toLocaleString()} views
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Enhanced Video Playback Modal for Desktop */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {selectedVideo?.featured && (
                    <Badge className="bg-yellow-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {selectedVideo?.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge variant="outline" className="border-red-200 text-red-600">
                    {selectedVideo?.category}
                  </Badge>
                  {selectedVideo?.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedVideo.views.toLocaleString()} views
                    </span>
                  )}
                  {selectedVideo?.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedVideo.duration}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleCloseModal}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow-lg"
                size="icon"
              >
                <X size={20} />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </DialogHeader>
          
          <div className="relative w-full aspect-video bg-black rounded-lg mx-6 overflow-hidden">
            {selectedVideo && renderVideoPlayerInModal(selectedVideo)}
          </div>
          
          <div className="p-6 pt-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                Description
              </h4>
              <div className="text-gray-700 leading-relaxed space-y-2">
                {selectedVideo?.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-sm md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}