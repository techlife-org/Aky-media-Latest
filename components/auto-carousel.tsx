"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface AutoCarouselProps {
  images: string[]
  title?: string
  className?: string
  imageClassName?: string
  autoAdvanceInterval?: number
  showControls?: boolean
  aspectRatio?: "square" | "video" | "auto"
}

export function AutoCarousel({
  images,
  title = "Image",
  className,
  imageClassName,
  autoAdvanceInterval = 5000,
  showControls = true,
  aspectRatio = "auto",
}: AutoCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    console.log("[v0] AutoCarousel received images:", images)
    console.log("[v0] Images length:", images?.length)
  }, [images])

  const scrollNext = useCallback(() => {
    if (api) {
      api.scrollNext()
    }
  }, [api])

  // Auto-advance functionality
  useEffect(() => {
    if (!api || images.length <= 1) return

    const interval = setInterval(() => {
      scrollNext()
    }, autoAdvanceInterval)

    return () => clearInterval(interval)
  }, [api, images.length, autoAdvanceInterval, scrollNext])

  // Track current slide
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)
    onSelect()

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // Filter out invalid or empty image URLs
  const validImages = images?.filter(img => img && img.trim() !== '' && img !== 'undefined' && img !== 'null') || []
  
  if (!validImages || validImages.length === 0) {
    console.log("[AutoCarousel] No valid images provided, showing fallback")
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "video" && "aspect-video",
          className,
        )}
      >
        <div className="text-center">
          <span className="text-4xl mb-2 block">📰</span>
          <span className="text-xs text-gray-500">No image available</span>
        </div>
      </div>
    )
  }

  if (validImages.length === 1) {
    console.log("[AutoCarousel] Single image display:", validImages[0])
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "video" && "aspect-video",
          className,
        )}
      >
        <img
          src={validImages[0]}
          alt={title}
          className={cn("w-full h-full object-cover", imageClassName)}
          onError={(e) => {
            console.log("[AutoCarousel] Image failed to load:", validImages[0])
            const target = e.target as HTMLImageElement
            // Create a fallback placeholder
            const canvas = document.createElement('canvas')
            canvas.width = 400
            canvas.height = 300
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.fillStyle = '#f3f4f6'
              ctx.fillRect(0, 0, 400, 300)
              ctx.fillStyle = '#9ca3af'
              ctx.font = '16px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('Image Not Available', 200, 140)
              ctx.fillText('📰', 200, 170)
              target.src = canvas.toDataURL()
            }
          }}
          onLoad={() => {
            console.log("[AutoCarousel] Image loaded successfully:", validImages[0])
          }}
        />
      </div>
    )
  }

  console.log("[AutoCarousel] Multiple images carousel with", validImages.length, "images")
  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem key={index}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg",
                  aspectRatio === "square" && "aspect-square",
                  aspectRatio === "video" && "aspect-video",
                )}
              >
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-300 hover:scale-105",
                    imageClassName,
                  )}
                  onError={(e) => {
                    console.log("[AutoCarousel] Carousel image failed to load:", image)
                    const target = e.target as HTMLImageElement
                    // Create a fallback placeholder
                    const canvas = document.createElement('canvas')
                    canvas.width = 400
                    canvas.height = 300
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                      ctx.fillStyle = '#f3f4f6'
                      ctx.fillRect(0, 0, 400, 300)
                      ctx.fillStyle = '#9ca3af'
                      ctx.font = '16px Arial'
                      ctx.textAlign = 'center'
                      ctx.fillText('Image Not Available', 200, 140)
                      ctx.fillText('📰', 200, 170)
                      target.src = canvas.toDataURL()
                    }
                  }}
                  onLoad={() => {
                    console.log("[AutoCarousel] Carousel image loaded successfully:", image)
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>

        {/* Dots indicator */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                className={cn("w-2 h-2 rounded-full transition-all", current === index ? "bg-white" : "bg-white/50")}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        )}
    </div>
  )
}

export default AutoCarousel
