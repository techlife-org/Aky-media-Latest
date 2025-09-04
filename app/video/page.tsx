import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import VideoGallery from "@/components/video-gallery"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Video, Play, Film, Camera } from "lucide-react"

export const metadata: Metadata = {
  title: "Video Gallery - AKY Media Center",
  description: "Watch the latest videos from Governor Abba Kabir Yusuf's administration and key events in Kano State.",
}

export default function VideoPage() {
  return (
    <>
      <Header />
      <main>
        {/* Enhanced Breadcrumb Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('bg3.png')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-red-800/70 to-red-700/60"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-red-300/20 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                {/* Enhanced breadcrumb */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <Link 
                    href="/" 
                    className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
                  >
                    Home
                  </Link>
                  <ArrowRight size={16} className="text-white/60" />
                  <span className="text-white font-semibold">Video Gallery</span>
                </div>
                
                {/* Enhanced title with icons */}
                <div className="mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-red-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Film className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Video
                    <span className="block bg-gradient-to-r from-red-200 to-white bg-clip-text text-transparent">
                      Gallery
                    </span>
                  </h1>
                  
                  <p className="text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Discover inspiring stories, achievements, and moments from Governor Abba Kabir Yusuf's administration in Kano State.
                  </p>
                </div>
                
                {/* Enhanced stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">50+</div>
                    <div className="text-sm text-white/80">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">10K+</div>
                    <div className="text-sm text-white/80">Views</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">5</div>
                    <div className="text-sm text-white/80">Categories</div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced illustration */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-red-300/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <Image
                      src="/pictures/assets/img/he/5.png"
                      alt="Video gallery illustration"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Play className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Video Gallery Section */}
        <VideoGallery />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}