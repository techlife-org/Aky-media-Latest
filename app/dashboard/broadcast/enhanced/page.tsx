import { Suspense } from "react"
import EnhancedBroadcastDashboard from "@/components/enhanced-broadcast-dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Enhanced Broadcast Dashboard - AKY Media Center",
  description: "Advanced broadcast management dashboard with real-time streaming, participant management, and comprehensive analytics.",
  robots: "noindex, nofollow" // Private admin area
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-gray-600">Loading broadcast dashboard...</p>
      </div>
    </div>
  )
}

export default function EnhancedBroadcastDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EnhancedBroadcastDashboard />
    </Suspense>
  )
}