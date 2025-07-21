"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface PageLoaderProps {
  isLoading?: boolean
  children: React.ReactNode
}

export default function PageLoader({ isLoading = false, children }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading)

  useEffect(() => {
    // Directly reflect the isLoading prop without artificial delays
    setShowLoader(isLoading)
  }, [isLoading])

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8 flex justify-center items-center flex-col">
              <Image
                src="/pictures/logo.png"
                alt="AKY Media Center Logo"
                width={100}
                height={100}
                className="mb-4 animate-pulse" // Added a subtle pulse animation
              />
              {/* Simple CSS spinner */}
              {/* <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div> */}
            </div>
            {/* <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">AKY Media Center</h2>
              <p className="text-gray-600">Loading content...</p>
            </div> */}
          </div>
        </div>
      )}
      <div className={showLoader ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>{children}</div>
    </>
  )
}
