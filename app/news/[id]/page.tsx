"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Clock, MapPin, User } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

interface BlogPost {
  id: string
  title: string
  content: string
  attechment?: string
  created_at: string
  doc_type?: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        // In a real app, you'd fetch the specific blog by ID
        // For now, we'll simulate with fallback data
        const fallbackBlog = {
          id: params.id as string,
          title: "Governor Launches Major Infrastructure Development Project",
          content: `
            <p>His Excellency Alh. Abba Kabir Yusuf, the Executive Governor of Kano State, today launched a comprehensive infrastructure development program aimed at transforming the state's transportation network and improving the quality of life for all residents.</p>
            
            <h3>Key Highlights of the Project</h3>
            <p>The infrastructure development initiative encompasses several critical areas including road construction, bridge rehabilitation, and urban planning improvements. This ambitious project represents one of the largest infrastructure investments in the state's recent history.</p>
            
            <h3>How We're Making a Difference</h3>
            <p>Our service details offer a clear and thorough understanding of how we are addressing critical community needs. Each service is designed with precision and care to ensure it meets specific challenges effectively. From enhancing public safety through community policing initiatives to improving educational outcomes through targeted school improvement programs.</p>
            
            <p>Our approach is grounded in data-driven decisions and community feedback, allowing us to refine our services and maximize their impact. By providing transparent information about each service, we ensure that you are well-informed about how we are working to create positive change.</p>
            
            <h3>Community Impact</h3>
            <p>The project is expected to create thousands of jobs and significantly improve transportation efficiency across the state. Local communities will benefit from improved access to essential services and enhanced economic opportunities.</p>
          `,
          attechment: "/placeholder.svg?height=600&width=800",
          created_at: new Date().toISOString(),
          doc_type: "Infrastructure",
        }

        setBlog(fallbackBlog)

        // Fetch related blogs
        const relatedData = [
          {
            id: "2",
            title: "Education Reform Initiative Launched",
            content: "Governor announces comprehensive education reforms...",
            attechment: "/placeholder.svg?height=300&width=400",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            doc_type: "Education",
          },
          {
            id: "3",
            title: "Healthcare System Improvements",
            content: "New medical facilities opened across the state...",
            attechment: "/placeholder.svg?height=300&width=400",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            doc_type: "Healthcare",
          },
          {
            id: "4",
            title: "Economic Development Programs",
            content: "Job creation initiatives show positive results...",
            attechment: "/placeholder.svg?height=300&width=400",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            doc_type: "Economy",
          },
        ]

        setRelatedBlogs(relatedData)
      } catch (error) {
        console.error("Error fetching blog detail:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetail()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 animate-pulse mb-4" />
            <div className="h-64 bg-gray-200 animate-pulse mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/news">Back to News</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb Section */}
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=400&width=1200)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">News Details</h1>
              <div className="flex items-center space-x-2 text-lg">
                <Link href="/" className="hover:text-red-400 transition-colors">
                  Home
                </Link>
                <ArrowRight size={16} />
                <Link href="/news" className="hover:text-red-400 transition-colors">
                  News
                </Link>
                <ArrowRight size={16} />
                <span className="text-red-400">Details</span>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="News Detail"
                width={500}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                {blog.doc_type && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">{blog.doc_type}</span>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6">{blog.title}</h1>

              {/* Article Meta */}
              <div className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Published</h4>
                    <span className="text-gray-600">{formatDate(blog.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Author</h4>
                    <span className="text-gray-600">AKY Media Team</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <span className="text-gray-600">Kano State, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.attechment || "/placeholder.svg?height=600&width=800"}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Quote Section */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12 rounded-r-lg">
              <p className="text-lg italic text-gray-700">
                "Our service details offer a clear and thorough understanding of how we are addressing critical
                community needs. Each service is designed with precision and care to ensure it meets specific challenges
                effectively."
              </p>
              <cite className="text-red-600 font-semibold mt-4 block">- Governor Abba Kabir Yusuf</cite>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">More News</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <Card key={relatedBlog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={relatedBlog.attechment || "/placeholder.svg?height=300&width=400"}
                      alt={relatedBlog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{formatDate(relatedBlog.created_at)}</span>
                      </div>
                      {relatedBlog.doc_type && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          {relatedBlog.doc_type}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                      <Link href={`/news/${relatedBlog.id}`} className="hover:text-red-600 transition-colors">
                        {relatedBlog.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{relatedBlog.content}</p>

                    <Link
                      href={`/news/${relatedBlog.id}`}
                      className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
                    >
                      Read More <ArrowRight size={16} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <NewsletterSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
