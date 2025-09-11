import { Suspense } from "react"
import EnhancedLiveBroadcastClient from "@/components/enhanced-live-broadcast-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Broadcast - AKY Media Center",
  description: "Join Governor Abba Kabir Yusuf's live broadcast with interactive features including chat, reactions, and real-time participation.",
  keywords: "live broadcast, Governor Abba Kabir Yusuf, AKY Media Center, Kano State, live streaming, interactive broadcast",
  openGraph: {
    title: "Live Broadcast - AKY Media Center",
    description: "Join Governor Abba Kabir Yusuf's live broadcast with interactive features",
    type: "website",
    images: [
      {
        url: "/og-live-broadcast.jpg",
        width: 1200,
        height: 630,
        alt: "AKY Media Center Live Broadcast"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Broadcast - AKY Media Center",
    description: "Join Governor Abba Kabir Yusuf's live broadcast with interactive features",
    images: ["/og-live-broadcast.jpg"]
  }
}

function LoadingFallback() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading broadcast interface...</p>
        </div>
      </div>
    </section>
  )
}

export default function EnhancedLivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <EnhancedLiveBroadcastClient />
      </Suspense>
    </div>
  )
}