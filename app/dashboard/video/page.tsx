"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlayIcon, 
  Trash2, 
  PlusCircle, 
  X, 
  Video as VideoIcon,
  Eye,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Download,
  Edit,
  MoreHorizontal,
  Sparkles,
  Activity,
  Users,
  Clock,
  Star
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  views?: number
  duration?: string
  featured?: boolean
}

interface VideoStats {
  totalVideos: number
  thisMonth: number
  totalViews: number
  totalDuration: string
  categories: number
  featured: number
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stats, setStats] = useState<VideoStats>({
    totalVideos: 0,
    thisMonth: 0,
    totalViews: 0,
    totalDuration: "0:00",
    categories: 0,
    featured: 0
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    category: "",
    featured: false
  })
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  useEffect(() => {
    fetchVideos()
    fetchStats()
  }, [])

  useEffect(() => {
    const filtered = videos.filter((video) => {
      const matchesSearch = 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    setFilteredVideos(filtered)
  }, [searchTerm, categoryFilter, videos])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/dashboard/videos")
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      
      // Add mock data for demo purposes
      const enhancedData = data.map((video: Video, index: number) => ({
        ...video,
        views: Math.floor(Math.random() * 1000) + 50,
        duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        featured: index < 2
      }))
      
      setVideos(enhancedData)
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

  const fetchStats = async () => {
    try {
      // Mock stats for demo - replace with actual API call
      const mockStats = {
        totalVideos: videos.length || 12,
        thisMonth: 3,
        totalViews: 8547,
        totalDuration: "2:45:30",
        categories: 5,
        featured: 2
      }
      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      await fetchVideos()
      await fetchStats()
      toast({
        title: "Success",
        description: "Video data refreshed successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh video data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
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
        featured: false
      })
      setShowAddForm(false)
      setEditingVideo(null)
      fetchVideos()
      fetchStats()
      fetchStats()
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

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || "",
      category: video.category,
      featured: video.featured || false
    })
    setShowAddForm(true)
  }

  const toggleFeatured = async (video: Video) => {
    try {
      // Mock API call - replace with actual implementation
      const updatedVideos = videos.map(v => 
        v.id === video.id ? { ...v, featured: !v.featured } : v
      )
      setVideos(updatedVideos)
      toast({
        title: "Success",
        description: `Video ${video.featured ? 'removed from' : 'added to'} featured`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      })
    }
  }

  const categories = Array.from(new Set(videos.map(v => v.category))).filter(Boolean)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "education":
        return "🎓"
      case "infrastructure":
        return "🏗️"
      case "healthcare":
        return "🏥"
      case "agriculture":
        return "🌾"
      case "economy":
        return "💰"
      case "security":
        return "🛡️"
      case "environment":
        return "🌱"
      case "sport":
        return "⚽"
      default:
        return "📹"
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <VideoIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                        Video Management
                      </h1>
                      <p className="text-gray-600 text-lg">Create, manage, and showcase your video content</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={refreshData}
                    disabled={refreshing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingVideo(null)
                      setFormData({
                        title: "",
                        description: "",
                        videoUrl: "",
                        thumbnail: "",
                        category: "",
                        featured: false
                      })
                      setShowAddForm(!showAddForm)
                    }} 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {showAddForm ? (
                      <>
                        <X className="w-4 h-4 mr-2" /> Hide Form
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 mr-2" /> Add New Video
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <VideoIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Videos</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalVideos}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      All content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">This Month</p>
                    <p className="text-3xl font-bold text-emerald-900">{stats.thisMonth}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      New uploads
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Views</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      All time views
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Duration</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.totalDuration}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Total runtime
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-700">Categories</p>
                    <p className="text-3xl font-bold text-pink-900">{stats.categories}</p>
                    <p className="text-xs text-pink-600 flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Content types
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Featured</p>
                    <p className="text-3xl font-bold text-indigo-900">{stats.featured}</p>
                    <p className="text-xs text-indigo-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Highlighted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search videos by title, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <span className="flex items-center gap-2">
                          <span>{getCategoryIcon(category)}</span>
                          {category}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredVideos.length}</span> of <span className="font-semibold text-gray-900">{videos.length}</span> videos
                  {searchTerm && ` matching "${searchTerm}"`}
                  {categoryFilter !== "all" && ` in category "${categoryFilter}"`}
                </p>
              </div>
            </CardContent>
          </Card>

          {showAddForm && (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  {editingVideo ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Edit Video
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Add New Video
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {editingVideo ? 'Update video information and settings' : 'Upload and configure a new video for your gallery'}
                </CardDescription>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">
                      Video Title *
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter a compelling video title"
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this video is about..."
                      rows={4}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="videoUrl" className="block text-sm font-medium mb-2 text-gray-700">
                      Video URL *
                    </label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supports YouTube links and direct MP4 URLs</p>
                  </div>
                  
                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium mb-2 text-gray-700">
                      Custom Thumbnail URL
                    </label>
                    <Input
                      id="thumbnail"
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated for YouTube if empty</p>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Education">🎓 Education</SelectItem>
                        <SelectItem value="Infrastructure">🏗️ Infrastructure</SelectItem>
                        <SelectItem value="Healthcare">🏥 Healthcare</SelectItem>
                        <SelectItem value="Agriculture">🌾 Agriculture</SelectItem>
                        <SelectItem value="Economy">💰 Economy</SelectItem>
                        <SelectItem value="Security">🛡️ Security</SelectItem>
                        <SelectItem value="Environment">🌱 Environment</SelectItem>
                        <SelectItem value="Sport">⚽ Sport</SelectItem>
                        <SelectItem value="Other">📹 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <div>
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Mark as Featured Video
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Featured videos appear prominently in the gallery</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingVideo(null)
                      setFormData({
                        title: "",
                        description: "",
                        videoUrl: "",
                        thumbnail: "",
                        category: "",
                        featured: false
                      })
                    }}
                    className="flex-1 bg-white/50 hover:bg-white border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {editingVideo ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Video
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Video
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          )}

          {/* Enhanced Videos Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-40 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || categoryFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by uploading your first video"}
                  </p>
                  {!searchTerm && categoryFilter === "all" && (
                    <Button 
                      onClick={() => setShowAddForm(true)} 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> 
                      Upload Your First Video
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden hover:scale-105">
                    <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <PlayIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {video.featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-gray-700 border-gray-200 shadow-lg border flex items-center gap-1">
                          <span>{getCategoryIcon(video.category)}</span>
                          {video.category}
                        </Badge>
                      </div>
                      
                      {/* Play Button */}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                        onClick={() => handleOpenModal(video)}
                      >
                        <PlayIcon className="w-5 h-5 text-purple-600" />
                        <span className="sr-only">View Video</span>
                      </Button>
                      
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-black/70 text-white border-0 text-xs">
                            {video.duration}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      {/* Title and Description */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {video.description}
                        </p>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        {video.views !== undefined && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="w-3 h-3 mr-1" />
                            {video.views} views
                          </div>
                        )}
                        {video.duration && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {video.duration}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(video)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          >
                            <PlayIcon className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(video)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        
                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => toggleFeatured(video)}>
                              <Star className="mr-2 h-4 w-4" />
                              {video.featured ? 'Remove from Featured' : 'Mark as Featured'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => handleDelete(video.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Video
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Video Playback Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border-white/20">
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedVideoForModal?.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {selectedVideoForModal?.title}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>{getCategoryIcon(selectedVideoForModal?.category || '')}</span>
                        {selectedVideoForModal?.category}
                      </span>
                      {selectedVideoForModal?.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {selectedVideoForModal.views} views
                        </span>
                      )}
                      {selectedVideoForModal?.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedVideoForModal.duration}
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
                {selectedVideoForModal && renderVideoPlayer(selectedVideoForModal)}
              </div>
              <div className="p-6 pt-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedVideoForModal?.description}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  )
}
