"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if cookie exists
    const consent = getCookie("newsletterConsent")
    if (consent !== "accepted") {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShow(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return null
  }

  const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setCookie("newsletterConsent", "accepted")
        setIsSubscribed(true)
        toast({
          title: "Thank you for subscribing! 🎉",
          description: data.message,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        // Close modal after 2 seconds
        setTimeout(() => {
          setShow(false)
        }, 2000)
      } else {
        toast({
          title: "Subscription Failed",
          description: data.message || "Please try again later",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = () => {
    setCookie("newsletterConsent", "declined")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
          <button 
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isSubscribed ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">Thank you for subscribing! 🎉</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter for the latest updates and news. We respect your privacy. Unsubscribe at any time.
            </p>
            <form onSubmit={handleAccept} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDecline}
                  className="w-full"
                  disabled={isLoading}
                >
                  Not Now
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
