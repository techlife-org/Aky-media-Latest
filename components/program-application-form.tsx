"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Users,
  Clock,
  MapPin,
  X
} from "lucide-react"
import { toast } from "sonner"

interface Program {
  _id: string
  title: string
  description: string
  category: string
  duration: string
  location: string
  benefits: string[]
  applicationRequired: boolean
  applicationDeadline?: string
  requiredDocuments: string[]
  customQuestions?: {
    question: string
    type: 'text' | 'textarea' | 'select'
    options?: string[]
    required: boolean
  }[]
  totalApplications: number
}

interface ProgramApplicationFormProps {
  program: Program
  onClose: () => void
  onSuccess: () => void
}

export default function ProgramApplicationForm({ program, onClose, onSuccess }: ProgramApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customResponses, setCustomResponses] = useState<{ question: string; answer: string }[]>([])
  const [files, setFiles] = useState<{ [key: string]: File | null }>({})

  // Initialize custom responses
  useState(() => {
    if (program.customQuestions) {
      setCustomResponses(
        program.customQuestions.map(q => ({ question: q.question, answer: '' }))
      )
    }
  })

  const handleFileChange = (documentType: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [documentType]: file }))
  }

  const handleCustomResponseChange = (index: number, answer: string) => {
    setCustomResponses(prev => 
      prev.map((response, i) => 
        i === index ? { ...response, answer } : response
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("youthToken")
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Validate required custom questions
      if (program.customQuestions) {
        for (let i = 0; i < program.customQuestions.length; i++) {
          const question = program.customQuestions[i]
          const response = customResponses[i]
          
          if (question.required && (!response.answer || response.answer.trim() === '')) {
            throw new Error(`Please answer: ${question.question}`)
          }
        }
      }

      const formData = new FormData()
      formData.append('programId', program._id)
      formData.append('customResponses', JSON.stringify(customResponses))

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file)
        }
      })

      const response = await fetch("/api/youth/applications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Application failed")
      }

      toast.success("Application submitted successfully! 🎉")
      onSuccess()
      onClose()

    } catch (error) {
      console.error("Application error:", error)
      toast.error(error instanceof Error ? error.message : "Application failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDeadlinePassed = program.applicationDeadline && new Date() > new Date(program.applicationDeadline)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Apply to Program</CardTitle>
              <CardDescription className="text-blue-100">
                {program.title}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Program Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{program.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{program.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{program.totalApplications} applicants</span>
              </div>
              {program.applicationDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Deadline: {new Date(program.applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deadline Warning */}
          {isDeadlinePassed && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The application deadline for this program has passed.
              </AlertDescription>
            </Alert>
          )}

          {!isDeadlinePassed && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Documents */}
              {program.requiredDocuments.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Required Documents
                  </Label>
                  <div className="space-y-4">
                    {program.requiredDocuments.map((docType) => (
                      <div key={docType} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium capitalize">
                            {docType.replace('_', ' ')}
                          </Label>
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </div>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(docType, e.target.files?.[0] || null)}
                          className="mt-2"
                        />
                        {files[docType] && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>{files[docType]?.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Questions */}
              {program.customQuestions && program.customQuestions.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Application Questions
                  </Label>
                  <div className="space-y-4">
                    {program.customQuestions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <Label className="font-medium mb-2 block">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {question.type === 'text' && (
                          <Input
                            value={customResponses[index]?.answer || ''}
                            onChange={(e) => handleCustomResponseChange(index, e.target.value)}
                            placeholder="Enter your answer..."
                            required={question.required}
                          />
                        )}
                        
                        {question.type === 'textarea' && (
                          <Textarea
                            value={customResponses[index]?.answer || ''}
                            onChange={(e) => handleCustomResponseChange(index, e.target.value)}
                            placeholder="Enter your answer..."
                            rows={4}
                            required={question.required}
                          />
                        )}
                        
                        {question.type === 'select' && question.options && (
                          <select
                            value={customResponses[index]?.answer || ''}
                            onChange={(e) => handleCustomResponseChange(index, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required={question.required}
                          >
                            <option value="">Select an option...</option>
                            {question.options.map((option, optIndex) => (
                              <option key={optIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  Program Benefits
                </Label>
                <div className="flex flex-wrap gap-2">
                  {program.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}