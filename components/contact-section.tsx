"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you within 30 minutes during business hours.",
          duration: 5000,
        })

        setIsSubmitted(true)

        // Reset form after showing success
        setTimeout(() => {
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            subject: "",
            message: "",
          })
          setIsSubmitted(false)
        }, 3000)
      } else {
        toast.error("Failed to send message", {
          description: data.message || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for contacting us. We'll get back to you within 30 minutes during business hours.
              </p>
              <div className="animate-pulse text-sm text-gray-500">Redirecting back to form...</div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-7 gap-0">
              {/* Contact Form */}
              <div className="lg:col-span-4 p-8 lg:p-12">
                <div className="mb-8">
                  <p className="text-red-600 font-medium text-lg mb-2">Contact us</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us A Message</h2>
                  <p className="text-gray-600">Our response time is within 30 minutes during business hours</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="h-12"
                      disabled={isSubmitting}
                    />
                    <Input
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12"
                      disabled={isSubmitting}
                    />
                    <Input
                      name="mobile"
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Input
                    name="subject"
                    placeholder="Subject *"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="h-12"
                    disabled={isSubmitting}
                  />

                  <Textarea
                    name="message"
                    placeholder="Message *"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="resize-none"
                    disabled={isSubmitting}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="lg:col-span-3 bg-red-600 p-8 lg:p-12 text-white">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Our Address</h3>
                      <p className="text-white/90">Government House, Kano State, Nigeria</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Call or Text</h3>
                      <a href="tel:+2347074222252" className="text-white/90 hover:text-white transition-colors">
                        +234 707 422 2252
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Email us today</h3>
                      <a
                        href="mailto:info@abbakabiryusuf.com"
                        className="text-white/90 hover:text-white transition-colors"
                      >
                        info@abbakabiryusuf.com
                      </a>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/20">
                    <h3 className="text-xl font-bold mb-4">Office Hours</h3>
                    <div className="space-y-2 text-white/90">
                      <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p>Saturday: 9:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
