"use client"

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
import VideoStream from "@/components/video-stream"

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

interface LiveBroadcastClientWithIdProps {
  broadcastId: string
}

export default function LiveBroadcastClientWithId({ broadcastId }: LiveBroadcastClientWithIdProps) {
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
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Check broadcast status
  useEffect(() => {
    const checkBroadcastStatus = async () => {
      try {
        const response = await fetch("/api/broadcast/status")
        const data = await response.json()

        if (data.isActive && data.broadcast && data.broadcast.id === broadcastId) {
          setBroadcastStatus("active")
          setBroadcastInfo({
            id: data.broadcast.id,
            title: data.broadcast.title || "Live Broadcast",
            startedAt: new Date(data.broadcast.startedAt),
            viewerCount: data.viewerCount || 0,
            participants: data.broadcast.participants || [],
          })
          // Set stream URL (in production, this would be the actual stream URL)
          setStreamUrl(`/api/broadcast/stream/${data.broadcast.id}`)
        } else if (data.isActive && data.broadcast && data.broadcast.id !== broadcastId) {
          // There's an active broadcast but it's not the one requested
          setBroadcastStatus("inactive")
          setBroadcastInfo(null)
          setStreamUrl(null)
        } else {
          setBroadcastStatus("inactive")
          setBroadcastInfo(null)
          setStreamUrl(null)
        }
      } catch (error) {
        console.error("Error checking broadcast status:", error)
        setBroadcastStatus("inactive")
      }
    }

    checkBroadcastStatus()
    const interval = setInterval(checkBroadcastStatus, 5000)
    return () => clearInterval(interval)
  }, [broadcastId])

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
          meetingId: broadcastId,
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
          title: "Connected Successfully!",
          description: `Welcome to ${data.broadcast?.title || "the live broadcast"}! You can now watch and participate in chat.`,
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

  // Handle video stream errors
  const handleStreamError = (error: string) => {
    console.error("Video stream error:", error)
    
    // For demo purposes, we'll show a less alarming message
    toast({
      title: "Stream Notice",
      description: "Demo stream is initializing. This is normal for the demo environment.",
      duration: 3000,
    })
  }

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/broadcast/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: broadcastId,
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
          meetingId: broadcastId,
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
      const response = await fetch(`/api/broadcast/chat?meetingId=${broadcastId}`)
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
    // Use the new URL format: /live/broadcast_id
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const shareUrl = `${baseUrl}/live/${broadcastId}`

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
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Checking Broadcast Status</h2>
            <p className="text-red-600">Please wait while we connect you to the live broadcast...</p>
          </div>
        </div>
      </section>
    )
  }

  if (broadcastStatus === "inactive") {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <VideoOff className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-4xl font-bold text-red-800 mb-6">Broadcast Not Found</h2>
            <p className="text-red-600 text-lg mb-4">
              The broadcast with ID <code className="bg-red-100 px-2 py-1 rounded text-sm">{broadcastId}</code> is not currently active.
            </p>
            <p className="text-red-600 text-lg mb-8">
              Please check the link or contact the broadcaster for the correct broadcast URL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/live'} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              >
                <Video className="h-4 w-4 mr-2" />
                Go to Live Page
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-gradient-to-br from-red-50 to-red-100 min-h-screen">
      <div className="container mx-auto px-4">
        {!isConnected ? (
          // Join Form - Viewer Only
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Video className="h-6 w-6" />
                  Join Live Broadcast
                </CardTitle>
                <p className="text-red-100">
                  {broadcastInfo?.title || "Live Broadcast"}
                  <span className="block text-red-200 text-xs">Broadcast ID: {broadcastId}</span>
                </p>
                <Badge className="mx-auto bg-red-800 text-red-100">
                  Viewer Mode - Listen Only
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    onKeyPress={(e) => e.key === "Enter" && joinBroadcast()}
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 border border-red-200">
                  <p className="font-medium mb-2">🎥 Viewer Mode Features:</p>
                  <ul className="space-y-1">
                    <li>• Watch and listen to the live broadcast</li>
                    <li>• Participate in live chat with other viewers</li>
                    <li>• Send reactions and emojis</li>
                    <li>• Your camera and microphone will not be used</li>
                  </ul>
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 text-xs">
                      ✅ <strong>Ready to Connect:</strong> Click "Join as Viewer" to instantly connect to the live broadcast. 
                      The connection is fast and reliable!
                    </p>
                  </div>
                </div>

                {broadcastInfo && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-sm text-green-800 border border-green-200">
                    <p className="font-medium mb-2">🔴 Live Now:</p>
                    <ul className="space-y-1">
                      <li>• {broadcastInfo.title}</li>
                      <li>• {broadcastInfo.viewerCount} viewers watching</li>
                      <li>• Started {broadcastInfo.startedAt ? new Date(broadcastInfo.startedAt).toLocaleTimeString() : 'recently'}</li>
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={joinBroadcast} 
                  disabled={isConnecting || !userName.trim()} 
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg text-lg font-semibold"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining Broadcast...
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
          // Live Broadcast Viewer Interface
          <div className="grid lg:grid-cols-4 gap-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            {/* Main Video Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Broadcast Status */}
              <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg mb-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-red-800 text-red-100 animate-pulse border-red-700">
                    🔴 LIVE
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-red-100">
                    <Users className="h-4 w-4" />
                    <span>{broadcastInfo?.viewerCount || 0} viewers</span>
                  </div>
                  <div className="text-sm text-red-100 font-medium">{broadcastInfo?.title || "Live Broadcast"}</div>
                </div>
                <Button 
                  onClick={shareBroadcast} 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-100 hover:bg-red-800 hover:border-red-200"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Video Container */}
              <div className="relative">
                <VideoStream 
                  streamUrl={streamUrl || undefined}
                  isLive={broadcastStatus === "active"}
                  title={broadcastInfo?.title}
                  onError={handleStreamError}
                />

                {/* Additional Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={leaveBroadcast}
                    title="Leave broadcast"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    title="Refresh stream"
                    className="bg-black/50 border-white/30 text-white hover:bg-white hover:text-black"
                  >
                    <Settings className="h-4 w-4" />
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
                
                {/* Viewer Count Overlay */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{broadcastInfo?.viewerCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Viewers */}
              <Card className="shadow-lg border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
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
              <Card className="flex-1 shadow-lg border-0 bg-white/95">
                <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
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