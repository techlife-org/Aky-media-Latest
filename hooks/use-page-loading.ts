"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Start loading when pathname changes
    setIsLoading(true)

    // Simulate page load completion
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Reduced to 800ms for better UX

    return () => clearTimeout(timer)
  }, [pathname])

  // Function to manually control loading state
  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, setIsLoading, startLoading, stopLoading }
}
