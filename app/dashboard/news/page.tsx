"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Newspaper, 
  Plus, 
  Calendar, 
  Eye, 
  Mail, 
  TrendingUp, 
  X, 
  Edit, 
  Trash2, 
  Send, 
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Users,
  BarChart3,
  Clock,
  Star,
  Image as ImageIcon,
  Download,
  Zap,
  Activity,
  Target,
  Sparkles,
  Globe,
  Building,
  GraduationCap,
  Heart,
  DollarSign,
  Wheat,
  Leaf,
  Shield,
  Home
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { AutoCarousel } from "@/components/auto-carousel"
import { DragDropUpload } from "@/components/drag-drop-upload"

interface Attachment {
  url: string
  type: "image" | "document" | "video" | "link"
  name?: string
  order?: number
}

interface NewsArticle {
  id: string
  title: string
  content: string
  doc_type: string
  created_at: string
  updated_at?: string
  attachments: Attachment[]
  views?: number
}

interface NewsStats {
  totalNews: number
  thisMonth: number
  totalViews: number
  emailsSent: number
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [newArticle, setNewArticle] = useState({
    id: "",
    title: "",
    content: "",
    doc_type: "",
    custom_category: "",
    attachments: [] as Attachment[],
    files: [] as File[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSending, setIsSending] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
    fetchStats()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("[News Management] Fetching news from /api/dashboard/news")
      
      // Use relative URL for client-side fetches
      const response = await fetch("/api/dashboard/news", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      })

      console.log("[News Management] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[News Management] API error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[News Management] API response data:", result)
      
      const newsData = Array.isArray(result) ? result : result.data || []

      if (Array.isArray(newsData)) {
        const formattedNews = newsData.map((article) => ({
          id: article._id || article.id,
          title: article.title,
          content: article.content,
          doc_type: article.doc_type,
          created_at: article.created_at,
          updated_at: article.updated_at,
          views: article.views || 0,
          attachments: Array.isArray(article.attachments)
            ? article.attachments
            : article.attachment
              ? [article.attachment]
              : [],
        }))

        console.log("[News Management] Formatted news data:", formattedNews.length, "articles")
        setNews(formattedNews)
      } else {
        console.error("[News Management] Unexpected news data format:", newsData)
        setNews([])
      }
    } catch (error) {
      console.error("[News Management] Error fetching news:", error)
      setError(error instanceof Error ? error.message : "Failed to load news articles")
      
      // Fallback to public news API if dashboard API fails
      try {
        console.log("[News Management] Trying fallback to /api/news")
        const fallbackResponse = await fetch("/api/news", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log("[News Management] Fallback data loaded:", fallbackData.length, "articles")
          
          const formattedFallbackNews = fallbackData.map((article: any) => ({
            id: article._id || article.id,
            title: article.title,
            content: article.content,
            doc_type: article.doc_type || "General",
            created_at: article.created_at,
            updated_at: article.updated_at,
            views: article.views || 0,
            attachments: Array.isArray(article.attachments)
              ? article.attachments
              : article.attachment
                ? [article.attachment]
                : [],
          }))
          
          setNews(formattedFallbackNews)
          toast({
            title: "Warning",
            description: "Loaded news from public API. Some management features may be limited.",
            className: "bg-yellow-50 border-yellow-200 text-yellow-800",
          })
        } else {
          throw new Error("Both dashboard and public APIs failed")
        }
      } catch (fallbackError) {
        console.error("[News Management] Fallback also failed:", fallbackError)
        setNews([])
        toast({
          title: "Error",
          description: "Failed to load news articles from both sources. Please check your connection and try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshNews = async () => {
    setRefreshing(true)
    try {
      await fetchNews()
      await fetchStats()
      toast({
        title: "Success",
        description: "News data refreshed successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh news data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log("[News Management] Fetching stats from /api/dashboard/news/stats")
      
      const response = await fetch("/api/dashboard/news/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      })

      if (!response.ok) {
        console.warn("[News Management] Stats API failed, using calculated stats")
        // Calculate stats from news data if API fails
        const calculatedStats = {
          totalNews: news.length,
          thisMonth: news.filter(article => {
            const articleDate = new Date(article.created_at)
            const now = new Date()
            return articleDate.getMonth() === now.getMonth() && articleDate.getFullYear() === now.getFullYear()
          }).length,
          totalViews: news.reduce((sum, article) => sum + (article.views || 0), 0),
          emailsSent: 0,
        }
        setStats(calculatedStats)
        return
      }

      const result = await response.json()
      console.log("[News Management] Stats data:", result)
      
      const defaultStats = {
        totalNews: news.length, // Use actual news count as fallback
        thisMonth: 0,
        totalViews: 0,
        emailsSent: 0,
        ...result,
      }

      setStats(defaultStats)
    } catch (err) {
      console.error("[News Management] Error fetching stats:", err)
      
      // Calculate basic stats from loaded news data
      const calculatedStats = {
        totalNews: news.length,
        thisMonth: news.filter(article => {
          const articleDate = new Date(article.created_at)
          const now = new Date()
          return articleDate.getMonth() === now.getMonth() && articleDate.getFullYear() === now.getFullYear()
        }).length,
        totalViews: news.reduce((sum, article) => sum + (article.views || 0), 0),
        emailsSent: 0,
      }
      
      setStats(calculatedStats)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "education":
        return <GraduationCap className="w-4 h-4" />
      case "infrastructure":
        return <Building className="w-4 h-4" />
      case "healthcare":
        return <Heart className="w-4 h-4" />
      case "agriculture":
        return <Wheat className="w-4 h-4" />
      case "economy":
      case "economicdevelopment":
        return <DollarSign className="w-4 h-4" />
      case "security":
        return <Shield className="w-4 h-4" />
      case "environment":
        return <Leaf className="w-4 h-4" />
      case "communitydevelopment":
        return <Home className="w-4 h-4" />
      case "sport":
        return <Target className="w-4 h-4" />
      default:
        return <Newspaper className="w-4 h-4" />
    }
  }

  const getCategoryEmoji = (category: string) => {
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
      case "economicdevelopment":
        return "💰"
      case "security":
        return "🛡️"
      case "environment":
        return "🌱"
      case "communitydevelopment":
        return "🏘️"
      case "sport":
        return "⚽"
      default:
        return "📰"
    }
  }

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "Education", name: "Education" },
    { id: "Infrastructure", name: "Infrastructure" },
    { id: "Healthcare", name: "Healthcare" },
    { id: "Agriculture", name: "Agriculture" },
    { id: "Economy", name: "Economy" },
    { id: "Security", name: "Security" },
    { id: "Environment", name: "Environment" },
    { id: "EconomicDevelopment", name: "Economic Development" },
    { id: "CommunityDevelopment", name: "Community Development" },
    { id: "Sport", name: "Sport" },
  ]

  const filteredNews = news.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.doc_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || article.doc_type === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      addFiles(files)
    }
  }

  const handleDragDropFiles = (files: File[]) => {
    addFiles(files)
  }

  const addFiles = (files: File[]) => {
    const currentCount = newArticle.files.length + newArticle.attachments.length
    const remainingSlots = 5 - currentCount

    if (files.length > remainingSlots) {
      toast({
        title: "Maximum files exceeded",
        description: `You can only upload up to 5 files in total. You have ${remainingSlots} slots remaining.`,
        variant: "destructive",
      })
      return
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      // Accept images, PDFs, Word documents, and videos
      const isValid = 
        fileType.startsWith('image/') || 
        fileType === 'application/pdf' || 
        fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType.startsWith('video/')
      
      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `File ${file.name} is not supported. Please upload images, PDFs, Word documents, or videos.`,
          variant: "destructive",
        })
      }
      
