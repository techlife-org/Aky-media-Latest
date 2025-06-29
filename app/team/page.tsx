import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TeamGrid from "@/components/team-grid"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Our Team - AKY Media Center",
  description: "Meet the dedicated team working with Governor Abba Kabir Yusuf to serve the people of Kano State.",
}

export default function TeamPage() {
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
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">Our Team</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <span>Home</span>
                  <span>→</span>
                  <span className="text-white font-medium">Our Team</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=400&width=500"
                    alt="Team illustration"
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Grid Section */}
        <TeamGrid />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
