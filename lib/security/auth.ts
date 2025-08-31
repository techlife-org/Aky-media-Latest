import { type NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export interface AuthUser {
  id: string
  email: string
  role: string
  sessionId: string
  lastActivity: Date
  ipAddress: string
  userAgent: string
}

export interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDuration: number // in minutes
  sessionTimeout: number // in minutes
  requireTwoFactor: boolean
  allowedIPs?: string[]
  requireStrongPassword: boolean
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
  requireTwoFactor: true,
  requireStrongPassword: false,
}

// Password validation removed - no strength requirements
// Passwords are accepted as-is without complexity validation

// Hash password with salt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate secure session ID
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Generate secure token for 2FA
export function generateSecureToken(length: number = 6): string {
  const digits = "0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    token += digits[crypto.randomInt(0, digits.length)]
  }
  return token
}

// Create JWT token with enhanced security
export function createSecureJWT(payload: any, expiresIn: string = "1h"): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured")
  }
  
  const enhancedPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: generateSessionId(), // JWT ID for token tracking
  }
  
  return jwt.sign(enhancedPayload, jwtSecret, {
    expiresIn,
    algorithm: "HS256",
    issuer: "aky-admin-portal",
    audience: "aky-admin-users",
  })
}

// Verify JWT token with enhanced validation
export function verifySecureJWT(token: string): any {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured")
  }
  
  try {
    return jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      issuer: "aky-admin-portal",
      audience: "aky-admin-users",
    })
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

// Extract client information from request
export function extractClientInfo(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIP || "unknown"
  
  return {
    ipAddress: ip,
    userAgent: request.headers.get("user-agent") || "unknown",
    origin: request.headers.get("origin") || "unknown",
    referer: request.headers.get("referer") || "unknown",
  }
}

// Check if IP is in whitelist
export function isIPWhitelisted(ip: string, whitelist?: string[]): boolean {
  if (!whitelist || whitelist.length === 0) {
    return true // No whitelist means all IPs are allowed
  }
  
  // Support for CIDR notation and exact matches
  return whitelist.some(allowedIP => {
    if (allowedIP.includes("/")) {
      // CIDR notation - simplified check (you might want to use a proper CIDR library)
      const [network, prefix] = allowedIP.split("/")
      return ip.startsWith(network.split(".").slice(0, parseInt(prefix) / 8).join("."))
    }
    return ip === allowedIP
  })
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Verify CSRF token
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, "hex"),
    Buffer.from(sessionToken, "hex")
  )
}