"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface PageLoaderProps {
  isLoading?: boolean
  children: React.ReactNode
}

export default function PageLoader({ isLoading = false, children }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true)
    } else {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            {/* Your custom loader */}
            <div className="loader mb-8"></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">AKY Media Center</h2>
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        </div>
      )}
      <div className={showLoader ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>{children}</div>
    </>
  )
}
