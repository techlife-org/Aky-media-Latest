"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  ExternalLink
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

const getDeviceIcon = (device: string) => {
  const deviceLower = device.toLowerCase()
  if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
    return Smartphone
  } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
    return Tablet
  } else if (deviceLower.includes('desktop') || deviceLower.includes('pc') || deviceLower.includes('mac')) {
    return Laptop
  }
  return Monitor
}

export default function TrafficPage() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trafficRes, statsRes] = await Promise.all([
          fetch('/api/dashboard/traffic'),
          fetch('/api/dashboard/stats')
        ])

        if (!trafficRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch traffic data')
        }

        const [trafficData, statsData] = await Promise.all([
          trafficRes.json(),
          statsRes.json()
        ])

        setTrafficData({
          ...trafficData,
          recentVisitors: statsData.recentVisitors || []
        })
      } catch (err) {
        console.error('Error fetching traffic data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load traffic data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

interface DeviceIconProps {
  device: string;
  className?: string;
}

const DeviceIcon = ({ device, className = '' }: DeviceIconProps) => {
  const deviceLower = device.toLowerCase()
  const iconProps = { className: `h-4 w-4 text-muted-foreground ${className}` }
  
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

  useEffect(() => {
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
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!trafficData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No traffic data available yet. Check back later.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Traffic</h1>
          <p className="text-gray-600 mt-2">Monitor your website's performance and visitor analytics.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {trafficData.totalVisitors.toLocaleString()}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Today's Visitors</p>
                  <p className="text-3xl font-bold text-gray-900">{trafficData.todayVisitors.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Page Views</p>
                  <p className="text-3xl font-bold text-gray-900">{trafficData.pageViews.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+15.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{trafficData.bounceRate}%</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visitors Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Browser
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visited At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trafficData.recentVisitors?.map((visitor: any) => (
                    <tr key={visitor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visitor.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.city}, {visitor.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.device}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.browser}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visitor.visitedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficData.topPages?.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{page.page}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${page.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{page.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficData.deviceStats.map((device, index) => {
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <DeviceIcon device={device.device} className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{device.device}</p>
                          <p className="text-sm text-gray-500">{device.percentage}%</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{device.count.toLocaleString()}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trafficData.locationStats.map((location, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{location.city}</p>
                    <p className="text-sm text-gray-500">{location.country}</p>
                  </div>
                  <Badge variant="outline">{location.count.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
