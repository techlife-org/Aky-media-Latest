"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseWebRTCProps {
  isHost?: boolean
  meetingId?: string
}

export function useWebRTC({ isHost = false, meetingId }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  // Get user media
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      setIsConnecting(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      })

      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setError(null)
      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera/microphone"
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Get screen share
  const getScreenShare = useCallback(async () => {
    try {
      setIsConnecting(true)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      })

      setLocalStream(stream)
      setIsScreenSharing(true)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Handle screen share end
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setIsScreenSharing(false)
        getUserMedia(isVideoEnabled, isAudioEnabled)
      })

      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to share screen"
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [getUserMedia, isVideoEnabled, isAudioEnabled])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }, [localStream, isVideoEnabled])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }, [localStream, isAudioEnabled])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      await getScreenShare()
    } catch (err) {
      console.error("Screen sharing failed:", err)
    }
  }, [getScreenShare])

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (isScreenSharing && localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setIsScreenSharing(false)
      await getUserMedia(isVideoEnabled, isAudioEnabled)
    }
  }, [isScreenSharing, localStream, getUserMedia, isVideoEnabled, isAudioEnabled])

  // Initialize media
  const initializeMedia = useCallback(async () => {
    try {
      await getUserMedia(true, true)
    } catch (err) {
      console.error("Failed to initialize media:", err)
    }
  }, [getUserMedia])

  // Cleanup
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()
    setLocalStream(null)
    setRemoteStreams([])
  }, [localStream])

  // Auto-initialize for hosts
  useEffect(() => {
    if (isHost) {
      initializeMedia()
    }

    return cleanup
  }, [isHost, initializeMedia, cleanup])

  return {
    localStream,
    remoteStreams,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    isConnecting,
    error,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    initializeMedia,
    cleanup,
  }
}
