"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface LoginFormData {
  uniqueId: string
  password: string
}

export default function YouthLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    uniqueId: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.uniqueId.trim() || !formData.password) {
      setError("Please enter both Unique ID and password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/youth/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Login failed")
      }

      // Store token in localStorage
      localStorage.setItem("youthToken", result.token)
      localStorage.setItem("youthData", JSON.stringify(result.youth))

      toast.success("Login successful!")
      router.push("/youth-dashboard")

    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Youth Dashboard Login</CardTitle>
            <CardDescription className="text-blue-100">
              Access your His Excellency's Youth Program dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="uniqueId">Unique ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="uniqueId"
                    type="text"
                    value={formData.uniqueId}
                    onChange={(e) => handleInputChange("uniqueId", e.target.value)}
                    placeholder="KANO-XXX-2025-XXXX"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-700"
                    onClick={() => router.push("/register")}
                  >
                    Register here
                  </Button>
                </p>
                
                <p className="text-xs text-gray-500">
                  Having trouble? Contact support for assistance.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Access Requirements</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your registration must be approved by admin</li>
                  <li>• Use the Unique ID provided during registration</li>
                  <li>• Use the password you created during registration</li>
                  <li>• Account will be locked after 5 failed attempts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}