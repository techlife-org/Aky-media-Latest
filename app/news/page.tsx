"use client"

import { useState, useEffect, useCallback } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Filter, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"
import { AutoCarousel } from "@/components/auto-carousel"

interface Attachment {
  url: string
  type: "image" | "document" | "video" | "link"
  name?: string
  order?: number
}

interface BlogPost {
  id: string
  title: string
  content: string
  attachments: Attachment[]
  created_at: string
  updated_at?: string
  doc_type?: string
  views?: number
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

  const fetchBlogs = useCallback(async () => {
    if (hasLoaded) return

    try {
      setDataLoading(true)
      setError(null)

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
      const response = await fetch(`${baseUrl}/api/news`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        const sortedBlogs = data.sort(
          (a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        setBlogs(sortedBlogs)
        setFilteredBlogs(sortedBlogs)

        // Extract unique document types, filter out undefined, and sort alphabetically
        const types = [...new Set(sortedBlogs
          .map((blog: BlogPost) => blog.doc_type)
          .filter((type): type is string => Boolean(type))
        )]
        setDocTypes(types.sort((a, b) => a.localeCompare(b)))
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      setError(error instanceof Error ? error.message : "Failed to load news")

      const fallbackData = [
        {
          id: "1",
          title: "Governor Launches New Education Initiative",
          content:
            "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program aimed at improving the quality of education in Kano State.",
          attachments: [{ url: "/placeholder.svg?height=300&width=400", type: "image" as const }],
          created_at: new Date().toISOString(),
          doc_type: "Education",
          views: 150,
        },
        {
          id: "2",
          title: "Infrastructure Development Progress",
          content:
            "The Kano State Government has commenced asphalt overlay works on critical infrastructure projects across the state.",
          attachments: [{ url: "/placeholder.svg?height=300&width=400", type: "image" as const }],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          doc_type: "Infrastructure",
          views: 200,
        },
      ]
      setBlogs(fallbackData)
      setFilteredBlogs(fallbackData)
      setDocTypes(["Education", "Infrastructure"])
    } finally {
      setDataLoading(false)
      setHasLoaded(true)
      stopLoading()
    }
  }, [hasLoaded, stopLoading])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  useEffect(() => {
    let filtered = blogs

    if (activeFilter !== "all") {
      filtered = filtered.filter((blog) => blog.doc_type === activeFilter)
    }

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

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section
          className="relative py-20"
          style={{
            backgroundImage: "url('/bg2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-red-500">Latest News</h1>
                <p className="text-xl mb-8 text-gray-800">
                  Stay informed with the latest updates, achievements, and developments from the Governor's office
                </p>
                <div className="flex items-center space-x-2 text-lg">
                  <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} />
                  <span className="text-red-500">News</span>
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

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => handleFilter("all")}
                    variant={activeFilter === "all" ? "default" : "outline"}
                    className={`${
                      activeFilter === "all"
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
                        className={`${
                          activeFilter === docType
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <Link href={`/news/${blog.id}`} className="block h-48 relative overflow-hidden">
                      {blog.attachments && blog.attachments.length > 0 ? (
                        <AutoCarousel
                          images={blog.attachments.map((att) => att.url)}
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
                    </Link>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {blog.doc_type && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                            {blog.doc_type}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{formatDate(blog.created_at)}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        <Link href={`/news/${blog.id}`} className="hover:text-red-600 transition-colors">
                          {blog.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Eye size={16} />
                          {blog.views || 0} views
                        </span>
                        <Link
                          href={`/news/${blog.id}`}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          Read More <ArrowRight size={16} />
                        </Link>
                      </div>
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
