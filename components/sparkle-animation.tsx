"use client"

import { useEffect, useState } from "react"

interface SparkleProps {
  trigger: boolean
  onComplete?: () => void
}

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

export function SparkleAnimation({ trigger, onComplete }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (trigger) {
      const newSparkles: Sparkle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
        duration: Math.random() * 1 + 1.5,
      }))

      setSparkles(newSparkles)

      setTimeout(() => {
        setSparkles([])
        onComplete?.()
      }, 2000)
    }
  }, [trigger, onComplete])

  if (!trigger || sparkles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: sparkle.color,
            borderRadius: "50%",
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
          }}
        />
      ))}

      {/* Confetti effect */}
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={`confetti-${i}`}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: "6px",
            height: "6px",
            backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"][Math.floor(Math.random() * 4)],
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${Math.random() * 0.5 + 1}s`,
          }}
        />
      ))}
    </div>
  )
}
