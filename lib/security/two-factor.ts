import crypto from "crypto"
import { generateSecureToken } from "./auth"

export interface TwoFactorCode {
  code: string
  userId: string
  email: string
  expiresAt: Date
  attempts: number
  maxAttempts: number
  verified: boolean
  createdAt: Date
}

export interface TwoFactorConfig {
  codeLength: number
  expirationMinutes: number
  maxAttempts: number
  resendCooldownMinutes: number
}

class TwoFactorManager {
  private codes = new Map<string, TwoFactorCode>()
  private resendCooldowns = new Map<string, Date>()
  private config: TwoFactorConfig

  constructor(config: TwoFactorConfig) {
    this.config = config
    
    // Clean up expired codes every 5 minutes
    setInterval(() => {
      this.cleanupExpiredCodes()
    }, 5 * 60 * 1000)
  }

  private cleanupExpiredCodes() {
    const now = new Date()
    const expiredCodes: string[] = []

    for (const [userId, codeData] of this.codes.entries()) {
      if (now > codeData.expiresAt) {
        expiredCodes.push(userId)
      }
    }

    for (const userId of expiredCodes) {
      this.codes.delete(userId)
    }

    // Clean up resend cooldowns
    const expiredCooldowns: string[] = []
    for (const [userId, cooldownEnd] of this.resendCooldowns.entries()) {
      if (now > cooldownEnd) {
        expiredCooldowns.push(userId)
      }
    }

    for (const userId of expiredCooldowns) {
      this.resendCooldowns.delete(userId)
    }
  }

  generateCode(userId: string, email: string): {
    success: boolean
    code?: string
    expiresAt?: Date
    cooldownUntil?: Date
    error?: string
  } {
    const now = new Date()
    
    // Check resend cooldown
    const cooldownEnd = this.resendCooldowns.get(userId)
    if (cooldownEnd && now < cooldownEnd) {
      return {
        success: false,
        cooldownUntil: cooldownEnd,
        error: "Please wait before requesting a new code",
      }
    }

    // Generate new code
    const code = generateSecureToken(this.config.codeLength)
    const expiresAt = new Date(now.getTime() + this.config.expirationMinutes * 60 * 1000)

    const codeData: TwoFactorCode = {
      code,
      userId,
      email,
      expiresAt,
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      verified: false,
      createdAt: now,
    }

    // Store code
    this.codes.set(userId, codeData)

    // Set resend cooldown
    const cooldownEnd = new Date(now.getTime() + this.config.resendCooldownMinutes * 60 * 1000)
    this.resendCooldowns.set(userId, cooldownEnd)

    return {
      success: true,
      code,
      expiresAt,
    }
  }

  verifyCode(userId: string, inputCode: string): {
    success: boolean
    verified: boolean
    attemptsRemaining?: number
    error?: string
  } {
    const codeData = this.codes.get(userId)
    
    if (!codeData) {
      return {
        success: false,
        verified: false,
        error: "No verification code found. Please request a new one.",
      }
    }

    const now = new Date()
    
    // Check if code is expired
    if (now > codeData.expiresAt) {
      this.codes.delete(userId)
      return {
        success: false,
        verified: false,
        error: "Verification code has expired. Please request a new one.",
      }
    }

    // Check if already verified
    if (codeData.verified) {
      return {
        success: true,
        verified: true,
      }
    }

    // Check attempts limit
    if (codeData.attempts >= codeData.maxAttempts) {
      this.codes.delete(userId)
      return {
        success: false,
        verified: false,
        error: "Too many failed attempts. Please request a new code.",
      }
    }

    // Increment attempts
    codeData.attempts++

    // Verify code using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(inputCode, "utf8"),
      Buffer.from(codeData.code, "utf8")
    )

