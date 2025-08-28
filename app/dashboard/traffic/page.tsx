"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Globe, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  Laptop,
  Calendar,
  Eye,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Activity,
  Clock,
  Download,
  RefreshCw,
  Zap,
  Target,
  MousePointer,
  Timer,
  Wifi,
  Signal,
  FileText
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface Visitor {
  _id: string
  ip: string
  country: string
  city: string
  device: string
  browser: string
  os: string
  visitedAt: string
  page?: string
  referrer?: string
  userAgent?: string
}

interface TrafficData {
  totalVisitors: number
  todayVisitors: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: string
  topPages: Array<{ page: string; views: number; percentage: number }>
  deviceStats: Array<{ device: string; count: number; percentage: number }>
  locationStats: Array<{ country: string; city: string; count: number }>
  hourlyTraffic: Array<{ hour: string; visitors: number }>
  recentVisitors?: Visitor[]
}

interface DeviceIconProps {
  device: string;
  className?: string;
}

const DeviceIcon = ({ device, className = '' }: DeviceIconProps) => {
  const deviceLower = device.toLowerCase()
  const iconProps = { className: `h-4 w-4 ${className}` }
  
  if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
    return <Smartphone {...iconProps} />
  } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
    return <Tablet {...iconProps} />
  } else if (deviceLower.includes('desktop') || deviceLower.includes('pc') || deviceLower.includes('mac')) {
    return <Laptop {...iconProps} />
  } else {
    return <Monitor {...iconProps} />
  }
}

export default function TrafficPage() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [trafficRes, statsRes] = await Promise.all([
        fetch('/api/dashboard/traffic'),
        fetch('/api/dashboard/stats')
      ])

      if (!trafficRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [trafficData, statsData] = await Promise.all([
        trafficRes.json(),
        statsRes.json()
      ])

      // Merge recent visitors from stats into traffic data
      setTrafficData({
        ...trafficData,
        recentVisitors: statsData.recentVisitors || []
      })
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading traffic analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative shadow-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Button 
              onClick={handleRefresh} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!trafficData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Traffic Data</h3>
            <p className="text-gray-500 mb-6">No traffic data available yet. Check back later.</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
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
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Website Traffic
                      </h1>
                      <p className="text-gray-600 text-lg">Monitor your website's performance and visitor analytics</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleRefresh}
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
                    <p className="text-sm font-medium text-blue-700">Total Visitors</p>
                    <p className="text-3xl font-bold text-blue-900">{trafficData.totalVisitors.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      All time visitors
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
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Today's Visitors</p>
                    <p className="text-3xl font-bold text-emerald-900">{trafficData.todayVisitors.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.2% from yesterday
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
                    <p className="text-sm font-medium text-purple-700">Page Views</p>
                    <p className="text-3xl font-bold text-purple-900">{trafficData.pageViews.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +15.3% this week
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
                    <p className="text-sm font-medium text-amber-700">Bounce Rate</p>
                    <p className="text-3xl font-bold text-amber-900">{trafficData.bounceRate}%</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -2.1% improvement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Visitors Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Recent Visitors
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Latest website visitors and their activity
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {trafficData.recentVisitors?.length || 0} visitors
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Device
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Browser
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Visited At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trafficData.recentVisitors?.map((visitor: any) => (
                      <tr key={visitor.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <Wifi className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-mono font-medium text-gray-900">{visitor.ip}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{visitor.city}</p>
                              <p className="text-xs text-gray-500">{visitor.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <DeviceIcon device={visitor.device} className="text-blue-600" />
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">
                              {visitor.device}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                              <Globe className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-700">{visitor.browser}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(visitor.visitedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(visitor.visitedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!trafficData.recentVisitors || trafficData.recentVisitors.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Visitors</h3>
                  <p className="text-gray-500">No visitor data available at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  Top Pages
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Most visited pages on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {trafficData.topPages?.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="font-semibold text-gray-900">{page.page}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="text-2xl font-bold text-gray-900">{page.views.toLocaleString()}</p>
                        <p className="text-sm text-purple-600 font-medium">{page.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  Device Breakdown
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Visitor device and platform statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {trafficData.deviceStats.map((device, index) => {
                    const colors = [
                      'from-blue-500 to-blue-600',
                      'from-emerald-500 to-emerald-600', 
                      'from-purple-500 to-purple-600',
                      'from-amber-500 to-amber-600'
                    ]
                    const bgColors = [
                      'from-blue-50 to-blue-100',
                      'from-emerald-50 to-emerald-100',
                      'from-purple-50 to-purple-100', 
                      'from-amber-50 to-amber-100'
                    ]
                    
                    return (
                      <div key={index} className={`flex items-center justify-between p-4 bg-gradient-to-r ${bgColors[index % bgColors.length]} rounded-xl hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <DeviceIcon device={device.device} className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{device.device}</p>
                            <p className="text-sm text-gray-600">{device.percentage}% of visitors</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 font-semibold px-3 py-1">
                          {device.count.toLocaleString()}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Top Locations
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Geographic distribution of your visitors
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {trafficData.locationStats.length} locations
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trafficData.locationStats.map((location, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{location.city}</p>
                      <p className="text-sm text-gray-600">{location.country}</p>
                    </div>
                    <Badge variant="outline" className="bg-white/80 text-gray-700 font-semibold">
                      {location.count.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}