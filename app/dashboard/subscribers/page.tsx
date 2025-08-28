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
import { Mail, Users, Download, Search, Calendar, TrendingUp, Eye, MessageSquare, UserCheck, UserX, Phone, CheckCircle, XCircle, MoreHorizontal, Filter, Trash2, AlertTriangle } from "lucide-react"
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
    const filtered = subscribers.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSubscribers(filtered)
  }, [searchTerm, subscribers])

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchTerm
      })
      const response = await fetch(`/api/dashboard/subscribers?${params}`)
      const data = await response.json()
      setSubscribers(data.subscribers)
      setFilteredSubscribers(data.subscribers)
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      // Fallback demo data
      const demoSubscribers = [
        {
          id: "1",
          email: "john.doe@example.com",
          subscribedAt: new Date("2024-01-15"),
          status: "active" as const,
          source: "Newsletter",
        },
        {
          id: "2",
          email: "jane.smith@example.com",
          subscribedAt: new Date("2024-01-20"),
          status: "active" as const,
          source: "Contact Form",
        },
        {
          id: "3",
          email: "ahmed.ibrahim@example.com",
          subscribedAt: new Date("2024-01-25"),
          status: "active" as const,
          source: "Newsletter",
        },
        {
          id: "4",
          email: "fatima.hassan@example.com",
          subscribedAt: new Date("2024-02-01"),
          status: "unsubscribed" as const,
          source: "Newsletter",
        },
        {
          id: "5",
          email: "muhammad.ali@example.com",
          subscribedAt: new Date("2024-02-05"),
          status: "active" as const,
          source: "Live Broadcast",
        },
      ]
      setSubscribers(demoSubscribers)
      setFilteredSubscribers(demoSubscribers)
      setStats({
        total: 1250,
        active: 1180,
        thisMonth: 85,
        growthRate: 12.5,
      })
    } finally {
      setLoading(false)
    }
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

  const exportSubscribers = async () => {
    try {
      const response = await fetch("/api/dashboard/subscribers/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting subscribers:", error)
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
        alert("Newsletter sent successfully!")
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-2">Manage your newsletter subscribers and send updates.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{stats.growthRate}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-900">{stats.active.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% active
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.unsubscribed.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.total > 0 ? ((stats.unsubscribed / stats.total) * 100).toFixed(1) : 0}% rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                  <p className="text-sm text-gray-500 mt-2">New subscribers</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Verified</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.emailVerified}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.total > 0 ? ((stats.emailVerified / stats.total) * 100).toFixed(1) : 0}% verified
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone Verified</p>
                  <p className="text-3xl font-bold text-indigo-900">{stats.phoneVerified}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.total > 0 ? ((stats.phoneVerified / stats.total) * 100).toFixed(1) : 0}% verified
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
          </div>
          <div className="flex gap-2">
            <Button onClick={exportSubscribers} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={sendNewsletter} className="bg-red-600 hover:bg-red-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Newsletter
            </Button>
          </div>
        </div>

        {/* Subscribers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Subscribers ({filteredSubscribers.length})</span>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{subscriber.name || 'No name'}</p>
                        {subscriber.emailVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" title="Email verified" />
                        )}
                        {subscriber.phone && subscriber.phoneVerified && (
                          <Phone className="w-4 h-4 text-blue-500" title="Phone verified" />
                        )}
                      </div>
                      <p className="text-gray-700 mb-1">{subscriber.email}</p>
                      {subscriber.phone && (
                        <p className="text-gray-600 text-sm mb-1">{subscriber.phone}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>via {subscriber.source}</span>
                        {subscriber.lastActive && (
                          <>
                            <span>•</span>
                            <span>Last active {new Date(subscriber.lastActive).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {subscriber.unsubscribedAt && (
                        <p className="text-sm text-orange-600 mt-1">
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
              ))}
            </div>

            {filteredSubscribers.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No subscribers match "${searchTerm}"` 
                    : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}subscribers found.`
                  }
                </p>
                {statusFilter !== 'active' && (
                  <Button
                    onClick={() => setStatusFilter('active')}
                    variant="outline"
                    className="mt-4"
                  >
                    View Active Subscribers
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {/* View Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subscriber Details</DialogTitle>
            </DialogHeader>
            {selectedSubscriber && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedSubscriber.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedSubscriber.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedSubscriber.phone || 'Not provided'}</p>
                  </div>
                  <div>
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
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subscribed</label>
                    <p className="text-gray-900">{new Date(selectedSubscriber.subscribedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Source</label>
                    <p className="text-gray-900">{selectedSubscriber.source}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Verification Status</label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      {selectedSubscriber.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">Email {selectedSubscriber.emailVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSubscriber.phoneVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">Phone {selectedSubscriber.phoneVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Notification Preferences</label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedSubscriber.preferences.emailNotifications} disabled />
                      <span className="text-sm">Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedSubscriber.preferences.smsNotifications} disabled />
                      <span className="text-sm">SMS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedSubscriber.preferences.whatsappNotifications} disabled />
                      <span className="text-sm">WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to Subscriber</DialogTitle>
            </DialogHeader>
            {selectedSubscriber && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Sending to: {selectedSubscriber.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Send via</label>
                  <div className="flex gap-4 mt-2">
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
                      <span className="text-sm">Email</span>
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
                          <span className="text-sm">SMS</span>
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
                          <span className="text-sm">WhatsApp</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={submitMessage} disabled={!messageText.trim() || messageChannels.length === 0}>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Subscriber Status</DialogTitle>
            </DialogHeader>
            {selectedSubscriber && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Subscriber: {selectedSubscriber.email}</p>
                  <p className="text-sm text-gray-600">Current status: <Badge className="ml-1">{selectedSubscriber.status}</Badge></p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
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
                  <label className="text-sm font-medium text-gray-700">Reason (optional)</label>
                  <Textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Enter reason for status change..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={submitStatusChange} disabled={!newStatus || newStatus === selectedSubscriber.status}>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Delete Subscriber
              </DialogTitle>
            </DialogHeader>
            {selectedSubscriber && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Permanent Action Warning</h4>
                      <p className="text-sm text-red-700">
                        This action cannot be undone. The subscriber and all their data will be permanently deleted from the system.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subscriber:</strong> {selectedSubscriber.name || 'No name'} ({selectedSubscriber.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> <Badge className="ml-1">{selectedSubscriber.status}</Badge>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Subscribed:</strong> {new Date(selectedSubscriber.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Reason for deletion (optional)</label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Enter reason for deleting this subscriber..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
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
    </DashboardLayout>
  )
}
