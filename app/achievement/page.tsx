"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { CheckCircle, Clock, Target, Users, GraduationCap, MapPin, Heart, Award, Search, Filter, ArrowRight, Droplets, Leaf, Shield, Zap, Car, X } from "lucide-react"

interface Achievement {
  _id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  category: string;
  date: string;
  location: string;
  impact: string;
  details: string[];
  icon: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "ongoing":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "determined":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "ongoing":
    case "determined":
      return <Clock className="w-4 h-4" />
    default:
      return <Target className="w-4 h-4" />
  }
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    CheckCircle, Clock, Target, Users, GraduationCap, Heart, Award, Droplets, Leaf, Shield, Zap, Car
  };
  return icons[iconName] || Target;
};

export default function AchievementPage() {
  const { isLoading, stopLoading } = usePageLoading()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/achievements');
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        const data = await response.json();
        setAchievements(data);
        hasFetched.current = true; // Mark as fetched
        setLoading(false);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again later.');
      } finally {
        setLoading(false);
        stopLoading();
      }
    };

    if (!hasFetched.current) {
      fetchAchievements();
    }
  }, [stopLoading]);
  // Also, update the handleAchievementClick to prevent unnecessary fetches
  const handleAchievementClick = async (achievement: Achievement) => {
    // Only fetch details if we don't already have them or if it's a different achievement
    if (!selectedAchievement || selectedAchievement._id !== achievement._id) {
      await fetchAchievementDetails(achievement._id);
    }
    setSelectedAchievement(achievement);
  };

  // Fetch single achievement details
  const fetchAchievementDetails = async (id: string) => {
    try {
      setModalLoading(true)
      const response = await fetch(`/api/achievements/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch achievement details')
      }
      const data = await response.json()
      setSelectedAchievement(data)
    } catch (err) {
      console.error('Error fetching achievement details:', err)
      setError('Failed to load achievement details. Please try again.')
    } finally {
      setModalLoading(false)
    }
  }

  // const handleAchievementClick = (achievement: Achievement) => {
  //   setSelectedAchievement(achievement)
  //   fetchAchievementDetails(achievement._id)
  // }

  const categories = [
    { id: "all", name: "All Achievements", count: achievements.length },
    {
      id: "infrastructure",
      name: "Infrastructure",
      count: achievements.filter((a) => a.category === "infrastructure").length,
    },
    {
      id: "education",
      name: "Education",
      count: achievements.filter((a) => a.category === "education").length
    },
    {
      id: "healthcare",
      name: "Healthcare",
      count: achievements.filter((a) => a.category === "healthcare").length
    },
    {
      id: "finance",
      name: "Finance",
      count: achievements.filter((a) => a.category === "finance").length
    },
    {
      id: "agriculture",
      name: "Agriculture",
      count: achievements.filter((a) => a.category === "agriculture").length
    },
    {
      id: "environment",
      name: "Environment",
      count: achievements.filter((a) => a.category === "environment").length
    },
  ]

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesCategory = selectedCategory === "all" || achievement.category === selectedCategory
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const completedCount = achievements.filter((a) => a.status === "completed").length
  const ongoingCount = achievements.filter((a) => a.status === "ongoing").length
  const totalProgress = achievements.length > 0
    ? Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length)
    : 0

  if (loading && !achievements.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Award className="w-16 h-16 text-red-500 mr-4" />
                <h1 className="text-5xl lg:text-6xl font-bold text-white">{achievements.length}+ Major Achievements</h1>
              </div>
              <p className="text-xl mb-8 text-white/90">
                Transforming Kano State through visionary leadership and impactful governance under His Excellency, the
                Executive Governor
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-red-300">{completedCount}</div>
                  <div className="text-sm text-white/90">Completed Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-blue-300">{ongoingCount}</div>
                  <div className="text-sm text-white/90">Ongoing Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-green-300">{totalProgress}%</div>
                  <div className="text-sm text-white/90">Overall Progress</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span className="text-sm">
                  Showing {filteredAchievements.length} of {achievements.length} achievements
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              {/* Category Tabs */}
              <div className="mb-8">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 bg-white shadow-lg rounded-xl border">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex flex-col items-center p-4 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg transition-all duration-200 hover:bg-red-50"
                    >
                      <span className="font-semibold text-sm text-center">{category.name}</span>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {category.count}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Achievements Grid */}
              <TabsContent value={selectedCategory} className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAchievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon)
                    return (
                      <Card
                        key={achievement._id}
                        className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                              {achievement.title}
                            </CardTitle>
                            <Badge
                              className={`${getStatusColor(achievement.status)} flex items-center gap-1 text-xs`}
                            >
                              {getStatusIcon(achievement.status)}
                              {achievement.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3 mt-2">{achievement.description}</p>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{achievement.location}</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAchievementClick(achievement)}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {filteredAchievements.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 p-6">
              <Button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 bg-white/90 text-gray-900 hover:bg-white rounded-full w-10 h-10 p-0"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg mb-4">
                  {React.createElement(getIconComponent(selectedAchievement.icon), {
                    className: "w-8 h-8 text-red-600"
                  })}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedAchievement.title}</h2>
                <div className="flex items-center mt-2">
                  <Badge className={`${getStatusColor(selectedAchievement.status)} flex items-center gap-1`}>
                    {getStatusIcon(selectedAchievement.status)}
                    {selectedAchievement.status.toUpperCase()}
                  </Badge>
                  <span className="text-white/80 text-sm ml-3">{selectedAchievement.date}</span>
                </div>
              </div>
            </div>

            {modalLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-700">{selectedAchievement.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</h3>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedAchievement.location}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Impact</h3>
                    <p className="text-gray-700">{selectedAchievement.impact}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Progress</h3>
                    <div className="flex items-center space-x-3">
                      <Progress value={selectedAchievement.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-gray-700">{selectedAchievement.progress}%</span>
                    </div>
                  </div>
                </div>

                {selectedAchievement.details && selectedAchievement.details.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Details</h3>
                    <ul className="space-y-2">
                      {selectedAchievement.details.map((detail, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setSelectedAchievement(null)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLoader>
  )
}
