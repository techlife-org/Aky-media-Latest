"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  })

  const [isLoading, setIsLoading] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState("Governor's Live Address")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check broadcast status on component mount
  useEffect(() => {
    checkBroadcastStatus()
    const interval = setInterval(checkBroadcastStatus, 3000)
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

  const checkBroadcastStatus = async () => {
    try {
      const response = await fetch("/api/broadcast/status")
      if (response.ok) {
        const data = await response.json()
        setBroadcastStatus(data)
        setError(null)
      } else {
        console.error("Failed to check broadcast status")
      }
    } catch (error) {
      console.error("Failed to check broadcast status:", error)
      setError("Failed to connect to server")
    }
  }

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mediaState.isVideoEnabled,
        audio: mediaState.isAudioEnabled,
      })

      setMediaState((prev) => ({
        ...prev,
        stream,
        hasPermissions: true,
      }))

      // Set video element source if exists
      const videoElement = document.getElementById("localVideo") as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = stream
      }

      setError(null)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      setError("Could not access camera or microphone")
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

        if (data.isExisting) {
          toast({
            title: "Connected to Existing Broadcast",
            description: "You're now connected to the active broadcast.",
          })
        } else {
          toast({
            title: "Broadcast Started Successfully!",
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

        // Stop media tracks
        if (mediaState.stream) {
          mediaState.stream.getTracks().forEach((track) => track.stop())
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

  const forceStopAllBroadcasts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // No specific broadcast ID = stop all
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

        toast({
          title: "All Broadcasts Stopped",
          description: `Stopped ${data.stoppedCount || 0} active broadcast(s).`,
        })

        // Refresh status
        setTimeout(checkBroadcastStatus, 1000)
      } else {
        throw new Error(data.message || "Failed to stop broadcasts")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stop broadcasts"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVideo = async () => {
    if (mediaState.stream) {
      const videoTrack = mediaState.stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !mediaState.isVideoEnabled
        setMediaState((prev) => ({
          ...prev,
          isVideoEnabled: !prev.isVideoEnabled,
        }))
      }
    }
  }

  const toggleAudio = async () => {
    if (mediaState.stream) {
      const audioTrack = mediaState.stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !mediaState.isAudioEnabled
        setMediaState((prev) => ({
          ...prev,
          isAudioEnabled: !prev.isAudioEnabled,
        }))
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!mediaState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        const videoElement = document.getElementById("localVideo") as HTMLVideoElement
        if (videoElement) {
          videoElement.srcObject = screenStream
        }

        setMediaState((prev) => ({
          ...prev,
          isScreenSharing: true,
          stream: screenStream,
        }))

        screenStream.getVideoTracks()[0].onended = () => {
          setMediaState((prev) => ({
            ...prev,
            isScreenSharing: false,
          }))
          initializeMedia()
        }
      } else {
        setMediaState((prev) => ({
          ...prev,
          isScreenSharing: false,
        }))
        await initializeMedia()
      }
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
        title: "Link Copied!",
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
    return `${diff}m`
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Broadcast Control</h1>
            <p className="text-gray-600 mt-2">Manage your live broadcasts and streaming sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={checkBroadcastStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Badge variant={broadcastStatus.isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
              {broadcastStatus.isActive ? (
                <>
                  <Radio className="w-4 h-4 mr-2 animate-pulse" />
                  LIVE
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  OFFLINE
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
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
          <Alert className="border-green-200 bg-green-50">
            <Radio className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>🔴 Broadcast is LIVE!</strong> Meeting ID: {broadcastStatus.meetingId}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyMeetingUrl}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareMeetingUrl}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Meeting Link: <code className="bg-green-100 px-2 py-1 rounded">{broadcastStatus.meetingLink}</code>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Preview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>Your live video feed that viewers will see</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video id="localVideo" autoPlay muted playsInline className="w-full h-full object-cover" />
                  {!mediaState.stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera Preview</p>
                        <p className="text-sm opacity-75">Click "Start Broadcast" to begin</p>
                      </div>
                    </div>
                  )}

                  {/* Status Overlay */}
                  {broadcastStatus.isActive && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="destructive" className="animate-pulse">
                        🔴 LIVE
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Media Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant={mediaState.isVideoEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={toggleVideo}
                    disabled={!mediaState.stream || isConnecting}
                  >
                    {mediaState.isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={mediaState.isAudioEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={toggleAudio}
                    disabled={!mediaState.stream || isConnecting}
                  >
                    {mediaState.isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={mediaState.isScreenSharing ? "default" : "outline"}
                    size="sm"
                    onClick={toggleScreenShare}
                    disabled={!mediaState.stream || isConnecting}
                  >
                    {mediaState.isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel - Takes 1 column */}
          <div className="space-y-6">
            {/* Broadcast Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Broadcast Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!broadcastStatus.isActive ? (
                  <>
                    <div>
                      <Label htmlFor="broadcastTitle">Broadcast Title</Label>
                      <Input
                        id="broadcastTitle"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Enter broadcast title"
                      />
                    </div>
                    <Button
                      onClick={startBroadcast}
                      disabled={isLoading || isConnecting}
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading || isConnecting ? "Starting..." : "Start Broadcast"}
                    </Button>
                    <Button
                      onClick={forceStopAllBroadcasts}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
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
                    className="w-full"
                    size="lg"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    {isLoading ? "Stopping..." : "Stop Broadcast"}
                  </Button>
                )}

                {/* Meeting URL Display */}
                {broadcastStatus.isActive && broadcastStatus.meetingLink && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label>Meeting URL</Label>
                      <div className="flex items-center gap-2">
                        <Input value={broadcastStatus.meetingLink} readOnly className="text-xs" />
                        <Button size="sm" variant="outline" onClick={copyMeetingUrl}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={shareMeetingUrl} className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(broadcastStatus.meetingLink!, "_blank")}
                          className="flex-1"
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

            {/* Broadcast Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Viewers</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-bold">{broadcastStatus.viewerCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Participants</span>
                    <span className="font-bold">{broadcastStatus.participants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="font-bold">{getDuration()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={broadcastStatus.isActive ? "default" : "secondary"}>
                      {broadcastStatus.isActive ? "Live" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Status */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Video</span>
                    <span className={mediaState.isVideoEnabled ? "text-green-600" : "text-red-600"}>
                      {mediaState.isVideoEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audio</span>
                    <span className={mediaState.isAudioEnabled ? "text-green-600" : "text-red-600"}>
                      {mediaState.isAudioEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Screen Share</span>
                    <span className={mediaState.isScreenSharing ? "text-blue-600" : "text-gray-600"}>
                      {mediaState.isScreenSharing ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection</span>
                    <span className={mediaState.hasPermissions ? "text-green-600" : "text-gray-600"}>
                      {mediaState.hasPermissions ? "Connected" : "Disconnected"}
                    </span>
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
