"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  Shield,
  LogOut,
  Crown,
  Play,
  Square,
  Loader2,
  Camera,
  AlertTriangle
} from "lucide-react"

export default function EnhancedBroadcastDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [broadcastTitle, setBroadcastTitle] = useState("Governor's Live Address")

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/broadcast-admin/auth/verify")
      const data = await response.json()
      
      if (data.authenticated && data.admin) {
        setIsAuthenticated(true)
        setAdminData(data.admin)
      } else {
        router.push('/broadcast-admin/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/broadcast-admin/login')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/broadcast-admin/auth/logout", { method: "POST" })
      router.push("/broadcast-admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const startBroadcast = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/enhanced-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          description: "",
          settings: {
            maxParticipants: 1000,
            allowScreenShare: true,
            allowChat: true,
            allowReactions: true,
            requireApproval: false,
            isPublic: true
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsActive(true)
        toast({
          title: "🎉 Broadcast Started Successfully!",
          description: "Your live broadcast is now active. Share the link to invite viewers."
        })
      } else {
        throw new Error(data.message || "Failed to start broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start broadcast"
      setError(errorMessage)
      toast({
        title: "Failed to Start Broadcast",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stopBroadcast = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/broadcast/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broadcastId: "current" })
      })

      if (response.ok) {
        setIsActive(false)
        toast({
          title: "Broadcast Stopped Successfully",
          description: "Your live broadcast has been ended."
        })
      } else {
        throw new Error("Failed to stop broadcast")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stop broadcast"
      setError(errorMessage)
      toast({
        title: "Error Stopping Broadcast",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Broadcast Control
                </h1>
              </div>
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className={`${isActive ? "bg-red-600 hover:bg-red-700 animate-pulse" : ""}`}
              >
                {isActive ? (
                  <>
                    <Radio className="w-4 h-4 mr-1 animate-pulse" />
                    LIVE
                  </>
                ) : (
                  <>
                    <VideoOff className="w-4 h-4 mr-1" />
                    OFFLINE
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Crown className="h-4 w-4" />
                <span>{adminData?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Preview
                  {isActive && (
                    <Badge variant="destructive" className="ml-auto animate-pulse">
                      🔴 BROADCASTING
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold">Camera Preview</p>
                        <p className="text-sm text-gray-400 mt-2">Enhanced broadcast dashboard coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isActive && (
                      <Badge variant="destructive" className="animate-pulse shadow-lg">
                        🔴 LIVE
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Media Controls */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="default" size="lg" className="h-12 px-6">
                      <Video className="h-5 w-5 mr-2" />
                      Camera On
                    </Button>
                    <Button variant="default" size="lg" className="h-12 px-6">
                      <Mic className="h-5 w-5 mr-2" />
                      Mic On
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Broadcast Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {!isActive ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="broadcastTitle" className="text-sm font-medium">Broadcast Title</Label>
                      <Input
                        id="broadcastTitle"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Enter broadcast title"
                        className="h-11"
                      />
                    </div>
                    
                    <Button
                      onClick={startBroadcast}
                      disabled={isLoading || !broadcastTitle.trim()}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-12 text-lg font-semibold shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Broadcast
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">{broadcastTitle}</h3>
                      <p className="text-sm text-gray-600">Broadcast is now live!</p>
                    </div>
                    
                    <Button
                      onClick={stopBroadcast}
                      disabled={isLoading}
                      variant="destructive"
                      className="w-full h-12 text-lg font-semibold shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Stopping...
                        </>
                      ) : (
                        <>
                          <Square className="h-5 w-5 mr-2" />
                          Stop Broadcast
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="text-sm">Enhanced Features</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>✅ Broadcast Admin Authentication</p>
                  <p>✅ Enhanced API Endpoints</p>
                  <p>✅ Real-time WebRTC Integration</p>
                  <p>✅ Google Meet-like Experience</p>
                  <p>🔄 Full UI Implementation in Progress</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}