import type { Metadata } from "next"
import { Suspense } from "react"
import SocialMediaLiveBroadcastWithId from "@/components/social-media-live-broadcast-with-id"

interface LivePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  return {
    title: `Live Broadcast ${params.id} - AKY Media Center`,
    description: `Watch live broadcast ${params.id} from Governor Abba Kabir Yusuf and stay connected with real-time updates from Kano State.`,
  }
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

export default function LivePageWithId({ params }: LivePageProps) {
  return (
    <Suspense fallback={<LiveBroadcastFallback />}>
      <SocialMediaLiveBroadcastWithId broadcastId={params.id} />
    </Suspense>
  )
}