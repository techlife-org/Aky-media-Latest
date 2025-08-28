"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Target } from "lucide-react"

interface Achievement {
  _id: string
  title: string
  description: string
  category: string
  status: "completed" | "ongoing" | "determined"
  progress: number
  date: string
  location: string
  impact: string
  details: string[]
  icon: string
  images?: string[]
}

interface AchievementViewModalProps {
  achievement: Achievement | null
  open: boolean
  onClose: () => void
}

export function AchievementViewModal({ achievement, open, onClose }: AchievementViewModalProps) {
  if (!achievement) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "determined":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{achievement.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner Image */}
          {achievement.images && achievement.images.length > 0 && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={achievement.images[0] || "/placeholder.svg"}
                alt={achievement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Status and Category */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`capitalize ${getStatusBadge(achievement.status)}`}>{achievement.status}</Badge>
            <Badge variant="outline" className="capitalize">
              {achievement.category}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{achievement.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  achievement.status === "completed"
                    ? "bg-green-500"
                    : achievement.status === "ongoing"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                }`}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{achievement.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{achievement.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{achievement.impact}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{achievement.description}</p>
          </div>

          {/* Key Points */}
          {achievement.details && achievement.details.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <ul className="space-y-1">
                {achievement.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Images */}
          {achievement.images && achievement.images.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Additional Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievement.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${achievement.title} - Image ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(image, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
