"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Video,
  VideoOff,
  Users,
  MessageCircle,
  Send,
  Share2,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  ThumbsUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Participant {
  id: string
  name: string
  isHost: boolean
  joinedAt: Date
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type?: "message" | "reaction" | "join" | "leave"
}

interface BroadcastInfo {
  id: string
  title: string
  startedAt: Date
  viewerCount: number
  participants: Participant[]
}

export default function LiveBroadcastClient() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meeting")

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userName, setUserName] = useState("")
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [broadcastStatus, setBroadcastStatus] = useState<"active" | "inactive" | "loading">("loading")
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null)

  const broadcastVideoRef = useRef<HTMLVideoElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Check broadcast status
  useEffect(() => {
    const checkBroadcastStatus = async () => {
      try {
        const response = await fetch("/api/broadcast/status")
        const data = await response.json()

        if (data.isActive && data.broadcast) {
          setBroadcastStatus("active")
          setBroadcastInfo({
            id: data.broadcast.id,
            title: data.broadcast.title || "Live Broadcast",
            startedAt: new Date(data.broadcast.startedAt),
            viewerCount: data.viewerCount || 0,
            participants: data.broadcast.participants || [],
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

    checkBroadcastStatus()
    const interval = setInterval(checkBroadcastStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  // Join broadcast as viewer only
  const joinBroadcast = async () => {
    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the broadcast.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      // Join the broadcast as viewer
      const response = await fetch("/api/broadcast/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meetingId || "default",
          userName,
          userType: "viewer",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsConnected(true)

        // Add user to participants
        const newParticipant: Participant = {
          id: data.participant.id,
          name: userName,
          isHost: false,
          joinedAt: new Date(),
        }

        setParticipants((prev) => [...prev, newParticipant])

        // Add join message to chat
        const joinMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: "system",
          userName: "System",
          message: `${userName} joined the broadcast`,
          timestamp: new Date(),
          type: "join",
        }

        setChatMessages((prev) => [...prev, joinMessage])

        // Load chat history
        await loadChatHistory()

        toast({
          title: "Joined Successfully",
          description: `You have joined ${data.broadcast?.title || "the live broadcast"}!`,
        })
      } else {
        throw new Error(data.message || "Failed to join broadcast")
      }
    } catch (error) {
      console.error("Error joining broadcast:", error)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to join the broadcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Leave broadcast
  const leaveBroadcast = () => {
    setIsConnected(false)
    setParticipants([])
    setChatMessages([])

    toast({
      title: "Left Broadcast",
      description: "You have left the live broadcast.",
    })
  }

  // Toggle audio (viewer's audio output)
  const toggleAudio = () => {
    if (broadcastVideoRef.current) {
      broadcastVideoRef.current.muted = isAudioEnabled
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen && broadcastVideoRef.current) {
      if (broadcastVideoRef.current.requestFullscreen) {
        broadcastVideoRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/broadcast/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meetingId || "default",
          userName,
          message: newMessage.trim(),
          type: "message",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const message: ChatMessage = {
          id: data.chatMessage.id,
          userId: data.chatMessage.id,
          userName,
          message: newMessage.trim(),
          timestamp: new Date(),
          type: "message",
        }

        setChatMessages((prev) => [...prev, message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Fallback to local message
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        userName,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: "message",
      }

      setChatMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  // Send reaction
  const sendReaction = async (reaction: string) => {
    try {
      const response = await fetch("/api/broadcast/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meetingId || "default",
          userName,
          message: reaction,
          type: "reaction",
        }),
      })

      if (response.ok) {
        const reactionMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: Date.now().toString(),
          userName,
          message: reaction,
          timestamp: new Date(),
          type: "reaction",
        }

        setChatMessages((prev) => [...prev, reactionMessage])
      }
    } catch (error) {
      console.error("Error sending reaction:", error)
      // Fallback to local reaction
      const reactionMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        userName,
        message: reaction,
        timestamp: new Date(),
        type: "reaction",
      }

      setChatMessages((prev) => [...prev, reactionMessage])
    }
  }

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/broadcast/chat?meetingId=${meetingId || "default"}`)
      if (response.ok) {
        const data = await response.json()
        const messages = data.messages.map((msg: any) => ({
          id: msg.id,
          userId: msg.id,
          userName: msg.userName,
          message: msg.message,
          timestamp: new Date(msg.timestamp),
          type: msg.type || "message",
        }))
        setChatMessages(messages)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  // Share broadcast
  const shareBroadcast = async () => {
    const shareUrl = `${window.location.origin}/live${meetingId ? `?meeting=${meetingId}` : ""}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Live Broadcast - ${broadcastInfo?.title || "AKY Media Center"}`,
          text: "Join the live broadcast from Governor Abba Kabir Yusuf",
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Broadcast link copied to clipboard!",
      })
    }
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
    <section className="py-8">
      <div className="container mx-auto px-4">
        {!isConnected ? (
          // Join Form - Viewer Only
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Video className="h-6 w-6 text-red-600" />
                  Join Live Broadcast
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {broadcastInfo?.title || "Live Broadcast"}
                  {meetingId && <span className="block">Meeting ID: {meetingId}</span>}
                </p>
                <Badge variant="secondary" className="mx-auto">
                  Viewer Mode - Listen Only
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    onKeyPress={(e) => e.key === "Enter" && joinBroadcast()}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <p className="font-medium">Viewer Mode:</p>
                  <p>• You can watch and listen to the broadcast</p>
                  <p>• You can participate in the chat</p>
                  <p>• Your camera and microphone will not be used</p>
                </div>

                {broadcastInfo && (
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                    <p className="font-medium">🔴 Live Now:</p>
                    <p>• {broadcastInfo.title}</p>
                    <p>• {broadcastInfo.viewerCount} viewers watching</p>
                  </div>
                )}

                <Button onClick={joinBroadcast} disabled={isConnecting} className="w-full">
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Join as Viewer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Live Broadcast Viewer Interface
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Video Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Broadcast Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{broadcastInfo?.viewerCount || 0} viewers</span>
                  </div>
                  <div className="text-sm text-gray-600">{broadcastInfo?.title || "Live Broadcast"}</div>
                </div>
                <Button onClick={shareBroadcast} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Video Container */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={broadcastVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg?height=720&width=1280"
                />

                {/* Viewer Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button size="sm" variant={isAudioEnabled ? "default" : "secondary"} onClick={toggleAudio}>
                    {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={leaveBroadcast}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>

                {/* Reaction Buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => sendReaction("👍")}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendReaction("❤️")}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Live Indicator */}
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Viewers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Viewers ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate">{participant.name}</span>
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs">
                              Host
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Live Chat */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-48" ref={chatScrollRef}>
                    <div className="space-y-2">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-medium ${
                                message.type === "join" || message.type === "leave"
                                  ? "text-green-600"
                                  : message.type === "reaction"
                                    ? "text-purple-600"
                                    : "text-red-600"
                              }`}
                            >
                              {message.userName}:
                            </span>
                            <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className={`break-words ${message.type === "reaction" ? "text-2xl" : "text-gray-700"}`}>
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator />

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
