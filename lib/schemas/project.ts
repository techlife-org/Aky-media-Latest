import { z } from "zod"

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  status: z.enum(["planning", "active", "completed", "on-hold", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  budget: z.number().min(0, "Budget must be a positive number"),
  allocated: z.number().min(0, "Allocated amount must be a positive number"),
  spent: z.number().min(0, "Spent amount must be a positive number"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required"),
  progress: z.number().min(0).max(100, "Progress must be between 0 and 100"),
  manager: z.string().min(2, "Project manager is required"),
  team: z.array(z.string()).default([]),
  location: z.string().min(2, "Location is required"),
  beneficiaries: z.number().min(0, "Beneficiaries must be a positive number"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Project = z.infer<typeof projectSchema> & {
  _id?: string
}