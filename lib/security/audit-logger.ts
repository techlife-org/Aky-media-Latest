import { type NextRequest } from "next/server"
import { extractClientInfo } from "./auth"

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId?: string
  sessionId?: string
  action: string
  resource: string
  method: string
  path: string
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
  severity: "low" | "medium" | "high" | "critical"
  category: "auth" | "admin" | "data" | "system" | "security"
}

export interface SecurityEvent {
  type: "login_attempt" | "login_success" | "login_failure" | "logout" | 
        "session_hijack" | "rate_limit_exceeded" | "brute_force_detected" |
        "unauthorized_access" | "privilege_escalation" | "data_access" |
        "admin_action" | "system_error" | "suspicious_activity"
  severity: "low" | "medium" | "high" | "critical"
  userId?: string
  sessionId?: string
  details: Record<string, any>
}

class AuditLogger {
  private logs: AuditLogEntry[] = []
  private maxLogs = 10000 // Keep last 10k logs in memory
  private alertThresholds = {
    failedLogins: 5, // Alert after 5 failed logins
    suspiciousActivity: 3, // Alert after 3 suspicious activities
    timeWindow: 15 * 60 * 1000, // 15 minutes
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  log(
    action: string,
    resource: string,
    request: NextRequest,
    options: {
      userId?: string
      sessionId?: string
      success: boolean
      errorMessage?: string
      metadata?: Record<string, any>
      severity?: "low" | "medium" | "high" | "critical"
      category?: "auth" | "admin" | "data" | "system" | "security"
    }
  ): void {
    const clientInfo = extractClientInfo(request)
    
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: options.userId,
      sessionId: options.sessionId,
      action,
      resource,
      method: request.method,
      path: request.nextUrl.pathname,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      success: options.success,
      errorMessage: options.errorMessage,
      metadata: options.metadata,
      severity: options.severity || "low",
      category: options.category || "system",
    }

    this.logs.push(entry)

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console logging for development
    if (process.env.NODE_ENV === "development") {
      console.log(`[AUDIT] ${entry.severity.toUpperCase()}: ${action} on ${resource}`, {
        success: entry.success,
        user: entry.userId,
        ip: entry.ipAddress,
        error: entry.errorMessage,
      })
    }

    // Check for security alerts
    this.checkSecurityAlerts(entry)
  }

  logSecurityEvent(event: SecurityEvent, request: NextRequest): void {
    const clientInfo = extractClientInfo(request)
    
    this.log(
      event.type,
      "security",
      request,
      {
        userId: event.userId,
        sessionId: event.sessionId,
        success: !["login_failure", "unauthorized_access", "session_hijack"].includes(event.type),
        metadata: {
          eventType: event.type,
          ...event.details,
          ...clientInfo,
        },
        severity: event.severity,
        category: "security",
      }
    )
  }

  private checkSecurityAlerts(entry: AuditLogEntry): void {
    const now = Date.now()
    const windowStart = now - this.alertThresholds.timeWindow

    // Check for multiple failed logins
    if (entry.action === "login_attempt" && !entry.success) {
      const recentFailures = this.logs.filter(log => 
        log.action === "login_attempt" &&
        !log.success &&
        log.ipAddress === entry.ipAddress &&
        log.timestamp.getTime() > windowStart
      )

      if (recentFailures.length >= this.alertThresholds.failedLogins) {
        this.triggerSecurityAlert("Multiple failed login attempts", {
          ipAddress: entry.ipAddress,
          attempts: recentFailures.length,
          timeWindow: this.alertThresholds.timeWindow / 60000, // minutes
        })
      }
    }

    // Check for suspicious activities
    if (entry.severity === "high" || entry.severity === "critical") {
      const recentSuspicious = this.logs.filter(log =>
        (log.severity === "high" || log.severity === "critical") &&
        log.ipAddress === entry.ipAddress &&
        log.timestamp.getTime() > windowStart
      )

      if (recentSuspicious.length >= this.alertThresholds.suspiciousActivity) {
        this.triggerSecurityAlert("Multiple suspicious activities detected", {
          ipAddress: entry.ipAddress,
          activities: recentSuspicious.length,
          timeWindow: this.alertThresholds.timeWindow / 60000,
        })
      }
    }
  }

