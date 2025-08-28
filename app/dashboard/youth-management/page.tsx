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
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Users,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  UserPlus,
  TrendingUp,
  Activity,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Star,
  Shield,
  Award
} from "lucide-react"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"

interface Youth {
  _id: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  age: number
  ninNumber: string
  lga: string
  lgaCode: string
  occupation: string
  uniqueId: string
  status: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  registeredAt: string
  ninDocumentUrl?: string
}

export default function YouthManagement() {
  const [youth, setYouth] = useState<Youth[]>([])
  const [filteredYouth, setFilteredYouth] = useState<Youth[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [lgaFilter, setLgaFilter] = useState("all")
  const [selectedYouth, setSelectedYouth] = useState<Youth | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchYouth()
  }, [])

  useEffect(() => {
    filterYouth()
  }, [youth, searchQuery, statusFilter, lgaFilter])

  const fetchYouth = async () => {
    try {
      const response = await fetch("/api/admin/youth")
      const result = await response.json()
      
      if (response.ok) {
        setYouth(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error fetching youth:", error)
      toast.error("Failed to load youth data")
    } finally {
      setLoading(false)
    }
  }

  const filterYouth = () => {
    let filtered = youth

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(y => 
        y.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        y.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        y.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        y.phone.includes(searchQuery)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(y => y.approvalStatus === statusFilter)
    }

    // LGA filter
    if (lgaFilter !== "all") {
      filtered = filtered.filter(y => y.lga === lgaFilter)
    }

    setFilteredYouth(filtered)
  }

  const handleApprove = async (youthId: string) => {
    setActionLoading(youthId)
    try {
      const response = await fetch(`/api/admin/youth/${youthId}/approve`, {
        method: "POST"
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Youth approved successfully!")
        fetchYouth() // Refresh data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error approving youth:", error)
      toast.error("Failed to approve youth")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (youthId: string, reason: string) => {
    setActionLoading(youthId)
    try {
      const response = await fetch(`/api/admin/youth/${youthId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Youth rejected")
        fetchYouth() // Refresh data
        setRejectionReason("")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error rejecting youth:", error)
      toast.error("Failed to reject youth")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "LGA", "Occupation", "Unique ID", "Status", "Registration Date"].join(","),
      ...filteredYouth.map(y => [
        y.fullName,
        y.email,
        y.phone,
        y.lga,
        y.occupation,
        y.uniqueId,
        y.approvalStatus,
        new Date(y.registeredAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `youth-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueLGAs = [...new Set(youth.map(y => y.lga))].sort()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading youth data...</p>
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
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Youth Management
                      </h1>
                      <p className="text-gray-600 text-lg">Manage youth registrations, approvals, and engagement</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={exportData} 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Youth
                  </Button>
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
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Youth</p>
                    <p className="text-3xl font-bold text-blue-900">{youth.length}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% this month
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
                    <p className="text-sm font-medium text-amber-700">Pending</p>
                    <p className="text-3xl font-bold text-amber-900">{youth.filter(y => y.approvalStatus === 'pending').length}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Awaiting review
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
                    <p className="text-sm font-medium text-emerald-700">Approved</p>
                    <p className="text-3xl font-bold text-emerald-900">{youth.filter(y => y.approvalStatus === 'approved').length}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Active members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Rejected</p>
                    <p className="text-3xl font-bold text-red-900">{youth.filter(y => y.approvalStatus === 'rejected').length}</p>
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Need attention
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
                      placeholder="Search by name, email, unique ID, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={lgaFilter} onValueChange={setLgaFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                    <SelectValue placeholder="Filter by LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All LGAs</SelectItem>
                    {uniqueLGAs.map(lga => (
                      <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Youth Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Youth Registrations ({filteredYouth.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Review and manage youth program registrations
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredYouth.length} results
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Youth</TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700">Location</TableHead>
                      <TableHead className="font-semibold text-gray-700">Occupation</TableHead>
                      <TableHead className="font-semibold text-gray-700">Unique ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Registered</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredYouth.map((youthItem) => (
                      <TableRow key={youthItem._id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${youthItem.fullName}`} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {youthItem.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{youthItem.fullName}</p>
                              <p className="text-sm text-gray-500">Age: {youthItem.age} years</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">{youthItem.email}</p>
                            <p className="text-sm text-gray-500">{youthItem.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{youthItem.lga}</p>
                            <p className="text-sm text-gray-500">{youthItem.lgaCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">
                            {youthItem.occupation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-mono border border-blue-200">
                            {youthItem.uniqueId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(youthItem.approvalStatus)} flex items-center gap-1 w-fit border`}>
                            {getStatusIcon(youthItem.approvalStatus)}
                            {youthItem.approvalStatus.charAt(0).toUpperCase() + youthItem.approvalStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {new Date(youthItem.registeredAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500">
                              {new Date(youthItem.registeredAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* View Details */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedYouth(youthItem)}
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold text-gray-900">Youth Details</DialogTitle>
                                  <DialogDescription className="text-gray-600">
                                    Complete information for {selectedYouth?.fullName}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedYouth && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                      <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedYouth.fullName}`} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                                          {selectedYouth.fullName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedYouth.fullName}</h3>
                                        <p className="text-gray-600">{selectedYouth.occupation}</p>
                                        <Badge className={`${getStatusColor(selectedYouth.approvalStatus)} mt-2`}>
                                          {selectedYouth.approvalStatus.charAt(0).toUpperCase() + selectedYouth.approvalStatus.slice(1)}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <Mail className="w-5 h-5 text-blue-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">Email</p>
                                            <p className="font-semibold text-gray-900">{selectedYouth.email}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <Phone className="w-5 h-5 text-green-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">Phone</p>
                                            <p className="font-semibold text-gray-900">{selectedYouth.phone}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <Calendar className="w-5 h-5 text-purple-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                                            <p className="font-semibold text-gray-900">
                                              {new Date(selectedYouth.dateOfBirth).toLocaleDateString()} ({selectedYouth.age} years)
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <MapPin className="w-5 h-5 text-red-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">LGA</p>
                                            <p className="font-semibold text-gray-900">{selectedYouth.lga} ({selectedYouth.lgaCode})</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <Briefcase className="w-5 h-5 text-orange-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">Occupation</p>
                                            <p className="font-semibold text-gray-900">{selectedYouth.occupation}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <FileText className="w-5 h-5 text-indigo-500" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-600">NIN</p>
                                            <p className="font-semibold text-gray-900 font-mono">{selectedYouth.ninNumber}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {selectedYouth.ninDocumentUrl && (
                                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-sm font-medium text-blue-700 mb-3">NIN Document</p>
                                        <Button
                                          variant="outline"
                                          onClick={() => window.open(selectedYouth.ninDocumentUrl, '_blank')}
                                          className="bg-white hover:bg-blue-50 border-blue-300"
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Document
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Approve/Reject Actions */}
                            {youthItem.approvalStatus === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(youthItem._id)}
                                  disabled={actionLoading === youthItem._id}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  {actionLoading === youthItem._id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={actionLoading === youthItem._id}
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Registration</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting {youthItem.fullName}'s registration.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">Rejection Reason</Label>
                                        <Textarea
                                          id="reason"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="Enter the reason for rejection..."
                                          rows={3}
                                          className="mt-2"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setRejectionReason("")}>
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleReject(youthItem._id, rejectionReason)}
                                          disabled={!rejectionReason.trim() || actionLoading === youthItem._id}
                                        >
                                          {actionLoading === youthItem._id ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                          ) : null}
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredYouth.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No youth found</h3>
                  <p className="text-gray-500">No youth found matching your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}