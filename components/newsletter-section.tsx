"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
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
        setIsSuccess(true)
        setEmail("")
        toast({
          title: "Successfully Subscribed! 🎉",
          description: data.message,
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        toast({
          title: "Subscription Failed",
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
    <section
      className="py-20 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.8)), url(pictures/welcome/1.JPG)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Don't miss!
              <br />
              Our latest updates
            </h2>
            <p className="text-xl text-white/90">Subscribe to our newsletter for exclusive content</p>
          </div>

          {isSuccess ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-white/90 mb-4">You've successfully subscribed to our newsletter.</p>
              <Button
                onClick={() => setIsSuccess(false)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                Subscribe Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                />
                {email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="bg-red-600 hover:bg-red-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          )}

          <p className="text-white/70 text-sm mt-4">Join over 10,000+ subscribers. No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
