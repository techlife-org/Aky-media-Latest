"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayIcon, Trash2, PlusCircle, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getYouTubeId, getYouTubeEmbedUrl } from "@/lib/video-utils"
import DashboardLayout from "@/components/dashboard-layout" 

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

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "", // Added thumbnail field
    category: "",
  })
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/dashboard/videos")
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/dashboard/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to add video")
      toast({
        title: "Success",
        description: "Video added successfully",
      })
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        thumbnail: "",
        category: "",
      })
      setShowAddForm(false) // Hide form after submission
      fetchVideos()
    } catch (error) {
      console.error("Error adding video:", error)
      toast({
        title: "Error",
        description: "Failed to add video",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return
    try {
      const response = await fetch(`/api/dashboard/videos/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete video")
      toast({
        title: "Success",
        description: "Video deleted successfully",
      })
      fetchVideos()
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      })
    }
  }

  const handleOpenModal = (video: Video) => {
    setSelectedVideoForModal(video)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedVideoForModal(null)
    setIsModalOpen(false)
  }

  const renderVideoPlayer = (video: Video) => {
    const youtubeId = getYouTubeId(video.videoUrl)
    if (youtubeId) {
      const embedUrl = getYouTubeEmbedUrl(youtubeId, true, false) // Autoplay, not muted for preview
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

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
            <p className="text-gray-600">Add and manage video content for your gallery</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700">
            {showAddForm ? (
              <>
                <X className="mr-2 h-4 w-4" /> Hide Form
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Video
              </>
            )}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Add New Video</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium mb-1 text-gray-700">
                    Video URL (YouTube link or direct MP4)
                  </label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://example.com/video.mp4"
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium mb-1 text-gray-700">
                    Thumbnail URL (Optional, auto-generated for YouTube if empty)
                  </label>
                  <Input
                    id="thumbnail"
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="e.g., https://example.com/thumbnail.jpg"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700">
                    Category
                  </label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Education, Infrastructure"
                    required
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Add Video
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Existing Videos</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border rounded-lg bg-white shadow-sm">
              No videos found. Click "Add New Video" to add your first video.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-2 right-2 bg-white/80 hover:bg-white rounded-full"
                      onClick={() => handleOpenModal(video)}
                    >
                      <PlayIcon className="w-5 h-5 text-red-600" />
                      <span className="sr-only">View Video</span>
                    </Button>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">{video.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(video.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="sr-only">Delete Video</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Video Playback Modal for Dashboard Preview */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-lg">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-2xl font-bold text-gray-900">{selectedVideoForModal?.title}</DialogTitle>
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
              {selectedVideoForModal && renderVideoPlayer(selectedVideoForModal)}
            </div>
            <div className="p-4 text-gray-700">
              <p>{selectedVideoForModal?.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
