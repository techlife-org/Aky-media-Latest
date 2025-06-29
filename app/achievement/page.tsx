"use client"

import { useState, useEffect } from "react"
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
import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  Building,
  GraduationCap,
  Heart,
  Award,
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react"

// Real achievements data from the attachment
const achievements = [
  {
    id: 1,
    title: "Pension Liabilities Settlement",
    description:
      "Cleared over N21 billion in pension liabilities out of a total debt of N48.6 billion inherited from the previous administration",
    status: "completed",
    progress: 100,
    category: "finance",
    date: "2023-2024",
    location: "Kano State",
    impact: "N21B+ pension debt cleared",
    icon: TrendingUp,
    details: [
      "Cleared N21 billion pension liabilities",
      "Total inherited debt was N48.6 billion",
      "Improved retirees' welfare",
      "Restored confidence in pension system",
    ],
  },
  {
    id: 2,
    title: "Road Infrastructure Development",
    description: "Construction of 5KM dual carriageway roads across all 44 Local Government Areas",
    status: "ongoing",
    progress: 75,
    category: "infrastructure",
    date: "2023-2025",
    location: "All 44 LGAs",
    impact: "220KM+ roads constructed",
    icon: Building,
    details: [
      "5KM dual carriageway in each LGA",
      "Modern road construction standards",
      "Improved connectivity across state",
      "Enhanced economic activities",
    ],
  },
  {
    id: 3,
    title: "Education Infrastructure Upgrade",
    description: "Construction of 1-storey blocks of 4 classrooms with offices across secondary schools",
    status: "ongoing",
    progress: 80,
    category: "education",
    date: "2023-2024",
    location: "All 44 LGAs",
    impact: "400+ new classrooms built",
    icon: GraduationCap,
    details: [
      "Modern classroom blocks construction",
      "Office facilities for teachers",
      "Improved learning environment",
      "Enhanced educational capacity",
    ],
  },
  {
    id: 4,
    title: "Healthcare System Strengthening",
    description: "General renovation and rehabilitation of hospitals across the state with modern equipment",
    status: "ongoing",
    progress: 70,
    category: "healthcare",
    date: "2023-2025",
    location: "Kano State",
    impact: "50+ hospitals upgraded",
    icon: Heart,
    details: [
      "Hospital renovations and upgrades",
      "Modern medical equipment procurement",
      "Healthcare worker training",
      "Improved patient care services",
    ],
  },
  {
    id: 5,
    title: "Student Support Programs",
    description: "Distribution of 10,000 free JAMB forms and payment of over N3 billion for NECO, NABTEB examinations",
    status: "completed",
    progress: 100,
    category: "education",
    date: "2023-2024",
    location: "Kano State",
    impact: "151,175+ students supported",
    icon: Users,
    details: [
      "10,000 free JAMB forms distributed",
      "N3B+ paid for exam fees",
      "141,175 secondary students supported",
      "Enhanced educational access",
    ],
  },
  {
    id: 6,
    title: "Power Infrastructure Development",
    description: "Purchase of 500 units of electric transformers for distribution across 44 LGAs",
    status: "ongoing",
    progress: 60,
    category: "infrastructure",
    date: "2023-2024",
    location: "All 44 LGAs",
    impact: "500 transformers distributed",
    icon: Building,
    details: [
      "500 electric transformers procured",
      "Distribution across all LGAs",
      "Improved power supply",
      "Enhanced rural electrification",
    ],
  },
  {
    id: 7,
    title: "Agricultural Development",
    description: "Construction of irrigation infrastructure and earth dams for agricultural enhancement",
    status: "ongoing",
    progress: 65,
    category: "agriculture",
    date: "2023-2025",
    location: "Rural Kano",
    impact: "1000+ hectares irrigated",
    icon: Target,
    details: [
      "Multiple irrigation projects",
      "Earth dam constructions",
      "Enhanced agricultural productivity",
      "Support for farmers",
    ],
  },
  {
    id: 8,
    title: "Environmental Protection",
    description: "Production and distribution of 3 million seedlings and erosion control projects",
    status: "completed",
    progress: 100,
    category: "environment",
    date: "2023-2024",
    location: "Kano State",
    impact: "3M+ trees planted",
    icon: Target,
    details: [
      "3 million seedlings produced",
      "Erosion control measures",
      "Environmental restoration",
      "Climate change mitigation",
    ],
  },
]

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

