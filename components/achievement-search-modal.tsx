"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Trophy } from "lucide-react"
import { AutoCarousel } from "@/components/auto-carousel"

interface Achievement {
  id: string
  title: string
  content: string
  attachments: Array<{
    url: string
    type: string
    name?: string
  }>
  created_at: string
  author?: string
  location?: string
  category?: string
}

interface AchievementSearchModalProps {
  achievement: Achievement
  isOpen: boolean
  onClose: () => void
}

export function AchievementSearchModal({ achievement, isOpen, onClose }: AchievementSearchModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="text-yellow-600" size={24} />
            Achievement Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Image Carousel */}
            {achievement.attachments && achievement.attachments.length > 0 && (
              <div className="w-full h-64 md:h-80">
                <AutoCarousel
                  images={achievement.attachments.map((att) => att.url)}
                  className="w-full h-full"
                  imageClassName="object-cover rounded-lg"
                  showControls={true}
                />
              </div>
            )}

            {/* Achievement Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{achievement.title}</h1>
                <Badge variant="secondary" className="w-fit">
                  <Trophy size={14} className="mr-1" />
                  Achievement
                </Badge>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(achievement.created_at)}
                </div>
                {achievement.author && (
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    {achievement.author}
                  </div>
                )}
                {achievement.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {achievement.location}
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Content */}
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{achievement.content}</div>
            </div>

            {/* Category */}
            {achievement.category && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <Badge variant="outline">{achievement.category}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
