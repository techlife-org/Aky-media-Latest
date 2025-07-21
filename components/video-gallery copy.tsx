"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  category: string
}

const videos: Video[] = [
  {
    id: "1",
    title: "Governor's Inauguration Speech",
    description: "Highlights from His Excellency's inaugural address, outlining the vision for Kano State.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Inauguration+Speech",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Speeches",
  },
  {
    id: "2",
    title: "Kano Infrastructure Projects Update",
    description: "A look at ongoing and completed infrastructure development projects across the state.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Infrastructure+Update",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Development",
  },
  {
    id: "3",
    title: "Youth Empowerment Program Launch",
    description:
      "Governor launches new initiatives to empower the youth through skill acquisition and entrepreneurship.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Youth+Program",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Social Programs",
  },
  {
    id: "4",
    title: "Healthcare Sector Reforms",
    description: "Improvements and new policies in the healthcare sector to ensure accessible medical services.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Healthcare+Reforms",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Healthcare",
  },
  {
    id: "5",
    title: "Agricultural Revolution in Kano",
    description: "Modern farming techniques and support for farmers to boost agricultural output.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Agriculture+Revolution",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Agriculture",
  },
  {
    id: "6",
    title: "Community Engagement Sessions",
    description: "Governor's direct engagement with local communities to address their needs and concerns.",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Community+Engagement",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", // Sample MP4
    category: "Community",
  },
]

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

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((e) => console.error("Video play failed:", e))
      } else {
        videoRef.current.pause()
      }
      videoRef.current.muted = isMuted
    }
  }, [isPlaying, isMuted])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop
        playsInline
        webkit-playsinline="true"
        className="w-full h-full object-contain" // Use object-contain for shorts to fit video aspect ratio
        onClick={togglePlay}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm opacity-90 line-clamp-3 mb-4">{video.description}</p>
        <div className="flex items-center justify-between">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
            size="icon"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              toggleMute()
            }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
            size="icon"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMobileVideoIndex, setCurrentMobileVideoIndex] = useState(0)
  const [mobileVideoStates, setMobileVideoStates] = useState<{ isPlaying: boolean; isMuted: boolean }[]>(
    videos.map(() => ({ isPlaying: false, isMuted: true })),
  )

  const mobileGalleryRef = useRef<HTMLDivElement>(null)

  // Handle mobile video autoplay/pause on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
          setMobileVideoStates((prevStates) => {
            const newStates = [...prevStates]
            if (entry.isIntersecting) {
              newStates[index] = { ...newStates[index], isPlaying: true }
              setCurrentMobileVideoIndex(index)
            } else {
              newStates[index] = { ...newStates[index], isPlaying: false }
            }
            return newStates
          })
        })
      },
      {
        threshold: 0.8, // Trigger when 80% of the video is visible
      },
    )

    if (mobileGalleryRef.current) {
      Array.from(mobileGalleryRef.current.children).forEach((child, index) => {
        child.setAttribute("data-index", index.toString())
        observer.observe(child)
      })
    }

    return () => {
      if (mobileGalleryRef.current) {
        Array.from(mobileGalleryRef.current.children).forEach((child) => {
          observer.unobserve(child)
        })
      }
    }
  }, [])

  const handleOpenModal = (video: Video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
    setIsModalOpen(false)
  }

  const toggleMobilePlay = useCallback((index: number) => {
    setMobileVideoStates((prevStates) => {
      const newStates = [...prevStates]
      newStates[index] = { ...newStates[index], isPlaying: !newStates[index].isPlaying }
      return newStates
    })
  }, [])

  const toggleMobileMute = useCallback((index: number) => {
    setMobileVideoStates((prevStates) => {
      const newStates = [...prevStates]
      newStates[index] = { ...newStates[index], isMuted: !newStates[index].isMuted }
      return newStates
    })
  }, [])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Video Gallery</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore a collection of impactful videos showcasing the Governor's initiatives and key events.
          </p>
        </div>

        {/* Mobile View: YouTube Shorts Style */}
        <div ref={mobileGalleryRef} className="md:hidden h-[calc(100vh-120px)] overflow-y-scroll snap-y snap-mandatory">
          {videos.map((video, index) => (
            <div key={video.id} className="h-full w-full flex-shrink-0 snap-center">
              <MobileVideoPlayer
                video={video}
                isPlaying={mobileVideoStates[index]?.isPlaying || false}
                togglePlay={() => toggleMobilePlay(index)}
                isMuted={mobileVideoStates[index]?.isMuted || true}
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
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-12 h-12 text-white" />
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
            </Button>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black">
            {selectedVideo && (
              <video
                key={selectedVideo.id} // Key ensures video reloads when source changes
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                playsInline
                webkit-playsinline="true"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="p-4 text-gray-700">
            <p>{selectedVideo?.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
