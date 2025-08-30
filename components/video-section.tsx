"use client"

import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnail: string | null
  category: string
  createdAt: string
  updatedAt: string
}

export default function VideoSection() {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedVideo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Ensure we're running in the browser
        if (typeof window === 'undefined') {
          console.log("[Video Section] Skipping fetch - running on server")
          return
        }

        console.log("[Video Section] Fetching videos from /api/dashboard/videos")
        const response = await fetch("/api/dashboard/videos", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`)
        }

        const videos = await response.json()
        console.log("[Video Section] API response:", videos)

        if (Array.isArray(videos) && videos.length > 0) {
          // Use the first video as featured video
          setFeaturedVideo(videos[0])
          console.log("[Video Section] Featured video set:", videos[0])
        } else {
          console.log("[Video Section] No videos found")
          setError("No videos available")
        }
      } catch (error) {
        console.error("Error fetching featured video:", error)
        setError(error instanceof Error ? error.message : "Failed to load video")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedVideo()
  }, [])

  // Function to extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Function to check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return getYouTubeId(url) !== null
  }

  // Fallback video if no videos are available
  const fallbackVideo = {
    id: "fallback",
    title: "Governor Abba Kabir Yusuf - Leadership in Action",
    description: "Watch highlights from Governor Abba Kabir Yusuf's administration and key initiatives for Kano State development.",
    videoUrl: "https://www.youtube.com/watch?v=iLVYuItS8e0", // Using a working YouTube video
    thumbnail: null,
    category: "Government",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const videoToDisplay = featuredVideo || (error ? fallbackVideo : null)

  if (loading) {
    return (
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=600&width=1200)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <span className="ml-4 text-white">Loading video...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!videoToDisplay) {
    return (
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=600&width=1200)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
                  <p className="text-gray-300">Check back soon for video content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const youtubeId = getYouTubeId(videoToDisplay.videoUrl)
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0`
    : null

  return (
    <section
      className="py-20 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=600&width=1200)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Video
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
            {videoToDisplay.title}
          </h3>
          <p className="text-gray-200 max-w-2xl mx-auto">
            {videoToDisplay.description}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              {embedUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  title={videoToDisplay.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Video Format Not Supported</h3>
                    <p className="text-gray-300 mb-4">This video format cannot be displayed</p>
                    <Button 
                      onClick={() => window.open(videoToDisplay.videoUrl, '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Watch on External Site
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