  private triggerSecurityAlert(message: string, details: Record<string, any>): void {
    console.error(`[SECURITY ALERT] ${message}`, details)
    
    // In production, you would send this to your monitoring system
    // Examples: Slack webhook, email alert, monitoring service, etc.
    
    // For now, we'll just log it prominently
    if (process.env.NODE_ENV === "production") {
      // TODO: Implement actual alerting mechanism
      // - Send email to security team
      // - Post to Slack channel
      // - Send to monitoring service (DataDog, New Relic, etc.)
    }
  }

  // Get logs with filtering
  getLogs(filters: {
    userId?: string
    action?: string
    category?: string
    severity?: string
    success?: boolean
    startDate?: Date
    endDate?: Date
    ipAddress?: string
    limit?: number
  } = {}): AuditLogEntry[] {
    let filteredLogs = [...this.logs]

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action))
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category)
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity)
    }

    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success)
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
    }

    if (filters.ipAddress) {
      filteredLogs = filteredLogs.filter(log => log.ipAddress === filters.ipAddress)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  // Get security statistics
  getSecurityStats(timeWindow: number = 24 * 60 * 60 * 1000): {
    totalEvents: number
    failedLogins: number
    successfulLogins: number
    suspiciousActivities: number
    uniqueIPs: number
    topFailedIPs: Array<{ ip: string; count: number }>
  } {
    const now = Date.now()
    const windowStart = now - timeWindow

    const recentLogs = this.logs.filter(log => 
      log.timestamp.getTime() > windowStart
    )

    const failedLogins = recentLogs.filter(log => 
      log.action === "login_attempt" && !log.success
    )

    const successfulLogins = recentLogs.filter(log => 
      log.action === "login_success"
    )

    const suspiciousActivities = recentLogs.filter(log => 
      log.severity === "high" || log.severity === "critical"
    )

    const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress))

    // Count failed logins by IP
    const failedByIP = new Map<string, number>()
    failedLogins.forEach(log => {
      const count = failedByIP.get(log.ipAddress) || 0
      failedByIP.set(log.ipAddress, count + 1)
    })

    const topFailedIPs = Array.from(failedByIP.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalEvents: recentLogs.length,
      failedLogins: failedLogins.length,
      successfulLogins: successfulLogins.length,
      suspiciousActivities: suspiciousActivities.length,
      uniqueIPs: uniqueIPs.size,
      topFailedIPs,
    }
  }

  // Export logs (for external analysis)
  exportLogs(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "id", "timestamp", "userId", "sessionId", "action", "resource",
        "method", "path", "ipAddress", "userAgent", "success", "errorMessage",
        "severity", "category"
      ]
      
      const csvRows = [
        headers.join(","),
        ...this.logs.map(log => [
          log.id,
          log.timestamp.toISOString(),
          log.userId || "",
          log.sessionId || "",
          log.action,
          log.resource,
          log.method,
          log.path,
          log.ipAddress,
          `"${log.userAgent}"`,
          log.success,
          log.errorMessage || "",
          log.severity,
          log.category,
        ].join(","))
      ]
      
      return csvRows.join("\n")
    }

    return JSON.stringify(this.logs, null, 2)
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger()

// Convenience functions for common security events
export const logLoginAttempt = (request: NextRequest, email: string, success: boolean, errorMessage?: string) => {
  auditLogger.logSecurityEvent({
    type: success ? "login_success" : "login_failure",
    severity: success ? "low" : "medium",
    details: { email, errorMessage },
  }, request)
}

export const logLogout = (request: NextRequest, userId: string, sessionId: string) => {
  auditLogger.logSecurityEvent({
    type: "logout",
    severity: "low",
    userId,
    sessionId,
    details: {},
  }, request)
}

export const logUnauthorizedAccess = (request: NextRequest, resource: string, userId?: string) => {
  auditLogger.logSecurityEvent({
    type: "unauthorized_access",
    severity: "high",
    userId,
    details: { resource, path: request.nextUrl.pathname },
  }, request)
}

export const logSuspiciousActivity = (request: NextRequest, activity: string, details: Record<string, any>) => {
  auditLogger.logSecurityEvent({
    type: "suspicious_activity",
    severity: "high",
    details: { activity, ...details },
  }, request)
}

export { AuditLogger }
export type { AuditLogEntry, SecurityEvent }