"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  attachment?: string
  created_at: string
  doc_type?: string
  author?: string
  location?: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        
        // Fetch the specific blog post
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
        const response = await fetch(`${baseUrl}/api/news/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog post')
        }
        
        const data = await response.json()
        setBlog(data)

        // Fetch related blogs (last 3 posts excluding the current one)
        const relatedResponse = await fetch(`${baseUrl}/api/news`)
        if (relatedResponse.ok) {
          const allBlogs = await relatedResponse.json()
          const filteredRelated = allBlogs
            .filter((b: BlogPost) => b.id !== params.id)
            .slice(0, 3) // Get the 3 most recent
          setRelatedBlogs(filteredRelated)
        }
        
      } catch (err) {
        console.error("Error fetching blog detail:", err)
        setError('Failed to load the news article. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlogDetail()
    }
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
            <div className="h-8 bg-gray-200 animate-pulse mb-4 w-1/2" />
            <div className="h-4 bg-gray-200 animate-pulse mb-2 w-1/4" />
            <div className="h-64 bg-gray-200 animate-pulse mb-8 rounded-lg" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button 
              onClick={() => router.push('/news')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Back to News
            </Button>
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
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or may have been removed.</p>
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

      {/* Breadcrumb Section
      <section className="py-20 relative bg-gradient-to-r from-red-600 via-red-700 to-red-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">News Details</h1>
              <div className="flex items-center space-x-2 text-lg">
                <Link href="/" className="hover:text-red-200 transition-colors">
                  Home
                </Link>
                <ArrowRight size={16} />
                <Link href="/news" className="hover:text-red-200 transition-colors">
                  News
                </Link>
                <ArrowRight size={16} />
                <span className="text-red-200">{blog.title}</span>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/pictures/assets/img/he/6.png"
                alt={blog.title}
                width={500}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section> */}

      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                {blog.doc_type && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                    {blog.doc_type}
                  </span>
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
                    <Calendar className="w-6 h-6 text-red-600" />
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
                    <span className="text-gray-600">{blog.author || 'AKY Media Team'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <span className="text-gray-600">{blog.location || 'Kano State, Nigeria'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.attachment && (
              <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={blog.attachment.url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none mb-12" 
              dangerouslySetInnerHTML={{ 
                __html: blog.content 
                  ? blog.content.replace(/\n/g, '<br/>')
                  : 'No content available.' 
              }} 
            />

            {/* Quote Section */}
            {/* <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12 rounded-r-lg">
              <p className="text-lg italic text-gray-700">
                "Our service details offer a clear and thorough understanding of how we are addressing critical
                community needs. Each service is designed with precision and care to ensure it meets specific challenges
                effectively."
              </p>
              <cite className="text-red-600 font-semibold mt-4 block">- Governor Abba Kabir Yusuf</cite>
            </div> */}
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">More News</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <Card key={relatedBlog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={relatedBlog.attachment.url || "/placeholder.svg?height=300&width=400"}
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

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {relatedBlog.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>

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
        )}
      </main>

      <NewsletterSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
