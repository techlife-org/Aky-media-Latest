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
  Star,
  Upload,
  Link as LinkIcon,
  Youtube,
  CloudUpload,
  FileVideo,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getYouTubeId, getYouTubeEmbedUrl } from "@/lib/video-utils"
import DashboardLayout from "@/components/dashboard-layout" 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

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
  const [uploadMethod, setUploadMethod] = useState<"youtube" | "cloudinary">("youtube")
  const [uploading, setUploading] = useState(false)
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
      
      // Use real data from API
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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/videos/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Calculate stats from videos data if API not available
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        
        const thisMonthVideos = videos.filter(video => {
          const videoDate = new Date(video.createdAt)
          return videoDate.getMonth() === currentMonth && videoDate.getFullYear() === currentYear
        })
        
        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)
        const featuredCount = videos.filter(video => video.featured).length
        const categories = new Set(videos.map(video => video.category)).size
        
        // Calculate total duration
        const totalMinutes = videos.reduce((sum, video) => {
          if (video.duration) {
            const [minutes, seconds] = video.duration.split(':').map(Number)
            return sum + minutes + (seconds / 60)
          }
          return sum
        }, 0)
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = Math.floor(totalMinutes % 60)
        const totalDuration = `${hours}:${minutes.toString().padStart(2, '0')}:00`
        
        setStats({
          totalVideos: videos.length,
          thisMonth: thisMonthVideos.length,
          totalViews,
          totalDuration,
          categories,
          featured: featuredCount
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Fallback to calculated stats
      setStats({
        totalVideos: videos.length,
        thisMonth: 0,
        totalViews: 0,
        totalDuration: "0:00:00",
        categories: new Set(videos.map(video => video.category)).size,
        featured: videos.filter(video => video.featured).length
      })
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

  // Enhanced Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)
    formData.append("resource_type", "video")

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary")
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a video file smaller than 100MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const videoUrl = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, videoUrl }))
      toast({
        title: "Upload Successful",
        description: "Video uploaded to Cloudinary successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.videoUrl) {
      toast({
        title: "Missing Video",
        description: "Please provide a video URL or upload a video file",
        variant: "destructive",
      })
      return
    }

    try {
      const method = editingVideo ? "PUT" : "POST"
      const url = editingVideo ? `/api/dashboard/videos/${editingVideo.id}` : "/api/dashboard/videos"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) throw new Error("Failed to save video")
      
      toast({
        title: "Success",
        description: editingVideo ? "Video updated successfully" : "Video added successfully",
        className: "bg-green-50 border-green-200 text-green-800",
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
    } catch (error) {
      console.error("Error saving video:", error)
      toast({
        title: "Error",
        description: "Failed to save video",
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
        className: "bg-green-50 border-green-200 text-green-800",
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
      const response = await fetch(`/api/dashboard/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !video.featured }),
      })
      
      if (!response.ok) throw new Error("Failed to update video")
      
      const updatedVideos = videos.map(v => 
        v.id === video.id ? { ...v, featured: !v.featured } : v
      )
      setVideos(updatedVideos)
      
      toast({
        title: "Success",
        description: `Video ${video.featured ? 'removed from' : 'added to'} featured`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
      
      // Refresh stats
      fetchStats()
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

          {/* Enhanced Add/Edit Form */}
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
                      <Label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">
                        Video Title *
                      </Label>
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
                      <Label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
                        Description *
                      </Label>
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
                    
                    {/* Enhanced Video Upload Section */}
                    <div className="md:col-span-2">
                      <Label className="block text-sm font-medium mb-3 text-gray-700">
                        Video Source *
                      </Label>
                      
                      <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "youtube" | "cloudinary")}>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="youtube" className="flex items-center gap-2">
                            <Youtube className="w-4 h-4" />
                            YouTube Link
                          </TabsTrigger>
                          <TabsTrigger value="cloudinary" className="flex items-center gap-2">
                            <CloudUpload className="w-4 h-4" />
                            Upload Video
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="youtube" className="space-y-3">
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="url"
                              value={formData.videoUrl}
                              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                            />
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Youtube className="w-5 h-5 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">YouTube Integration</p>
                                <p className="text-xs text-red-600 mt-1">
                                  Paste any YouTube video URL. Thumbnails will be automatically generated.
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="cloudinary" className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="video-upload"
                              disabled={uploading}
                            />
                            <label
                              htmlFor="video-upload"
                              className="cursor-pointer flex flex-col items-center gap-3"
                            >
                              {uploading ? (
                                <>
                                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Uploading...</p>
                                    <p className="text-xs text-gray-500">Please wait while your video is being uploaded</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FileVideo className="w-6 h-6 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Click to upload video</p>
                                    <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
                                  </div>
                                </>
                              )}
                            </label>
                          </div>
                          
                          {formData.videoUrl && uploadMethod === "cloudinary" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">Video Uploaded Successfully</p>
                                  <p className="text-xs text-green-600 mt-1 break-all">
                                    {formData.videoUrl}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CloudUpload className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">Cloudinary Upload</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Videos are uploaded to Cloudinary for optimized streaming and automatic thumbnail generation.
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div>
                      <Label htmlFor="thumbnail" className="block text-sm font-medium mb-2 text-gray-700">
                        Custom Thumbnail URL
                      </Label>
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
                      <Label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700">
                        Category *
                      </Label>
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
                      disabled={uploading || !formData.videoUrl}
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
                        {video.views !== undefined && video.views > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="w-3 h-3 mr-1" />
                            {video.views.toLocaleString()} views
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