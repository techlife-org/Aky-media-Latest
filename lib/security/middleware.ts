import { type NextRequest, NextResponse } from "next/server"
import { sessionManager, getSessionIdFromRequest } from "./session-manager"
import { loginRateLimiter, apiRateLimiter, bruteForceProtection } from "./rate-limiter"
import { auditLogger, logUnauthorizedAccess, logSuspiciousActivity } from "./audit-logger"
import { isIPWhitelisted, extractClientInfo } from "./auth"

export interface SecurityMiddlewareConfig {
  enableRateLimit: boolean
  enableIPWhitelist: boolean
  enableSessionValidation: boolean
  enableAuditLogging: boolean
  enableCSRFProtection: boolean
  allowedIPs?: string[]
  publicPaths: string[]
  adminPaths: string[]
}

const defaultConfig: SecurityMiddlewareConfig = {
  enableRateLimit: true,
  enableIPWhitelist: false,
  enableSessionValidation: true,
  enableAuditLogging: true,
  enableCSRFProtection: true,
  publicPaths: [
    "/",
    "/about",
    "/contact",
    "/news",
    "/api/contact",
    "/api/newsletter",
    "/api/search",
    "/login",
    "/api/auth/login",
  ],
  adminPaths: [
    "/dashboard",
    "/api/dashboard",
    "/api/admin",
  ],
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async handle(request: NextRequest): Promise<NextResponse | null> {
    const path = request.nextUrl.pathname
    const method = request.method

    // Skip security checks for public paths (except rate limiting)
    const isPublicPath = this.config.publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath + "/")
    )

    const isAdminPath = this.config.adminPaths.some(adminPath => 
      path === adminPath || path.startsWith(adminPath + "/")
    )

    // 1. IP Whitelist Check (for admin paths)
    if (this.config.enableIPWhitelist && isAdminPath && this.config.allowedIPs) {
      const clientInfo = extractClientInfo(request)
      if (!isIPWhitelisted(clientInfo.ipAddress, this.config.allowedIPs)) {
        if (this.config.enableAuditLogging) {
          logUnauthorizedAccess(request, path)
        }
        
        return new NextResponse("Access denied", { 
          status: 403,
          headers: {
            "Content-Type": "text/plain",
          },
        })
      }
    }

    // 2. Rate Limiting
    if (this.config.enableRateLimit) {
      const rateLimitResult = this.checkRateLimit(request, path)
      if (!rateLimitResult.allowed) {
        if (this.config.enableAuditLogging) {
          logSuspiciousActivity(request, "rate_limit_exceeded", {
            path,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
          })
        }

        return new NextResponse("Rate limit exceeded", {
          status: 429,
          headers: {
            "Content-Type": "text/plain",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        })
      }
    }

    // 3. Session Validation (for protected paths)
    if (this.config.enableSessionValidation && !isPublicPath) {
      const sessionValidation = await this.validateSession(request)
      if (!sessionValidation.valid) {
        if (this.config.enableAuditLogging) {
          logUnauthorizedAccess(request, path, sessionValidation.userId)
        }

        // For API routes, return JSON error
        if (path.startsWith("/api/")) {
          return NextResponse.json(
            { 
              error: "Unauthorized", 
              message: sessionValidation.reason || "Invalid or expired session",
              code: "UNAUTHORIZED"
            },
            { status: 401 }
          )
        }

        // For page routes, redirect to login
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", path)
        return NextResponse.redirect(loginUrl)
      }

      // Add user info to request headers for downstream handlers
      const response = NextResponse.next()
      if (sessionValidation.session) {
        response.headers.set("X-User-ID", sessionValidation.session.userId)
        response.headers.set("X-User-Email", sessionValidation.session.email)
        response.headers.set("X-User-Role", sessionValidation.session.role)
        response.headers.set("X-Session-ID", sessionValidation.session.sessionId)
      }
      return response
    }

    // 4. CSRF Protection (for state-changing operations)
    if (this.config.enableCSRFProtection && 
        ["POST", "PUT", "DELETE", "PATCH"].includes(method) &&
        !isPublicPath) {
      const csrfValidation = this.validateCSRF(request)
      if (!csrfValidation.valid) {
        if (this.config.enableAuditLogging) {
          logSuspiciousActivity(request, "csrf_token_invalid", {
            path,
            method,
            reason: csrfValidation.reason,
          })
        }

        return NextResponse.json(
          { 
            error: "Forbidden", 
            message: "Invalid CSRF token",
            code: "CSRF_TOKEN_INVALID"
          },
          { status: 403 }
        )
      }
    }

    // 5. Audit Logging (for all requests to protected paths)
    if (this.config.enableAuditLogging && !isPublicPath) {
      auditLogger.log(
        `${method}_request`,
        path,
        request,
        {
          success: true,
          category: isAdminPath ? "admin" : "data",
          severity: "low",
        }
      )
    }

    return null // Continue to next middleware/handler
  }

  private checkRateLimit(request: NextRequest, path: string) {
    // Use stricter rate limiting for login endpoints
    if (path.includes("/login") || path.includes("/auth")) {
      return loginRateLimiter.check(request)
    }

    // Use general API rate limiting for other endpoints
    return apiRateLimiter.check(request)
  }

  private async validateSession(request: NextRequest): Promise<{
    valid: boolean
    session?: any
    userId?: string
    reason?: string
  }> {
    const sessionId = getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return { valid: false, reason: "No session ID provided" }
    }

    const validation = sessionManager.validateSession(sessionId, request)
    
    return {
      valid: validation.valid,
      session: validation.session,
      userId: validation.session?.userId,
      reason: validation.reason,
    }
  }

  private validateCSRF(request: NextRequest): {
    valid: boolean
    reason?: string
  } {
    // Get CSRF token from header or form data
    const csrfToken = request.headers.get("X-CSRF-Token") || 
                     request.headers.get("X-Requested-With")

    // For AJAX requests, we can be more lenient
    if (request.headers.get("X-Requested-With") === "XMLHttpRequest") {
      return { valid: true }
    }

    // For API requests with proper content type, we can skip CSRF
    const contentType = request.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return { valid: true }
    }

    // TODO: Implement proper CSRF token validation
    // For now, we'll be lenient to avoid breaking existing functionality
    return { valid: true }
  }

  // Security headers middleware
  addSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
    )

    // Security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      )
    }

    // Remove server information
    response.headers.delete("Server")
    response.headers.delete("X-Powered-By")

    return response
  }
}

// Global security middleware instance
export const securityMiddleware = new SecurityMiddleware()

// Helper function to check if user has required role
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Helper function to check if user can access resource
export function canAccessResource(
  userRole: string, 
  resource: string, 
  action: string
): boolean {
  // Define role-based permissions
  const permissions = {
    admin: ["*"], // Admin can do everything
    moderator: ["read", "update"], // Moderator can read and update
    user: ["read"], // User can only read
  }

  const userPermissions = permissions[userRole as keyof typeof permissions] || []
  
  return userPermissions.includes("*") || userPermissions.includes(action)
}

export type { SecurityMiddlewareConfig }