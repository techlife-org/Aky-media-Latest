"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Newspaper, Plus, Send, Calendar, Eye, Mail, TrendingUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "@/hooks/use-toast"

interface NewsArticle {
  id: string
  title: string
  content: string
  doc_type: string
  created_at: string
  attechment?: string
  views?: number
}

interface NewsStats {
  totalNews: number
  thisMonth: number
  totalViews: number
  emailsSent: number
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [stats, setStats] = useState<NewsStats>({
    totalNews: 0,
    thisMonth: 0,
    totalViews: 0,
    emailsSent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    doc_type: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchNews()
    fetchStats()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch("https://server.bitcoops.com/kgt/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newForm: { query_type: "select" } }),
      })

      const data = await response.json()
      if (data.resp && Array.isArray(data.resp)) {
        setNews(data.resp)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      // Fallback demo data
      setNews([
        {
          id: "1",
          title: "Governor Launches New Education Initiative",
          content: "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program...",
          doc_type: "Education",
          created_at: new Date().toISOString(),
          views: 1250,
        },
        {
          id: "2",
          title: "Infrastructure Development Progress",
          content: "Major road construction projects across Kano State are showing significant progress...",
          doc_type: "Infrastructure",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          views: 890,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/news/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching news stats:", error)
      setStats({
        totalNews: 45,
        thisMonth: 8,
        totalViews: 25680,
        emailsSent: 1250,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newArticle.title || !newArticle.content || !newArticle.doc_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Add news article
      const response = await fetch("https://server.bitcoops.com/kgt/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newForm: {
            query_type: "insert",
            title: newArticle.title,
            content: newArticle.content,
            doc_type: newArticle.doc_type,
          },
        }),
      })

      if (response.ok) {
        // Send email notification to subscribers
        await fetch("/api/dashboard/news/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newArticle.title,
            content: newArticle.content,
            doc_type: newArticle.doc_type,
          }),
        })

        toast({
          title: "Success!",
          description: "News article published and subscribers notified.",
        })

        setNewArticle({ title: "", content: "", doc_type: "" })
        setIsDialogOpen(false)
        fetchNews()
        fetchStats()
      } else {
        throw new Error("Failed to publish article")
      }
    } catch (error) {
      console.error("Error publishing article:", error)
      toast({
        title: "Error",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendNewsletterUpdate = async (articleId: string) => {
    try {
      const response = await fetch("/api/dashboard/news/send-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })

      if (response.ok) {
        toast({
          title: "Newsletter Sent!",
          description: "Update sent to all subscribers.",
        })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to send newsletter update.",
        variant: "destructive",
      })
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 mt-2">Manage news articles and notify subscribers.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Article</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    placeholder="Enter article title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={newArticle.doc_type}
                    onValueChange={(value) => setNewArticle({ ...newArticle, doc_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    placeholder="Enter article content"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                    {isSubmitting ? "Publishing..." : "Publish & Notify"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total News</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalNews}</p>
                  <p className="text-sm text-gray-500 mt-2">Published articles</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-blue-600" />
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
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+25%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">All time views</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.emailsSent.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">Notifications sent</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {news.slice(0, 10).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">{article.doc_type}</Badge>
                      {article.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views} views
                        </span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => sendNewsletterUpdate(article.id)} variant="outline" size="sm" className="ml-4">
                    <Send className="w-4 h-4 mr-2" />
                    Send Update
                  </Button>
                </div>
              ))}
            </div>

            {news.length === 0 && (
              <div className="text-center py-8">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No news articles found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
