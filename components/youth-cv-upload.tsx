"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

export default function YouthCVUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedCV, setUploadedCV] = useState<any>(null)

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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.")
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast.error("File size exceeds 10MB limit.")
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setIsUploading(true)

    try {
      const token = localStorage.getItem("youthToken")
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      const formData = new FormData()
      formData.append('cv', file)

      const response = await fetch("/api/youth/cv-upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Upload failed")
      }

      setUploadedCV(result.data)
      toast.success("CV uploaded successfully! 🎉")
      
      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push("/youth-dashboard")
      }, 2000)

    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('image')) return '🖼️'
    return '📁'
  }

  if (uploadedCV) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">CV Uploaded Successfully! 🎉</CardTitle>
              <CardDescription className="text-green-100">
                You're all set to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{uploadedCV.filename}</p>
                    <p className="text-sm text-green-600">
                      Uploaded on {new Date(uploadedCV.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Your CV has been successfully uploaded and you now have full access to the Youth Dashboard!
              </p>

              <Button
                onClick={() => router.push("/youth-dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upload Your CV 📄
          </h1>
          <p className="text-lg text-gray-600">
            One final step to access your personalized dashboard
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Required:</strong> Please upload your CV to complete your profile and gain access to all dashboard features.
            Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </AlertDescription>
        </Alert>

        {/* Upload Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">CV Upload</CardTitle>
            <CardDescription className="text-blue-100">
              Upload your curriculum vitae to showcase your skills and experience
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="cv-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        Drop your CV here or click to browse
                      </p>
                      <p className="text-gray-500">
                        Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload CV
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">💡 CV Tips</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Include your contact information and professional summary</li>
                <li>• List your education, work experience, and skills</li>
                <li>• Keep it concise and relevant to your career goals</li>
                <li>• Use a clean, professional format</li>
                <li>• Proofread for spelling and grammar errors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}