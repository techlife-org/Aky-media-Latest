"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle, User, Mail, Phone, Calendar, CreditCard, MapPin, Briefcase } from "lucide-react"
import { KANO_LGAS, OCCUPATION_OPTIONS } from "@/models/Youth"
import { toast } from "sonner"

interface FormData {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  ninNumber: string
  lga: string
  occupation: string
  ninDocument: File | null
}

interface FormErrors {
  [key: string]: string
}

export default function YouthRegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ninNumber: "",
    lga: "",
    occupation: "",
    ninDocument: null
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Phone validation
    const phoneRegex = /^(\+234|0)[789]\d{9}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Invalid Nigerian phone number format (e.g., 08012345678)"
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required"
    } else {
      const age = calculateAge(formData.dateOfBirth)
      if (age < 15 || age > 35) {
        newErrors.dateOfBirth = "Age must be between 15 and 35 years to qualify"
      }
    }

    // NIN validation
    const ninRegex = /^\d{11}$/
    if (!formData.ninNumber.trim()) {
      newErrors.ninNumber = "NIN is required"
    } else if (!ninRegex.test(formData.ninNumber)) {
      newErrors.ninNumber = "NIN must be exactly 11 digits"
    }

    // LGA validation
    if (!formData.lga) {
      newErrors.lga = "Local Government Area is required"
    }

    // Occupation validation
    if (!formData.occupation) {
      newErrors.occupation = "Occupation is required"
    }

    // File validation
    if (!formData.ninDocument) {
      newErrors.ninDocument = "NIN document is required"
    } else {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(formData.ninDocument.type)) {
        newErrors.ninDocument = "Only JPG, PNG, and PDF files are allowed"
      } else if (formData.ninDocument.size > maxSize) {
        newErrors.ninDocument = "File size must be less than 5MB"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFormData(prev => ({ ...prev, ninDocument: file }))
    if (errors.ninDocument) {
      setErrors(prev => ({ ...prev, ninDocument: "" }))
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const submitFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          submitFormData.append(key, value)
        }
      })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/youth/register", {
        method: "POST",
        body: submitFormData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      toast.success("Registration successful!")
      
      // Redirect to success page with registration data
      const searchParams = new URLSearchParams({
        uniqueId: result.data.uniqueId,
        fullName: result.data.fullName,
        lga: result.data.lga,
        email: result.data.email
      })
      
      router.push(`/register/success?${searchParams.toString()}`)

    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Registration failed")
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">User Program Registration</CardTitle>
            <CardDescription className="text-red-100">
              Join His Excellency's User Program - Empowering Kano Youth
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name (as on NIN) *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name as it appears on your NIN"
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number (WhatsApp preferred) *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="08012345678 or +2348012345678"
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 35)).toISOString().split('T')[0]}
                      className={`pl-10 ${errors.dateOfBirth ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formData.dateOfBirth && (
                    <p className="text-sm text-gray-600">
                      Age: {calculateAge(formData.dateOfBirth)} years
                    </p>
                  )}
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>

              {/* Identification Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                  <CreditCard className="w-5 h-5" />
                  Identification
                </div>

                {/* NIN Number */}
                <div className="space-y-2">
                  <Label htmlFor="ninNumber" className="text-sm font-medium">
                    NIN Number *
                  </Label>
                  <Input
                    id="ninNumber"
                    type="text"
                    value={formData.ninNumber}
                    onChange={(e) => handleInputChange("ninNumber", e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678901"
                    maxLength={11}
                    className={errors.ninNumber ? "border-red-500" : ""}
                  />
                  {errors.ninNumber && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.ninNumber}
                    </p>
                  )}
                </div>

                {/* NIN Document Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Upload NIN Slip/Card *
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-red-500 bg-red-50"
                        : errors.ninDocument
                        ? "border-red-500"
                        : "border-gray-300 hover:border-red-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="ninDocument"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="ninDocument" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {formData.ninDocument ? (
                          <>
                            <FileText className="w-8 h-8 text-green-500" />
                            <p className="text-sm font-medium text-green-600">
                              {formData.ninDocument.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.ninDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm font-medium">
                              Drop your NIN document here or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, or PDF (max 5MB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors.ninDocument && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.ninDocument}
                    </p>
                  )}
                </div>
              </div>

              {/* Location & Occupation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                  <MapPin className="w-5 h-5" />
                  Location & Occupation
                </div>

                {/* LGA */}
                <div className="space-y-2">
                  <Label htmlFor="lga" className="text-sm font-medium">
                    Local Government Area (LGA) *
                  </Label>
                  <Select value={formData.lga} onValueChange={(value) => handleInputChange("lga", value)}>
                    <SelectTrigger className={errors.lga ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your LGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(KANO_LGAS).map(([lga, code]) => (
                        <SelectItem key={lga} value={lga}>
                          {lga} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.lga && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lga}
                    </p>
                  )}
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    Occupation/Status *
                  </Label>
                  <Select value={formData.occupation} onValueChange={(value) => handleInputChange("occupation", value)}>
                    <SelectTrigger className={errors.occupation ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCUPATION_OPTIONS.map((occupation) => (
                        <SelectItem key={occupation} value={occupation}>
                          {occupation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.occupation && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.occupation}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading registration...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Complete Registration
                  </div>
                )}
              </Button>

              {/* Terms Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  By registering, you agree to participate in His Excellency's Youth Program and 
                  consent to the processing of your personal data for program purposes. Your information 
                  will be kept secure and confidential.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}