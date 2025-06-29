"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch("/api/track-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer,
          }),
        })
      } catch (error) {
        console.error("Visitor tracking failed:", error)
      }
    }

    trackVisit()
  }, [pathname])

  return null // This component doesn't render anything
}
