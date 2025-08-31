"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { getBlogApiUrl } from "@/lib/api-config"
import AutoCarousel from "./auto-carousel"

interface BlogPost {
  id: string
  title: string
  content: string
  attachments?: (string | { url?: string; secure_url?: string })[]
  created_at: string
  doc_type?: string
}

export default function NewsSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Ensure we're running in the browser
        if (typeof window === 'undefined') {
          console.log("[News Section] Skipping fetch - running on server")
          return
        }

        console.log("[News Section] Fetching news from /api/news")
        // Use relative URL for client-side fetches
        const response = await fetch("/api/news", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[News Section] API response data:", data)

        if (Array.isArray(data)) {
          const sortedBlogs = data
            .sort((a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .map((blog: BlogPost) => {
              console.log("[News Section] Processing blog:", blog.title, "attachments:", blog.attachments)

              const processedAttachments =
                blog.attachments?.map((attachment) => {
                  let attachmentUrl: string

                  // Handle case where attachment is an object with url property
                  if (typeof attachment === "object" && attachment !== null) {
                    attachmentUrl = (attachment as any).url || (attachment as any).secure_url || ""
                  } else if (typeof attachment === "string") {
                    attachmentUrl = attachment
                  } else {
                    console.warn("[v0] Invalid attachment format:", attachment)
                    return ""
                  }

                  if (attachmentUrl.startsWith("http")) {
                    return attachmentUrl
                  }
                  if (attachmentUrl.startsWith("/")) {
                    return attachmentUrl
                  }
                  return `/uploads/${attachmentUrl}`
                }) || []

              console.log("[News Section] Processed attachments:", processedAttachments)

              return {
                ...blog,
                attachments: processedAttachments,
              }
            })
          setBlogs(sortedBlogs)
          console.log("[News Section] Final processed blogs:", sortedBlogs)
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
        setError(error instanceof Error ? error.message : "Failed to load news")

        const fallbackData = [
          {
            id: "1",
            title: "Governor Launches New Education Initiative",
            content: "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program...",
            attachments: ["/placeholder.svg?height=300&width=400&text=Education+Initiative"],
            created_at: new Date().toISOString(),
            doc_type: "Education",
          },
          {
            id: "2",
            title: "Infrastructure Development Progress",
            content: "Major road construction projects across Kano State are showing significant progress...",
            attachments: ["/placeholder.svg?height=300&width=400&text=Infrastructure+Development"],
            created_at: new Date(Date.now() - 86400000).toISOString(),
            doc_type: "Infrastructure",
          },
          {
            id: "3",
            title: "Healthcare System Strengthening",
            content: "The state government continues to invest in healthcare infrastructure...",
            attachments: ["/placeholder.svg?height=300&width=400&text=Healthcare+System"],
            created_at: new Date(Date.now() - 172800000).toISOString(),
            doc_type: "Healthcare",
          },
        ]
        setBlogs(fallbackData)
        console.log("[News Section] Using fallback data due to API error:", error)
        console.log("[News Section] Using fallback data with proper attachments")
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const directBlogFetch = async () => {
    const approaches = [
      {
        method: "GET",
        body: null,
      },
      {
        method: "POST",
        body: {},
      },
      {
        method: "POST",
        body: { action: "get_blogs" },
      },
      {
        method: "POST",
        body: { query: "select" },
      },
    ]

    for (const approach of approaches) {
      try {
        console.log("Trying direct approach:", approach)

        const response = await fetch(`${getBlogApiUrl()}/kgt/blog`, {
          method: approach.method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
          body: approach.body ? JSON.stringify(approach.body) : null,
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Direct approach succeeded:", data)
          return { success: true, data }
        }
      } catch (err) {
        console.log("Direct approach failed:", err)
        continue
      }
    }

    return { success: false, error: "All direct approaches failed" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const truncateContent = (content: string, wordLimit = 25) => {
    const words = content.split(" ")
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : content
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Latest News</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest developments and achievements from the Governor's office
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-lg">
                <div className="h-64 bg-gray-200 animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 animate-pulse mb-4" />
                  <div className="h-6 bg-gray-200 animate-pulse mb-4" />
                  <div className="h-20 bg-gray-200 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Latest News</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest developments and achievements from the Governor's office
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-yellow-800 text-sm">Note: Using sample news data. API connection issue: {error}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog, index) => (
            <Card
              key={blog.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
            >
              <div className="relative h-64 overflow-hidden">
                {blog.attachments && blog.attachments.length > 0 ? (
                  <AutoCarousel
                    images={blog.attachments.filter((attachment) => typeof attachment === "string")}
                    title={blog.title}
                    className="h-full"
                    aspectRatio="auto"
                    showControls={false}
                    autoAdvanceInterval={5000}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {blog.doc_type && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      {blog.doc_type}
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar size={16} />
                  <span>{formatDate(blog.created_at)}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-red-600 transition-colors">
                  <Link href={`/news/${blog.id}`}>{blog.title || "No Title"}</Link>
                </h3>

                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {truncateContent(blog.content || "No Content")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/news" className="inline-flex items-center gap-2">
              View All News
              <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
