"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Mail, MessageSquare, TrendingUp, Globe, Eye, UserPlus, MapPin } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface DashboardStats {
  totalVisitors: number
  todayVisitors: number
  subscribers: number
  contactMessages: number
  pageViews: number
  bounceRate: number
}

interface Visitor {
  id: string
  ip: string
  country: string
  city: string
  device: string
  browser: string
  visitedAt: Date
  pages: string[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    subscribers: 0,
    contactMessages: 0,
    pageViews: 0,
    bounceRate: 0,
  })
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Ensure we have valid stats data with fallback values
      const statsData = data.stats || {}
      setStats({
        totalVisitors: statsData.totalVisitors || 0,
        todayVisitors: statsData.todayVisitors || 0,
        subscribers: statsData.subscribers || 0,
        contactMessages: statsData.contactMessages || 0,
        pageViews: statsData.pageViews || 0,
        bounceRate: statsData.bounceRate || 0,
      })
      
      setRecentVisitors(data.recentVisitors || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set fallback data on error
      setStats({
        totalVisitors: 0,
        todayVisitors: 0,
        subscribers: 0,
        contactMessages: 0,
        pageViews: 0,
        bounceRate: 0,
      })
      setRecentVisitors([])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Visitors",
      value: (stats?.totalVisitors || 0).toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Today's Visitors",
      value: (stats?.todayVisitors || 0).toLocaleString(),
      icon: TrendingUp,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Newsletter Subscribers",
      value: (stats?.subscribers || 0).toLocaleString(),
      icon: Mail,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Contact Messages",
      value: (stats?.contactMessages || 0).toLocaleString(),
      icon: MessageSquare,
      color: "bg-red-500",
      change: "+5%",
    },
    {
      title: "Page Views",
      value: (stats?.pageViews || 0).toLocaleString(),
      icon: Eye,
      color: "bg-orange-500",
      change: "+18%",
    },
    {
      title: "Bounce Rate",
      value: `${stats?.bounceRate || 0}%`,
      icon: BarChart3,
      color: "bg-gray-500",
      change: "-3%",
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your website.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        className={`${card.change.startsWith("+") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {card.change}
                      </Badge>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Visitors */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Visitors</h3>
              <div className="space-y-4">
                {recentVisitors.slice(0, 5).map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{visitor.ip}</p>
                        <p className="text-sm text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {visitor.city}, {visitor.country}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{visitor.device}</p>
                      <p className="text-xs text-gray-500">{new Date(visitor.visitedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
                <Button className="w-full justify-start bg-green-50 text-green-700 hover:bg-green-100">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Export Subscriber List
                </Button>
                <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Newsletter
                </Button>
                <Button className="w-full justify-start bg-red-50 text-red-700 hover:bg-red-100">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
