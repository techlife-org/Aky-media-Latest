"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2, VolumeX, Maximize, Minimize, RefreshCw, Wifi, WifiOff, Play, Pause } from "lucide-react"

interface RealVideoStreamProps {
  streamUrl?: string
  isLive?: boolean
  title?: string
  onError?: (error: string) => void
  onRetry?: () => void
}

type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected'

export default function RealVideoStream({ streamUrl, isLive = false, title, onError, onRetry }: RealVideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('excellent')
  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    if (!streamUrl) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Create WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      })
      
      peerConnectionRef.current = peerConnection
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0]
          setIsLoading(false)
          setIsConnected(true)
          setIsPlaying(true)
        }
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }))
        }
      }
      
      // Connect to WebSocket signaling server
      const wsUrl = streamUrl.replace('http', 'ws').replace('/stream/', '/ws/')
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('WebSocket connection opened')
        // Request offer from broadcaster
        ws.send(JSON.stringify({ type: 'viewer-join', streamId: streamUrl.split('/').pop() }))
      }
      
      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'offer':
            try {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))
              const answer = await peerConnection.createAnswer()
              await peerConnection.setLocalDescription(answer)
              
              ws.send(JSON.stringify({
                type: 'answer',
                answer: peerConnection.localDescription
              }))
            } catch (err) {
              console.error('Error handling offer:', err)
              setError('Failed to establish connection')
            }
            break
            
          case 'ice-candidate':
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
            } catch (err) {
              console.error('Error adding ICE candidate:', err)
            }
            break
            
          case 'error':
            setError(message.message || 'Connection error')
            break
        }
      }
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('Connection failed')
      }
      
      ws.onclose = () => {
        console.log('WebSocket connection closed')
      }
      
    } catch (err) {
      console.error('Error initializing WebRTC:', err)
      setError('Failed to initialize stream')
      setIsLoading(false)
    }
  }, [streamUrl])

  // Cleanup connections
  const cleanupConnections = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // Initialize stream when component mounts or streamUrl changes
  useEffect(() => {
    if (isLive && streamUrl) {
      initializeWebRTC()
    }
    
    return () => {
      cleanupConnections()
    }
  }, [isLive, streamUrl, initializeWebRTC, cleanupConnections])

  // Manual retry function
  const manualRetry = () => {
    setError(null)
    setIsConnected(false)
    cleanupConnections()
    initializeWebRTC()
    if (onRetry) onRetry()
  }

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isAudioEnabled
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err)
          setError('Failed to play video')
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current?.parentElement) {
      const element = videoRef.current.parentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
        setIsFullscreen(true)
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = () => {
      setError('Video playback error')
      setIsLoading(false)
    }
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Get connection quality icon and color
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
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        poster="/pictures/assets/img/he/6.png"
        muted={!isAudioEnabled}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Connecting to live stream...</p>
            <p className="text-sm text-gray-300 mt-2">Please wait a moment...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg font-medium mb-2">Stream Unavailable</p>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-black"
                onClick={manualRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-300 border-gray-500 hover:bg-gray-500 hover:text-white"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No stream placeholder */}
      {!isLive && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-4xl">📺</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">No Live Stream</h3>
            <p className="text-gray-400 mb-4">The broadcaster is not currently streaming</p>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Stream
            </Button>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button size="sm" variant={isAudioEnabled ? "default" : "secondary"} onClick={toggleAudio}>
          {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant={isPlaying ? "default" : "secondary"} onClick={togglePlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        {/* Connection quality indicator */}
        <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
          {getConnectionIcon()}
          <span className="text-xs text-white capitalize">{connectionQuality}</span>
        </div>
      </div>

      {/* Live indicator and status */}
      {isLive && (
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-red-600 text-white animate-pulse shadow-lg">
            🔴 LIVE
          </Badge>
          {isConnected && (
            <Badge className="bg-green-600 text-white shadow-lg">
              ✓ Connected
            </Badge>
          )}
          {connectionQuality === 'poor' && (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500">
              Poor Connection
            </Badge>
          )}
          {connectionQuality === 'disconnected' && (
            <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500">
              Disconnected
            </Badge>
          )}
        </div>
      )}

      {/* Title overlay */}
      {title && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg">
          <p className="text-sm font-medium">{title}</p>
        </div>
      )}
    </div>
  )
}