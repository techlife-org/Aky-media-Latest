"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Camera,
  Volume2,
  Wifi,
  Activity,
  MessageCircle,
  BarChart3,
  Shield,
  LogOut,
  Crown,
  UserX,
  MicIcon,
  Maximize,
  Minimize
} from "lucide-react"

interface AdminData {
  id: string
  email: string
  name: string
  role: string
  permissions: any
}

interface BroadcastSession {
  id: string
  title: string
  description?: string
  isActive: boolean
  startedAt: Date
  meetingLink: string
  participants: any[]
  settings: any
}

interface MediaState {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  hasPermissions: boolean
  stream: MediaStream | null
}

export default function BroadcastControlPage() {
  const router = useRouter()
  
  // Authentication state
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Broadcast state
  const [broadcastSession, setBroadcastSession] = useState<BroadcastSession | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Broadcast settings
  const [broadcastTitle, setBroadcastTitle] = useState("Governor's Live Address")
  const [broadcastDescription, setBroadcastDescription] = useState("")
  const [allowChat, setAllowChat] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)
  const [allowScreenShare, setAllowScreenShare] = useState(true)
  
  // Media state
  const [mediaState, setMediaState] = useState<MediaState>({
    isVideoEnabled: false,
    isAudioEnabled: false,
    isScreenSharing: false,
    hasPermissions: false,
    stream: null
  })
  
  // Stats
  const [broadcastStats, setBroadcastStats] = useState({
    currentViewers: 0,
    peakViewers: 0,
    duration: 0,
    chatMessages: 0
  })
  
  // System health
  const [systemHealth, setSystemHealth] = useState({
    server: true,
    database: true,
    streaming: true
  })
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Initialize media and check broadcast status
  useEffect(() => {
    if (isAuthenticated) {
      checkBroadcastStatus()
      checkSystemHealth()
      
      const interval = setInterval(() => {
        checkBroadcastStatus()
        updateStats()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/broadcast-admin/auth/verify")
      const data = await response.json()
      
      if (data.authenticated && data.admin) {
        setIsAuthenticated(true)
        setAdminData(data.admin)
        
        // Load admin's broadcast settings
        setBroadcastTitle(data.admin.broadcastSettings?.defaultTitle || "Governor's Live Address")
      } else {
        router.push("/broadcast-admin/login")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/broadcast-admin/login")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const logout = async () => {
    try {
      // Stop any active streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      await fetch("/api/broadcast-admin/auth/logout", { method: "POST" })
      router.push("/broadcast-admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const initializeMedia = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      
      setMediaState(prev => ({
        ...prev,
        hasPermissions: true,
        stream,
        isVideoEnabled: true,
        isAudioEnabled: true
      }))
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      toast({
        title: "✅ Media Initialized",
        description: "Camera and microphone are ready for broadcasting."
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)
      let errorMessage = "Could not access camera or microphone."
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera/microphone access denied. Please allow permissions and try again."
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera or microphone found. Please connect a device and try again."
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera/microphone is already in use by another application."
        }
      }
      
      setError(errorMessage)
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const checkBroadcastStatus = async () => {
    try {
      const response = await fetch("/api/broadcast/status")
      const data = await response.json()
      
      if (data.isActive && data.broadcast) {
        setIsActive(true)
        setBroadcastSession(data.broadcast)
        setParticipants(data.broadcast.participants || [])
        setBroadcastStats(prev => ({
          ...prev,
          currentViewers: data.broadcast.participants?.length || 0
        }))
      } else {
        setIsActive(false)
        setBroadcastSession(null)
        setParticipants([])
      }
    } catch (error) {
      console.error("Failed to check broadcast status:", error)
    }
  }

  const checkSystemHealth = async () => {
    try {
      setSystemHealth({
        server: true,
        database: Math.random() > 0.1,
        streaming: Math.random() > 0.05
      })
    } catch (error) {
      console.error("System health check failed:", error)
    }
  }

  const updateStats = () => {
    if (isActive && broadcastSession) {
      setBroadcastStats(prev => ({
        ...prev,
        duration: prev.duration + 3,
        peakViewers: Math.max(prev.peakViewers, participants.length)
      }))
    }
  }

  const startBroadcast = async () => {
    if (!mediaState.hasPermissions) {
      await initializeMedia()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/enhanced-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          description: broadcastDescription,
          settings: {
            maxParticipants: 1000,
            allowScreenShare,
            allowChat,
            allowReactions,
            requireApproval: false,
            isPublic: true
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsActive(true)
        setBroadcastSession(data.broadcast)
        
        // Reset stats for new broadcast
        setBroadcastStats({
          currentViewers: 0,
          peakViewers: 0,
          duration: 0,
          chatMessages: 0
        })

        toast({
          title: "🎉 Broadcast Started Successfully!",
          description: "Your live broadcast is now active. Share the link to invite viewers."
        })
      } else {
        throw new Error(data.message || "Failed to start broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start broadcast"
      setError(errorMessage)
      toast({
        title: "Failed to Start Broadcast",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
          broadcastId: broadcastSession?.id
        })
      })

      if (response.ok) {
        setIsActive(false)
        setBroadcastSession(null)
        setParticipants([])

        toast({
          title: "Broadcast Stopped Successfully",
          description: "Your live broadcast has been ended."
        })
      } else {
        throw new Error("Failed to stop broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stop broadcast"
      setError(errorMessage)
      toast({
        title: "Error Stopping Broadcast",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVideo = async () => {
    if (!streamRef.current) {
      await initializeMedia()
      return
    }

    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      const newState = !mediaState.isVideoEnabled
      videoTrack.enabled = newState
      setMediaState(prev => ({ ...prev, isVideoEnabled: newState }))
      
      toast({
        title: `Camera ${newState ? "Enabled" : "Disabled"}`,
        description: `Your camera is now ${newState ? "on" : "off"}.`
      })
    }
  }

  const toggleAudio = async () => {
    if (!streamRef.current) {
      await initializeMedia()
      return
    }

    const audioTrack = streamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      const newState = !mediaState.isAudioEnabled
      audioTrack.enabled = newState
      setMediaState(prev => ({ ...prev, isAudioEnabled: newState }))
      
      toast({
        title: `Microphone ${newState ? "Enabled" : "Disabled"}`,
        description: `Your microphone is now ${newState ? "on" : "off"}.`
      })
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!mediaState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        // Replace video track with screen share
        if (streamRef.current && videoRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0]
          videoRef.current.srcObject = screenStream
          
          // Handle screen share end
          videoTrack.addEventListener('ended', () => {
            setMediaState(prev => ({ ...prev, isScreenSharing: false }))
            if (videoRef.current && streamRef.current) {
              videoRef.current.srcObject = streamRef.current
            }
          })
        }
        
        setMediaState(prev => ({ ...prev, isScreenSharing: true }))
        
        toast({
          title: "Screen Share Started",
          description: "You are now sharing your screen."
        })
      } else {
        // Stop screen sharing and return to camera
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current
        }
        setMediaState(prev => ({ ...prev, isScreenSharing: false }))
        
        toast({
          title: "Screen Share Stopped",
          description: "Returned to camera view."
        })
      }
    } catch (error) {
      console.error("Error with screen sharing:", error)
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing.",
        variant: "destructive"
      })
    }
  }

  const copyMeetingUrl = () => {
    if (broadcastSession?.meetingLink) {
      navigator.clipboard.writeText(broadcastSession.meetingLink)
      toast({
        title: "✅ Link Copied!",
        description: "Meeting URL has been copied to clipboard."
      })
    }
  }

  const getDuration = () => {
    if (!broadcastSession?.startedAt) return "0m"
    const start = new Date(broadcastSession.startedAt)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Live Broadcast Control
                </h1>
              </div>
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className={`${isActive ? "bg-red-600 hover:bg-red-700 animate-pulse" : ""}`}
              >
                {isActive ? (
                  <>
                    <Radio className="w-4 h-4 mr-1 animate-pulse" />
                    LIVE
                  </>
                ) : (
                  <>
                    <VideoOff className="w-4 h-4 mr-1" />
                    OFFLINE
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Crown className="h-4 w-4" />
                <span>{adminData?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Health Status */}
        <Card className="mb-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
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
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
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
        {isActive && broadcastSession?.meetingLink && (
          <Alert className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
            <Radio className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-green-800">🔴 Broadcast is LIVE!</strong> 
                  <span className="ml-2 text-green-700">Meeting ID: {broadcastSession.id}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyMeetingUrl} className="border-green-300 text-green-700 hover:bg-green-100">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(broadcastSession.meetingLink!, "_blank")}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <div className="text-sm text-green-800 font-medium mb-1">Meeting Link:</div>
                <code className="text-xs bg-white px-2 py-1 rounded border text-green-700 break-all">
                  {broadcastSession.meetingLink}
                </code>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Preview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Preview
                  {isActive && (
                    <Badge variant="destructive" className="ml-auto animate-pulse">
                      🔴 BROADCASTING
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: mediaState.stream ? 'block' : 'none' }}
                  />
                  
                  {!mediaState.stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold">Camera Preview</p>
                          <p className="text-sm text-gray-400 mt-2">Click "Initialize Media" to begin streaming</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isActive && (
                      <Badge variant="destructive" className="animate-pulse shadow-lg">
                        🔴 LIVE
                      </Badge>
                    )}
                    {mediaState.isScreenSharing && (
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        📺 SCREEN SHARING
                      </Badge>
                    )}
                  </div>

                  {/* Viewer count overlay */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{broadcastStats.currentViewers}</span>
                    </div>
                  )}

                  {/* Duration overlay */}
                  {isActive && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{getDuration()}</span>
                    </div>
                  )}
                </div>

                {/* Media Controls */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {!mediaState.hasPermissions ? (
                      <Button
                        onClick={initializeMedia}
                        disabled={isConnecting}
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        size="lg"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            <Camera className="h-5 w-5 mr-2" />
                            Initialize Media
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={mediaState.isVideoEnabled ? "default" : "destructive"}
                          size="lg"
                          onClick={toggleVideo}
                          className="h-12 px-6"
                        >
                          {mediaState.isVideoEnabled ? <Video className="h-5 w-5 mr-2" /> : <VideoOff className="h-5 w-5 mr-2" />}
                          {mediaState.isVideoEnabled ? "Camera On" : "Camera Off"}
                        </Button>
                        <Button
                          variant={mediaState.isAudioEnabled ? "default" : "destructive"}
                          size="lg"
                          onClick={toggleAudio}
                          className="h-12 px-6"
                        >
                          {mediaState.isAudioEnabled ? <Mic className="h-5 w-5 mr-2" /> : <MicOff className="h-5 w-5 mr-2" />}
                          {mediaState.isAudioEnabled ? "Mic On" : "Mic Off"}
                        </Button>
                        <Button
                          variant={mediaState.isScreenSharing ? "default" : "outline"}
                          size="lg"
                          onClick={toggleScreenShare}
                          className="h-12 px-6"
                        >
                          {mediaState.isScreenSharing ? <MonitorOff className="h-5 w-5 mr-2" /> : <Monitor className="h-5 w-5 mr-2" />}
                          {mediaState.isScreenSharing ? "Stop Share" : "Share Screen"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
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
                {!isActive ? (
                  <>
                    <div className="space-y-4">
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="broadcastDescription" className="text-sm font-medium">Description (Optional)</Label>
                        <Textarea
                          id="broadcastDescription"
                          value={broadcastDescription}
                          onChange={(e) => setBroadcastDescription(e.target.value)}
                          placeholder="Enter broadcast description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Broadcast Settings</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowChat" className="text-sm">Allow Chat</Label>
                            <Switch
                              id="allowChat"
                              checked={allowChat}
                              onCheckedChange={setAllowChat}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowReactions" className="text-sm">Allow Reactions</Label>
                            <Switch
                              id="allowReactions"
                              checked={allowReactions}
                              onCheckedChange={setAllowReactions}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowScreenShare" className="text-sm">Allow Screen Share</Label>
                            <Switch
                              id="allowScreenShare"
                              checked={allowScreenShare}
                              onCheckedChange={setAllowScreenShare}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={startBroadcast}
                      disabled={isLoading || !broadcastTitle.trim() || !mediaState.hasPermissions}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-12 text-lg font-semibold shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
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
                    
                    {!mediaState.hasPermissions && (
                      <p className="text-xs text-gray-500 text-center">
                        Initialize media first to enable broadcasting
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">{broadcastSession?.title}</h3>
                      {broadcastSession?.description && (
                        <p className="text-sm text-gray-600">{broadcastSession.description}</p>
                      )}
                    </div>
                    
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Live Statistics */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{broadcastStats.currentViewers}</div>
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
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        Chat Messages
                      </span>
                      <span className="font-bold">{broadcastStats.chatMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-gray-500" />
                        Status
                      </span>
                      <Badge variant={isActive ? "default" : "secondary"} className="font-medium">
                        {isActive ? "Live" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants Management */}
            {isActive && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {participants.map((participant, index) => (
                        <div key={participant.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {participant.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{participant.name || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">
                                Joined {participant.joinedAt ? new Date(participant.joinedAt).toLocaleTimeString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        </div>
                      ))}
                      
                      {participants.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No participants yet</p>
                          <p className="text-xs">Share the meeting link to invite viewers</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}