"use client"

import { useState, useEffect, useCallback } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

      // Ensure we're running in the browser
      if (typeof window === 'undefined') {
        console.log("[News Page] Skipping fetch - running on server")
        return
      }

      console.log("[News Page] Fetching news from /api/news")
      // Use relative URL for client-side fetches
      const response = await fetch("/api/news", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[News Page] API response data:", data)
      
      if (Array.isArray(data)) {
        const sortedBlogs = data.sort(
          (a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        setBlogs(sortedBlogs)
        setFilteredBlogs(sortedBlogs)
        console.log("[News Page] Loaded", sortedBlogs.length, "news articles")

        // Extract unique document types, filter out undefined, and sort alphabetically
        const types = [...new Set(sortedBlogs
          .map((blog: BlogPost) => blog.doc_type)
          .filter((type): type is string => Boolean(type))
        )]
        setDocTypes(types.sort((a, b) => a.localeCompare(b)))
        console.log("[News Page] Document types:", types)
      } else {
        console.warn("[News Page] API response is not an array:", data)
        setError("Invalid data format received from server")
      }
    } catch (error) {
      console.error("[News Page] Error fetching blogs:", error)
      setError(error instanceof Error ? error.message : "Failed to load news")

      // Use fallback data only if there's a network error
      console.log("[News Page] Using fallback data due to API error:", error)
      const fallbackData = [
        {
          id: "fallback-1",
          title: "Governor Launches New Education Initiative",
          content:
            "His Excellency Alh. Abba Kabir Yusuf announced a comprehensive education reform program aimed at improving the quality of education in Kano State.",
          attachments: [{ url: "/placeholder.svg?height=300&width=400", type: "image" as const }],
          created_at: new Date().toISOString(),
          doc_type: "Education",
          views: 150,
        },
        {
          id: "fallback-2",
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
      console.log("[News Page] Fallback data loaded with", fallbackData.length, "articles")
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

        {/* Search Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span className="text-sm">
                  Showing {filteredBlogs.length} of {blogs.length} articles
                  {searchTerm && ` for "${searchTerm}"`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <main className="py-16">
          <div className="container mx-auto px-4">
            {/* Tab Filter Section */}
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
              <div className="mb-8">
                {/* Mobile Dropdown for small screens */}
                <div className="block sm:hidden mb-4">
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium"
                  >
                    <option value="all">All Articles ({blogs.length})</option>
                    {docTypes.map((docType) => {
                      const count = blogs.filter((blog) => blog.doc_type === docType).length
                      return (
                        <option key={docType} value={docType}>
                          {docType} ({count})
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Desktop/Tablet Tab Layout - Full Width */}
                <div className="hidden sm:block">
                  <TabsList 
                    className="grid w-full h-auto p-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100" 
                    style={{gridTemplateColumns: `repeat(${docTypes.length + 1}, 1fr)`}}
                  >
                    <TabsTrigger
                      value="all"
                      className="
                        group relative flex flex-col items-center justify-center gap-1 px-2 py-3 
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 
                        data-[state=active]:text-white
                        rounded-lg transition-all duration-300 ease-out
                        hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:scale-105
                        text-xs font-medium border border-transparent
                        data-[state=active]:border-red-300
                        transform hover:-translate-y-0.5 min-h-[60px]
                      "
                    >
                      {/* Active indicator */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Category name */}
                      <span className="text-center group-data-[state=active]:font-bold transition-all duration-300 text-xs leading-tight">
                        All Articles
                      </span>
                      
                      {/* Count badge */}
                      <Badge 
                        variant="secondary" 
                        className="
                          text-xs px-1.5 py-0.5 min-w-[20px] h-4 flex items-center justify-center
                          transition-all duration-300 font-bold
                          group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white group-data-[state=active]:border-white/30
                          group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-200
                          bg-gray-100 text-gray-600 border border-gray-200
                        "
                      >
                        {blogs.length}
                      </Badge>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </TabsTrigger>
                    
                    {docTypes.map((docType) => {
                      const count = blogs.filter((blog) => blog.doc_type === docType).length
                      return (
                        <TabsTrigger
                          key={docType}
                          value={docType}
                          className="
                            group relative flex flex-col items-center justify-center gap-1 px-2 py-3 
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 
                            data-[state=active]:text-white
                            rounded-lg transition-all duration-300 ease-out
                            hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:scale-105
                            text-xs font-medium border border-transparent
                            data-[state=active]:border-red-300
                            transform hover:-translate-y-0.5 min-h-[60px]
                          "
                        >
                          {/* Active indicator */}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Category name */}
                          <span className="text-center group-data-[state=active]:font-bold transition-all duration-300 text-xs leading-tight">
                            {docType}
                          </span>
                          
                          {/* Count badge */}
                          <Badge 
                            variant="secondary" 
                            className="
                              text-xs px-1.5 py-0.5 min-w-[20px] h-4 flex items-center justify-center
                              transition-all duration-300 font-bold
                              group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white group-data-[state=active]:border-white/30
                              group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-200
                              bg-gray-100 text-gray-600 border border-gray-200
                            "
                          >
                            {count}
                          </Badge>
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>

                {/* Filter summary */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {activeFilter === 'all' ? (
                      <span className="font-medium">Showing all <span className="text-red-600 font-bold">{filteredBlogs.length}</span> articles</span>
                    ) : (
                      <span className="font-medium">
                        Filtered by <span className="text-red-600 font-bold">{activeFilter}</span> - 
                        <span className="text-red-600 font-bold">{filteredBlogs.length}</span> articles found
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <TabsContent value={activeFilter} className="mt-8">

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
                      {(() => {
                        // Get valid image URLs
                        const validImages = blog.attachments
                          ?.filter(att => {
                            const isImage = att.type === 'image' || 
                                           att.url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
                            const hasValidUrl = att.url && att.url.trim() !== ''
                            return isImage && hasValidUrl
                          })
                          ?.map(att => att.url)
                          ?.filter(url => url && url.trim() !== '') || []
                        
                        if (validImages.length > 0) {
                          return (
                            <AutoCarousel
                              images={validImages}
                              title={blog.title}
                              className="h-full"
                              aspectRatio="auto"
                              showControls={false}
                              autoAdvanceInterval={5000}
                            />
                          )
                        } else {
                          return (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="text-center">
                                <span className="text-4xl mb-2 block">📰</span>
                                <span className="text-xs text-gray-400">
                                  {blog.attachments && blog.attachments.length > 0 
                                    ? `${blog.attachments.length} attachment(s) - No valid images` 
                                    : 'No image available'
                                  }
                                </span>
                              </div>
                            </div>
                          )
                        }
                      })()}
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
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <NewsletterSection />
        <Footer />
        <ScrollToTop />
      </div>
    </PageLoader>
  )
}
