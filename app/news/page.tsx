"use client"

import { useState, useEffect, useCallback } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"
import { blogApiRequest, blogApiRequestAlt, getBlogApiUrl } from "@/lib/api-config"

interface BlogPost {
  id: string
  title: string
  content: string
  attachment?: string
  created_at: string
  doc_type?: string
}

export default function NewsPage() {
  const { isLoading, stopLoading } = usePageLoading()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [docTypes, setDocTypes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function to prevent infinite loops
  const fetchBlogs = useCallback(async () => {
    if (hasLoaded) return // Prevent multiple fetches

    try {
      setDataLoading(true)
      setError(null)

      console.log("Fetching blogs from news page...")

      // Try the primary method first
      let result = await blogApiRequest("/kgt/blog", {
        method: "POST",
        body: { newForm: { query_type: "select" } },
      })

      // If primary method fails, try alternative method
      if (!result.success) {
        console.log("Primary method failed, trying alternative...")
        result = await blogApiRequestAlt("/kgt/blog")
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
          // Sort by created_at date (newest first)
          const sortedBlogs = blogData.sort(
            (a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )

          // Format image URLs to be absolute
          const blogsWithImages = sortedBlogs.map((blog: BlogPost) => ({
            ...blog,
            attachment: blog.attachment
              ? `${getBlogApiUrl()}${blog.attachment}`
              : "/placeholder.svg?height=300&width=400",
          }))

          setBlogs(blogsWithImages)
          setFilteredBlogs(blogsWithImages)

          // Extract unique document types
          const types = [...new Set(blogsWithImages.map((blog: BlogPost) => blog.doc_type).filter(Boolean))]
          setDocTypes(types)
          console.log("Successfully fetched blogs:", blogsWithImages)
        } else {
          throw new Error("No blog data found in response")
        }
      } else {
        throw new Error(result.error || "Failed to fetch blogs")
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      // Fallback data for demo
      const fallbackData = [
        {
          id: "1",
          title: "Governor Launches New Education Initiative",
          content:
            "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program aimed at improving the quality of education in Kano State. The initiative includes infrastructure development, teacher training, and student support programs.",
          attachment: "/placeholder.svg?height=300&width=400",
          created_at: new Date().toISOString(),
          doc_type: "Education",
        },
        {
          id: "2",
          title: "Infrastructure Development Progress",
          content:
            "In line with the infrastructure renewal drive of the present administration, the Kano State Government, through the Kano Road Maintenance Agency (KARMA), has commenced asphalt overlay works on the access road leading to the Kano State Polytechnic School of Technology (SOT), Matan Fada, in the heart of Kano Metropolis. This project is part of Governor Alhaji Abba Kabir Yusuf's broader strategy to improve critical infrastructure in educational institutions and enhance accessibility, safety, and mobility for students, staff, and residents in the surrounding community. The road leading to the School of Technology had deteriorated over time due to years of wear, inadequate drainage, and high pedestrian and vehicular usage. The asphalt overlay intervention is a timely response to the concerns of road users, aimed at transforming the route into a smooth, safe, and durable roadway.",
          attachment: "/placeholder.svg?height=300&width=400",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          doc_type: "Infrastructure",
        },
        {
          id: "3",
          title: "Healthcare System Strengthening",
          content:
            "The state government continues to invest in healthcare infrastructure with the opening of new medical facilities and equipment procurement.",
          attachment: "/placeholder.svg?height=300&width=400",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          doc_type: "Healthcare",
        },
        {
          id: "4",
          title: "Youth Empowerment Programs",
          content:
            "New initiatives to empower young people across Kano State with skills training and entrepreneurship opportunities.",
          attachment: "/placeholder.svg?height=300&width=400",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          doc_type: "Youth Development",
        },
        {
          id: "5",
          title: "Agricultural Development Projects",
          content:
            "Investment in modern farming techniques and irrigation systems to boost agricultural productivity in the state.",
          attachment: "/placeholder.svg?height=300&width=400",
          created_at: new Date(Date.now() - 345600000).toISOString(),
          doc_type: "Agriculture",
        },
      ]
      setBlogs(fallbackData)
      setFilteredBlogs(fallbackData)
      setDocTypes(["Education", "Infrastructure", "Healthcare", "Youth Development", "Agriculture"])
    } finally {
      setDataLoading(false)
      setHasLoaded(true)
      stopLoading()
    }
  }, [hasLoaded, stopLoading])

  // Single useEffect for initial data fetch
  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Separate useEffect for filtering (no API calls)
  useEffect(() => {
    let filtered = blogs

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((blog) => blog.doc_type === activeFilter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredBlogs(filtered)
  }, [blogs, activeFilter, searchTerm])

  const handleFilter = (docType: string) => {
    setActiveFilter(docType)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const stripHtmlTags = (html: string) => {
    // Create a temporary div element to parse HTML
    if (typeof document === "undefined") {
      return ""
    }
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  const truncateContent = (content: string, wordLimit = 25) => {
    // First strip HTML tags, then truncate
    const plainText = stripHtmlTags(content)
    const words = plainText.split(" ")
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : plainText
  }

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section
          className="py-20 relative bg-gradient-to-r from-red-600 via-red-700 to-red-800"
        // style={{
        //   background:
        //     "linear-gradient(rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.8)),",
        // }}
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h1 className="text-5xl lg:text-6xl font-bold mb-6">Latest News</h1>
                <p className="text-xl mb-8 opacity-90">
                  Stay informed with the latest updates, achievements, and developments from the Governor's office
                </p>
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="hover:text-red-200 transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} />
                  <span className="text-red-200">News</span>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/pictures/assets/img/he/6.png"
                  alt="News"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        <main className="py-20">
          <div className="container mx-auto px-4">
            {/* Search and Filter Section */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => handleFilter("all")}
                    variant={activeFilter === "all" ? "default" : "outline"}
                    className={`${activeFilter === "all"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                      }`}
                  >
                    <Filter size={16} className="mr-2" />
                    All ({blogs.length})
                  </Button>
                  {docTypes.map((docType) => {
                    const count = blogs.filter((blog) => blog.doc_type === docType).length
                    return (
                      <Button
                        key={docType}
                        onClick={() => handleFilter(docType)}
                        variant={activeFilter === docType ? "default" : "outline"}
                        className={`${activeFilter === docType
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                          }`}
                      >
                        {docType} ({count})
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-600 text-lg">
                Showing {filteredBlogs.length} of {blogs.length} news articles
                {searchTerm && ` for "${searchTerm}"`}
                {activeFilter !== "all" && ` in ${activeFilter}`}
              </p>
            </div>

            {/* Blog Posts */}
            {dataLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog, index) => (
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-red-600 transition-colors">
                        <Link href={`/news/${blog.id}`}>{blog.title || "No Title"}</Link>
                      </h3>

                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {truncateContent(blog.content || "No Content")}
                      </p>

                      {/* <Link
                        href={`/news/${blog.id}`}
                        className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors group"
                      >
                        Read More
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link> */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredBlogs.length === 0 && !dataLoading && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No news articles found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? `No articles match your search for "${searchTerm}"`
                      : `No articles found in the ${activeFilter} category`}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setActiveFilter("all")
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        <NewsletterSection />
        <Footer />
        <ScrollToTop />
      </div>
    </PageLoader>
  )
}
