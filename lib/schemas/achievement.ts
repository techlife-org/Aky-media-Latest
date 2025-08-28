import { z } from "zod"

export const achievementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["completed", "ongoing", "determined"]),
  progress: z.number().min(0).max(100),
  category: z.enum(["infrastructure", "education", "healthcare", "finance", "agriculture", "environment", "security"]),
  date: z.string().min(4, "Please enter a valid date"),
  location: z.string().min(2, "Location is required"),
  impact: z.string().min(5, "Impact description is required"),
  details: z.array(z.string()).optional().default([]),
  icon: z.string().optional(),
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").optional().default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Achievement = z.infer<typeof achievementSchema> & {
  _id?: string
}
