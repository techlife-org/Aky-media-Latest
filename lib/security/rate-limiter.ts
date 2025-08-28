import { type NextRequest } from "next/server"

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  blockDuration: number // Block duration in milliseconds after limit exceeded
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
        this.store.delete(key)
      }
    }
  }

  private getKey(request: NextRequest, identifier?: string): string {
    if (identifier) return identifier
    
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")
    const ip = forwarded?.split(",")[0] || realIP || "unknown"
    
    return `${ip}:${request.nextUrl.pathname}`
  }

  check(request: NextRequest, identifier?: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    blocked: boolean
    blockUntil?: number
  } {
    const key = this.getKey(request, identifier)
    const now = Date.now()
    
    let entry = this.store.get(key)
    
    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        blocked: false,
      }
    }
    
    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blocked: true,
        blockUntil: entry.blockUntil,
      }
    }
    
    // Reset block if block period expired
    if (entry.blocked && entry.blockUntil && entry.blockUntil <= now) {
      entry.blocked = false
      entry.blockUntil = undefined
      entry.count = 0
      entry.resetTime = now + this.config.windowMs
    }
    
    // Increment counter
    entry.count++
    
    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true
      entry.blockUntil = now + this.config.blockDuration
      
      this.store.set(key, entry)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blocked: true,
        blockUntil: entry.blockUntil,
      }
    }
    
    this.store.set(key, entry)
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      blocked: false,
    }
  }

  // Record successful request (for login attempts)
  recordSuccess(request: NextRequest, identifier?: string) {
    if (this.config.skipSuccessfulRequests) {
      const key = this.getKey(request, identifier)
      this.store.delete(key) // Reset on successful login
    }
  }

  // Record failed request (for login attempts)
  recordFailure(request: NextRequest, identifier?: string) {
    if (!this.config.skipFailedRequests) {
      // Failure is already recorded in check() method
      return
    }
  }

  // Reset rate limit for a specific key
  reset(request: NextRequest, identifier?: string) {
    const key = this.getKey(request, identifier)
    this.store.delete(key)
  }
}

// Pre-configured rate limiters for different use cases
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  blockDuration: 30 * 60 * 1000, // Block for 30 minutes after limit exceeded
  skipSuccessfulRequests: true,
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  blockDuration: 5 * 60 * 1000, // Block for 5 minutes
})

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  blockDuration: 10 * 60 * 1000, // Block for 10 minutes
})

// Brute force protection specifically for login attempts
class BruteForceProtection {
  private attempts = new Map<string, {
    count: number
    lastAttempt: number
    blocked: boolean
    blockUntil?: number
  }>()

  private readonly maxAttempts = 5
  private readonly windowMs = 15 * 60 * 1000 // 15 minutes
  private readonly blockDuration = 30 * 60 * 1000 // 30 minutes

  checkAttempt(identifier: string): {
    allowed: boolean
    attemptsRemaining: number
    blockUntil?: number
  } {
    const now = Date.now()
    let entry = this.attempts.get(identifier)

    if (!entry) {
      entry = {
        count: 0,
        lastAttempt: now,
        blocked: false,
      }
    }

    // Reset if window expired
    if (now - entry.lastAttempt > this.windowMs) {
      entry.count = 0
      entry.blocked = false
      entry.blockUntil = undefined
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        blockUntil: entry.blockUntil,
      }
    }

    // Reset block if expired
    if (entry.blocked && entry.blockUntil && entry.blockUntil <= now) {
      entry.blocked = false
      entry.blockUntil = undefined
      entry.count = 0
    }

    return {
      allowed: true,
      attemptsRemaining: this.maxAttempts - entry.count,
    }
  }

  recordFailedAttempt(identifier: string): {
    blocked: boolean
    attemptsRemaining: number
    blockUntil?: number
  } {
    const now = Date.now()
    let entry = this.attempts.get(identifier)

    if (!entry) {
      entry = {
        count: 1,
        lastAttempt: now,
        blocked: false,
      }
    } else {
      entry.count++
      entry.lastAttempt = now
    }

    if (entry.count >= this.maxAttempts) {
      entry.blocked = true
      entry.blockUntil = now + this.blockDuration
    }

    this.attempts.set(identifier, entry)

    return {
      blocked: entry.blocked,
      attemptsRemaining: Math.max(0, this.maxAttempts - entry.count),
      blockUntil: entry.blockUntil,
    }
  }

  recordSuccessfulAttempt(identifier: string) {
    this.attempts.delete(identifier) // Reset on successful login
  }

  isBlocked(identifier: string): boolean {
    const entry = this.attempts.get(identifier)
    if (!entry || !entry.blocked) return false
    
    const now = Date.now()
    if (entry.blockUntil && entry.blockUntil <= now) {
      // Block expired
      entry.blocked = false
      entry.blockUntil = undefined
      entry.count = 0
      this.attempts.set(identifier, entry)
      return false
    }
    
    return entry.blocked
  }
}

export const bruteForceProtection = new BruteForceProtection()

export { RateLimiter }
export type { RateLimitConfig }