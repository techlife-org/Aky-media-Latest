"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Smartphone, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function Setup2FAPage() {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setupTwoFactor()
  }, [])

  const setupTwoFactor = async () => {
    try {
      const response = await fetch("/api/auth/2fa/setup")
      const data = await response.json()

      if (data.success) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        toast({
          title: "Setup Failed",
          description: "Failed to generate 2FA setup",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast({
      title: "Copied!",
      description: "Secret key copied to clipboard",
    })
  }

  const verifySetup = async () => {
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
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
          isSetup: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsSetupComplete(true)
        toast({
          title: "Setup Complete!",
          description: "2FA has been successfully configured",
        })
        
        // Store the secret in environment (you'll need to add this to your .env file)
        localStorage.setItem("2fa_secret", secret)
        
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up 2FA...</p>
        </div>
      </div>
    )
  }

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-4">
              Two-Factor Authentication has been successfully configured for your account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Two-Factor Authentication</h1>
          <p className="text-gray-600">Secure your admin account with an additional layer of protection</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    className="mx-auto border rounded-lg"
                    width={200}
                    height={200}
                  />
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Step 1:</strong> Install Google Authenticator on your phone</p>
                <p><strong>Step 2:</strong> Scan this QR code with the app</p>
                <p><strong>Step 3:</strong> Enter the 6-digit code below</p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="secret">Secret Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secret"
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copySecret}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If you can't scan the QR code, manually enter this key in your authenticator app
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">App Settings:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Account:</strong> AKY Admin Dashboard</li>
                  <li><strong>Issuer:</strong> AKY Media Center</li>
                  <li><strong>Type:</strong> Time-based (TOTP)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Verify Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Enter 6-digit code from your authenticator app</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
            </div>
            
            <Button
              onClick={verifySetup}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>Save your secret key in a secure location. You'll need it if you lose access to your authenticator app.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}