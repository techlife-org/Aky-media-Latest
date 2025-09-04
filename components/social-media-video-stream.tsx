"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Heart,
  ThumbsUp,
  Smile,
  MessageCircle,
  Users,
  Camera,
  Mic,
  MicOff
} from "lucide-react"

interface VideoStreamProps {
  streamUrl?: string
  isLive?: boolean
  title?: string
  onError?: (error: string) => void
  chatMessages?: ChatMessage[]
  onSendReaction?: (reaction: string) => void
  viewerCount?: number
  hostName?: string
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type?: "message" | "reaction" | "join" | "leave"
}

interface FloatingReaction {
  id: string
  emoji: string
  x: number
  y: number
  timestamp: number
}

type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected'

export default function SocialMediaVideoStream({ 
  streamUrl, 
  isLive = false, 
  title, 
  onError,
  chatMessages = [],
  onSendReaction,
  viewerCount = 0,
  hostName = "Broadcaster"
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('excellent')
  const [isConnected, setIsConnected] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const [showChatOverlay, setShowChatOverlay] = useState(true)
  
  const animationRef = useRef<number | null>(null)
  const reactionAnimationRef = useRef<number | null>(null)

  // Create realistic camera feed simulation
  const startCameraSimulation = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 1920
    canvas.height = 1080
    
    let frame = 0
    let time = 0
    
    const animate = () => {
      time += 0.016 // 60fps
      
      // Create dynamic background with camera-like movement - RED THEME
      const gradient = ctx.createRadialGradient(
        canvas.width/2 + Math.sin(time * 0.5) * 100, 
        canvas.height/2 + Math.cos(time * 0.3) * 80, 
        0,
        canvas.width/2, 
        canvas.height/2, 
        canvas.width * 0.8
      )
      gradient.addColorStop(0, '#dc2626')
      gradient.addColorStop(0.3, '#ef4444')
      gradient.addColorStop(0.7, '#991b1b')
      gradient.addColorStop(1, '#7f1d1d')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add moving particles for dynamic effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.1 + i) * canvas.width/2) + canvas.width/2
        const y = (Math.cos(time * 0.15 + i * 0.5) * canvas.height/2) + canvas.height/2
        const size = Math.sin(time + i) * 3 + 5
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Simulate camera focus effect
      const focusIntensity = Math.sin(time * 0.2) * 0.1 + 0.9
      ctx.globalAlpha = focusIntensity
      
      // Main content area
      const contentY = canvas.height * 0.3
      
      // Host name and title
      ctx.fillStyle = 'white'
      ctx.font = 'bold 72px Arial'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 20
      ctx.fillText('🎥 LIVE BROADCAST', canvas.width / 2, contentY)
      
      ctx.font = 'bold 48px Arial'
      ctx.fillText(`Host: ${hostName}`, canvas.width / 2, contentY + 100)
      
      ctx.font = '36px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillText(title || 'Live Stream', canvas.width / 2, contentY + 160)
      
      // Live indicator with pulse
      const pulseSize = Math.sin(time * 3) * 10 + 40
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(canvas.width / 2 - 200, contentY + 250, pulseSize, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 32px Arial'
      ctx.fillText('🔴 LIVE', canvas.width / 2 - 200, contentY + 260)
      
      // Viewer count
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = '28px Arial'
      ctx.fillText(`👥 ${viewerCount} watching`, canvas.width / 2 + 200, contentY + 260)
      
      // Timestamp
      ctx.font = '24px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, contentY + 320)
      
      // Audio visualization bars - RED THEME
      ctx.fillStyle = '#ef4444'
      for (let i = 0; i < 20; i++) {
        const barHeight = Math.sin(time * 5 + i * 0.5) * 30 + 40
        const x = canvas.width / 2 - 200 + i * 20
        const y = contentY + 380
        
        ctx.fillRect(x, y, 15, barHeight)
      }
      
      // Connection quality indicator - RED THEME
      ctx.fillStyle = connectionQuality === 'excellent' ? '#ef4444' : 
                     connectionQuality === 'good' ? '#dc2626' : '#991b1b'
      ctx.font = '20px Arial'
      ctx.fillText(`📶 ${connectionQuality.toUpperCase()}`, canvas.width / 2, contentY + 450)
      
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      
      frame++
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    // Create MediaStream from canvas
    try {
      if ('captureStream' in canvas) {
        const stream = (canvas as any).captureStream(30)
        video.srcObject = stream
        video.play().then(() => {
          setIsLoading(false)
          setError(null)
          setIsConnected(true)
          setConnectionQuality('excellent')
        }).catch((err) => {
          console.warn('Video play failed:', err)
          setIsLoading(false)
          setError(null)
          setIsConnected(true)
          setConnectionQuality('good')
        })
      } else {
        setIsLoading(false)
        setError(null)
        setIsConnected(true)
        setConnectionQuality('good')
      }
    } catch (streamError) {
      console.warn('MediaStream creation failed:', streamError)
      setIsLoading(false)
      setError(null)
      setIsConnected(true)
      setConnectionQuality('good')
    }
  }, [hostName, title, viewerCount, connectionQuality])

  // Initialize stream
  const initializeStream = useCallback(() => {
    console.log('Initializing social media stream...')
    setIsLoading(true)
    setError(null)
    
    if (isLive) {
      setTimeout(() => {
        startCameraSimulation()
      }, 1000)
    } else {
      setIsLoading(false)
      setIsConnected(false)
    }
  }, [isLive, startCameraSimulation])

  // Handle floating reactions
  const addFloatingReaction = useCallback((emoji: string) => {
    const newReaction: FloatingReaction = {
      id: Math.random().toString(36).substring(7),
      emoji,
      x: Math.random() * 80 + 10, // 10-90% from left
      y: 90, // Start from bottom
      timestamp: Date.now()
    }
    
    setFloatingReactions(prev => [...prev, newReaction])
    
    // Remove reaction after animation
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id))
    }, 3000)
  }, [])

  // Animate floating reactions
  useEffect(() => {
    const animateReactions = () => {
      setFloatingReactions(prev => 
        prev.map(reaction => ({
          ...reaction,
          y: reaction.y - 0.5, // Move up
          x: reaction.x + Math.sin((Date.now() - reaction.timestamp) * 0.01) * 0.1 // Slight sway
        }))
      )
      reactionAnimationRef.current = requestAnimationFrame(animateReactions)
    }
    
    if (floatingReactions.length > 0) {
      reactionAnimationRef.current = requestAnimationFrame(animateReactions)
    }
    
    return () => {
      if (reactionAnimationRef.current) {
        cancelAnimationFrame(reactionAnimationRef.current)
      }
    }
  }, [floatingReactions.length])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (reactionAnimationRef.current) {
        cancelAnimationFrame(reactionAnimationRef.current)
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeStream()
  }, [initializeStream])

  // Handle reactions from props
  useEffect(() => {
    const recentReactions = chatMessages
      .filter(msg => msg.type === 'reaction' && Date.now() - msg.timestamp.getTime() < 1000)
    
    recentReactions.forEach(reaction => {
      addFloatingReaction(reaction.message)
    })
  }, [chatMessages, addFloatingReaction])

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = isAudioEnabled
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleReactionClick = (emoji: string) => {
    addFloatingReaction(emoji)
    onSendReaction?.(emoji)
  }

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'poor':
        return <Wifi className="h-4 w-4 text-yellow-500" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border-4 border-red-500">
      {/* Hidden canvas for stream generation */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1920}
        height={1080}
      />
      
      {/* Main video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        muted={!isAudioEnabled}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
              <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
            </div>
            <p className="text-xl font-bold mb-2">Connecting to Live Stream</p>
            <p className="text-sm text-white/80">Preparing camera and audio...</p>
          </div>
        </div>
      )}

      {/* Social Media Style Overlays */}
      {isConnected && (
        <>
          {/* Top overlay - Live indicator and info */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500 text-white animate-pulse px-3 py-1 text-sm font-bold shadow-lg">
                🔴 LIVE
              </Badge>
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-white font-medium text-sm">{viewerCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-white text-xs capitalize">{connectionQuality}</span>
              </div>
            </div>
          </div>

          {/* Host info overlay */}
          <div className="absolute top-16 left-4 z-20">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold">
                  {hostName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-bold text-sm">{hostName}</p>
                <p className="text-white/80 text-xs">{title}</p>
              </div>
            </div>
          </div>

          {/* Chat overlay - Social media style */}
          {showChatOverlay && chatMessages.length > 0 && (
            <div className="absolute bottom-20 left-4 right-4 z-20">
              <div 
                ref={chatContainerRef}
                className="max-h-40 overflow-y-auto space-y-2 scrollbar-hide"
              >
                {chatMessages.slice(-5).map((message) => (
                  <div 
                    key={message.id} 
                    className={`
                      ${message.type === 'reaction' ? 'flex justify-center' : ''}
                      animate-fade-in-up
                    `}
                  >
                    {message.type === 'reaction' ? (
                      <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-2xl">{message.message}</span>
                      </div>
                    ) : (
                      <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-red-500 to-red-600 text-white">
                              {message.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium text-xs">{message.userName}</span>
                        </div>
                        <p className="text-white text-sm break-words">{message.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating reactions */}
          {floatingReactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute pointer-events-none z-30 animate-float-up"
              style={{
                left: `${reaction.x}%`,
                bottom: `${100 - reaction.y}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className="text-3xl drop-shadow-lg">{reaction.emoji}</span>
            </div>
          ))}

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
            {/* Left controls */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={isAudioEnabled ? "default" : "secondary"} 
                onClick={toggleAudio}
                className="bg-red-500/80 backdrop-blur-sm border-red-400/50 hover:bg-red-600/90 text-white"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4 text-white" /> : <VolumeX className="h-4 w-4 text-white" />}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleFullscreen}
                className="bg-red-500/80 backdrop-blur-sm border-red-400/50 hover:bg-red-600/90 text-white"
              >
                {isFullscreen ? <Minimize className="h-4 w-4 text-white" /> : <Maximize className="h-4 w-4 text-white" />}
              </Button>
            </div>

            {/* Center - Reaction buttons */}
            <div className="flex gap-2">
              {['❤️', '👍', '😂', '😮', '😢', '👏'].map((emoji) => (
                <Button
                  key={emoji}
                  size="sm"
                  variant="outline"
                  onClick={() => handleReactionClick(emoji)}
                  className="bg-red-500/80 backdrop-blur-sm border-red-400/50 hover:bg-red-600/90 hover:scale-110 transition-transform text-white"
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowChatOverlay(!showChatOverlay)}
                className="bg-red-500/80 backdrop-blur-sm border-red-400/50 hover:bg-red-600/90 text-white"
              >
                <MessageCircle className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg font-medium mb-2">Stream Error</p>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <Button 
              variant="outline" 
              className="text-white border-red-500 hover:bg-red-500 hover:text-white bg-red-500/20"
              onClick={() => initializeStream()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* No stream placeholder */}
      {!isLive && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Camera Off</h3>
            <p className="text-gray-400 mb-4">The broadcaster is not currently live</p>
          </div>
        </div>
      )}
    </div>
  )
}