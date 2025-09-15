"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TwoFactorVerificationProps {
  onVerificationSuccess: () => void
  onBack: () => void
  userEmail: string
}

export default function TwoFactorVerification({ 
  onVerificationSuccess, 
  onBack, 
  userEmail 
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token: verificationCode,
          isSetup: false
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Verification Successful",
          description: "Welcome to the dashboard!",
        })
        onVerificationSuccess()
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid authentication code",
          variant: "destructive",
        })
        setVerificationCode("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerification()
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </CardTitle>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Signed in as: <span className="font-medium text-gray-700">{userEmail}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-code">Authentication Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            className="text-center text-2xl font-mono tracking-widest h-14"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
          />
          <p className="text-xs text-gray-500 text-center">
            Enter the 6-digit code from Google Authenticator
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleVerification}
            disabled={isVerifying || verificationCode.length !== 6}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Having trouble?</p>
            <ul className="space-y-1 text-xs">
              <li>• Make sure your phone's time is synchronized</li>
              <li>• Try refreshing your authenticator app</li>
              <li>• Contact IT support if issues persist</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}