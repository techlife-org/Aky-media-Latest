"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, Download, Search, Calendar, TrendingUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface Subscriber {
  id: string
  email: string
  subscribedAt: Date
  status: "active" | "unsubscribed"
  source: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    thisMonth: 0,
    growthRate: 0,
  })

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
      const response = await fetch("/api/dashboard/subscribers")
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
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-2">Manage your newsletter subscribers and send updates.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {((stats.active / stats.total) * 100).toFixed(1)}% active rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-3xl font-bold text-gray-900">+{stats.growthRate}%</p>
                  <p className="text-sm text-gray-500 mt-2">vs last month</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <Button onClick={exportSubscribers} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={sendNewsletter} className="bg-red-600 hover:bg-red-700">
            <Mail className="w-4 h-4 mr-2" />
            Send Newsletter
          </Button>
        </div>

        {/* Subscribers List */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{subscriber.email}</p>
                      <p className="text-sm text-gray-500">
                        Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()} via {subscriber.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        subscriber.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }
                    >
                      {subscriber.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {filteredSubscribers.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No subscribers found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
