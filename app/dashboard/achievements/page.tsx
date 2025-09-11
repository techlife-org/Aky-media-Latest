"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Award, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Activity, 
  RefreshCw, 
  Star,
  Download,
  Zap,
  Building,
  GraduationCap,
  Heart,
  DollarSign,
  Wheat,
  Leaf,
  Shield,
  Trophy,
  Sparkles
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { AchievementViewModal } from "@/components/achievement-view-modal"
import { useToast } from "@/hooks/use-toast"

interface Achievement {
  _id: string
  title: string
  description: string
  category: string
  status: "completed" | "ongoing" | "determined"
  progress: number
  date: string
  location: string
  impact: string
  details: string[]
  icon: string
  images?: string[]
}

export default function AchievementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
    const intervalId = setInterval(fetchAchievements, 30000)
    return () => clearInterval(intervalId)
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements", {
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Failed to fetch achievements")
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
      toast({
        title: "Error",
        description: "Failed to load achievements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshAchievements = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/achievements", {
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Failed to fetch achievements")
      const data = await response.json()
      setAchievements(data)
      toast({
        title: "Success",
        description: "Achievements refreshed successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error refreshing achievements:", error)
      toast({
        title: "Error",
        description: "Failed to refresh achievements",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    setExportLoading(true)
    try {
      // Build query parameters based on current filters
      const params = new URLSearchParams({
        format,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      })

      const response = await fetch(`/api/achievements/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to export achievements')
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `achievements_export_${new Date().toISOString().split('T')[0]}.${format}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `Achievements exported successfully as ${format.toUpperCase()}`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error('Error exporting achievements:', error)
      toast({
        title: "Error",
        description: "Failed to export achievements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteClick = (achievement: Achievement) => {
    setAchievementToDelete(achievement)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!achievementToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/achievements/${achievementToDelete._id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete achievement")

      toast({
        title: "Success",
        description: "Achievement deleted successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
      setDeleteModalOpen(false)
      setAchievementToDelete(null)
      await fetchAchievements()
    } catch (error) {
      console.error("Error deleting achievement:", error)
      toast({
        title: "Error",
        description: "Failed to delete achievement",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleView = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setViewModalOpen(true)
  }

  const sendAchievementNotification = async (achievementId: string) => {
    try {
      setIsSending(achievementId)
      console.log('[Achievement Management] Sending notification for achievement:', achievementId)
      const response = await fetch("/api/dashboard/achievements/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ achievementId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send achievement notification")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: result.message || "Achievement notification sent successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error sending achievement notification:", error)
      toast({
        title: "Error",
        description: "Failed to send achievement notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "determined":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "ongoing":
        return <Activity className="w-4 h-4" />
      case "determined":
        return <Target className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "infrastructure":
        return <Building className="w-6 h-6" />
      case "education":
        return <GraduationCap className="w-6 h-6" />
      case "healthcare":
        return <Heart className="w-6 h-6" />
      case "finance":
        return <DollarSign className="w-6 h-6" />
      case "agriculture":
        return <Wheat className="w-6 h-6" />
      case "environment":
        return <Leaf className="w-6 h-6" />
      case "security":
        return <Shield className="w-6 h-6" />
      default:
        return <Trophy className="w-6 h-6" />
    }
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "infrastructure":
        return "🏗️"
      case "education":
        return "🎓"
      case "healthcare":
        return "🏥"
      case "finance":
        return "💰"
      case "agriculture":
        return "🌾"
      case "environment":
        return "🌱"
      case "security":
        return "🛡️"
      default:
        return "🏆"
    }
  }

  // Calculate stats
  const stats = {
    total: achievements.length,
    completed: achievements.filter(a => a.status === 'completed').length,
    ongoing: achievements.filter(a => a.status === 'ongoing').length,
    determined: achievements.filter(a => a.status === 'determined').length,
    avgProgress: achievements.length > 0 ? Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length) : 0
  }

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "infrastructure", name: "Infrastructure" },
    { id: "education", name: "Education" },
    { id: "healthcare", name: "Healthcare" },
    { id: "finance", name: "Finance" },
    { id: "agriculture", name: "Agriculture" },
    { id: "environment", name: "Environment" },
    { id: "security", name: "Security" },
  ]

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || achievement.status === statusFilter
    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading achievements...</p>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-red-800 bg-clip-text text-transparent">
                        Achievement Management
                      </h1>
                      <p className="text-gray-600 text-lg">Track and manage government achievements and projects</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={refreshAchievements}
                    disabled={refreshing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={exportLoading}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Download className={`w-4 h-4 mr-2 ${exportLoading ? 'animate-pulse' : ''}`} />
                        {exportLoading ? 'Exporting...' : 'Export Report'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exportLoading}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('json')} disabled={exportLoading}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    onClick={() => router.push("/dashboard/achievements/new")}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      All projects
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
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Completed</p>
                    <p className="text-3xl font-bold text-emerald-900">{stats.completed}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total
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
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Ongoing</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.ongoing}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {stats.total > 0 ? Math.round((stats.ongoing / stats.total) * 100) : 0}% of total
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
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Determined</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.determined}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {stats.total > 0 ? Math.round((stats.determined / stats.total) * 100) : 0}% of total
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
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Avg Progress</p>
                    <p className="text-3xl font-bold text-indigo-900">{stats.avgProgress}%</p>
                    <p className="text-xs text-indigo-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Overall completion
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
                      placeholder="Search achievements by title, description, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="determined">Determined</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredAchievements.length}</span> of <span className="font-semibold text-gray-900">{achievements.length}</span> achievements
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== "all" && ` with status "${statusFilter}"`}
                  {categoryFilter !== "all" && ` in category "${categoryFilter}"`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Achievements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map((achievement) => (
                <Card key={achievement._id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden hover:scale-105">
                  <div className="relative">
                    {/* Image or Icon */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {achievement.images && achievement.images.length > 0 ? (
                        <img
                          src={achievement.images[0]}
                          alt={achievement.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            {getCategoryIcon(achievement.category)}
                            <span className="text-white">{getCategoryIcon(achievement.category)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${getStatusBadge(achievement.status)} flex items-center gap-1 shadow-lg border`}>
                          {getStatusIcon(achievement.status)}
                          {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
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
                            <DropdownMenuItem onClick={() => handleView(achievement)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/achievements/${achievement._id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Achievement
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => sendAchievementNotification(achievement._id)}
                              disabled={isSending === achievement._id}
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              {isSending === achievement._id ? "Sending..." : "Send Notification"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => handleDeleteClick(achievement)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Achievement
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Title and Description */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Badge variant="outline" className="capitalize border-gray-300 text-xs bg-gray-50">
                        <span className="mr-1">{getCategoryEmoji(achievement.category)}</span>
                        {achievement.category}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {achievement.location}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{achievement.progress}%</span>
                      </div>
                      <Progress 
                        value={achievement.progress} 
                        className="h-3 bg-gray-100"
                      />
                    </div>

                    {/* Impact */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium text-blue-700">Impact:</span> {achievement.impact}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(achievement)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/achievements/${achievement._id}`)}
                        className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAchievementNotification(achievement._id)}
                        disabled={isSending === achievement._id}
                        className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        {isSending === achievement._id ? "Sending..." : "Notify"}
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
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by adding your first achievement"}
                    </p>
                    {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
                      <Button 
                        onClick={() => router.push("/dashboard/achievements/new")}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="mr-2 h-4 w-4" /> 
                        Add Your First Achievement
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* View Modal */}
          <AchievementViewModal
            achievement={selectedAchievement}
            open={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false)
              setSelectedAchievement(null)
            }}
          />

          {/* Enhanced Delete Confirmation Modal */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Achievement
                </DialogTitle>
              </DialogHeader>
              {achievementToDelete && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Permanent Action Warning</h4>
                        <p className="text-sm text-red-700">
                          This action cannot be undone. The achievement and all its data will be permanently deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Achievement to delete:</h4>
                    <p className="text-gray-700 font-medium">{achievementToDelete.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{achievementToDelete.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusBadge(achievementToDelete.status)}>
                        {achievementToDelete.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{achievementToDelete.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleDelete} 
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700 text-white flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {deleteLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Permanently
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteModalOpen(false)}
                      disabled={deleteLoading}
                      className="flex-1 bg-white/50 hover:bg-white border-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  )
}