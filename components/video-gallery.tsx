"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

const videos = [
  {
    id: 1,
    title: "Governor's State Address 2024",
    videoId: "hULQASzb6pM",
    thumbnail: "https://img.youtube.com/vi/hULQASzb6pM/maxresdefault.jpg",
    description: "Annual state address by Governor Abba Kabir Yusuf",
    size: "large", // col-xl-6
  },
  {
    id: 2,
    title: "Infrastructure Development Projects",
    videoId: "bL2Da1alx50",
    thumbnail: "https://img.youtube.com/vi/bL2Da1alx50/maxresdefault.jpg",
    description: "Overview of major infrastructure projects in Kano State",
    size: "medium", // col-xl-3
  },
  {
    id: 3,
    title: "Education Sector Reforms",
    videoId: "Yuh1-RT6rWM",
    thumbnail: "https://img.youtube.com/vi/Yuh1-RT6rWM/maxresdefault.jpg",
    description: "Transforming education in Kano State",
    size: "large", // col-xl-6
  },
  {
    id: 4,
    title: "Healthcare Initiatives",
    videoId: "rzResCThrc4",
    thumbnail: "https://img.youtube.com/vi/rzResCThrc4/maxresdefault.jpg",
    description: "Improving healthcare delivery across Kano State",
    size: "small", // col-xl-4
  },
  {
    id: 5,
    title: "Agricultural Development Programs",
    videoId: "fWjmWCN4ADY",
    thumbnail: "https://img.youtube.com/vi/fWjmWCN4ADY/maxresdefault.jpg",
    description: "Supporting farmers and agricultural growth",
    size: "large", // col-xl-6
  },
  {
    id: 6,
    title: "Youth Empowerment Initiatives",
    videoId: "aoLZYjHYrmg",
    thumbnail: "https://img.youtube.com/vi/aoLZYjHYrmg/maxresdefault.jpg",
    description: "Creating opportunities for young people in Kano",
    size: "medium", // col-xl-3
  },
  {
    id: 7,
    title: "Urban Development Projects",
    videoId: "DU-AT5ngAMc",
    thumbnail: "https://img.youtube.com/vi/DU-AT5ngAMc/maxresdefault.jpg",
    description: "Modernizing Kano's urban infrastructure",
    size: "large", // col-xl-6
  },
  {
    id: 8,
    title: "Community Engagement Programs",
    videoId: "cNJQm1S4Q8U",
    thumbnail: "https://img.youtube.com/vi/cNJQm1S4Q8U/maxresdefault.jpg",
    description: "Connecting with communities across Kano State",
    size: "small", // col-xl-4
  },
]

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId)
  }

  const closeVideo = () => {
    setSelectedVideo(null)
  }

  const getGridClasses = (size: string) => {
    switch (size) {
      case "large":
        return "col-span-1 md:col-span-2 lg:col-span-2"
      case "medium":
        return "col-span-1 md:col-span-1 lg:col-span-1"
      case "small":
        return "col-span-1 md:col-span-1 lg:col-span-1"
      default:
        return "col-span-1"
    }
  }

  const getHeightClasses = (size: string) => {
    switch (size) {
      case "large":
        return "h-64 lg:h-80"
      case "medium":
        return "h-48 lg:h-64"
      case "small":
        return "h-48 lg:h-60"
      default:
        return "h-48"
    }
  }

  return (
    <>
      {/* First Section - Videos 1-4 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-16">
            {videos.slice(0, 4).map((video) => (
              <Card
                key={video.id}
                className={`group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 ${getGridClasses(video.size)}`}
                onClick={() => openVideo(video.videoId)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${getHeightClasses(video.size)}`}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
                    <p className="text-white/80 text-sm">{video.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Second Section - Videos 5-8 */}
      <section className="py-0 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {videos.slice(4, 8).map((video) => (
              <Card
                key={video.id}
                className={`group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 ${getGridClasses(video.size)}`}
                onClick={() => openVideo(video.videoId)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${getHeightClasses(video.size)}`}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
                    <p className="text-white/80 text-sm">{video.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeVideo}>
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors text-2xl"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  )
}
