"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  Lock,
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react"
import { KANO_LGAS, OCCUPATION_OPTIONS } from "@/models/Youth"
import { toast } from "sonner"

interface FormData {
  // Step 1: Personal Information
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Step 2: Identification
  ninNumber: string
  ninDocument: File | null
  
  // Step 3: Location & Occupation
  lga: string
  occupation: string
  
  // Step 4: Security
  password: string
  confirmPassword: string
}

interface StepValidation {
  [key: string]: string
}

const STEPS = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User,
    fields: ["fullName", "email", "phone", "dateOfBirth"]
  },
  {
    id: 2,
    title: "Identification",
    description: "Verify your identity",
    icon: CreditCard,
    fields: ["ninNumber", "ninDocument"]
  },
  {
    id: 3,
    title: "Location & Occupation",
    description: "Where are you from?",
    icon: MapPin,
    fields: ["lga", "occupation"]
  },
  {
    id: 4,
    title: "Security",
    description: "Create your password",
    icon: Lock,
    fields: ["password", "confirmPassword"]
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Confirm your details",
    icon: CheckCircle,
    fields: []
  }
]

export default function MultiStepRegistration() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ninNumber: "",
    ninDocument: null,
    lga: "",
    occupation: "",
    password: "",
    confirmPassword: ""
  })
  
  const [errors, setErrors] = useState<StepValidation>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: StepValidation = {}
    const currentStepData = STEPS.find(s => s.id === step)
    
    if (!currentStepData) return false

    // Step 1: Personal Information
    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required"
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters"
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format"
      }

      const phoneRegex = /^(\+234|0)[789]\d{9}$/
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required"
      } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ""))) {
        newErrors.phone = "Invalid Nigerian phone number format"
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required"
      } else {
        const age = calculateAge(formData.dateOfBirth)
        if (age < 15 || age > 35) {
          newErrors.dateOfBirth = "Age must be between 15 and 35 years"
        }
      }
    }

    // Step 2: Identification
    if (step === 2) {
      const ninRegex = /^\d{11}$/
      if (!formData.ninNumber.trim()) {
        newErrors.ninNumber = "NIN is required"
      } else if (!ninRegex.test(formData.ninNumber)) {
        newErrors.ninNumber = "NIN must be exactly 11 digits"
      }

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
    }

    // Step 3: Location & Occupation
    if (step === 3) {
      if (!formData.lga) {
        newErrors.lga = "Local Government Area is required"
      }

      if (!formData.occupation) {
        newErrors.occupation = "Occupation is required"
      }
    }

    // Step 4: Security
    if (step === 4) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
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

  // Navigate between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    } else {
      toast.error("Please fix the errors before proceeding")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Please fix all errors before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          submitFormData.append(key, value)
        }
      })

      const response = await fetch("/api/youth/register", {
        method: "POST",
        body: submitFormData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      toast.success("Registration successful!")
      
      // Redirect to success page
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join His Excellency's Youth Program
          </h1>
          <p className="text-lg text-gray-600">
            Empowering the future leaders of Kano State
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex flex-col items-center min-w-0 flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    hidden lg:block w-full h-0.5 mt-6 -ml-6 -mr-6
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {STEPS[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as on NIN) *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (WhatsApp preferred) *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="08012345678"
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

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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
                      <p className="text-sm text-green-600">
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
              </div>
            )}

            {/* Step 2: Identification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ninNumber">NIN Number *</Label>
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

                <div className="space-y-2">
                  <Label>Upload NIN Slip/Card *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : errors.ninDocument
                        ? "border-red-500"
                        : "border-gray-300 hover:border-blue-400"
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
                      <div className="flex flex-col items-center gap-4">
                        {formData.ninDocument ? (
                          <>
                            <FileText className="w-16 h-16 text-green-500" />
                            <div>
                              <p className="text-lg font-medium text-green-600">
                                {formData.ninDocument.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(formData.ninDocument.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-16 h-16 text-gray-400" />
                            <div>
                              <p className="text-lg font-medium">
                                Drop your NIN document here or click to browse
                              </p>
                              <p className="text-sm text-gray-500">
                                JPG, PNG, or PDF (max 5MB)
                              </p>
                            </div>
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
            )}

            {/* Step 3: Location & Occupation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lga">Local Government Area (LGA) *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation/Status *</Label>
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
              </div>
            )}

            {/* Step 4: Security */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Create a strong password"
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Password must contain:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                          At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                          One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>
                          One lowercase letter
                        </li>
                        <li className={/\d/.test(formData.password) ? "text-green-600" : ""}>
                          One number
                        </li>
                      </ul>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {formData.confirmPassword && (
                      <p className={`text-sm flex items-center gap-1 ${
                        formData.password === formData.confirmPassword ? "text-green-600" : "text-red-500"
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                        <p><span className="font-medium">Email:</span> {formData.email}</p>
                        <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                        <p><span className="font-medium">Age:</span> {formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 'N/A'} years</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Location & Occupation</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">LGA:</span> {formData.lga}</p>
                        <p><span className="font-medium">Occupation:</span> {formData.occupation}</p>
                        <p><span className="font-medium">NIN:</span> {formData.ninNumber}</p>
                        <p><span className="font-medium">Document:</span> {formData.ninDocument?.name || 'Not uploaded'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>
                        By submitting this registration, you agree to participate in His Excellency's Youth Program 
                        and consent to the processing of your personal data for program purposes. Your information 
                        will be kept secure and confidential.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}