"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { convertHeicToJpeg } from "@/app/utils/heic-convert"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, ArrowLeft } from "lucide-react"
import { DragDropUpload, ImagePreview } from "@/components/drag-drop-upload"
import DashboardLayout from "@/components/dashboard-layout"

const achievementFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["completed", "ongoing", "determined"]),
  progress: z.number().min(0).max(100),
  category: z.enum(["infrastructure", "education", "healthcare", "finance", "agriculture", "environment", "security"]),
  date: z.string().min(4, "Please enter a valid date"),
  location: z.string().min(2, "Location is required"),
  impact: z.string().min(5, "Impact description is required"),
  details: z.string().transform((val) => val.split("\n").filter((item) => item.trim() !== "")),
  icon: z.string().optional(),
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").optional().default([]),
})

type AchievementFormValues = z.infer<typeof achievementFormSchema>

const defaultValues: Partial<AchievementFormValues> = {
  status: "ongoing",
  progress: 0,
  category: "infrastructure",
  details: [],
}

function AchievementForm({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    const fetchAchievement = async () => {
      if (id === "new") {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/achievements/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to fetch achievement")
        }

        const data = await response.json()

        const formData = {
          ...data,
          details: data.details ? data.details.join("\n") : "",
          images: data.images || [],
        }

        form.reset(formData)
        if (data.images?.length) {
          setPreviewUrls(data.images)
        }
      } catch (error) {
        console.error("Error fetching achievement:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load achievement")
      } finally {
        setLoading(false)
      }
    }

    fetchAchievement()
  }, [id, form])

  const convertFileIfNeeded = useCallback(async (file: File): Promise<File> => {
    try {
      return await convertHeicToJpeg(file)
    } catch (error) {
      console.error("Error in HEIC conversion:", error)
      return file
    }
  }, [])

  const handleImageUpload = async (file: File): Promise<string> => {
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]
    const maxFileSize = 5 * 1024 * 1024

    if (
      !validImageTypes.includes(file.type.toLowerCase()) &&
      !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif|heic|heif)$/i)
    ) {
      throw new Error("Invalid file type. Please upload an image file (JPEG, PNG, WebP, AVIF, HEIC).")
    }

    if (file.size > maxFileSize) {
      throw new Error(`File is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`)
    }

    setUploading(true)
    let uploadProgress = 0
    const progressInterval = setInterval(() => {
      uploadProgress = Math.min(uploadProgress + 10, 90)
      toast.loading(`Uploading ${file.name}... (${uploadProgress}%)`, {
        id: `upload-${file.name}`,
      })
    }, 200)

    try {
      toast.loading(`Starting upload for ${file.name}...`, {
        id: `upload-${file.name}`,
      })

      const processedFile = await convertFileIfNeeded(file)

      const formData = new FormData()
      formData.append("file", processedFile)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      toast.success(`Uploaded ${file.name} successfully`, {
        id: `upload-${file.name}`,
        duration: 3000,
      })

      return result.url
    } catch (error) {
      console.error("Error uploading image:", error)

      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(`Upload failed: ${errorMessage}`, {
        id: `upload-${file.name}`,
        duration: 5000,
      })

      throw error
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
    }
  }

  const handleDragDropUpload = async (files: File[]) => {
    const currentImages = form.getValues("images") || []

    try {
      setUploading(true)
      const uploadPromises = files.map((file) => handleImageUpload(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      const newImages = [...currentImages, ...uploadedUrls]
      form.setValue("images", newImages, { shouldValidate: true })
      setPreviewUrls(newImages)

      toast.success(`Successfully uploaded ${files.length} image(s)`)
    } catch (error) {
      console.error("Error handling drag drop upload:", error)
      toast.error("Failed to upload some images. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const currentImages = [...previewUrls]
    currentImages.splice(index, 1)
    setPreviewUrls(currentImages)
    form.setValue("images", currentImages)
  }

  const onSubmit = async (data: AchievementFormValues) => {
    try {
      setIsSubmitting(true)
      const method = id === "new" ? "POST" : "PUT"
      const url = id === "new" ? "/api/achievements" : `/api/achievements/${id}`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save achievement")

      toast.success("Achievement saved successfully")

      router.push("/dashboard/achievements")
      router.refresh()
    } catch (error) {
      console.error("Error saving achievement:", error)
      toast.error("Failed to save achievement")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{id === "new" ? "Add New" : "Edit"} Achievement</h1>
            <p className="text-muted-foreground">
              {id === "new" ? "Add a new achievement to track" : "Update the achievement details"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter achievement title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="determined">Determined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023-2024" {...field} />
                    </FormControl>
                    <FormDescription>Enter the date or time period for this achievement</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kano State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a detailed description of the achievement"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impact</FormLabel>
                  <FormControl>
                    <Input placeholder="Briefly describe the impact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Points</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter key points (one per line)"
                      className="min-h-[100px]"
                      value={Array.isArray(field.value) ? field.value.join("\n") : field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Enter each key point on a new line</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Images (Max 5)</FormLabel>

              <ImagePreview images={previewUrls} onRemove={removeImage} disabled={uploading} />

              <DragDropUpload
                onFilesSelected={handleDragDropUpload}
                maxFiles={5}
                disabled={uploading}
              />

              <FormDescription>
                Drag and drop up to 5 images or click to browse. Maximum file size: 5MB each. The first image will be
                used as the banner image.
              </FormDescription>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/achievements")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id === "new" ? "Create Achievement" : "Update Achievement"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <AchievementForm id={id} />
    </Suspense>
  )
}
