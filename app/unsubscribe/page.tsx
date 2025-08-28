"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, reason }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Successfully Unsubscribed",
          description: data.message,
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        setError(data.message)
        toast({
          title: "Unsubscribe Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("Network error. Please try again later.")
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResubscribe = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/resubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Successfully Resubscribed",
          description: data.message,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setIsSuccess(false) // Reset to show the form again
      } else {
        toast({
          title: "Resubscribe Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscription</h1>
          <p className="text-gray-600">Manage your newsletter subscription preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {isSuccess ? "Unsubscribed Successfully" : "Unsubscribe from Newsletter"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">You've been unsubscribed</h3>
                  <p className="text-gray-600 mb-4">
                    You will no longer receive newsletter emails at <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Changed your mind? You can resubscribe anytime.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={handleResubscribe} 
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Resubscribe to Newsletter
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Return to Website
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for unsubscribing (optional)
                  </label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Help us improve by telling us why you're unsubscribing..."
                    rows={3}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your feedback helps us improve our newsletter content.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Processing..." : "Unsubscribe"}
                </Button>

                <div className="text-center">
                  <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    Cancel and return to website
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having trouble? Contact us at{" "}
            <a href="mailto:notify@abbakabiryusuf.info" className="text-red-600 hover:text-red-700">
              notify@abbakabiryusuf.info
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}