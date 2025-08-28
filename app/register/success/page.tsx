"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Share2, Home, User, Mail, MapPin, Calendar, Copy } from "lucide-react"
import { toast } from "sonner"

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const uniqueId = searchParams.get("uniqueId")
  const fullName = searchParams.get("fullName")
  const lga = searchParams.get("lga")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!uniqueId || !fullName || !lga || !email) {
      router.push("/register")
    }
  }, [uniqueId, fullName, lga, email, router])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Unique ID copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const shareRegistration = async () => {
    const shareData = {
      title: "Youth Program Registration Successful",
      text: `I've successfully registered for His Excellency's Youth Program! My unique ID is: ${uniqueId}`,
      url: window.location.origin + "/register"
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nRegister here: ${shareData.url}`
        )
        toast.success("Registration details copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const downloadCertificate = () => {
    // This would generate a PDF certificate
    toast.info("Certificate download feature coming soon!")
  }

  if (!uniqueId || !fullName || !lga || !email) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Successful! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to His Excellency's Youth Program
          </p>
        </div>

        {/* Registration Details Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold text-center">
              Registration Confirmation
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Unique ID - Most Important */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Unique ID</p>
                    <p className="text-2xl font-bold text-green-700 font-mono">{uniqueId}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Keep this ID safe - you'll need it to access your dashboard
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(uniqueId)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold">{fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">LGA</p>
                    <p className="font-semibold">{lga}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
                  Status: Pending Verification
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Verification Process</h4>
                  <p className="text-sm text-gray-600">
                    Our team will verify your NIN document and registration details within 2-3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Confirmation Notifications</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive confirmation via Email, SMS, and WhatsApp once verified.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Access Your Dashboard</h4>
                  <p className="text-sm text-gray-600">
                    Use your unique ID to access your youth dashboard and stay updated on program activities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => router.push("/youth-dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Access Dashboard
          </Button>

          <Button
            onClick={shareRegistration}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Success
          </Button>

          <Button
            onClick={downloadCertificate}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
        </div>

        {/* Important Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-amber-600">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800">Important Reminders</h4>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• Keep your unique ID ({uniqueId}) safe and secure</li>
                  <li>• Check your email and phone for verification updates</li>
                  <li>• Visit your dashboard regularly for program updates</li>
                  <li>• Contact support if you don't receive confirmation within 3 days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}