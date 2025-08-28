"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Target, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Heart,
  Star
} from "lucide-react"
import { toast } from "sonner"

interface OnboardingData {
  // Step 1: Welcome & Goals
  goals: string[]
  motivation: string
  
  // Step 2: Interests & Skills
  interests: string[]
  skills: string[]
  experience: string
  
  // Step 3: Expectations & Commitment
  expectations: string
  availability: string
  commitment: string
}

const GOALS_OPTIONS = [
  "Learn new skills",
  "Start a business", 
  "Find employment",
  "Network with peers",
  "Personal development",
  "Community service"
]

const INTERESTS_OPTIONS = [
  "Technology",
  "Business",
  "Arts & Culture",
  "Sports",
  "Music",
  "Agriculture",
  "Health",
  "Education"
]

const SKILLS_OPTIONS = [
  "Communication",
  "Leadership",
  "Computer Skills",
  "Problem Solving",
  "Teamwork",
  "Creativity",
  "Time Management",
  "Public Speaking"
]

export default function YouthOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    goals: [],
    motivation: "",
    interests: [],
    skills: [],
    experience: "",
    expectations: "",
    availability: "",
    commitment: ""
  })

  const progress = (currentStep / 3) * 100

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("youthToken")
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/youth/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Onboarding failed")
      }

      toast.success("Welcome to the Youth Program! 🎉")
      router.push("/youth-cv-upload")

    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error(error instanceof Error ? error.message : "Onboarding failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Journey! 🚀
          </h1>
          <p className="text-lg text-gray-600">
            Let's get to know you better and personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 3
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Form Content */}
        <Card className="shadow-2xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {currentStep === 1 && "Your Goals & Motivation"}
              {currentStep === 2 && "Your Interests & Skills"}
              {currentStep === 3 && "Your Expectations & Commitment"}
            </CardTitle>
            <CardDescription className="text-purple-100">
              {currentStep === 1 && "Tell us what you want to achieve"}
              {currentStep === 2 && "Share your passions and abilities"}
              {currentStep === 3 && "Let us know your expectations"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Step 1: Goals & Motivation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    What are your main goals? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GOALS_OPTIONS.map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={formData.goals.includes(goal) ? "default" : "outline"}
                        className={`h-auto p-4 text-left justify-start ${
                          formData.goals.includes(goal) 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "hover:bg-purple-50"
                        }`}
                        onClick={() => handleArrayToggle("goals", goal)}
                      >
                        <div className="flex items-center gap-2">
                          {formData.goals.includes(goal) && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm">{goal}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="motivation" className="text-lg font-semibold">
                    What motivates you to join this program?
                  </Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange("motivation", e.target.value)}
                    placeholder="Share your motivation and what you hope to achieve..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Interests & Skills */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    What are your interests? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className={`h-auto p-3 text-center ${
                          formData.interests.includes(interest) 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "hover:bg-blue-50"
                        }`}
                        onClick={() => handleArrayToggle("interests", interest)}
                      >
                        <div className="flex items-center gap-2">
                          {formData.interests.includes(interest) && (
                            <Heart className="w-4 h-4" />
                          )}
                          <span className="text-sm">{interest}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    What skills do you have? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SKILLS_OPTIONS.map((skill) => (
                      <Button
                        key={skill}
                        type="button"
                        variant={formData.skills.includes(skill) ? "default" : "outline"}
                        className={`h-auto p-3 text-center ${
                          formData.skills.includes(skill) 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "hover:bg-green-50"
                        }`}
                        onClick={() => handleArrayToggle("skills", skill)}
                      >
                        <div className="flex items-center gap-2">
                          {formData.skills.includes(skill) && (
                            <Star className="w-4 h-4" />
                          )}
                          <span className="text-sm">{skill}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-lg font-semibold">
                    Tell us about your experience (work, volunteer, projects)
                  </Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="Describe your relevant experience, achievements, or projects..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Expectations & Commitment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="expectations" className="text-lg font-semibold">
                    What do you expect from this program?
                  </Label>
                  <Textarea
                    id="expectations"
                    value={formData.expectations}
                    onChange={(e) => handleInputChange("expectations", e.target.value)}
                    placeholder="Share your expectations and what success looks like for you..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="availability" className="text-lg font-semibold">
                    How much time can you commit per week?
                  </Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange("availability", e.target.value)}
                    placeholder="e.g., 10-15 hours per week"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="commitment" className="text-lg font-semibold">
                    How committed are you to completing this program?
                  </Label>
                  <Textarea
                    id="commitment"
                    value={formData.commitment}
                    onChange={(e) => handleInputChange("commitment", e.target.value)}
                    placeholder="Tell us about your commitment level and any challenges you might face..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Your Profile Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Goals:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.goals.map(goal => (
                          <Badge key={goal} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Interests:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
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

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
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
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Onboarding
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