import type { Metadata } from "next"
import { Suspense } from "react"
import SocialMediaLiveBroadcast from "@/components/social-media-live-broadcast"

export const metadata: Metadata = {
  title: "Live Broadcast - AKY Media Center",
  description:
    "Watch live broadcasts from Governor Abba Kabir Yusuf and stay connected with real-time updates from Kano State.",
}

function LiveBroadcastFallback() {
  return (
    <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-700 font-medium">Loading broadcast...</p>
        </div>
      </div>
    </section>
  )
}

export default function LivePage() {
  return (
    <Suspense fallback={<LiveBroadcastFallback />}>
      <SocialMediaLiveBroadcast />
    </Suspense>
  )
}