    if (isValid) {
      codeData.verified = true
      this.codes.set(userId, codeData)
      
      return {
        success: true,
        verified: true,
      }
    } else {
      this.codes.set(userId, codeData)
      
      return {
        success: false,
        verified: false,
        attemptsRemaining: codeData.maxAttempts - codeData.attempts,
        error: `Invalid verification code. ${codeData.maxAttempts - codeData.attempts} attempts remaining.`,
      }
    }
  }

  isCodeVerified(userId: string): boolean {
    const codeData = this.codes.get(userId)
    if (!codeData) return false

    const now = new Date()
    if (now > codeData.expiresAt) {
      this.codes.delete(userId)
      return false
    }

    return codeData.verified
  }

  invalidateCode(userId: string): boolean {
    return this.codes.delete(userId)
  }

  getCodeStatus(userId: string): {
    exists: boolean
    verified?: boolean
    expiresAt?: Date
    attemptsRemaining?: number
    canResend?: boolean
    resendCooldownUntil?: Date
  } {
    const codeData = this.codes.get(userId)
    const now = new Date()

    if (!codeData) {
      const cooldownEnd = this.resendCooldowns.get(userId)
      return {
        exists: false,
        canResend: !cooldownEnd || now >= cooldownEnd,
        resendCooldownUntil: cooldownEnd && now < cooldownEnd ? cooldownEnd : undefined,
      }
    }

    // Check if expired
    if (now > codeData.expiresAt) {
      this.codes.delete(userId)
      const cooldownEnd = this.resendCooldowns.get(userId)
      return {
        exists: false,
        canResend: !cooldownEnd || now >= cooldownEnd,
        resendCooldownUntil: cooldownEnd && now < cooldownEnd ? cooldownEnd : undefined,
      }
    }

    const cooldownEnd = this.resendCooldowns.get(userId)

    return {
      exists: true,
      verified: codeData.verified,
      expiresAt: codeData.expiresAt,
      attemptsRemaining: codeData.maxAttempts - codeData.attempts,
      canResend: !cooldownEnd || now >= cooldownEnd,
      resendCooldownUntil: cooldownEnd && now < cooldownEnd ? cooldownEnd : undefined,
    }
  }

  // Get statistics
  getStats(): {
    activeCodes: number
    verifiedCodes: number
    expiredCodes: number
    averageAttempts: number
  } {
    const now = new Date()
    let activeCodes = 0
    let verifiedCodes = 0
    let expiredCodes = 0
    let totalAttempts = 0

    for (const codeData of this.codes.values()) {
      if (now > codeData.expiresAt) {
        expiredCodes++
      } else {
        activeCodes++
        if (codeData.verified) {
          verifiedCodes++
        }
      }
      totalAttempts += codeData.attempts
    }

    return {
      activeCodes,
      verifiedCodes,
      expiredCodes,
      averageAttempts: this.codes.size > 0 ? totalAttempts / this.codes.size : 0,
    }
  }
}

// Default configuration
const defaultConfig: TwoFactorConfig = {
  codeLength: 6,
  expirationMinutes: 10,
  maxAttempts: 3,
  resendCooldownMinutes: 1,
}

// Global two-factor manager instance
export const twoFactorManager = new TwoFactorManager(defaultConfig)

// Email service integration (placeholder)
export async function sendTwoFactorCode(email: string, code: string): Promise<boolean> {
  try {
    // In a real implementation, you would integrate with your email service
    // For now, we'll just log it (in development) or use a mock service
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[2FA] Sending code ${code} to ${email}`)
      return true
    }

    // TODO: Implement actual email sending
    // Examples:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    
    // For now, return true to simulate successful sending
    return true
  } catch (error) {
    console.error("Failed to send 2FA code:", error)
    return false
  }
}

// SMS service integration (placeholder)
export async function sendTwoFactorCodeSMS(phoneNumber: string, code: string): Promise<boolean> {
  try {
    // In a real implementation, you would integrate with SMS service
    // For now, we'll just log it (in development)
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[2FA SMS] Sending code ${code} to ${phoneNumber}`)
      return true
    }

    // TODO: Implement actual SMS sending
    // Examples:
    // - Twilio
    // - AWS SNS
    // - Vonage (Nexmo)
    
    return true
  } catch (error) {
    console.error("Failed to send 2FA SMS:", error)
    return false
  }
}

export { TwoFactorManager }
export type { TwoFactorCode, TwoFactorConfig }