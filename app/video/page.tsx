import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import VideoGallery from "@/components/video-gallery"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
        <section
          className="relative py-20"
          style={{
            backgroundImage: "url('bg3.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.9,
          }}
        >
          <div className="absolute "></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold  text-red-800 mb-6">Video Gallery</h1>
                <div className="flex items-center gap-2">
                  <Link href="/" className="hover: transition-colors">
                    Home
                  </Link>
                  <ArrowRight size={16} />
                  <span className=" text-red-800 font-medium">Gallery</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <Image
                    src="/pictures/assets/img/he/5.png"
                    alt="Video gallery illustration"
                    width={600}
                    height={400}
                    className="w-full h-auto"
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
