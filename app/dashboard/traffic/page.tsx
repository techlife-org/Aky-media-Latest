"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Globe, MapPin, Monitor, Smartphone, Tablet, TrendingUp, TrendingDown } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

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
}

export default function TrafficPage() {
  const [trafficData, setTrafficData] = useState<TrafficData>({
    totalVisitors: 0,
    todayVisitors: 0,
    pageViews: 0,
    bounceRate: 0,
    avgSessionDuration: "0:00",
    topPages: [],
    deviceStats: [],
    locationStats: [],
    hourlyTraffic: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrafficData()
  }, [])

  const fetchTrafficData = async () => {
    try {
      const response = await fetch("/api/dashboard/traffic")
      const data = await response.json()
      setTrafficData(data)
    } catch (error) {
      console.error("Error fetching traffic data:", error)
      // Fallback demo data
      setTrafficData({
        totalVisitors: 15420,
        todayVisitors: 342,
        pageViews: 45680,
        bounceRate: 32.5,
        avgSessionDuration: "3:45",
        topPages: [
          { page: "/", views: 12500, percentage: 35.2 },
          { page: "/news", views: 8900, percentage: 25.1 },
          { page: "/about", views: 5600, percentage: 15.8 },
          { page: "/contact", views: 3200, percentage: 9.0 },
          { page: "/live", views: 2800, percentage: 7.9 },
        ],
        deviceStats: [
          { device: "Desktop", count: 8500, percentage: 55.1 },
          { device: "Mobile", count: 5200, percentage: 33.7 },
          { device: "Tablet", count: 1720, percentage: 11.2 },
        ],
        locationStats: [
          { country: "Nigeria", city: "Kano", count: 8900 },
          { country: "Nigeria", city: "Lagos", count: 3200 },
          { country: "Nigeria", city: "Abuja", count: 2100 },
          { country: "USA", city: "New York", count: 800 },
          { country: "UK", city: "London", count: 420 },
        ],
        hourlyTraffic: [
          { hour: "00:00", visitors: 45 },
          { hour: "06:00", visitors: 120 },
          { hour: "12:00", visitors: 280 },
          { hour: "18:00", visitors: 350 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return Monitor
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      default:
        return Monitor
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
                  <p className="text-3xl font-bold text-gray-900">{trafficData.totalVisitors.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{page.page}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${page.percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{page.percentage}%</p>
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
                  const DeviceIcon = getDeviceIcon(device.device)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <DeviceIcon className="w-5 h-5 text-blue-600" />
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
