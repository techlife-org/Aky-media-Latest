import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import VideoGallery from "@/components/video-gallery"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Video Gallery - AKY Media Center",
  description: "Watch the latest videos from Governor Abba Kabir Yusuf's administration and key events in Kano State.",
}

export default function VideoPage() {
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
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">Gallery</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <span>Home</span>
                  <span>→</span>
                  <span className="text-white font-medium">Gallery</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                   src="/pictures/assets/img/he/5.png"
                    alt="Video gallery illustration"
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Gallery Section */}
        <VideoGallery />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
