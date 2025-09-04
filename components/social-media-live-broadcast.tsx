"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Camera,
  Clock
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import SocialMediaVideoStream from "@/components/social-media-video-stream"

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

export default function SocialMediaLiveBroadcast() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meeting")

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userName, setUserName] = useState("")
  const [broadcastStatus, setBroadcastStatus] = useState<"active" | "inactive" | "loading">("loading")
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

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
          setStreamUrl(`/api/broadcast/stream/${data.broadcast.id}`)
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
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  // Join broadcast as viewer
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

        const newParticipant: Participant = {
          id: data.participant.id,
          name: userName,
          isHost: false,
          joinedAt: new Date(),
        }

        setParticipants((prev) => [...prev, newParticipant])

        const joinMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: "system",
          userName: "System",
          message: `${userName} joined the broadcast`,
          timestamp: new Date(),
          type: "join",
        }

        setChatMessages((prev) => [...prev, joinMessage])
        await loadChatHistory()

        toast({
          title: "🎉 Welcome to the Live Stream!",
          description: `You're now watching ${data.broadcast?.title || "the live broadcast"}. Enjoy the show!`,
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
      description: "Thanks for watching! Come back anytime.",
    })
  }

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsTyping(true)

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
    } finally {
      setIsTyping(false)
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const shareUrl = meetingId ? `${baseUrl}/live/${meetingId}` : `${baseUrl}/live`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `🔴 LIVE: ${broadcastInfo?.title || "AKY Media Center"}`,
          text: "Join the live broadcast from Governor Abba Kabir Yusuf",
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied! 📋",
        description: "Share this link with friends to watch together!",
      })
    }
  }

  if (broadcastStatus === "loading") {
    return (
      <section className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto"></div>
            <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Connecting to Live Stream</h2>
          <p className="text-white/80 text-lg">Preparing the best viewing experience for you...</p>
        </div>
      </section>
    )
  }

  if (broadcastStatus === "inactive") {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <VideoOff className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Stream Offline</h2>
          <p className="text-gray-300 text-lg mb-8">
            The broadcaster isn't live right now. Follow us for notifications when we go live!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button 
              onClick={shareBroadcast} 
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Page
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900">
      {!isConnected ? (
        // Social Media Style Join Screen
        <section className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader className="text-center bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white rounded-t-lg p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <Camera className="h-8 w-8 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <h1 className="text-2xl font-bold">Join Live Stream</h1>
                </div>
                <p className="text-white/90 text-lg">
                  {broadcastInfo?.title || "Live Broadcast"}
                </p>
                {meetingId && (
                  <Badge className="mx-auto bg-white/20 text-white border-white/30 mt-2">
                    Stream ID: {meetingId.slice(0, 8)}...
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3 text-lg">What's your name?</label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your display name"
                    className="h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-red-400"
                    onKeyPress={(e) => e.key === "Enter" && joinBroadcast()}
                  />
                </div>

                <div className="glass-dark p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Video className="h-6 w-6 text-red-400" />
                    <h3 className="text-white font-bold text-lg">Viewer Experience</h3>
                  </div>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Watch live video and audio
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Chat with other viewers
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Send reactions and emojis
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Social media style interface
                    </li>
                  </ul>
                </div>

                {broadcastInfo && (
                  <div className="glass-effect p-6 rounded-2xl border border-green-200/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <h3 className="text-white font-bold text-lg">Now Live</h3>
                    </div>
                    <div className="space-y-2 text-white/90">
                      <p className="font-medium">{broadcastInfo.title}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {broadcastInfo.viewerCount} watching
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Started {new Date(broadcastInfo.startedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={joinBroadcast} 
                  disabled={isConnecting || !userName.trim()} 
                  className="w-full h-14 bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:via-red-600 hover:to-red-800 text-white shadow-lg text-lg font-bold rounded-xl"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Joining Stream...
                    </>
                  ) : (
                    <>
                      <Video className="h-6 w-6 mr-3" />
                      Join Live Stream
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
        // Social Media Style Live Interface
        <div className="min-h-screen p-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Main Video Area */}
              <div className="lg:col-span-3 space-y-4">
                {/* Stream Header */}
                <div className="glass-dark rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-red-500 text-white animate-pulse px-4 py-2 text-sm font-bold">
                      🔴 LIVE
                    </Badge>
                    <div className="flex items-center gap-2 text-white">
                      <Users className="h-5 w-5" />
                      <span className="font-bold">{broadcastInfo?.viewerCount || 0}</span>
                      <span className="text-white/70">watching</span>
                    </div>
                    <div className="hidden sm:block text-white font-medium">
                      {broadcastInfo?.title || "Live Broadcast"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={shareBroadcast} 
                      variant="outline" 
                      size="sm"
                      className="bg-red-500/80 border-red-400/50 text-white hover:bg-red-600/90"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      onClick={leaveBroadcast} 
                      variant="destructive" 
                      size="sm"
                      className="bg-red-500/80 hover:bg-red-600"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Video Stream */}
                <SocialMediaVideoStream 
                  streamUrl={streamUrl || undefined}
                  isLive={broadcastStatus === "active"}
                  title={broadcastInfo?.title}
                  chatMessages={chatMessages}
                  onSendReaction={sendReaction}
                  viewerCount={broadcastInfo?.viewerCount || 0}
                  hostName={broadcastInfo?.participants?.find(p => p.isHost)?.name || "Broadcaster"}
                />
              </div>

              {/* Chat Sidebar - Desktop */}
              <div className="hidden lg:block space-y-4">
                {/* Participants */}
                <Card className="glass-dark border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Live Viewers ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-red-400">
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-sm font-bold">
                                {participant.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{participant.name}</p>
                              {participant.isHost && (
                                <Badge variant="secondary" className="text-xs bg-red-500 text-white">
                                  Host
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Live Chat */}
                <Card className="glass-dark border-white/10 flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <MessageCircle className="h-5 w-5" />
                      Live Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-64" ref={chatScrollRef}>
                      <div className="space-y-3">
                        {chatMessages.map((message) => (
                          <div key={message.id} className="animate-slide-in-left">
                            {message.type === "reaction" ? (
                              <div className="flex justify-center">
                                <div className="glass-effect rounded-full px-3 py-1">
                                  <span className="text-2xl">{message.message}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs">
                                      {message.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className={`font-medium text-sm ${
                                    message.type === "join" || message.type === "leave"
                                      ? "text-green-400"
                                      : "text-white"
                                  }`}>
                                    {message.userName}
                                  </span>
                                  <span className="text-xs text-white/50">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-white/90 text-sm break-words ml-8">
                                  {message.message}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          ref={messageInputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                          disabled={isTyping}
                        />
                        <Button 
                          size="sm" 
                          onClick={sendMessage}
                          disabled={isTyping || !newMessage.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Quick Reactions */}
                      <div className="flex gap-1 justify-center">
                        {['❤️', '👍', '😂', '😮', '👏', '🔥'].map((emoji) => (
                          <Button
                            key={emoji}
                            size="sm"
                            variant="outline"
                            onClick={() => sendReaction(emoji)}
                            className="bg-red-500/80 border-red-400/50 hover:bg-red-600/90 p-2 text-white"
                          >
                            <span className="text-lg">{emoji}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}