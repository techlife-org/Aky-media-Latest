"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  Users, 
  Download, 
  Search, 
  Calendar, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  UserCheck, 
  UserX, 
  Phone, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal, 
  Filter, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Send,
  Sparkles,
  Activity,
  Clock,
  Star,
  UserPlus,
  X,
  SortAsc,
  SortDesc,
  Globe,
  Shield
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface Subscriber {
  id: string
  email: string
  phone?: string
  name?: string
  subscribedAt: Date
  unsubscribedAt?: Date
  status: "active" | "unsubscribed" | "terminated"
  source: string
  lastActive?: Date
  emailVerified: boolean
  phoneVerified: boolean
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
  }
}

interface SubscriberStats {
  total: number
  active: number
  unsubscribed: number
  terminated: number
  thisMonth: number
  growthRate: number
  emailVerified: number
  phoneVerified: number
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [messageChannels, setMessageChannels] = useState<string[]>(["email"])
  const [newStatus, setNewStatus] = useState<string>("")
  const [statusReason, setStatusReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "email">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    terminated: 0,
    thisMonth: 0,
    growthRate: 0,
    emailVerified: 0,
    phoneVerified: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscribers()
  }, [statusFilter])

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    const filtered = subscribers.filter((subscriber) => {
      const matchesSearch = 
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subscriber.phone && subscriber.phone.includes(searchTerm))
      
      const matchesDate = dateFilter === "all" || (() => {
        const now = new Date()
        const subDate = new Date(subscriber.subscribedAt)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        switch (dateFilter) {
          case "today": return subDate >= today
          case "week": return subDate >= weekAgo
          case "month": return subDate >= monthAgo
          default: return true
        }
      })()
      
      return matchesSearch && matchesDate
    })
    
    // Sort filtered results
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = new Date(a.subscribedAt).getTime() - new Date(b.subscribedAt).getTime()
          break
        case "name":
          comparison = (a.name || a.email).localeCompare(b.name || b.email)
          break
        case "email":
          comparison = a.email.localeCompare(b.email)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })
    
    setFilteredSubscribers(filtered)
  }, [searchTerm, subscribers, sortBy, sortOrder, dateFilter])

  const fetchSubscribers = async () => {
    try {
      setFetchError(null)
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchTerm
      })
      const response = await fetch(`/api/dashboard/subscribers?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSubscribers(data.subscribers)
      setFilteredSubscribers(data.subscribers)
      setStats(data.stats)
      
      if (refreshing) {
        toast({
          title: "Success",
          description: `Loaded ${data.subscribers?.length || 0} subscribers successfully`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load subscribers"
      setFetchError(errorMessage)
      
      // Fallback demo data
      const demoSubscribers = [
        {
          id: "1",
          email: "john.doe@example.com",
          name: "John Doe",
          phone: "+2348161781643",
          subscribedAt: new Date("2024-01-15"),
          status: "active" as const,
          source: "Newsletter",
          emailVerified: true,
          phoneVerified: true,
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            whatsappNotifications: true
          }
        },
        {
          id: "2",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          subscribedAt: new Date("2024-01-20"),
          status: "active" as const,
          source: "Contact Form",
          emailVerified: true,
          phoneVerified: false,
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            whatsappNotifications: false
          }
        },
        {
          id: "3",
          email: "ahmed.ibrahim@example.com",
          name: "Ahmed Ibrahim",
          phone: "+2347880234567",
          subscribedAt: new Date("2024-01-25"),
          status: "active" as const,
          source: "Newsletter",
          emailVerified: true,
          phoneVerified: true,
          preferences: {
            emailNotifications: true,
            smsNotifications: true,
            whatsappNotifications: true
          }
        },
        {
          id: "4",
          email: "fatima.hassan@example.com",
          name: "Fatima Hassan",
          subscribedAt: new Date("2024-02-01"),
          unsubscribedAt: new Date("2024-02-15"),
          status: "unsubscribed" as const,
          source: "Newsletter",
          emailVerified: true,
          phoneVerified: false,
          preferences: {
            emailNotifications: false,
            smsNotifications: false,
            whatsappNotifications: false
          }
        },
        {
          id: "5",
          email: "muhammad.ali@example.com",
          name: "Muhammad Ali",
          phone: "+2349012345678",
          subscribedAt: new Date("2024-02-05"),
          status: "active" as const,
          source: "Live Broadcast",
          emailVerified: true,
          phoneVerified: true,
          preferences: {
            emailNotifications: true,
            smsNotifications: true,
            whatsappNotifications: true
          }
        },
      ]
      setSubscribers(demoSubscribers)
      setFilteredSubscribers(demoSubscribers)
      setStats({
        total: 1250,
        active: 1180,
        unsubscribed: 65,
        terminated: 5,
        thisMonth: 85,
        growthRate: 12.5,
        emailVerified: 1200,
        phoneVerified: 850,
      })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchSubscribers()
  }

  const exportSubscribers = () => {
    const csvContent = [
      ['Date', 'Name', 'Email', 'Phone', 'Status', 'Source', 'Email Verified', 'Phone Verified'],
      ...filteredSubscribers.map(sub => [
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.name || '',
        sub.email,
        sub.phone || '',
        sub.status,
        sub.source,
        sub.emailVerified ? 'Yes' : 'No',
        sub.phoneVerified ? 'Yes' : 'No'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Success",
      description: "Subscribers exported successfully",
      className: "bg-green-50 border-green-200 text-green-800",
    })
  }

  const handleViewDetails = async (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setShowDetailsModal(true)
  }

  const handleSendMessage = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setMessageText("")
    setMessageChannels(["email"])
    setShowMessageModal(true)
  }

  const handleChangeStatus = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setNewStatus(subscriber.status)
    setStatusReason("")
    setShowStatusModal(true)
  }

  const handleDeleteSubscriber = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setDeleteReason("")
    setShowDeleteModal(true)
  }

  const submitMessage = async () => {
    if (!selectedSubscriber || !messageText.trim()) return

    try {
      const response = await fetch('/api/dashboard/subscribers/manage?action=send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: selectedSubscriber.id,
          message: messageText,
          channels: messageChannels
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Message Sent",
          description: "Message sent successfully to subscriber",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setShowMessageModal(false)
      } else {
        toast({
          title: "Failed to Send Message",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const submitStatusChange = async () => {
    if (!selectedSubscriber || !newStatus) return

    try {
      const response = await fetch('/api/dashboard/subscribers/manage?action=update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: selectedSubscriber.id,
          status: newStatus,
          reason: statusReason
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Subscriber status changed to ${newStatus}`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setShowStatusModal(false)
        fetchSubscribers() // Refresh the list
      } else {
        toast({
          title: "Failed to Update Status",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const submitDelete = async () => {
    if (!selectedSubscriber) return

    try {
      const response = await fetch('/api/dashboard/subscribers/manage?action=delete-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: selectedSubscriber.id,
          reason: deleteReason
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Subscriber Deleted",
          description: `Subscriber ${selectedSubscriber.email} has been permanently deleted`,
          className: "bg-red-50 border-red-200 text-red-800",
        })
        setShowDeleteModal(false)
        fetchSubscribers() // Refresh the list
      } else {
        toast({
          title: "Failed to Delete Subscriber",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      })
    }
  }

  const handleResubscribe = async (email: string) => {
    try {
      const response = await fetch('/api/newsletter/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Resubscribed Successfully",
          description: data.message,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        fetchSubscribers() // Refresh the list
      } else {
        toast({
          title: "Failed to Resubscribe",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resubscribe",
        variant: "destructive",
      })
    }
  }

  const sendNewsletter = async () => {
    try {
      const response = await fetch("/api/dashboard/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "manual" }),
      })
      if (response.ok) {
        toast({
          title: "Newsletter Sent",
          description: "Newsletter sent successfully to all active subscribers",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="p-6 space-y-8">
            {/* Header Skeleton */}
            <div className="relative overflow-hidden">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 rounded-lg p-6 animate-pulse shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-red-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-red-800 bg-clip-text text-transparent">
                        Newsletter Subscribers
                      </h1>
                      <div className="flex items-center gap-3">
                        <p className="text-gray-600 text-lg">Manage your newsletter subscribers and send updates</p>
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                          {loading ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              Loading...
                            </div>
                          ) : fetchError ? (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Error
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Connected
                            </div>
                          )}
                        </div>
                      </div>
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
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button 
                    onClick={exportSubscribers}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={sendNewsletter}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Newsletter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Total Subscribers</p>
                    <p className="text-3xl font-bold text-red-900">{stats.total.toLocaleString()}</p>
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.growthRate}% growth
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
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Active</p>
                    <p className="text-3xl font-bold text-green-900">{stats.active.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% active
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
                    <XCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Unsubscribed</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.unsubscribed.toLocaleString()}</p>
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stats.total > 0 ? ((stats.unsubscribed / stats.total) * 100).toFixed(1) : 0}% rate
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
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">This Month</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.thisMonth}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      New subscribers
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
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Email Verified</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.emailVerified}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {stats.total > 0 ? ((stats.emailVerified / stats.total) * 100).toFixed(1) : 0}% verified
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
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Phone Verified</p>
                    <p className="text-3xl font-bold text-indigo-900">{stats.phoneVerified}</p>
                    <p className="text-xs text-indigo-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {stats.total > 0 ? ((stats.phoneVerified / stats.total) * 100).toFixed(1) : 0}% verified
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {fetchError && (
            <Card className="bg-red-50 border-red-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
                    <p className="text-red-600 text-sm">{fetchError}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setFetchError(null)
                      fetchSubscribers()
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="unsubscribed">Unsubscribed Only</SelectItem>
                      <SelectItem value="terminated">Terminated Only</SelectItem>
                      <SelectItem value="all">All Subscribers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Date Filter */}
                <div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sort Options */}
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: "date" | "name" | "email") => setSortBy(value)}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-12 w-12 border-gray-300"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Filter Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Showing <span className="font-semibold text-gray-900">{filteredSubscribers.length}</span> of <span className="font-semibold text-gray-900">{subscribers.length}</span> subscribers</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                    {dateFilter !== "all" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Status: {statusFilter}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Sort: {sortBy} ({sortOrder})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Subscribers List */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Subscribers ({filteredSubscribers.length})
                </CardTitle>
                {statusFilter === 'unsubscribed' && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Showing Unsubscribed
                  </Badge>
                )}
                {statusFilter === 'terminated' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Showing Terminated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredSubscribers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No subscribers found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || dateFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}subscribers found.`}
                  </p>
                  {statusFilter !== 'active' && (
                    <Button
                      onClick={() => setStatusFilter('active')}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Active Subscribers
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => (
                    <div key={subscriber.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">{subscriber.name || 'No name'}</p>
                              {subscriber.emailVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" title="Email verified" />
                              )}
                              {subscriber.phone && subscriber.phoneVerified && (
                                <Phone className="w-4 h-4 text-blue-500" title="Phone verified" />
                              )}
                            </div>
                            <p className="text-gray-700 mb-1 truncate">{subscriber.email}</p>
                            {subscriber.phone && (
                              <p className="text-gray-600 text-sm mb-1">{subscriber.phone}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(subscriber.subscribedAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {subscriber.source}
                              </span>
                              {subscriber.lastActive && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Last active {new Date(subscriber.lastActive).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                            {subscriber.unsubscribedAt && (
                              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Unsubscribed {new Date(subscriber.unsubscribedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              subscriber.status === "active" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : subscriber.status === "unsubscribed"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {subscriber.status}
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {/* View Details */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(subscriber)}
                              title="View Details"
                              className="border-gray-300 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {/* Send Message - only for active subscribers */}
                            {subscriber.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage(subscriber)}
                                title="Send Message"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Change Status */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangeStatus(subscriber)}
                              title="Change Status"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              {subscriber.status === 'active' ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                            
                            {/* Quick Resubscribe for unsubscribed users */}
                            {subscriber.status === 'unsubscribed' && (
                              <Button
                                size="sm"
                                onClick={() => handleResubscribe(subscriber.email)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                title="Resubscribe"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSubscriber(subscriber)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              title="Delete Subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modals remain the same but with enhanced styling */}
          {/* View Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 -m-6 mb-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-gray-900">Subscriber Details</DialogTitle>
                    <p className="text-sm text-gray-600">View complete subscriber information</p>
                  </div>
                </div>
              </DialogHeader>
              {selectedSubscriber && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{selectedSubscriber.name || 'Not provided'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 font-medium">{selectedSubscriber.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 font-medium">{selectedSubscriber.phone || 'Not provided'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge className={
                        selectedSubscriber.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : selectedSubscriber.status === "unsubscribed"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }>
                        {selectedSubscriber.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Subscribed</label>
                      <p className="text-gray-900 font-medium">{new Date(selectedSubscriber.subscribedAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Source</label>
                      <p className="text-gray-900 font-medium">{selectedSubscriber.source}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Verification Status</label>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        {selectedSubscriber.emailVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Email {selectedSubscriber.emailVerified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedSubscriber.phoneVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Phone {selectedSubscriber.phoneVerified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Notification Preferences</label>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedSubscriber.preferences.emailNotifications} disabled />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedSubscriber.preferences.smsNotifications} disabled />
                        <span className="text-sm font-medium">SMS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedSubscriber.preferences.whatsappNotifications} disabled />
                        <span className="text-sm font-medium">WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Send Message Modal */}
          <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 -m-6 mb-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-gray-900">Send Message to Subscriber</DialogTitle>
                    <p className="text-sm text-gray-600">Send a personalized message</p>
                  </div>
                </div>
              </DialogHeader>
              {selectedSubscriber && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">Sending to: {selectedSubscriber.name || 'No name'} ({selectedSubscriber.email})</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message..."
                      rows={6}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{messageText.length} characters</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Send via</label>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={messageChannels.includes('email')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMessageChannels([...messageChannels, 'email'])
                            } else {
                              setMessageChannels(messageChannels.filter(c => c !== 'email'))
                            }
                          }}
                        />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      {selectedSubscriber.phone && (
                        <>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={messageChannels.includes('sms')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMessageChannels([...messageChannels, 'sms'])
                                } else {
                                  setMessageChannels(messageChannels.filter(c => c !== 'sms'))
                                }
                              }}
                            />
                            <span className="text-sm font-medium">SMS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={messageChannels.includes('whatsapp')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMessageChannels([...messageChannels, 'whatsapp'])
                                } else {
                                  setMessageChannels(messageChannels.filter(c => c !== 'whatsapp'))
                                }
                              }}
                            />
                            <span className="text-sm font-medium">WhatsApp</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      onClick={submitMessage} 
                      disabled={!messageText.trim() || messageChannels.length === 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Change Status Modal */}
          <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
            <DialogContent className="max-w-xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100 -m-6 mb-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-gray-900">Change Subscriber Status</DialogTitle>
                    <p className="text-sm text-gray-600">Update subscriber status and preferences</p>
                  </div>
                </div>
              </DialogHeader>
              {selectedSubscriber && (
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-800 font-medium mb-1">Subscriber: {selectedSubscriber.name || 'No name'} ({selectedSubscriber.email})</p>
                    <p className="text-sm text-purple-700">Current status: <Badge className="ml-1">{selectedSubscriber.status}</Badge></p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">New Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Reason (optional)</label>
                    <Textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Enter reason for status change..."
                      rows={3}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      onClick={submitStatusChange} 
                      disabled={!newStatus || newStatus === selectedSubscriber.status}
                      className="bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Update Status
                    </Button>
                    <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-100 -m-6 mb-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-red-800">Delete Subscriber</DialogTitle>
                    <p className="text-sm text-red-600">This action cannot be undone</p>
                  </div>
                </div>
              </DialogHeader>
              {selectedSubscriber && (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Permanent Action Warning</h4>
                        <p className="text-sm text-red-700">
                          This action cannot be undone. The subscriber and all their data will be permanently deleted from the system.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Subscriber:</strong> {selectedSubscriber.name || 'No name'} ({selectedSubscriber.email})
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Status:</strong> <Badge className="ml-1">{selectedSubscriber.status}</Badge>
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Subscribed:</strong> {new Date(selectedSubscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Reason for deletion (optional)</label>
                    <Textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Enter reason for deleting this subscriber..."
                      rows={3}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      onClick={submitDelete} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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