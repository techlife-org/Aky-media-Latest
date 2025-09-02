"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  Video,
  VideoOff,
  Users,
  Share2,
  Settings,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX
} from "lucide-react"

interface BroadcastInfo {
  id: string
  title: string
  description?: string
  startedAt: Date
  viewerCount: number
}

export default function EnhancedLiveBroadcastClient() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meeting")

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userName, setUserName] = useState("")
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null)
  const [broadcastStatus, setBroadcastStatus] = useState<"active" | "inactive" | "loading">("loading")
  const [audioEnabled, setAudioEnabled] = useState(true)

  useEffect(() => {
    checkBroadcastStatus()
    const interval = setInterval(checkBroadcastStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkBroadcastStatus = async () => {
    try {
      const response = await fetch("/api/broadcast/status")
      const data = await response.json()

      if (data.isActive && data.broadcast) {
        setBroadcastStatus("active")
        setBroadcastInfo({
          id: data.broadcast.id,
          title: data.broadcast.title || "Live Broadcast",
          description: data.broadcast.description,
          startedAt: new Date(data.broadcast.startedAt),
          viewerCount: data.viewerCount || 0
        })
      } else {
        setBroadcastStatus("inactive")
        setBroadcastInfo(null)
      }
    } catch (error) {
      console.error("Error checking broadcast status:", error)
      setBroadcastStatus("inactive")
    }
  }

  const joinBroadcast = async () => {
    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the broadcast.",
        variant: "destructive"
      })
      return
    }

    if (!broadcastInfo) {
      toast({
        title: "No Active Broadcast",
        description: "There is no active broadcast to join at the moment.",
        variant: "destructive"
      })
      return
    }

    setIsConnecting(true)

    try {
      // Simulate joining the broadcast
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsConnected(true)
      toast({
        title: "Joined Successfully",
        description: `Welcome to ${broadcastInfo.title}!`
      })
    } catch (error) {
      console.error("Error joining broadcast:", error)
      toast({
        title: "Connection Error",
        description: "Failed to join the broadcast. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const leaveBroadcast = () => {
    setIsConnected(false)
    toast({
      title: "Left Broadcast",
      description: "You have left the live broadcast."
    })
  }

  const shareBroadcast = async () => {
    const shareUrl = `${window.location.origin}/live${meetingId ? `?meeting=${meetingId}` : ""}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Live Broadcast - ${broadcastInfo?.title || "AKY Media Center"}`,
          text: "Join the live broadcast from Governor Abba Kabir Yusuf",
          url: shareUrl
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Broadcast link copied to clipboard!"
      })
    }
  }

  const formatDuration = (startTime: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (broadcastStatus === "loading") {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking broadcast status...</p>
          </div>
        </div>
      </section>
    )
  }

  if (broadcastStatus === "inactive") {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <VideoOff className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Broadcast</h2>
            <p className="text-gray-600 mb-8">
              There is currently no live broadcast. Please check back later or follow our social media for updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button onClick={shareBroadcast} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Page
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {!isConnected ? (
          // Join Form
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Video className="h-6 w-6" />
                  Join Live Broadcast
                </CardTitle>
                <p className="text-red-100 text-sm">
                  {broadcastInfo?.title || "Live Broadcast"}
                  {meetingId && <span className="block">Meeting ID: {meetingId}</span>}
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    onKeyPress={(e) => e.key === "Enter" && joinBroadcast()}
                    className="h-11"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-2">🎥 Viewer Mode Features:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Watch live video and audio</li>
                    <li>• Participate in live chat</li>
                    <li>• Send reactions and emojis</li>
                    <li>• See other participants</li>
                  </ul>
                </div>

                {broadcastInfo && (
                  <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                    <p className="font-medium mb-2">🔴 Live Now:</p>
                    <p className="text-xs">• {broadcastInfo.title}</p>
                    <p className="text-xs">• {broadcastInfo.viewerCount} viewers watching</p>
                    <p className="text-xs">• Started {formatDuration(broadcastInfo.startedAt)} ago</p>
                  </div>
                )}

                <Button 
                  onClick={joinBroadcast} 
                  disabled={isConnecting || !userName.trim()} 
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-2" />
                      Join as Viewer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Broadcast Interface
          <div className="space-y-4">
            {/* Header Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{broadcastInfo?.viewerCount || 0} viewers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{broadcastInfo ? formatDuration(broadcastInfo.startedAt) : "0:00"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={shareBroadcast} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={leaveBroadcast} variant="destructive" size="sm">
                    <VideoOff className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
              {/* Main Video Area */}
              <div className="lg:col-span-3 space-y-4">
                {/* Broadcast Title */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h1 className="text-2xl font-bold text-gray-900">{broadcastInfo?.title}</h1>
                  {broadcastInfo?.description && (
                    <p className="text-gray-600 mt-2">{broadcastInfo.description}</p>
                  )}
                </div>

                {/* Video Container */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold">Live Video Stream</p>
                        <p className="text-sm text-gray-400 mt-2">Enhanced broadcast client coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Button 
                      size="sm" 
                      variant={audioEnabled ? "default" : "secondary"} 
                      onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                      {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  </div>

                  {/* Connection Quality Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Participants */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Participants (1)
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 truncate">{userName} (You)</span>
                        <Badge variant="outline" className="text-xs">
                          Viewer
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Enhanced Features</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-gray-600">
                      <p>✅ Real-time Connection</p>
                      <p>✅ Enhanced APIs</p>
                      <p>✅ Google Meet-like UI</p>
                      <p>🔄 Full Features Coming Soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}