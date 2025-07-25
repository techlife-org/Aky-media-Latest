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
import Link from "next/link"

interface NewsArticle {
  id: string
  title: string
  content: string
  doc_type: string
  created_at: string
  updated_at?: string
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [newArticle, setNewArticle] = useState({
    id: '',
    title: "",
    content: "",
    doc_type: "",
    custom_category: "",
    attachment: {
      type: 'link',
      url: '',
      name: ''
    },
    file: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSending, setIsSending] = useState<string | null>(null)

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
          updated_at: article.updated_at,
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

  const resetForm = () => {
    setNewArticle({
      id: '',
      title: "",
      content: "",
      doc_type: "",
      custom_category: "",
      attachment: {
        type: 'link',
        url: '',
        name: ''
      },
      file: null
    })
    setEditingId(null)
    setShowCustomCategory(false)
  }

  const handleEdit = async (articleId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
      const response = await fetch(`${baseUrl}/api/dashboard/news/${articleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch article details')
      }
      const article = await response.json()
      
      setEditingId(article.id)
      setNewArticle({
        id: article.id,
        title: article.title,
        content: article.content,
        doc_type: article.doc_type,
        custom_category: article.doc_type,
        attachment: article.attachment || {
          type: 'link',
          url: '',
          name: ''
        },
        file: null
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching article:', error)
      toast({
        title: "Error",
        description: "Failed to load article for editing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(id)
      const response = await fetch(`/api/dashboard/news/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNews(prev => prev.filter(article => article.id !== id))
        toast({
          title: "Success",
          description: "Article deleted successfully.",
        })
      } else {
        throw new Error('Failed to delete article')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const docType = newArticle.doc_type === 'Other' ? newArticle.custom_category : newArticle.doc_type
    
    if (!newArticle.title || !newArticle.content || !docType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let attachmentUrl = newArticle.attachment?.url

      // Handle file upload if a file is selected
      if (newArticle.file) {
        const uploadResponse = await uploadFile(newArticle.file)
        attachmentUrl = uploadResponse.secure_url
      }

      const articleData = {
        title: newArticle.title,
        content: newArticle.content,
        doc_type: docType,
        ...(attachmentUrl && {
          attachment: {
            url: attachmentUrl,
            type: newArticle.attachment?.type || 'link',
            name: newArticle.attachment?.name || 'Attachment'
          }
        })
      }

      let response: Response
      let successMessage = ""

      if (editingId) {
        // Update existing article
        response = await fetch(`/api/dashboard/news/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData)
        })
        successMessage = "Article updated successfully"
      } else {
        // Create new article
        response = await fetch("/api/dashboard/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData)
        })
        successMessage = "Article published successfully"
      }

      if (response.ok) {
        const article = await response.json()
        
        // Refresh the news list
        await fetchNews()
        
        toast({
          title: "Success!",
          description: successMessage,
        })

        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error(editingId ? "Failed to update article" : "Failed to publish article")
      }
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendNewsletterUpdate = async (articleId: string) => {
    try {
      setIsSending(articleId)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
      const response = await fetch(`${baseUrl}/api/dashboard/news/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsId: articleId }),
      })

      if (!response.ok) {
        throw new Error('Failed to send newsletter')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: result.message || "Newsletter sent successfully",
      })
    } catch (error) {
      console.error('Error sending newsletter:', error)
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(null)
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              resetForm()
              setIsDialogOpen(false)
            } else {
              setIsDialogOpen(true)
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Article' : 'Add New Article'}</DialogTitle>
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
                    onValueChange={(value) => {
                      const showCustom = value === 'Other'
                      setShowCustomCategory(showCustom)
                      setNewArticle(prev => ({
                        ...prev,
                        doc_type: value,
                        custom_category: showCustom ? prev.custom_category : ''
                      }))
                    }}
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
                      <SelectItem value="Other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {showCustomCategory && (
                    <div className="mt-2">
                      <Input
                        value={newArticle.custom_category}
                        onChange={(e) => setNewArticle(prev => ({
                          ...prev,
                          custom_category: e.target.value
                        }))}
                        placeholder="Enter custom category"
                        required={newArticle.doc_type === 'Other'}
                      />
                    </div>
                  )}
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
                <div className="flex justify-between gap-4">
                  <div>
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => handleDelete(editingId)}
                        disabled={isSubmitting}
                      >
                        {isDeleting === editingId ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        resetForm()
                        setIsDialogOpen(false)
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting 
                        ? (editingId ? 'Updating...' : 'Publishing...') 
                        : (editingId ? 'Update' : 'Publish')}
                    </Button>
                  </div>
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
            <div className="flex justify-between items-center">
              <CardTitle>Recent Articles</CardTitle>
              <div className="text-sm text-gray-500">
                Showing {news.length} of {news.length} articles
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {news.map((article) => (
                <div 
                  key={article.id} 
                  className="group flex flex-col h-full bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Image Section */}
                  {article.attachment?.url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={article.attachment.url} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  
                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-gray-900 mb-2 line-clamp-2">
                        <Link href={`/news/${article.id}`} className="hover:text-red-600">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {article.content.substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {article.doc_type}
                          </Badge>
                        </div>
                        {article.views !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{article.views} {article.views === 1 ? 'view' : 'views'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEdit(article.id)
                            }}
                            className="text-xs h-7 px-2"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(article.id)
                            }}
                            className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="xs"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            sendNewsletterUpdate(article.id)
                          }}
                          disabled={isSending === article.id}
                          className="text-xs h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {isSending === article.id ? 'Sending...' : 'Send Update'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {news.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No news articles found.</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Article
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
