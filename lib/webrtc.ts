import SimplePeer from "simple-peer"

export interface PeerConnection {
  id: string
  peer: SimplePeer.Instance
  stream?: MediaStream
}

export class WebRTCService {
  private peers: Map<string, PeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private socket: any = null

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize socket connection for signaling
      this.initializeSocket()
    }
  }

  private initializeSocket() {
    // Socket.io connection for signaling
    if (typeof window !== "undefined") {
      import("socket.io-client").then(({ io }) => {
        this.socket = io()
      })
    }
  }

  async getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream
      return stream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  async getDisplayMedia(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      return stream
    } catch (error) {
      console.error("Error accessing display media:", error)
      throw error
    }
  }

  createPeer(initiator: boolean, stream: MediaStream, peerId: string): SimplePeer.Instance {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream,
    })

    this.peers.set(peerId, { id: peerId, peer, stream })

    peer.on("signal", (signal) => {
      // Send signal through socket
      if (this.socket) {
        this.socket.emit("signal", { signal, peerId })
      }
    })

    peer.on("stream", (remoteStream) => {
      // Handle incoming stream
      const peerConnection = this.peers.get(peerId)
      if (peerConnection) {
        peerConnection.stream = remoteStream
      }
    })

    peer.on("error", (error) => {
      console.error("Peer error:", error)
    })

    return peer
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = enabled
      }
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = enabled
      }
    }
  }

  stopStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  disconnectPeer(peerId: string) {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.peer.destroy()
      this.peers.delete(peerId)
    }
  }

  disconnectAll() {
    this.peers.forEach((connection) => {
      connection.peer.destroy()
    })
    this.peers.clear()
    this.stopStream()
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getPeers(): Map<string, PeerConnection> {
    return this.peers
  }
}

export const webRTCService = new WebRTCService()
