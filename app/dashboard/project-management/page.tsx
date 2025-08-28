"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  FolderKanban,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Plus,
  TrendingUp,
  Activity,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Star,
  Shield,
  Award,
  Users,
  Target,
  DollarSign,
  PlayCircle,
  PauseCircle,
  StopCircle,
  BarChart3,
  RefreshCw,
  Sparkles,
  Zap
} from "lucide-react"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"

interface Project {
  _id: string
  title: string
  description: string
  category: string
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number
  allocated: number
  spent: number
  startDate: string
  endDate: string
  progress: number
  manager: string
  team: string[]
  location: string
  beneficiaries: number
  createdAt: string
  updatedAt: string
}

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  planningProjects: number
  onHoldProjects: number
  cancelledProjects: number
  thisMonthProjects: number
  totalBudget: number
  totalAllocated: number
  totalSpent: number
  totalBeneficiaries: number
  averageProgress: number
  budgetUtilization: number
  completionRate: number
}

interface NewProject {
  title: string
  description: string
  category: string
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number
  allocated: number
  spent: number
  startDate: string
  endDate: string
  progress: number
  manager: string
  team: string[]
  location: string
  beneficiaries: number
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProject, setNewProject] = useState<NewProject>({
    title: "",
    description: "",
    category: "",
    status: "planning",
    priority: "medium",
    budget: 0,
    allocated: 0,
    spent: 0,
    startDate: "",
    endDate: "",
    progress: 0,
    manager: "",
    team: [],
    location: "",
    beneficiaries: 0
  })

  useEffect(() => {
    fetchProjects()
    fetchStats()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, statusFilter, categoryFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/projects/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to load project statistics")
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchProjects(), fetchStats()])
      toast.success("Data refreshed successfully")
    } catch (error) {
      toast.error("Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      await fetchProjects()
      await fetchStats()
      setShowCreateDialog(false)
      resetForm()
      toast.success("Project created successfully")
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setActionLoading(projectId)
    try {
      const response = await fetch(`/api/dashboard/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      await fetchProjects()
      await fetchStats()
      toast.success("Project deleted successfully")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    } finally {
      setActionLoading(null)
    }
  }

  const resetForm = () => {
    setNewProject({
      title: "",
      description: "",
      category: "",
      status: "planning",
      priority: "medium",
      budget: 0,
      allocated: 0,
      spent: 0,
      startDate: "",
      endDate: "",
      progress: 0,
      manager: "",
      team: [],
      location: "",
      beneficiaries: 0
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4" />
      case 'planning': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'on-hold': return <PauseCircle className="w-4 h-4" />
      case 'cancelled': return <StopCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const exportData = () => {
    const csvContent = [
      ["Title", "Category", "Status", "Priority", "Budget", "Progress", "Manager", "Location", "Beneficiaries", "Start Date", "End Date"].join(","),
      ...filteredProjects.map(p => [
        p.title,
        p.category,
        p.status,
        p.priority,
        p.budget,
        `${p.progress}%`,
        p.manager,
        p.location,
        p.beneficiaries,
        new Date(p.startDate).toLocaleDateString(),
        new Date(p.endDate).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `projects-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueCategories = [...new Set(projects.map(p => p.category))].sort()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading project data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                        Project Management
                      </h1>
                      <p className="text-gray-600 text-lg">Track and manage government projects and initiatives</p>
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
                    onClick={exportData} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">Create New Project</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Add a new government project to track progress and manage resources
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateProject} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Project Title *</Label>
                            <Input
                              id="title"
                              value={newProject.title}
                              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                              placeholder="Enter project title"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Input
                              id="category"
                              value={newProject.category}
                              onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                              placeholder="e.g., Education, Healthcare, Infrastructure"
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            placeholder="Describe the project objectives and scope"
                            required
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={newProject.status} onValueChange={(value: any) => setNewProject({ ...newProject, status: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={newProject.priority} onValueChange={(value: any) => setNewProject({ ...newProject, priority: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="budget">Budget (₦) *</Label>
                            <Input
                              id="budget"
                              type="number"
                              value={newProject.budget}
                              onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                              placeholder="0"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="allocated">Allocated (₦) *</Label>
                            <Input
                              id="allocated"
                              type="number"
                              value={newProject.allocated}
                              onChange={(e) => setNewProject({ ...newProject, allocated: Number(e.target.value) })}
                              placeholder="0"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="spent">Spent (₦)</Label>
                            <Input
                              id="spent"
                              type="number"
                              value={newProject.spent}
                              onChange={(e) => setNewProject({ ...newProject, spent: Number(e.target.value) })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={newProject.startDate}
                              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={newProject.endDate}
                              onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="manager">Project Manager *</Label>
                            <Input
                              id="manager"
                              value={newProject.manager}
                              onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                              placeholder="Enter manager name"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              value={newProject.location}
                              onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                              placeholder="Project location"
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="progress">Progress (%)</Label>
                            <Input
                              id="progress"
                              type="number"
                              min="0"
                              max="100"
                              value={newProject.progress}
                              onChange={(e) => setNewProject({ ...newProject, progress: Number(e.target.value) })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="beneficiaries">Beneficiaries</Label>
                            <Input
                              id="beneficiaries"
                              type="number"
                              value={newProject.beneficiaries}
                              onChange={(e) => setNewProject({ ...newProject, beneficiaries: Number(e.target.value) })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCreateDialog(false)
                              resetForm()
                            }}
                            disabled={isSubmitting}
                            className="bg-white/50 hover:bg-white border-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {isSubmitting ? "Creating..." : "Create Project"}
                          </Button>
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
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FolderKanban className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Projects</p>
                    <p className="text-3xl font-bold text-purple-900">{stats?.totalProjects || 0}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {stats?.thisMonthProjects || 0} this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Projects</p>
                    <p className="text-3xl font-bold text-green-900">{stats?.activeProjects || 0}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      In progress
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
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats?.totalBudget || 0)}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {stats?.budgetUtilization || 0}% utilized
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Beneficiaries</p>
                    <p className="text-3xl font-bold text-orange-900">{(stats?.totalBeneficiaries || 0).toLocaleString()}</p>
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      People impacted
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
                      placeholder="Search projects by title, description, manager, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Projects Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Projects ({filteredProjects.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Monitor project progress, budgets, and deliverables
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {filteredProjects.length} results
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Project</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Progress</TableHead>
                      <TableHead className="font-semibold text-gray-700">Budget</TableHead>
                      <TableHead className="font-semibold text-gray-700">Manager</TableHead>
                      <TableHead className="font-semibold text-gray-700">Timeline</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project._id} className="hover:bg-purple-50/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">{project.title}</p>
                            <p className="text-sm text-gray-500">{project.category}</p>
                            <Badge className={`${getPriorityColor(project.priority)} text-xs`}>
                              {project.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(project.status)} flex items-center gap-1 w-fit border`}>
                            {getStatusIcon(project.status)}
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
                            <p className="text-xs text-gray-500">Spent: {formatCurrency(project.spent)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.manager}`} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs">
                                {project.manager.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{project.manager}</p>
                              <p className="text-xs text-gray-500">{project.team.length} team members</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">{project.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProject(project)}
                                  className="hover:bg-purple-50 hover:border-purple-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold text-gray-900">Project Details</DialogTitle>
                                  <DialogDescription className="text-gray-600">
                                    Complete information for {selectedProject?.title}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedProject && (
                                  <div className="space-y-6">
                                    {/* Project Header */}
                                    <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                                      <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                          <h3 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h3>
                                          <p className="text-gray-600">{selectedProject.description}</p>
                                          <div className="flex items-center gap-3">
                                            <Badge className={`${getStatusColor(selectedProject.status)}`}>
                                              {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                                            </Badge>
                                            <Badge className={`${getPriorityColor(selectedProject.priority)}`}>
                                              {selectedProject.priority.toUpperCase()} Priority
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-3xl font-bold text-purple-900">{selectedProject.progress}%</p>
                                          <p className="text-sm text-gray-600">Complete</p>
                                          <Progress value={selectedProject.progress} className="w-24 mt-2" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Project Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="p-4">
                                          <div className="flex items-center gap-3">
                                            <DollarSign className="w-8 h-8 text-blue-600" />
                                            <div>
                                              <p className="text-sm text-blue-700">Total Budget</p>
                                              <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedProject.budget)}</p>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-green-50 border-green-200">
                                        <CardContent className="p-4">
                                          <div className="flex items-center gap-3">
                                            <Target className="w-8 h-8 text-green-600" />
                                            <div>
                                              <p className="text-sm text-green-700">Beneficiaries</p>
                                              <p className="text-xl font-bold text-green-900">{selectedProject.beneficiaries.toLocaleString()}</p>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-orange-50 border-orange-200">
                                        <CardContent className="p-4">
                                          <div className="flex items-center gap-3">
                                            <Users className="w-8 h-8 text-orange-600" />
                                            <div>
                                              <p className="text-sm text-orange-700">Team Size</p>
                                              <p className="text-xl font-bold text-orange-900">{selectedProject.team.length + 1}</p>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Project Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Project Information</h4>
                                        
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-purple-500" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-600">Category</p>
                                              <p className="font-semibold text-gray-900">{selectedProject.category}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <MapPin className="w-5 h-5 text-red-500" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-600">Location</p>
                                              <p className="font-semibold text-gray-900">{selectedProject.location}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-600">Timeline</p>
                                              <p className="font-semibold text-gray-900">
                                                {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Budget Breakdown</h4>
                                        
                                        <div className="space-y-3">
                                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-blue-700">Total Budget</span>
                                              <span className="font-bold text-blue-900">{formatCurrency(selectedProject.budget)}</span>
                                            </div>
                                          </div>

                                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-green-700">Allocated</span>
                                              <span className="font-bold text-green-900">{formatCurrency(selectedProject.allocated)}</span>
                                            </div>
                                          </div>

                                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-orange-700">Spent</span>
                                              <span className="font-bold text-orange-900">{formatCurrency(selectedProject.spent)}</span>
                                            </div>
                                          </div>

                                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-purple-700">Remaining</span>
                                              <span className="font-bold text-purple-900">{formatCurrency(selectedProject.allocated - selectedProject.spent)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Team Information */}
                                    <div className="space-y-4">
                                      <h4 className="text-lg font-semibold text-gray-900">Project Team</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedProject.manager}`} />
                                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                                {selectedProject.manager.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-semibold text-gray-900">{selectedProject.manager}</p>
                                              <p className="text-sm text-purple-600">Project Manager</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <p className="text-sm font-medium text-gray-600">Team Members</p>
                                          {selectedProject.team.map((member, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                              <Avatar className="w-8 h-8">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member}`} />
                                                <AvatarFallback className="bg-gray-400 text-white text-xs">
                                                  {member.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-sm text-gray-900">{member}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProject(project._id)}
                              disabled={actionLoading === project._id}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              {actionLoading === project._id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                      ? "No projects found matching your search criteria"
                      : "Get started by creating your first project"}
                  </p>
                  {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="mr-2 h-4 w-4" /> 
                      Create Your First Project
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}