"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { blogApiRequest, blogApiRequestAlt, getBlogApiUrl } from "@/lib/api-config"

interface BlogPost {
  id: string
  title: string
  content: string
  attachment?: string
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

        console.log("Fetching blogs from news section...")

        // Try the primary method first
        let result = await blogApiRequest("/kgt/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newForm: { query_type: "select" } }),
        })

        // If primary method fails, try alternative method
        if (!result.success) {
          console.log("Primary method failed, trying alternative...")
          result = await blogApiRequestAlt("/kgt/blog")
        }

        // If still fails, try direct fetch with different approaches
        if (!result.success) {
          console.log("Alternative method failed, trying direct fetch...")
          result = await directBlogFetch()
        }

        if (result.success && result.data) {
          let blogData = []

          // Handle different response formats
          if (result.data.resp && Array.isArray(result.data.resp)) {
            blogData = result.data.resp
          } else if (Array.isArray(result.data)) {
            blogData = result.data
          } else if (result.data.data && Array.isArray(result.data.data)) {
            blogData = result.data.data
          }

          if (blogData.length > 0) {
            // Sort by created_at date (newest first) and take only the first 3
            const sortedBlogs = blogData
              .sort((a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((blog: BlogPost) => ({
                ...blog,
                attachment: blog.attachment
                  ? `${getBlogApiUrl()}${blog.attachment}`
                  : "/placeholder.svg?height=300&width=400",
              }))

            setBlogs(sortedBlogs)
            console.log("Successfully fetched blogs:", sortedBlogs)
          } else {
            throw new Error("No blog data found in response")
          }
        } else {
          throw new Error(result.error || "Failed to fetch blogs")
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
        setError(error instanceof Error ? error.message : "Unknown error")

        // Use fallback data
        const fallbackData = [
          {
            id: "1",
            title: "Governor Launches New Education Initiative",
            content:
              "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program aimed at improving the quality of education in Kano State. The initiative includes infrastructure development, teacher training, and student support programs that will benefit thousands of students across all 44 local government areas.",
            attachment: "/placeholder.svg?height=300&width=400",
            created_at: new Date().toISOString(),
            doc_type: "Education",
          },
          {
            id: "2",
            title: "Infrastructure Development Progress",
            content:
              "Major road construction projects across Kano State are showing significant progress as part of the administration's commitment to improving transportation infrastructure. The dual carriageway projects spanning multiple local government areas are creating jobs and enhancing connectivity for rural communities.",
            attachment: "/placeholder.svg?height=300&width=400",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            doc_type: "Infrastructure",
          },
          {
            id: "3",
            title: "Healthcare System Strengthening",
            content:
              "The state government continues to invest in healthcare infrastructure with the opening of new medical facilities and equipment procurement. Recent achievements include the renovation of specialist hospitals and the employment of additional medical personnel to serve the growing population.",
            attachment: "/placeholder.svg?height=300&width=400",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            doc_type: "Healthcare",
          },
        ]
        setBlogs(fallbackData)
        console.log("Using fallback data due to API error")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  // Direct fetch function with multiple approaches
  const directBlogFetch = async () => {
    const approaches = [
      // Approach 1: GET request
      {
        method: "GET",
        body: null,
      },
      // Approach 2: POST with empty body
      {
        method: "POST",
        body: {},
      },
      // Approach 3: POST with different payload
      {
        method: "POST",
        body: { action: "get_blogs" },
      },
      // Approach 4: POST with query parameter
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
                <Image
                  src={blog.attechment || `/placeholder.svg?height=300&width=400&text=News+${index + 1}`}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
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

                <Link
                  href={`/news/${blog.id}`}
                  className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors group"
                >
                  Read More
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
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