export default function AchievementPage() {
  const { isLoading, stopLoading } = usePageLoading()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading()
    }, 1000)
    return () => clearTimeout(timer)
  }, [stopLoading])

  const categories = [
    { id: "all", name: "All Achievements", count: achievements.length },
    {
      id: "infrastructure",
      name: "Infrastructure",
      count: achievements.filter((a) => a.category === "infrastructure").length,
    },
    { id: "education", name: "Education", count: achievements.filter((a) => a.category === "education").length },
    { id: "healthcare", name: "Healthcare", count: achievements.filter((a) => a.category === "healthcare").length },
    { id: "finance", name: "Finance", count: achievements.filter((a) => a.category === "finance").length },
    { id: "agriculture", name: "Agriculture", count: achievements.filter((a) => a.category === "agriculture").length },
    { id: "environment", name: "Environment", count: achievements.filter((a) => a.category === "environment").length },
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
  const totalProgress = Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length)

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Award className="w-16 h-16 text-yellow-300 mr-4" />
                <h1 className="text-5xl lg:text-6xl font-bold">600+ Major Achievements</h1>
              </div>
              <p className="text-xl mb-8 opacity-90">
                Transforming Kano State through visionary leadership and impactful governance under His Excellency, the
                Executive Governor
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-yellow-300">{completedCount}</div>
                  <div className="text-sm opacity-90">Completed Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-blue-300">{ongoingCount}</div>
                  <div className="text-sm opacity-90">Ongoing Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-green-300">{totalProgress}%</div>
                  <div className="text-sm opacity-90">Overall Progress</div>
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
                    const IconComponent = achievement.icon
                    return (
                      <Card
                        key={achievement.id}
                        className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-600 p-6">
                          <div className="absolute top-4 right-4">
                            <Badge
                              className={`${getStatusColor(achievement.status)} flex items-center gap-1 shadow-sm`}
                            >
                              {getStatusIcon(achievement.status)}
                              {achievement.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                              <IconComponent className="w-8 h-8 text-red-600" />
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                            {achievement.title}
                          </CardTitle>
                          <p className="text-gray-600 text-sm line-clamp-3">{achievement.description}</p>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-red-600">{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2" />
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{achievement.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{achievement.location}</span>
                              </div>
                            </div>

                            {/* Impact */}
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                              <div className="text-xs text-red-600 uppercase tracking-wide mb-1 font-semibold">
                                Impact
                              </div>
                              <div className="font-semibold text-gray-900 text-sm">{achievement.impact}</div>
                            </div>

                            {/* View Details Button */}
                            <Button
                              onClick={() => setSelectedAchievement(achievement)}
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

                {filteredAchievements.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative h-64 bg-gradient-to-br from-red-500 to-red-600 p-6">
                <Button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 bg-white/90 text-gray-900 hover:bg-white rounded-full w-10 h-10 p-0"
                  size="sm"
                >
                  ✕
                </Button>
                <div className="absolute bottom-6 left-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg mb-4">
                    <selectedAchievement.icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedAchievement.title}</h2>
                  <Badge className={`${getStatusColor(selectedAchievement.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedAchievement.status)}
                    {selectedAchievement.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{selectedAchievement.description}</p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1 font-semibold">Timeline</div>
                    <div className="font-semibold text-gray-900">{selectedAchievement.date}</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="text-sm text-green-600 mb-1 font-semibold">Location</div>
                    <div className="font-semibold text-gray-900">{selectedAchievement.location}</div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className="font-bold text-red-600">{selectedAchievement.progress}%</span>
                  </div>
                  <Progress value={selectedAchievement.progress} className="h-4" />
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-xl">Key Achievements</h3>
                  <ul className="space-y-3">
                    {selectedAchievement.details.map((detail: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                  <div className="text-sm text-red-600 uppercase tracking-wide mb-2 font-bold">Total Impact</div>
                  <div className="font-bold text-red-800 text-2xl">{selectedAchievement.impact}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </PageLoader>
  )
}
