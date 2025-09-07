"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, CheckCircle, Loader2, AlertCircle, MessageSquare, Clock, Shield } from "lucide-react"
import { toast } from "sonner"

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  subject?: string;
  message?: string;
}

interface NotificationStatus {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  admin: boolean;
}

export default function ContactForm() {
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
  const [errors, setErrors] = useState<FormErrors>({})
  const [notifications, setNotifications] = useState<NotificationStatus | null>(null)
  const [contactId, setContactId] = useState<string | null>(null)

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required'
        if (value.trim().length > 50) return 'First name must be less than 50 characters'
        break
      case 'lastName':
        if (!value.trim()) return 'Last name is required'
        if (value.trim().length > 50) return 'Last name must be less than 50 characters'
        break
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address'
        break
      case 'mobile':
        // Mobile is optional, but if provided, should be valid
        if (value.trim() && value.trim().length < 10) return 'Please enter a valid phone number'
        break
      case 'subject':
        if (!value.trim()) return 'Subject is required'
        if (value.trim().length > 200) return 'Subject must be less than 200 characters'
        break
      case 'message':
        if (!value.trim()) return 'Message is required'
        if (value.trim().length < 10) return 'Message must be at least 10 characters'
        if (value.trim().length > 5000) return 'Message must be less than 5000 characters'
        break
    }
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Validate all fields
    const newErrors: FormErrors = {}
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      toast.error("Please fix the errors in the form", {
        description: "Check the highlighted fields and try again.",
      })
      return
    }

    try {
      // Add metadata
      const submissionData = {
        ...formData,
        source: 'website',
        referrer: document.referrer,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setContactId(data.contactId)
        setNotifications(data.notifications)
        setIsSubmitted(true)

        // Show success toast with notification status
        const notificationCount = data.notifications ? 
          Object.values(data.notifications).filter(Boolean).length : 0
        
        toast.success("Message sent successfully!", {
          description: `We'll get back to you within 30 minutes during business hours. ${notificationCount} confirmation(s) sent.`,
          duration: 5000,
        })

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
          setNotifications(null)
          setContactId(null)
        }, 5000)
      } else {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors: FormErrors = {}
          data.errors.forEach((error: string) => {
            if (error.includes('First name')) serverErrors.firstName = error
            else if (error.includes('Last name')) serverErrors.lastName = error
            else if (error.includes('Email') || error.includes('email')) serverErrors.email = error
            else if (error.includes('phone') || error.includes('mobile')) serverErrors.mobile = error
            else if (error.includes('Subject')) serverErrors.subject = error
            else if (error.includes('Message')) serverErrors.message = error
          })
          setErrors(serverErrors)
        }

        toast.error("Failed to send message", {
          description: data.message || "Please check your information and try again.",
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
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }

    // Real-time validation for better UX
    const error = validateField(name, value)
    if (error && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
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
              
              {/* Notification Status */}
              {notifications && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Confirmation Status:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`flex items-center gap-2 ${notifications.email ? 'text-green-600' : 'text-gray-400'}`}>
                      <Mail className="w-4 h-4" />
                      <span>Email {notifications.email ? '✓' : '✗'}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${notifications.sms ? 'text-green-600' : 'text-gray-400'}`}>
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS {notifications.sms ? '✓' : '✗'}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${notifications.whatsapp ? 'text-green-600' : 'text-gray-400'}`}>
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp {notifications.whatsapp ? '✓' : '✗'}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${notifications.admin ? 'text-green-600' : 'text-gray-400'}`}>
                      <Shield className="w-4 h-4" />
                      <span>Admin {notifications.admin ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {contactId && (
                <p className="text-xs text-gray-500 mb-4">
                  Reference ID: {contactId.slice(-8).toUpperCase()}
                </p>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Redirecting back to form...</span>
              </div>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us A Message</h2>
                  <p className="text-gray-600 text-lg">Our response time is within 30 minutes during business hours</p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span>Email confirmation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      <span>SMS notification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-red-600" />
                      <span>WhatsApp update</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>Quick response</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        name="firstName"
                        placeholder="First Name *"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={`h-12 ${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.firstName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Input
                        name="lastName"
                        placeholder="Last Name *"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={`h-12 ${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Input
                        name="mobile"
                        type="tel"
                        placeholder="Mobile Number (Optional)"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`h-12 ${errors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.mobile && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.mobile}</span>
                        </div>
                      )}
                      {!errors.mobile && formData.mobile && (
                        <p className="text-xs text-gray-500 mt-1">
                          Include for SMS and WhatsApp confirmations
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      name="subject"
                      placeholder="Subject *"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`h-12 ${errors.subject ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.subject && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.subject}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Textarea
                      name="message"
                      placeholder="Message *"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className={`resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.message}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Minimum 10 characters required
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.message.length}/5000
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to receive confirmations via email, SMS, and WhatsApp.
                  </p>
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
                  
                  <div className="pt-8 border-t border-white/20">
                    <h3 className="text-xl font-bold mb-4">Response Time</h3>
                    <div className="space-y-2 text-white/90">
                      <p>• Email: Within 30 minutes</p>
                      <p>• SMS: Instant confirmation</p>
                      <p>• WhatsApp: Instant confirmation</p>
                      <p>• Phone: During office hours</p>
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