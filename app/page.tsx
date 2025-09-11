"use client"

import { useEffect } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import dynamic from "next/dynamic"
import PageLoader from "@/components/page-loader"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import NewsSection from "@/components/news-section"
import VideoSection from "@/components/video-section"
import AchievementsSection from "@/components/achievements-section"
import SocialMediaSection from "@/components/social-media-section"
import ContactSection from "@/components/contact-section"
import NewsletterSection from "@/components/newsletter-section"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"

// Dynamically import CookieConsent with no SSR to avoid hydration issues
const CookieConsent = dynamic(
  () => import("@/components/cookie-consent"),
  { ssr: false }
)

export default function HomePage() {
  const { isLoading, stopLoading } = usePageLoading()

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      stopLoading()
    }, 1000)

    return () => clearTimeout(timer)
  }, [stopLoading])

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          <NewsSection />
          <VideoSection />
          <AchievementsSection />
          <SocialMediaSection />
          <ContactSection />
          <NewsletterSection />
        </main>
        <Footer />
        <CookieConsent />
        <ScrollToTop />
      </div>
    </PageLoader>
  )
}