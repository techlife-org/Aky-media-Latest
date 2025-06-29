import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ContactForm from "@/components/contact-form"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Contact Us - AKY Media Center",
  description:
    "Get in touch with Governor Abba Kabir Yusuf's office. Send us your messages, suggestions, and feedback.",
}

export default function ContactPage() {
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
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">Contact Us</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <span>Home</span>
                  <span>→</span>
                  <span className="text-white font-medium">Contact Us</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                    src="/pictures/assets/img/he/5.png"
                    alt="Contact illustration"
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Maps Section */}
        <section className="py-0">
          <div className="w-full h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124888.4715258766!2d8.454720208887275!3d11.990774408514717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11ae80eff0fff3f1%3A0x85ff8700a3da54eb!2sKano!5e0!3m2!1sen!2sng!4v1738945730641!5m2!1sen!2sng"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* Contact Form Section */}
        <ContactForm />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
