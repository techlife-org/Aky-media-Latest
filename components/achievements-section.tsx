"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Clock,
  Target,
  Award,
  ArrowRight,
  MapPin,
  Eye,
  Calendar,
  Building,
  GraduationCap,
  Heart,
  Leaf,
  Shield,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Achievement {
  _id: string
  title: string
  description: string
  category: string
  status: "completed" | "ongoing" | "determined"
  progress: number
  date: string
  location: string
  impact: string
  details: string[]
  icon: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "ongoing":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "determined":
      return "bg-amber-100 text-amber-800 border-amber-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "ongoing":
      return <Clock className="w-4 h-4" />
    case "determined":
      return <Target className="w-4 h-4" />
    default:
      return <Target className="w-4 h-4" />
  }
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    infrastructure: Building,
    education: GraduationCap,
    healthcare: Heart,
    environment: Leaf,
    security: Shield,
    finance: Zap,
    agriculture: Leaf,
    default: Award
  }
  return icons[category] || icons.default
}

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    infrastructure: "🏗️",
    education: "🎓",
    healthcare: "🏥",
    environment: "🌱",
    security: "🛡️",
    finance: "💰",
    agriculture: "🌾",
    default: "🏆"
  }
  return emojis[category] || emojis.default
}

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/achievements", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch achievements")
        }

        const data = await response.json()
        // Get the latest 6 achievements for the home page
        setAchievements(data.slice(0, 6))
      } catch (err) {
        console.error("Error fetching achievements:", err)
        setError("Failed to load achievements")
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])



  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">Loading achievements...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Unable to load achievements</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Major Achievements
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Transforming Kano State
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the remarkable achievements and ongoing projects that are shaping the future of Kano State under Governor Abba Kabir Yusuf's leadership
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-500 mx-auto mt-8" />
        </div>



        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {achievements.map((achievement) => {
            const IconComponent = getCategoryIcon(achievement.category)
            return (
              <Card 
                key={achievement._id} 
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden hover:scale-105"
              >
                <div className="relative">
                  {/* Image or Icon */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {achievement.images && achievement.images.length > 0 ? (
                      <Image
                        src={achievement.images[0]}
                        alt={achievement.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getStatusColor(achievement.status)} flex items-center gap-1 shadow-lg border`}>
                        {getStatusIcon(achievement.status)}
                        {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Title and Description */}
                  <div className="space-y-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 pt-4 border-t border-gray-100">
                    <Badge variant="outline" className="capitalize border-gray-300 text-xs bg-gray-50">
                      <span className="mr-1">{getCategoryEmoji(achievement.category)}</span>
                      {achievement.category}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {achievement.location}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{achievement.progress}%</span>
                    </div>
                    <Progress 
                      value={achievement.progress} 
                      className="h-3 bg-gray-100"
                    />
                  </div>

                  {/* Impact */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium text-blue-700">Impact:</span> {achievement.impact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/achievements">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
            >
              <Eye className="w-5 h-5 mr-2" />
              View All Achievements
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}