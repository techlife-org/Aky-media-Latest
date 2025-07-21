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
  attachment?: {
    url: string
    type: 'image' | 'document' | 'video' | 'link'
    name?: string
  }
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
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    doc_type: "",
    attachment: {
      type: 'link',
      url: '',
      name: ''
    },
    file: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchNews()
    fetchStats()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/dashboard/news`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Handle both response formats: direct array or { data: array }
      const newsData = Array.isArray(result) ? result : (result.data || []);
      
      if (Array.isArray(newsData)) {
        // Transform the data to match the NewsArticle interface
        const formattedNews = newsData.map(article => ({
          id: article._id || article.id,
          title: article.title,
          content: article.content,
          doc_type: article.doc_type,
          created_at: article.created_at,
          views: article.views || 0,
          ...(article.attachment && { attachment: article.attachment })
        }));
        
        setNews(formattedNews);
      } else {
        console.error('Unexpected news data format:', newsData);
        setNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/dashboard/news/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Ensure we have the expected stats structure
      const defaultStats = {
        totalNews: 0,
        thisMonth: 0,
        totalViews: 0,
        emailsSent: 0,
        ...result // Spread any stats we get from the API
      };
      
      setStats(defaultStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load statistics');
      // Set default stats in case of error
      setStats({
        totalNews: 0,
        thisMonth: 0,
        totalViews: 0,
        emailsSent: 0
      });
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewArticle(prev => ({
        ...prev,
        file,
        attachment: {
          ...prev.attachment,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document'
        }
      }))
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '')
    formData.append('timestamp', (Date.now() / 1000).toString())

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Cloudinary upload error:', errorData)
        throw new Error(errorData.message || 'File upload failed')
      }

      return response.json()
    } catch (error) {
      console.error('Upload error:', error)
      throw error
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
      let attachmentUrl = newArticle.attachment.url

      // Handle file upload if a file is selected
      if (newArticle.file) {
        const uploadResponse = await uploadFile(newArticle.file)
        attachmentUrl = uploadResponse.secure_url
      }

      // Add news article with attachment
      const response = await fetch("/api/dashboard/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newArticle.title,
          content: newArticle.content,
          doc_type: newArticle.doc_type,
          ...(attachmentUrl && {
            attachment: {
              url: attachmentUrl,
              type: newArticle.attachment.type,
              name: newArticle.attachment.name || 'Attachment'
            }
          })
        }),
      })

      if (response.ok) {
        const article = await response.json()

        // Send email notification to subscribers
        await fetch("/api/dashboard/news/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: article.id,
            title: newArticle.title,
            content: newArticle.content,
            doc_type: newArticle.doc_type,
            attachment: attachmentUrl ? {
              url: attachmentUrl,
              type: newArticle.attachment.type,
              name: newArticle.attachment.name
            } : undefined
          }),
        })

        toast({
          title: "Success!",
          description: "News article published and subscribers notified.",
        })

        setNewArticle({
          title: "",
          content: "",
          doc_type: "",
          attachment: {
            type: 'link',
            url: '',
            name: ''
          },
          file: null
        })
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
      // First get the full article details
      const articleResponse = await fetch(`/api/dashboard/news/${articleId}`)
      if (!articleResponse.ok) {
        throw new Error('Failed to fetch article details')
      }
      const article = await articleResponse.json()

      // Then send the notification with full article data
      const response = await fetch("/api/dashboard/news/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          title: article.title,
          content: article.content,
          doc_type: article.doc_type,
          attachment: article.attachment || null
        }),
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <Textarea
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                        placeholder="Enter article content"
                        rows={6}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Attachment</label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Input
                            type="url"
                            value={newArticle.attachment.url}
                            onChange={(e) => setNewArticle(prev => ({
                              ...prev,
                              attachment: { ...prev.attachment, url: e.target.value, type: 'link' },
                              file: null
                            }))}
                            placeholder="Or enter a link"
                            className="w-full"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type="file"
                            id="file-upload"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300"
                          >
                            Upload File
                          </label>
                        </div>
                      </div>
                      {newArticle.file && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {newArticle.file.name} ({(newArticle.file.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>
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
        {loading ? (
          <div>Loading statistics...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total News</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalNews?.toLocaleString() ?? '0'}
                    </p>
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
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.thisMonth?.toLocaleString() ?? '0'}
                    </p>
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
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalViews?.toLocaleString() ?? '0'}
                    </p>
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
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.emailsSent?.toLocaleString() ?? '0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Notifications sent</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    <h3 className="font-medium text-gray-900 mb-2">{article?.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article?.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">{article?.doc_type}</Badge>
                      {article?.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article?.views} views
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
