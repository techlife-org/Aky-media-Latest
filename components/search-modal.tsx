"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, MapPin, User, Newspaper, Trophy, Eye } from "lucide-react"
import { AutoCarousel } from "@/components/auto-carousel"
import { AchievementSearchModal } from "@/components/achievement-search-modal"

interface SearchResult {
  id: string
  title: string
  content: string
  type: "news" | "achievement"
  doc_type?: string
  attachments: Array<{
    url: string
    type: string
    name?: string
    order?: number
  }>
  created_at: string
  author?: string
  location?: string
  category?: string
  views?: number
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export function SearchModal({ isOpen, onClose, searchQuery, onSearchQueryChange }: SearchModalProps) {
  const [newsResults, setNewsResults] = useState<SearchResult[]>([])
  const [achievementResults, setAchievementResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<SearchResult | null>(null)
  const [activeSection, setActiveSection] = useState<"all" | "news" | "achievements">("all")

  useEffect(() => {
    if (searchQuery.trim() && isOpen) {
      performSearch(searchQuery)
    } else {
      setNewsResults([])
      setAchievementResults([])
    }
  }, [searchQuery, isOpen])

  const performSearch = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setNewsResults(data.results?.news || [])
        setAchievementResults(data.results?.achievements || [])
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "news") {
      window.open(`/news/${result.id}`, "_blank")
    } else if (result.type === "achievement") {
      setSelectedAchievement(result)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDisplayResults = () => {
    switch (activeSection) {
      case "news":
        return newsResults
      case "achievements":
        return achievementResults
      default:
        return [...newsResults, ...achievementResults].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
    }
  }

  const totalResults = newsResults.length + achievementResults.length

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] sm:w-[90vw] sm:max-w-4xl lg:max-w-5xl overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50 p-3 sm:p-6">
          <DialogHeader className="border-b border-gray-200 pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold text-gray-900">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <Search size={16} className="sm:hidden text-red-600" />
                <Search size={24} className="hidden sm:block text-red-600" />
              </div>
              <span className="truncate">Search Results</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-3 sm:mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search news & achievements..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="pr-10 sm:pr-12 pl-3 sm:pl-4 py-2 sm:py-3 text-sm sm:text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl shadow-sm"
                />
                <Search
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {totalResults > 0 && (
              <div className="mb-3 sm:mb-6">
                <div className="flex gap-1 sm:gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveSection("all")}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeSection === "all" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All ({totalResults})
                  </button>
                  <button
                    onClick={() => setActiveSection("news")}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                      activeSection === "news" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Newspaper size={12} className="sm:size-4" />
                    <span className="hidden xs:inline">News</span> ({newsResults.length})
                  </button>
                  <button
                    onClick={() => setActiveSection("achievements")}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                      activeSection === "achievements"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Trophy size={12} className="sm:size-4" />
                    <span className="hidden xs:inline">Achievements</span> ({achievementResults.length})
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-red-200 border-t-red-600"></div>
                    <p className="text-sm sm:text-base text-gray-500">Searching...</p>
                  </div>
                </div>
              ) : getDisplayResults().length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {getDisplayResults().map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 hover:shadow-lg hover:border-red-200 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <div className="w-full h-48 sm:w-40 sm:h-32 flex-shrink-0">
                          <AutoCarousel
                            images={result.attachments?.map((att) => att.url) || []}
                            className="w-full h-full rounded-lg overflow-hidden shadow-sm"
                            imageClassName="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-3 gap-2">
                            <h3 className="font-bold text-base sm:text-xl text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 sm:line-clamp-2">
                              {result.title}
                            </h3>
                            <div className="flex gap-1 sm:gap-2 flex-wrap sm:ml-4">
                              <Badge
                                variant={result.type === "news" ? "default" : "secondary"}
                                className={`text-xs ${
                                  result.type === "news"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                } font-medium`}
                              >
                                {result.type === "news" ? (
                                  <>
                                    <Newspaper size={10} className="mr-1" /> News
                                  </>
                                ) : (
                                  <>
                                    <Trophy size={10} className="mr-1" /> Achievement
                                  </>
                                )}
                              </Badge>
                              {result.doc_type && result.doc_type !== "news" && (
                                <Badge variant="outline" className="text-xs">
                                  {result.doc_type}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
                            {result.content}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar size={12} className="sm:size-3.5" />
                              <span className="font-medium">{formatDate(result.created_at)}</span>
                            </div>
                            {result.author && (
                              <div className="flex items-center gap-1 sm:gap-2">
                                <User size={12} className="sm:size-3.5" />
                                <span className="truncate max-w-20 sm:max-w-none">{result.author}</span>
                              </div>
                            )}
                            {result.location && (
                              <div className="flex items-center gap-1 sm:gap-2">
                                <MapPin size={12} className="sm:size-3.5" />
                                <span className="truncate max-w-20 sm:max-w-none">{result.location}</span>
                              </div>
                            )}
                            {result.views !== undefined && (
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Eye size={12} className="sm:size-3.5" />
                                <span>{result.views} views</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mb-3 sm:mb-4">
                    <Search size={32} className="sm:size-12 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No results found</h3>
                  <p className="text-sm sm:text-base text-gray-500 px-4">
                    No results found for "{searchQuery}". Try different keywords.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="mb-3 sm:mb-4">
                    <Search size={32} className="sm:size-12 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Start searching</h3>
                  <p className="text-sm sm:text-base text-gray-500 px-4">
                    Enter a search term to find news and achievements
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Search Modal */}
      {selectedAchievement && (
        <AchievementSearchModal
          achievement={selectedAchievement}
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  )
}
