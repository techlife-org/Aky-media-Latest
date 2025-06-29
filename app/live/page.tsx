import type { Metadata } from "next"
import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LiveBroadcastClient from "@/components/live-broadcast-client"
import ScrollToTop from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Live Broadcast - AKY Media Center",
  description:
    "Watch live broadcasts from Governor Abba Kabir Yusuf and stay connected with real-time updates from Kano State.",
}

function LiveBroadcastFallback() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading broadcast...</p>
        </div>
      </div>
    </section>
  )
}

export default function LivePage() {
  return (
    <>
      <Header />
      <main>
        {/* Breadcrumb Section */}
        <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">Live Broadcast</h1>
                <p className="text-xl text-white/90 mb-6">
                  Stay connected with Governor Abba Kabir Yusuf through live broadcasts and real-time updates
                </p>
                <div className="flex items-center gap-2 text-white/90">
                  <span>Home</span>
                  <span>→</span>
                  <span className="text-white font-medium">Live Broadcast</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                    src="/pictures/assets/img/he/6.png"
                    alt="Live broadcast illustration"
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Broadcast Section */}
        <Suspense fallback={<LiveBroadcastFallback />}>
          <LiveBroadcastClient />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
