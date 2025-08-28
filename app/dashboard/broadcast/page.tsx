"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  Share2,
  Settings,
  Play,
  Square,
  Copy,
  ExternalLink,
  Radio,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Eye,
  Clock,
  Signal,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Camera,
  Volume2,
  Wifi,
  Activity,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface BroadcastStatus {
  isActive: boolean
  meetingId: string | null
  participants: number
  startTime: string | null
  title: string
  viewerCount: number
  meetingLink: string | null
}

interface MediaState {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  hasPermissions: boolean
  stream: MediaStream | null
  connectionQuality: "excellent" | "good" | "fair" | "poor"
}

interface BroadcastStats {
  totalViewTime: number
  peakViewers: number
  averageViewTime: number
  chatMessages: number
}

export default function BroadcastPage() {
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>({
    isActive: false,
    meetingId: null,
    participants: 0,
    startTime: null,
    title: "Governor's Live Address",
    viewerCount: 0,
    meetingLink: null,
  })

  const [mediaState, setMediaState] = useState<MediaState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    hasPermissions: false,
    stream: null,
    connectionQuality: "excellent",
  })

  const [broadcastStats, setBroadcastStats] = useState<BroadcastStats>({
    totalViewTime: 0,
    peakViewers: 0,
    averageViewTime: 0,
    chatMessages: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState("Governor's Live Address")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [systemHealth, setSystemHealth] = useState({
    server: true,
    database: true,
    streaming: true,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Check broadcast status on component mount
  useEffect(() => {
    checkBroadcastStatus()
    checkSystemHealth()
    const interval = setInterval(() => {
      checkBroadcastStatus()
      updateStats()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Initialize media when component mounts
  useEffect(() => {
    initializeMedia()
    return () => {
      if (mediaState.stream) {
        mediaState.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Simulate video feed with animated canvas
  useEffect(() => {
    if (mediaState.stream && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let animationId: number
      let time = 0

      const animate = () => {
        time += 0.02
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, `hsl(${(time * 50) % 360}, 70%, 60%)`)
        gradient.addColorStop(1, `hsl(${(time * 50 + 180) % 360}, 70%, 40%)`)
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add animated elements
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
        for (let i = 0; i < 5; i++) {
          const x = (Math.sin(time + i) * 100) + canvas.width / 2
          const y = (Math.cos(time * 1.5 + i) * 50) + canvas.height / 2
          const radius = 20 + Math.sin(time * 2 + i) * 10
          
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Add "LIVE" indicator
        if (broadcastStatus.isActive) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.9)"
          ctx.fillRect(20, 20, 80, 30)
          ctx.fillStyle = "white"
          ctx.font = "bold 14px Arial"
          ctx.fillText("🔴 LIVE", 30, 40)
        }
        
        animationId = requestAnimationFrame(animate)
      }
      
      animate()
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [mediaState.stream, broadcastStatus.isActive])

  const checkSystemHealth = async () => {
    try {
      // Simulate system health checks
      setSystemHealth({
        server: true,
        database: Math.random() > 0.1, // 90% uptime simulation
        streaming: Math.random() > 0.05, // 95% uptime simulation
      })
    } catch (error) {
      console.error("System health check failed:", error)
    }
  }

  const updateStats = () => {
    if (broadcastStatus.isActive) {
      setBroadcastStats(prev => ({
        ...prev,
        totalViewTime: prev.totalViewTime + 3,
        peakViewers: Math.max(prev.peakViewers, broadcastStatus.viewerCount),
        chatMessages: prev.chatMessages + Math.floor(Math.random() * 2),
      }))
    }
  }

  const checkBroadcastStatus = async () => {
    try {
      setConnectionStatus("connecting")
      const response = await fetch("/api/broadcast/status")
      if (response.ok) {
        const data = await response.json()
        setBroadcastStatus(data)
        setError(null)
        setConnectionStatus("connected")
        
        // Update connection quality based on response time
        const responseTime = Date.now()
        setMediaState(prev => ({
          ...prev,
          connectionQuality: responseTime < 100 ? "excellent" : 
                           responseTime < 300 ? "good" : 
                           responseTime < 500 ? "fair" : "poor"
        }))
      } else {
        console.error("Failed to check broadcast status")
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      console.error("Failed to check broadcast status:", error)
      setError("Failed to connect to server")
      setConnectionStatus("disconnected")
    }
  }

  const initializeMedia = async () => {
    try {
      setConnectionStatus("connecting")
      
      // Simulate media initialization
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMediaState((prev) => ({
        ...prev,
        hasPermissions: true,
        stream: {} as MediaStream, // Placeholder stream object
      }))

      setError(null)
      setConnectionStatus("connected")
      
      toast({
        title: "Media Initialized",
        description: "Camera and microphone are ready for broadcasting.",
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)
      setError("Could not access camera or microphone")
      setConnectionStatus("disconnected")
      toast({
        title: "Media Access Error",
        description: "Could not access camera or microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const startBroadcast = async () => {
    if (!mediaState.hasPermissions) {
      await initializeMedia()
    }

    setIsLoading(true)
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          hostName: "Governor Abba Kabir Yusuf",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBroadcastStatus({
          isActive: true,
          meetingId: data.meetingId || data.broadcast.id,
          participants: data.broadcast.participants?.length || 1,
          startTime: data.broadcast.startedAt || new Date().toISOString(),
          title: data.broadcast.title || broadcastTitle,
          viewerCount: data.broadcast.viewerCount || 0,
          meetingLink: data.meetingLink,
        })

        // Reset stats for new broadcast
        setBroadcastStats({
          totalViewTime: 0,
          peakViewers: 0,
          averageViewTime: 0,
          chatMessages: 0,
        })

        if (data.isExisting) {
          toast({
            title: "Connected to Existing Broadcast",
            description: "You're now connected to the active broadcast.",
          })
        } else {
          toast({
            title: "🎉 Broadcast Started Successfully!",
            description: "Your live broadcast is now active. Share the link to invite viewers.",
          })
        }
      } else {
        throw new Error(data.message || "Failed to start broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start broadcast"
      setError(errorMessage)
      toast({
        title: "Failed to Start Broadcast",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Start broadcast error:", error)
    } finally {
      setIsLoading(false)
      setIsConnecting(false)
    }
  }

  const stopBroadcast = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastId: broadcastStatus.meetingId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBroadcastStatus({
          isActive: false,
          meetingId: null,
          participants: 0,
          startTime: null,
          title: "Governor's Live Address",
          viewerCount: 0,
          meetingLink: null,
        })

        // Stop media tracks simulation
        if (mediaState.stream) {
          setMediaState((prev) => ({ ...prev, stream: null }))
        }

        toast({
          title: "Broadcast Stopped Successfully",
          description: "Your live broadcast has been ended.",
        })
      } else {
        throw new Error(data.message || "Failed to stop broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stop broadcast"
      setError(errorMessage)
      toast({
        title: "Error Stopping Broadcast",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Stop broadcast error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVideo = async () => {
    setMediaState((prev) => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled,
    }))
    
    toast({
      title: `Camera ${!mediaState.isVideoEnabled ? "Enabled" : "Disabled"}`,
      description: `Your camera is now ${!mediaState.isVideoEnabled ? "on" : "off"}.`,
    })
  }

  const toggleAudio = async () => {
    setMediaState((prev) => ({
      ...prev,
      isAudioEnabled: !prev.isAudioEnabled,
    }))
    
    toast({
      title: `Microphone ${!mediaState.isAudioEnabled ? "Enabled" : "Disabled"}`,
      description: `Your microphone is now ${!mediaState.isAudioEnabled ? "on" : "off"}.`,
    })
  }

  const toggleScreenShare = async () => {
    try {
      setMediaState((prev) => ({
        ...prev,
        isScreenSharing: !prev.isScreenSharing,
      }))
      
      toast({
        title: `Screen Share ${!mediaState.isScreenSharing ? "Started" : "Stopped"}`,
        description: `Screen sharing is now ${!mediaState.isScreenSharing ? "active" : "inactive"}.`,
      })
    } catch (error) {
      console.error("Error with screen sharing:", error)
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing.",
        variant: "destructive",
      })
    }
  }

  const copyMeetingUrl = () => {
    if (broadcastStatus.meetingLink) {
      navigator.clipboard.writeText(broadcastStatus.meetingLink)
      toast({
        title: "✅ Link Copied!",
        description: "Meeting URL has been copied to clipboard.",
      })
    }
  }

  const shareMeetingUrl = async () => {
    if (!broadcastStatus.meetingLink) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Live Broadcast - AKY Media Center",
          text: "Join Governor Abba Kabir Yusuf's live broadcast",
          url: broadcastStatus.meetingLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        copyMeetingUrl()
      }
    } else {
      copyMeetingUrl()
    }
  }

  const getDuration = () => {
    if (!broadcastStatus.startTime) return "0m"
    const start = new Date(broadcastStatus.startTime)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getConnectionQualityColor = () => {
    switch (mediaState.connectionQuality) {
      case "excellent": return "text-green-600"
      case "good": return "text-blue-600"
      case "fair": return "text-yellow-600"
      case "poor": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getConnectionQualityIcon = () => {
    switch (connectionStatus) {
      case "connected": return <Wifi className="w-4 h-4 text-green-600" />
      case "connecting": return <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
      case "disconnected": return <WifiOff className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
              Live Broadcast Control
            </h1>
            <p className="text-gray-600 text-lg">Manage your live broadcasts and streaming sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              {getConnectionQualityIcon()}
              <span className={`text-sm font-medium ${getConnectionQualityColor()}`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={checkBroadcastStatus} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Badge 
              variant={broadcastStatus.isActive ? "default" : "secondary"} 
              className={`text-lg px-6 py-3 ${broadcastStatus.isActive ? "bg-red-600 hover:bg-red-700 animate-pulse" : ""}`}
            >
              {broadcastStatus.isActive ? (
                <>
                  <Radio className="w-5 h-5 mr-2 animate-pulse" />
                  LIVE
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 mr-2" />
                  OFFLINE
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* System Health Status */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">System Health</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {systemHealth.server ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-sm">Server</span>
                </div>
                <div className="flex items-center gap-2">
                  {systemHealth.database ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-sm">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  {systemHealth.streaming ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-sm">Streaming</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Active Broadcast Info */}
        {broadcastStatus.isActive && broadcastStatus.meetingLink && (
          <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
            <Radio className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-green-800">🔴 Broadcast is LIVE!</strong> 
                  <span className="ml-2 text-green-700">Meeting ID: {broadcastStatus.meetingId}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyMeetingUrl} className="border-green-300 text-green-700 hover:bg-green-100">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareMeetingUrl} className="border-green-300 text-green-700 hover:bg-green-100">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <div className="text-sm text-green-800 font-medium mb-1">Meeting Link:</div>
                <code className="text-xs bg-white px-2 py-1 rounded border text-green-700 break-all">
                  {broadcastStatus.meetingLink}
                </code>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Enhanced Video Preview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Preview
                  {broadcastStatus.isActive && (
                    <Badge variant="destructive" className="ml-auto animate-pulse">
                      🔴 BROADCASTING
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your live video feed that viewers will see
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                  {/* Canvas for animated video simulation */}
                  <canvas 
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                    style={{ display: mediaState.stream ? 'block' : 'none' }}
                  />
                  
                  {/* Placeholder when no stream */}
                  {!mediaState.stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold">Camera Preview</p>
                          <p className="text-sm text-gray-400 mt-2">Click "Start Broadcast" to begin streaming</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Status Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {broadcastStatus.isActive && (
                      <Badge variant="destructive" className="animate-pulse shadow-lg">
                        🔴 LIVE
                      </Badge>
                    )}
                    <Badge variant="secondary" className={`${getConnectionQualityColor()} bg-black/50 text-white border-white/20`}>
                      {mediaState.connectionQuality.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Viewer count overlay */}
                  {broadcastStatus.isActive && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{broadcastStatus.viewerCount}</span>
                    </div>
                  )}

                  {/* Duration overlay */}
                  {broadcastStatus.isActive && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{getDuration()}</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Media Controls */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={mediaState.isVideoEnabled ? "default" : "destructive"}
                      size="lg"
                      onClick={toggleVideo}
                      disabled={!mediaState.stream || isConnecting}
                      className="h-12 px-6"
                    >
                      {mediaState.isVideoEnabled ? <Video className="h-5 w-5 mr-2" /> : <VideoOff className="h-5 w-5 mr-2" />}
                      {mediaState.isVideoEnabled ? "Camera On" : "Camera Off"}
                    </Button>
                    <Button
                      variant={mediaState.isAudioEnabled ? "default" : "destructive"}
                      size="lg"
                      onClick={toggleAudio}
                      disabled={!mediaState.stream || isConnecting}
                      className="h-12 px-6"
                    >
                      {mediaState.isAudioEnabled ? <Mic className="h-5 w-5 mr-2" /> : <MicOff className="h-5 w-5 mr-2" />}
                      {mediaState.isAudioEnabled ? "Mic On" : "Mic Off"}
                    </Button>
                    <Button
                      variant={mediaState.isScreenSharing ? "default" : "outline"}
                      size="lg"
                      onClick={toggleScreenShare}
                      disabled={!mediaState.stream || isConnecting}
                      className="h-12 px-6"
                    >
                      {mediaState.isScreenSharing ? <MonitorOff className="h-5 w-5 mr-2" /> : <Monitor className="h-5 w-5 mr-2" />}
                      {mediaState.isScreenSharing ? "Stop Share" : "Share Screen"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Control Panel - Takes 1 column */}
          <div className="space-y-6">
            {/* Broadcast Controls */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Broadcast Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {!broadcastStatus.isActive ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="broadcastTitle" className="text-sm font-medium">Broadcast Title</Label>
                      <Input
                        id="broadcastTitle"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Enter broadcast title"
                        className="h-11"
                      />
                    </div>
                    <Button
                      onClick={startBroadcast}
                      disabled={isLoading || isConnecting}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-12 text-lg font-semibold shadow-lg"
                      size="lg"
                    >
                      {isLoading || isConnecting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Broadcast
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        fetch("/api/broadcast/stop", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({}),
                        }).then(() => {
                          toast({
                            title: "All Broadcasts Stopped",
                            description: "Stopped all active broadcasts.",
                          })
                          checkBroadcastStatus()
                        })
                      }}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-10"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Force Stop All
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={stopBroadcast}
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full h-12 text-lg font-semibold shadow-lg"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Stopping...
                      </>
                    ) : (
                      <>
                        <Square className="h-5 w-5 mr-2" />
                        Stop Broadcast
                      </>
                    )}
                  </Button>
                )}

                {/* Meeting URL Display */}
                {broadcastStatus.isActive && broadcastStatus.meetingLink && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Meeting URL</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={broadcastStatus.meetingLink} 
                          readOnly 
                          className="text-xs bg-gray-50" 
                        />
                        <Button size="sm" variant="outline" onClick={copyMeetingUrl}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={shareMeetingUrl} className="h-9">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(broadcastStatus.meetingLink!, "_blank")}
                          className="h-9"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Live Statistics */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{broadcastStatus.viewerCount}</div>
                      <div className="text-sm text-blue-700">Current Viewers</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{broadcastStats.peakViewers}</div>
                      <div className="text-sm text-green-700">Peak Viewers</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        Duration
                      </span>
                      <span className="font-bold text-lg">{getDuration()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        Participants
                      </span>
                      <span className="font-bold">{broadcastStatus.participants}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        Status
                      </span>
                      <Badge variant={broadcastStatus.isActive ? "default" : "secondary"} className="font-medium">
                        {broadcastStatus.isActive ? "Live" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                  
                  {broadcastStatus.isActive && (
                    <div className="pt-2">
                      <div className="text-sm text-gray-600 mb-2">Broadcast Health</div>
                      <Progress value={85} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">Excellent connection quality</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Technical Status */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Signal className="h-4 w-4" />
                  Technical Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">Video</span>
                      </div>
                      <Badge variant={mediaState.isVideoEnabled ? "default" : "secondary"} className="text-xs">
                        {mediaState.isVideoEnabled ? "Active" : "Off"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">Audio</span>
                      </div>
                      <Badge variant={mediaState.isAudioEnabled ? "default" : "secondary"} className="text-xs">
                        {mediaState.isAudioEnabled ? "Active" : "Off"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Screen Share</span>
                      <Badge variant={mediaState.isScreenSharing ? "default" : "secondary"} className="text-xs">
                        {mediaState.isScreenSharing ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Connection</span>
                      <div className="flex items-center gap-2">
                        {getConnectionQualityIcon()}
                        <Badge variant={mediaState.hasPermissions ? "default" : "secondary"} className="text-xs">
                          {mediaState.hasPermissions ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Quality</span>
                      <Badge variant="outline" className={`text-xs ${getConnectionQualityColor()}`}>
                        {mediaState.connectionQuality.charAt(0).toUpperCase() + mediaState.connectionQuality.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}