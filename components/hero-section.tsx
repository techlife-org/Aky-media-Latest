"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, ArrowRight, Star, Users, Award, VideoOff } from "lucide-react"

export default function HeroSection() {
  const [isLiveBroadcast, setIsLiveBroadcast] = useState(false)
  const [broadcastInfo, setBroadcastInfo] = useState<{
    title?: string
    viewerCount?: number
    duration?: string
  }>({})

  // Check for active broadcast
  useEffect(() => {
    const checkBroadcastStatus = async () => {
      try {
        console.log("[Hero Section] Fetching broadcast status from /api/broadcast/status")
        const response = await fetch("/api/broadcast/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("[Hero Section] Broadcast status response:", data)
        
        setIsLiveBroadcast(data.isActive)
        if (data.isActive) {
          setBroadcastInfo({
            title: data.broadcast?.title || "Live Broadcast",
            viewerCount: data.viewerCount || 0,
            duration: data.duration || "00:00",
          })
        }
      } catch (error) {
        console.error("[Hero Section] Error checking broadcast status:", error)
        setIsLiveBroadcast(false)
      }
    }

    checkBroadcastStatus()
    // Check every 10 seconds
    const interval = setInterval(checkBroadcastStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-white to-red-50 pt-20 pb-16 overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-300/40 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-red-100/50 rounded-full blur-2xl animate-pulse delay-1000"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/3 right-10 w-16 h-16 border-2 border-red-300/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/3 left-20 w-12 h-12 bg-red-400/20 rotate-12 animate-pulse"></div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ef4444' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            // backgroundImage: `/bg.png`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              Welcome to the AKY Media
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">AKY</span>
                <br />
                <span className="text-gray-800">Media</span>
              </h1>

              <div className="space-y-4">
                <p className="text-2xl text-gray-700 font-medium">Personal Website of</p>
                {/* <p className="text-xl text-red-600 font-semibold">Alh. Abba Kabir Yusuf</p> */}
                <p className="text-xl text-red-600 font-semibold">The Executive Governor, Kano State</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">600+</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">44</div>
                <div className="text-sm text-gray-600">LGAs Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">15M+</div>
                <div className="text-sm text-gray-600">Citizens Served</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/news" className="flex items-center gap-2">
                  Latest News
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-red-600 text-red-600 hover:bg-red-50 shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <Link href="/achievement" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  View Achievements
                </Link>
              </Button>
            </div>

            {/* Live Broadcast Button - Only shows and blinks when live */}
            <div className="pt-4">
              {isLiveBroadcast ? (
                <div className="space-y-2">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group animate-pulse"
                  >
                    <Link href="/live" className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                      <Play className="w-4 h-4" />
                      Join Live Broadcast
                    </Link>
                  </Button>
                  <div className="text-sm text-green-600 font-medium">
                    🔴 {broadcastInfo.title} • {broadcastInfo.viewerCount} viewers • {broadcastInfo.duration}
                  </div>
                </div>
              ) : (
                <Button disabled className="bg-gray-400 text-gray-600 cursor-not-allowed opacity-50">
                  <VideoOff className="w-4 h-4 mr-2" />
                  No Live Broadcast
                </Button>
              )}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative animate-fade-in-right">
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-200 to-red-300 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

              {/* Image */}
              <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl">
                <Image
                  src="/pictures/assets/img/he/5.png"
                  alt="Governor Abba Kabir Yusuf"
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-2xl shadow-lg"
                  priority
                />

                {/* Floating Badge
                <div className="absolute -top-2 -right-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Governor
                </div> */}
              </div>

              {/* Floating Cards
              <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-xl shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">15M+</div>
                    <div className="text-xs text-gray-600">Citizens</div>
                  </div>
                </div>
              </div> */}

              {/* <div className="absolute -right-6 bottom-1/4 bg-white p-4 rounded-xl shadow-lg animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">600+</div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
