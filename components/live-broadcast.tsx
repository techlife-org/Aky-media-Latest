"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Video,
  Users,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Calendar,
  Clock,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Participant {
  id: string
  name: string
  avatar?: string
  joinedAt: Date
  isHost: boolean
}

interface LiveBroadcast {
  id: string
  title: string
  isActive: boolean
  startedAt: Date
  meetingLink: string
  participants: Participant[]
  viewerCount: number
}

export default function LiveBroadcast() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meeting")

  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeBroadcast, setActiveBroadcast] = useState<LiveBroadcast | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; name: string; message: string; time: Date }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    checkActiveBroadcast()
    const interval = setInterval(checkActiveBroadcast, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Auto-join if meeting ID is provided in URL
  useEffect(() => {
    if (meetingId && activeBroadcast && activeBroadcast.id === meetingId && !hasJoined) {
      // Auto-fill a default name or prompt for name
      setParticipantName(`Viewer_${Math.random().toString(36).substring(2, 8)}`)
    }
  }, [meetingId, activeBroadcast, hasJoined])

  // Check for active broadcast
  const checkActiveBroadcast = async () => {
    try {
      const response = await fetch("/api/broadcast/status")
      const data = await response.json()

      if (data.broadcast) {
        setActiveBroadcast(data.broadcast)

        // If this is a direct meeting link, auto-join
        if (meetingId && data.broadcast.id === meetingId && !hasJoined && participantName) {
          joinMeeting()
        }
      } else {
        setActiveBroadcast(null)
      }
    } catch (error) {
      console.error("Error checking broadcast status:", error)
    } finally {
      setLoading(false)
    }
  }

  // Copy meeting link
  const copyMeetingLink = () => {
    if (activeBroadcast) {
      navigator.clipboard.writeText(activeBroadcast.meetingLink)
      toast({
        title: "Link Copied!",
        description: "Meeting link has been copied to clipboard.",
      })
    }
  }

  // Share to social media
  const shareToSocial = (platform: string) => {
    if (!activeBroadcast) return

    const text = "Join Governor Abba Kabir Yusuf's live broadcast!"
    const url = activeBroadcast.meetingLink

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`,
    }

    if (platform === "instagram") {
      toast({
        title: "Instagram Sharing",
        description: "Copy the link and share it in your Instagram story or post.",
      })
      copyMeetingLink()
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
    }
  }

  // Join meeting
  const joinMeeting = async () => {
    if (!participantName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the meeting.",
        variant: "destructive",
      })
      return
    }

    if (!activeBroadcast) {
      toast({
        title: "No Active Broadcast",
        description: "There is no active broadcast to join at the moment.",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)

    try {
      const response = await fetch("/api/broadcast/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastId: activeBroadcast.id,
          participantName,
        }),
      })

      if (response.ok) {
        setHasJoined(true)
        toast({
          title: "Joined Successfully!",
          description: "You have joined the live broadcast.",
        })

        // Refresh broadcast data
        checkActiveBroadcast()
      } else {
        throw new Error("Failed to join")
      }
    } catch (error) {
      toast({
        title: "Failed to Join",
        description: "There was an error joining the meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || !hasJoined || !activeBroadcast) return

    try {
      const response = await fetch("/api/broadcast/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastId: activeBroadcast.id,
          participantName,
          message: newMessage,
        }),
      })

      if (response.ok) {
        const messageData = {
          id: Date.now().toString(),
          name: participantName,
          message: newMessage,
          time: new Date(),
        }
        setChatMessages((prev) => [...prev, messageData])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const upcomingEvents = [
    {
      title: "Weekly State Address",
      date: "2024-01-20",
      time: "15:00",
      platform: "All Platforms",
      description: "Governor's weekly address to the people of Kano State",
    },
    {
      title: "Infrastructure Project Launch",
      date: "2024-01-25",
      time: "10:00",
      platform: "Facebook & YouTube",
      description: "Live coverage of new road construction project launch",
    },
    {
      title: "Community Town Hall",
      date: "2024-01-30",
      time: "16:00",
      platform: "All Platforms",
      description: "Interactive session with citizens - Q&A and feedback",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking for active broadcasts...</p>
          </div>
        </div>
      </section>
    )
  }

  // If accessed via meeting link but no active broadcast
  if (meetingId && !activeBroadcast) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Broadcast Not Found</h3>
              <p className="text-gray-600 mb-6">
                The broadcast you're trying to join is not currently active or may have ended.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <a href="/live">View Live Page</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Live Status Banner */}
        <div className="mb-12">
          <Card
            className={`${activeBroadcast ? "bg-gradient-to-r from-green-600 to-green-800" : "bg-gradient-to-r from-gray-600 to-gray-800"} text-white border-0`}
          >
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {activeBroadcast ? (
                  <>
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <Wifi className="w-6 h-6" />
                    <h2 className="text-3xl font-bold">Live Broadcast Active</h2>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-6 h-6" />
                    <h2 className="text-3xl font-bold">No Active Broadcast</h2>
                  </>
                )}
              </div>
              <p className="text-white/90 text-lg mb-4">
                Current Time:{" "}
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <p className="text-white/80">
                {activeBroadcast
                  ? `Governor Abba Kabir Yusuf is currently live! Join ${activeBroadcast.participants.length} participants.`
                  : "No live broadcast is currently active. Check back later or follow our social media for announcements."}
              </p>
            </CardContent>
          </Card>
        </div>

        {activeBroadcast ? (
          <>
            {/* Active Broadcast Section */}
            <div className="mb-12">
              <Card className="bg-gradient-to-r from-red-600 to-red-800 text-white border-0">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                        <h2 className="text-3xl font-bold">{activeBroadcast.title}</h2>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Users className="w-3 h-3 mr-1" />
                          {activeBroadcast.viewerCount} viewers
                        </Badge>
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                          <Users className="w-3 h-3 mr-1" />
                          {activeBroadcast.participants.length} participants
                        </Badge>
                        <Badge className="bg-purple-500 hover:bg-purple-600">
                          Started {new Date(activeBroadcast.startedAt).toLocaleTimeString()}
                        </Badge>
                      </div>

                      <p className="text-white/90 mb-6">
                        Join the live broadcast and participate in real-time discussions with Governor Abba Kabir Yusuf.
                      </p>

                      {!hasJoined && (
                        <div className="flex gap-4">
                          <Input
                            placeholder="Enter your name to join"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                          />
                          <Button
                            onClick={joinMeeting}
                            disabled={isJoining}
                            className="bg-white text-red-600 hover:bg-gray-100"
                            size="lg"
                          >
                            {isJoining ? "Joining..." : "Join Meeting"}
                          </Button>
                        </div>
                      )}

                      {hasJoined && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">You are connected as {participantName}</span>
                        </div>
                      )}
                    </div>

                    {/* Live Stream Embed */}
                    <div className="relative">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Video className="w-16 h-16 mx-auto mb-4 opacity-75" />
                            <p className="text-lg">Live Stream</p>
                            <p className="text-sm opacity-75">Broadcasting from Governor's Office</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Meeting Link & Sharing */}
            <div className="mb-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Share This Broadcast</h3>
                  <div className="flex gap-4 mb-4">
                    <Input value={activeBroadcast.meetingLink} readOnly className="flex-1" />
                    <Button onClick={copyMeetingLink} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => shareToSocial("facebook")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={() => shareToSocial("twitter")} className="bg-sky-500 hover:bg-sky-600 text-white">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial("instagram")}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Participants List */}
            <div className="mb-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    <Users className="w-5 h-5 inline mr-2" />
                    Participants ({activeBroadcast.participants.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBroadcast.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold">{participant.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {participant.name}
                            {participant.isHost && (
                              <Badge className="ml-2 bg-red-600 hover:bg-red-700 text-xs">Host</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Chat */}
            {hasJoined && (
              <div className="mb-12">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      <MessageCircle className="w-5 h-5 inline mr-2" />
                      Live Chat
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                      {chatMessages.length > 0 ? (
                        <div className="space-y-3">
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-red-600 text-sm font-bold">
                                  {msg.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{msg.name}</span>
                                  <span className="text-xs text-gray-500">{msg.time.toLocaleTimeString()}</span>
                                </div>
                                <p className="text-gray-700">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center">No messages yet. Be the first to say something!</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} className="bg-red-600 hover:bg-red-700 text-white">
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <>
            {/* No Active Broadcast */}
            <div className="mb-12">
              <Card className="text-center">
                <CardContent className="p-12">
                  <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Live Broadcast Currently</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    There is no active live broadcast at the moment. Follow our social media channels or check back
                    later for upcoming live events with Governor Abba Kabir Yusuf.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <a
                        href="https://www.facebook.com/share/18p6gDcA1B/?mibextid=LQQJ4d"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        Follow on Facebook
                      </a>
                    </Button>
                    <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
                      <a
                        href="https://x.com/kyusufabba?s=21&t=QVAaej86af3fs31NIYvGSA"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Follow on Twitter
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Live Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time} WAT</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>{event.platform}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3 text-sm">{event.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Join Instructions */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How to Join Live Broadcasts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">1. Enter Your Name</h3>
                <p className="text-gray-600 text-sm">
                  When a broadcast is live, simply enter your name to join the meeting
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">2. Watch & Listen</h3>
                <p className="text-gray-600 text-sm">
                  Enjoy the live video stream and audio from the Governor's office
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">3. Participate</h3>
                <p className="text-gray-600 text-sm">
                  Use the live chat to ask questions and engage with other participants
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
