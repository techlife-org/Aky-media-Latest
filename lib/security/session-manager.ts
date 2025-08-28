import { type NextRequest, type NextResponse } from "next/server"
import { generateSessionId, extractClientInfo } from "./auth"

export interface SessionData {
  sessionId: string
  userId: string
  email: string
  role: string
  createdAt: Date
  lastActivity: Date
  ipAddress: string
  userAgent: string
  csrfToken: string
  twoFactorVerified: boolean
  loginMethod: "password" | "2fa"
}

export interface SessionConfig {
  maxAge: number // in seconds
  secure: boolean
  httpOnly: boolean
  sameSite: "strict" | "lax" | "none"
  domain?: string
  path: string
}

class SessionManager {
  private sessions = new Map<string, SessionData>()
  private userSessions = new Map<string, Set<string>>() // userId -> sessionIds
  private config: SessionConfig

  constructor(config: SessionConfig) {
    this.config = config
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000)
  }

  private cleanupExpiredSessions() {
    const now = new Date()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      const expiryTime = new Date(session.lastActivity.getTime() + this.config.maxAge * 1000)
      if (now > expiryTime) {
        expiredSessions.push(sessionId)
      }
    }

    for (const sessionId of expiredSessions) {
      this.destroySession(sessionId)
    }
  }

  createSession(
    userId: string,
    email: string,
    role: string,
    request: NextRequest,
    twoFactorVerified: boolean = false
  ): SessionData {
    const sessionId = generateSessionId()
    const clientInfo = extractClientInfo(request)
    const now = new Date()

    const sessionData: SessionData = {
      sessionId,
      userId,
      email,
      role,
      createdAt: now,
      lastActivity: now,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      csrfToken: generateSessionId(),
      twoFactorVerified,
      loginMethod: twoFactorVerified ? "2fa" : "password",
    }

    // Store session
    this.sessions.set(sessionId, sessionData)

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set())
    }
    this.userSessions.get(userId)!.add(sessionId)

    return sessionData
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    // Check if session is expired
    const now = new Date()
    const expiryTime = new Date(session.lastActivity.getTime() + this.config.maxAge * 1000)
    
    if (now > expiryTime) {
      this.destroySession(sessionId)
      return null
    }

    return session
  }

  updateSessionActivity(sessionId: string, request: NextRequest): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const clientInfo = extractClientInfo(request)
    
    // Verify IP and User-Agent for session hijacking protection
    if (session.ipAddress !== clientInfo.ipAddress || 
        session.userAgent !== clientInfo.userAgent) {
      // Potential session hijacking - destroy session
      this.destroySession(sessionId)
      return false
    }

    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)
    return true
  }

  destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    // Remove from sessions
    this.sessions.delete(sessionId)

    // Remove from user sessions
    const userSessionSet = this.userSessions.get(session.userId)
    if (userSessionSet) {
      userSessionSet.delete(sessionId)
      if (userSessionSet.size === 0) {
        this.userSessions.delete(session.userId)
      }
    }

    return true
  }

  destroyAllUserSessions(userId: string): number {
    const userSessionSet = this.userSessions.get(userId)
    if (!userSessionSet) return 0

    const sessionCount = userSessionSet.size
    
    // Destroy all sessions for this user
    for (const sessionId of userSessionSet) {
      this.sessions.delete(sessionId)
    }
    
    this.userSessions.delete(userId)
    return sessionCount
  }

  getUserSessions(userId: string): SessionData[] {
    const userSessionSet = this.userSessions.get(userId)
    if (!userSessionSet) return []

    const sessions: SessionData[] = []
    for (const sessionId of userSessionSet) {
      const session = this.sessions.get(sessionId)
      if (session) {
        sessions.push(session)
      }
    }

    return sessions
  }

  validateSession(sessionId: string, request: NextRequest): {
    valid: boolean
    session?: SessionData
    reason?: string
  } {
    const session = this.getSession(sessionId)
    if (!session) {
      return { valid: false, reason: "Session not found or expired" }
    }

    const clientInfo = extractClientInfo(request)
    
    // Check IP address
    if (session.ipAddress !== clientInfo.ipAddress) {
      this.destroySession(sessionId)
      return { valid: false, reason: "IP address mismatch" }
    }

    // Check User-Agent
    if (session.userAgent !== clientInfo.userAgent) {
      this.destroySession(sessionId)
      return { valid: false, reason: "User agent mismatch" }
    }

    // Update activity
    this.updateSessionActivity(sessionId, request)

    return { valid: true, session }
  }

  setSessionCookie(response: NextResponse, sessionId: string): void {
    response.cookies.set("session-id", sessionId, {
      maxAge: this.config.maxAge,
      secure: this.config.secure,
      httpOnly: this.config.httpOnly,
      sameSite: this.config.sameSite,
      domain: this.config.domain,
      path: this.config.path,
    })
  }

  clearSessionCookie(response: NextResponse): void {
    response.cookies.delete("session-id")
  }

  getSessionStats(): {
    totalSessions: number
    totalUsers: number
    averageSessionsPerUser: number
  } {
    return {
      totalSessions: this.sessions.size,
      totalUsers: this.userSessions.size,
      averageSessionsPerUser: this.userSessions.size > 0 
        ? this.sessions.size / this.userSessions.size 
        : 0,
    }
  }
}

// Default session configuration
const defaultSessionConfig: SessionConfig = {
  maxAge: 60 * 60, // 1 hour
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict",
  path: "/",
}

// Global session manager instance
export const sessionManager = new SessionManager(defaultSessionConfig)

// Helper function to extract session ID from request
export function getSessionIdFromRequest(request: NextRequest): string | null {
  // Try cookie first
  const cookieSessionId = request.cookies.get("session-id")?.value
  if (cookieSessionId) return cookieSessionId

  // Try Authorization header as fallback
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

export { SessionManager }
export type { SessionData, SessionConfig }