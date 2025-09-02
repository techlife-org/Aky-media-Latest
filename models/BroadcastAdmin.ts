export interface BroadcastAdmin {
  _id?: string
  id: string
  email: string
  password: string
  name: string
  role: 'broadcast_admin' | 'super_admin'
  permissions: {
    canCreateBroadcast: boolean
    canManageBroadcast: boolean
    canViewAnalytics: boolean
    canManageParticipants: boolean
    canAccessChat: boolean
  }
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  profile: {
    avatar?: string
    title?: string
    department?: string
    phone?: string
  }
  broadcastSettings: {
    defaultTitle: string
    autoRecord: boolean
    maxParticipants: number
    allowScreenShare: boolean
    allowChat: boolean
    allowReactions: boolean
  }
}

export interface BroadcastSession {
  _id?: string
  id: string
  adminId: string
  title: string
  description?: string
  isActive: boolean
  isRecording: boolean
  startedAt: Date
  endedAt?: Date
  meetingLink: string
  participants: BroadcastParticipant[]
  settings: {
    maxParticipants: number
    allowScreenShare: boolean
    allowChat: boolean
    allowReactions: boolean
    requireApproval: boolean
    isPublic: boolean
  }
  stats: {
    totalViewTime: number
    peakViewers: number
    averageViewTime: number
    chatMessages: number
    reactions: number
    totalParticipants: number
  }
  chatMessages: ChatMessage[]
  reactions: Reaction[]
  createdAt: Date
  updatedAt: Date
}

export interface BroadcastParticipant {
  id: string
  name: string
  email?: string
  isHost: boolean
  isApproved: boolean
  joinedAt: Date
  leftAt?: Date
  userType: 'host' | 'viewer' | 'participant'
  permissions: {
    canSpeak: boolean
    canVideo: boolean
    canScreenShare: boolean
    canChat: boolean
    canReact: boolean
  }
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
  mediaStatus: {
    video: boolean
    audio: boolean
    screenShare: boolean
  }
  ipAddress?: string
  userAgent?: string
}

export interface ChatMessage {
  id: string
  broadcastId: string
  participantId: string
  participantName: string
  message: string
  type: 'message' | 'system' | 'announcement'
  timestamp: Date
  isDeleted: boolean
  replyTo?: string
  attachments?: {
    type: 'image' | 'file' | 'link'
    url: string
    name: string
  }[]
}

export interface Reaction {
  id: string
  broadcastId: string
  participantId: string
  participantName: string
  emoji: string
  timestamp: Date
}

export interface BroadcastAnalytics {
  broadcastId: string
  date: Date
  metrics: {
    totalViewers: number
    peakConcurrentViewers: number
    averageWatchTime: number
    totalWatchTime: number
    chatEngagement: number
    reactionCount: number
    dropOffRate: number
    joinRate: number
  }
  demographics: {
    countries: { [key: string]: number }
    devices: { [key: string]: number }
    browsers: { [key: string]: number }
  }
  engagement: {
    chatMessagesPerMinute: number
    reactionsPerMinute: number
    averageParticipationTime: number
  }
}