      return isValid
    })

    if (validFiles.length > 0) {
      setNewArticle((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles.slice(0, remainingSlots)],
      }))
      
      if (validFiles.length < files.length) {
        toast({
          title: "Some files skipped",
          description: `${files.length - validFiles.length} files were not uploaded due to unsupported file types.`,
        })
      }
    }
  }

  const removeFile = (index: number, isUploaded = false) => {
    if (isUploaded) {
      const totalImages =
        newArticle.attachments.filter((att) => att.type === "image").length +
        newArticle.files.filter((file) => file.type.startsWith("image/")).length

      if (totalImages <= 1) {
        toast({
          title: "Cannot delete image",
          description: "At least one image must remain for the article.",
          variant: "destructive",
        })
        return
      }

      setNewArticle((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }))
    } else {
      setNewArticle((prev) => ({
        ...prev,
        files: prev.files.filter((_, i) => i !== index),
      }))
    }
  }

  const uploadFiles = async (files: File[]): Promise<Attachment[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")
      
      // Add folder parameter for organization
      formData.append("folder", "aky_news")
      
      // Add tags for easier management
      formData.append("tags", "news,aky_media")

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error("Cloudinary cloud name not configured")
      }

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        { method: "POST", body: formData },
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("Cloudinary upload error:", errorText)
        throw new Error(`Failed to upload file: ${file.name}. Status: ${uploadResponse.status}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log("Cloudinary upload result:", uploadResult)

      let fileType: "image" | "document" | "video" | "link" = "link"
      if (uploadResult.resource_type === "image") {
        fileType = "image"
      } else if (uploadResult.resource_type === "video") {
        fileType = "video"
      } else {
        fileType = "document"
      }

      return {
        url: uploadResult.secure_url,
        type: fileType,
        name: file.name,
        order: 0,
      }
    })

    return Promise.all(uploadPromises)
  }

  const resetForm = () => {
    setNewArticle({
      id: "",
      title: "",
      content: "",
      doc_type: "",
      custom_category: "",
      attachments: [] as Attachment[],
      files: [] as File[],
    })
    setEditingId(null)
    setShowCustomCategory(false)
  }

  const handleEdit = async (articleId: string) => {
    try {
      console.log("[News Management] Fetching article for edit:", articleId)
      const response = await fetch(`/api/dashboard/news/${articleId}`, {
        cache: "no-store"
      })
      if (!response.ok) {
        throw new Error("Failed to fetch article details")
      }
      const article = await response.json()
      console.log("[News Management] Article data for edit:", article)

      setEditingId(article.id)
      setNewArticle({
        id: article.id,
        title: article.title,
        content: article.content,
        doc_type: article.doc_type,
        custom_category: article.doc_type,
        attachments: Array.isArray(article.attachments)
          ? article.attachments
          : article.attachment
            ? [article.attachment]
            : [],
        files: [],
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching article:", error)
      toast({
        title: "Error",
        description: "Failed to load article for editing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      const response = await fetch(`/api/dashboard/news/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNews((prev) => prev.filter((article) => article.id !== id))
        toast({
          title: "Success",
          description: "Article deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete article")
      }
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const docType = newArticle.doc_type === "Other" ? newArticle.custom_category : newArticle.doc_type

    if (!newArticle.title || !newArticle.content || !docType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if at least one image is included
    const hasImage = [...newArticle.attachments, ...newArticle.files].some(
      (item) => 
        (item.type && item.type === "image") || 
        (item instanceof File && item.type.startsWith("image/"))
    )

    if (!hasImage) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image for the article.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let uploadedAttachments: Attachment[] = []

      if (newArticle.files && newArticle.files.length > 0) {
        try {
          uploadedAttachments = await uploadFiles(newArticle.files)
        } catch (error) {
          console.error("Error uploading files:", error)
          throw new Error("Failed to upload one or more files")
        }
      }

      const allAttachments = [...(newArticle.attachments || []), ...uploadedAttachments].map((attachment, index) => ({
        ...attachment,
        order: index,
      }))

      const articleData = {
        title: newArticle.title,
        content: newArticle.content,
        doc_type: docType,
        attachments: allAttachments,
        custom_category: newArticle.custom_category || undefined,
      }

      let response: Response
      let successMessage = ""

      if (editingId) {
        response = await fetch(`/api/dashboard/news/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        })
        successMessage = "Article updated successfully"
      } else {
        response = await fetch("/api/dashboard/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        })
        successMessage = "Article published successfully"
      }

      if (response.ok) {
        await fetchNews()
        toast({
          title: "Success!",
          description: successMessage,
        })

        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error(editingId ? "Failed to update article" : "Failed to publish article")
      }
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendNewsletterUpdate = async (articleId: string) => {
    try {
      setIsSending(articleId)
      console.log("[News Management] Sending newsletter for article:", articleId)
      const response = await fetch("/api/dashboard/news/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId: articleId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send newsletter")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: result.message || "Newsletter sent successfully",
      })
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading news articles...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        News Management
                      </h1>
                      <p className="text-gray-600 text-lg">Create, manage, and distribute news articles to your audience</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={refreshNews}
                    disabled={refreshing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        resetForm()
                        setIsDialogOpen(false)
                      } else {
                        setIsDialogOpen(true)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Plus className="w-4 h-4 mr-2" />
                        Add News Article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {editingId ? "Edit Article" : "Create New Article"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title *</label>
                          <Input
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            placeholder="Enter article title"
                            required
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Category *</label>
                          <Select
                            value={newArticle.doc_type}
                            onValueChange={(value) => {
                              const showCustom = value === "Other"
                              setShowCustomCategory(showCustom)
                              setNewArticle((prev) => ({
                                ...prev,
                                doc_type: value,
                                custom_category: showCustom ? prev.custom_category : "",
                              }))
                            }}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <span className="flex items-center gap-2">
                                    <span>{getCategoryEmoji(category.id)}</span>
                                    {category.name}
                                  </span>
                                </SelectItem>
                              ))}
                              <SelectItem value="Other">Other (Specify)</SelectItem>
                            </SelectContent>
                          </Select>

                          {showCustomCategory && (
                            <div className="mt-2">
                              <Input
                                value={newArticle.custom_category}
                                onChange={(e) =>
                                  setNewArticle((prev) => ({
                                    ...prev,
                                    custom_category: e.target.value,
                                  }))
                                }
                                placeholder="Enter custom category"
                                required={newArticle.doc_type === "Other"}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Content *</label>
                          <Textarea
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            placeholder="Enter article content"
                            rows={6}
                            required
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Media Files (Max 5)</label>

                          <DragDropUpload
                            onFilesSelected={handleDragDropFiles}
                            maxFiles={5 - (newArticle.attachments.length + newArticle.files.length)}
                            accept="image/*,.pdf,.doc,.docx,.txt,video/*"
                            multiple
                            disabled={newArticle.attachments.length + newArticle.files.length >= 5}
                          />

                          {/* Show existing attachments */}
                          {newArticle.attachments.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Existing Media
                                <Badge variant="secondary" className="text-xs">
                                  {newArticle.attachments.length} uploaded
                                </Badge>
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {newArticle.attachments.map((attachment, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={attachment.url || "/placeholder.svg"}
                                      alt={attachment.name || `Attachment ${index + 1}`}
                                      className="rounded-md h-24 w-full object-cover border-2 border-blue-200"
                                    />
                                    {index === 0 && (
                                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        Featured
                                      </div>
                                    )}
                                    {(() => {
                                      const totalImages =
                                        newArticle.attachments.filter((att) => att.type === "image").length +
                                        newArticle.files.filter((file) => file.type.startsWith("image/")).length
                                      const canDelete = totalImages > 1

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => removeFile(index, true)}
                                          disabled={!canDelete}
                                          className={`absolute -top-2 -right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                            canDelete
                                              ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                          }`}
                                          aria-label={canDelete ? "Remove image" : "Cannot remove last image"}
                                          title={canDelete ? "Remove image" : "At least one image must remain"}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )
                                    })()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show new file uploads */}
                          {newArticle.files.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New Uploads
                                <Badge variant="outline" className="text-xs border-green-200 text-green-800">
                                  {newArticle.files.length} pending
                                </Badge>
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {newArticle.files.map((file, index) => (
                                  <div key={index} className="relative group">
                                    {file.type.startsWith("image/") ? (
                                      <img
                                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                                        alt={file.name}
                                        className="rounded-md h-24 w-full object-cover border-2 border-green-200"
                                      />
                                    ) : (
                                      <div className="border-2 border-green-200 rounded-md p-2 h-24 flex items-center justify-center bg-muted">
                                        <span className="text-xs text-center break-words">{file.name}</span>
                                      </div>
                                    )}
                                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                      New
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index, false)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                      aria-label="Remove file"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* File upload input */}
                          <div className="mt-2">
                            <Input
                              type="file"
                              onChange={handleFileChange}
                              accept="image/*,.pdf,.doc,.docx,.txt,video/*"
                              multiple
                              disabled={newArticle.attachments.length + newArticle.files.length >= 5}
                              className="cursor-pointer border-gray-300"
                            />
                            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                              <span>{5 - (newArticle.attachments.length + newArticle.files.length)} of 5 slots remaining</span>
                              <span className="text-blue-600">Supported: Images, PDFs, Word docs, Videos</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between gap-4 pt-4 border-t">
                          <div>
                            {editingId && (
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDelete(editingId)}
                                disabled={isSubmitting}
                                className="shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                {isDeleting === editingId ? "Deleting..." : "Delete"}
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                resetForm()
                                setIsDialogOpen(false)
                              }}
                              disabled={isSubmitting}
                              className="bg-white/50 hover:bg-white border-gray-300"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={isSubmitting} 
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              {isSubmitting ? (editingId ? "Updating..." : "Publishing...") : editingId ? "Update Article" : "Publish Article"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Newspaper className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Articles</p>
                    <p className="text-3xl font-bold text-blue-900">{stats?.totalNews?.toLocaleString() ?? "0"}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Published articles
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
                    <p className="text-3xl font-bold text-emerald-900">{stats?.thisMonth?.toLocaleString() ?? "0"}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Recent activity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Views</p>
                    <p className="text-3xl font-bold text-purple-900">{stats?.totalViews?.toLocaleString() ?? "0"}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
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
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Emails Sent</p>
                    <p className="text-3xl font-bold text-amber-900">{stats?.emailsSent?.toLocaleString() ?? "0"}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Notifications sent
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
                      placeholder="Search articles by title, content, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          {category.id !== "all" && <span>{getCategoryEmoji(category.id)}</span>}
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredNews.length}</span> of <span className="font-semibold text-gray-900">{news.length}</span> articles
                  {searchTerm && ` matching "${searchTerm}"`}
                  {categoryFilter !== "all" && ` in category "${categoryFilter}"`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced News Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((article) => (
                <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden hover:scale-105">
                  <div className="relative">
                    {/* Image */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {article.attachments && article.attachments.length > 0 ? (
                        <AutoCarousel
                          images={article.attachments.filter((att) => att.type === "image").map((att) => att.url)}
                          className="w-full h-full"
                          imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            {getCategoryIcon(article.doc_type)}
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-700 border-gray-200 shadow-lg border flex items-center gap-1">
                          <span>{getCategoryEmoji(article.doc_type)}</span>
                          {article.doc_type}
                        </Badge>
                      </div>
                      
                      {/* Actions */}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(article.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Article
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => sendNewsletterUpdate(article.id)}
                              disabled={isSending === article.id}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {isSending === article.id ? "Sending..." : "Send Notification"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => handleDelete(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Article
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Title and Content */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        <Link href={`/news/${article.id}`}>
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {article.content.substring(0, 150)}...
                      </p>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      {article.views !== undefined && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Eye className="w-3 h-3 mr-1" />
                          {article.views} views
                        </div>
                      )}
                      {article.updated_at && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Updated {new Date(article.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(article.id)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendNewsletterUpdate(article.id)}
                        disabled={isSending === article.id}
                        className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {isSending === article.id ? "Sending..." : "Notify"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Newspaper className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || categoryFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by creating your first news article"}
                    </p>
                    {!searchTerm && categoryFilter === "all" && (
                      <Button 
                        onClick={() => setIsDialogOpen(true)} 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="mr-2 h-4 w-4" /> 
                        Create Your First Article
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}