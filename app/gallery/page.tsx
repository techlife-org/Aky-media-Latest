import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ZoomIn } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterSection from "@/components/newsletter-section"
import ScrollToTop from "@/components/scroll-to-top"

const galleryImages = [
  { id: 1, src: "/placeholder.svg?height=400&width=600", alt: "Governor at State Event", size: "large" },
  { id: 2, src: "/placeholder.svg?height=300&width=300", alt: "Community Meeting", size: "small" },
  { id: 3, src: "/placeholder.svg?height=300&width=300", alt: "Infrastructure Project", size: "small" },
  { id: 4, src: "/placeholder.svg?height=300&width=300", alt: "Education Initiative", size: "small" },
  { id: 5, src: "/placeholder.svg?height=300&width=300", alt: "Healthcare Program", size: "small" },
  { id: 6, src: "/placeholder.svg?height=400&width=600", alt: "State Development", size: "large" },
  { id: 7, src: "/placeholder.svg?height=300&width=400", alt: "Public Address", size: "medium" },
  { id: 8, src: "/placeholder.svg?height=300&width=400", alt: "Community Outreach", size: "medium" },
  { id: 9, src: "/placeholder.svg?height=300&width=400", alt: "Government Meeting", size: "medium" },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb Section */}
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=400&width=1200)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">Our Gallery</h1>
              <div className="flex items-center space-x-2 text-lg">
                <Link href="/" className="hover:text-red-400 transition-colors">
                  Home
                </Link>
                <ArrowRight size={16} />
                <span className="text-red-400">Gallery</span>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Gallery"
                width={500}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className={`relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                  image.size === "large"
                    ? "md:col-span-2 md:row-span-2"
                    : image.size === "medium"
                      ? "md:col-span-1 md:row-span-1"
                      : "col-span-1"
                }`}
              >
                <div className={`relative ${image.size === "large" ? "h-96" : "h-48"}`}>
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                        <ZoomIn size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Load More Images
            </button>
          </div>
        </div>
      </main>

      <NewsletterSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
