"use client"

import { useEffect } from "react"
import { usePageLoading } from "@/hooks/use-page-loading" // Assuming this hook manages actual loading state
import PageLoader from "@/components/page-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, GraduationCap, Briefcase, Award, Star } from "lucide-react"
import Image from "next/image"
import NewsletterSection from "@/components/newsletter-section"

const timelineEvents = [
  {
    year: "1963",
    title: "Birth",
    description: "His excellency Abba Kabir Yusuf was born on January 5, in Gaya Local Government Area of Kano State.",
    image: "/pictures/assets/img/about/1.png",
  },
  {
    year: "1975",
    title: "Primary & Secondary Education",
    description:
      "His excellency Abba Kabir Yusuf attended Sumaila Primary School 1968-1975, Government Secondary School Dawakin Tofa, and Government Secondary School Lautai in Gumel, completing his secondary education in 1980.",
    image: "/pictures/assets/img/about/2.png",
  },
  {
    year: "1985",
    title: "National Diploma",
    description:
      "His excellency Abba Kabir Yusuf earned a National Diploma in Civil Engineering from the Federal Polytechnic, Mubi.",
    image: "/pictures/assets/img/about/3.png",
  },
  {
    year: "1989",
    title: "Higher Education",
    description:
      "His excellency Abba Kabir Yusuf obtain his Higher National Diploma in Civil Engineering with a specialization in Water Resources/Environmental Engineering from Kaduna Polytechnic and also obtained a postgraduate diploma and a master's degree in business administration from Bayero University, Kano.",
    image: "/pictures/assets/img/about/4.png",
  },
  {
    year: "1990",
    title: "National Youth Service",
    description:
      "His excellency Abba Kabir Yusuf completed his National Youth Service Corps at the Kaduna Environmental Protection Agency (KEPA).",
    image: "/pictures/assets/img/about/5.png",
  },
  {
    year: "2009-2011",
    title: "Chairman Governing Board",
    description:
      "His excellency Abba Kabir Yusuf served as the chairman of the Governing Board of the National Institute for Educational Planning and Administration (NIEPA), Ondo State",
    image: "/pictures/assets/img/about/6.png",
  },
  {
    year: "2011-2015",
    title: "Commissioner of Works",
    description:
      "His excellency Abba Kabir Yusuf became the Commissioner of Works, Housing and Transport in 2011 when Kwankwaso was re-elected as governor of Kano State",
    image: "/pictures/assets/img/about/7.png",
  },
  {
    year: "2019",
    title: "PDP Gubernatorial Candidate",
    description: "His excellency Abba Kabir Yusuf ran for governor under the Peoples Democratic Party.",
    image: "/pictures/assets/img/he/3.jpg",
  },
  {
    year: "2023-Present",
    title: "Elected as Kano State Governor",
    description:
      "His excellency Abba Kabir Yusuf ran again under the New Nigeria Peoples Party and was declared the winner",
    image: "/pictures/assets/img/he/4.jpg",
  },
]

export default function AboutPage() {
  const { isLoading, stopLoading } = usePageLoading()

  // Removed the setTimeout here to rely on the actual loading state from usePageLoading
  useEffect(() => {
    // Assuming usePageLoading will eventually call stopLoading when content is ready
    // For demonstration, you might still need a mock stopLoading if usePageLoading isn't fully implemented
    // If usePageLoading truly reflects content readiness, this useEffect might not be needed here.
    // For now, I'll keep it to ensure stopLoading is called, but without the artificial delay.
    if (!isLoading) {
      stopLoading() // Ensure stopLoading is called once content is considered loaded
    }
  }, [isLoading, stopLoading])

  return (
    <PageLoader isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <Header />
        {/* Hero Section */}
        <section
          className="relative py-20"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.9,
          }}
        >
          <div className="absolute "></div> {/* Added a white overlay for text readability */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6 text-gray-900">About Governor</h1>
                <h2 className="text-3xl font-semibold mb-4 text-red-700">Alh. Abba Kabir Yusuf</h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  A visionary leader dedicated to transforming Kano State through innovative governance, sustainable
                  development, and inclusive policies that benefit all citizens.
                </p>
                <div className="flex items-center mt-6 space-x-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-red-600" />
                    <span className="text-gray-800">Governor since 2023</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    <span className="text-gray-800">Kano State, Nigeria</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                {/* Removed the Card component */}
                <Image
                  src="/pictures/assets/img/he/3.png"
                  width={500} // Provide appropriate width
                  height={400} // Provide appropriate height
                  alt="Governor Abba Kabir Yusuf"
                  className="w-full h-full object-cover" // Added shadow for better visual separation
                />
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/20"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-red-100/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-900 bg-clip-text text-transparent mb-6">
                Journey of Excellence
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                A remarkable journey of dedication, service, and leadership spanning decades of public service and
                professional excellence that shaped a visionary leader.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-200 via-red-400 to-red-600 rounded-full"></div>

              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row gap-8 mb-16 ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="hidden lg:block absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Image Card */}
                  <div className="lg:w-1/2 lg:px-8">
                    <Card className="h-full shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
                      <div className="relative overflow-hidden">
                        <Image
                          src={event.image || "/pictures/assets/img/he/3.png"}
                          width={600}
                          height={400}
                          alt={event.title}
                          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white text-lg px-6 py-3 shadow-lg font-semibold">
                            {event.year}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 lg:px-8 flex items-center">
                    <div className="space-y-6 p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                          {event.title.toLowerCase().includes("education") ||
                          event.title.toLowerCase().includes("diploma") ? (
                            <GraduationCap className="w-7 h-7 text-white" />
                          ) : event.title.toLowerCase().includes("commissioner") ||
                            event.title.toLowerCase().includes("chairman") ? (
                            <Briefcase className="w-7 h-7 text-white" />
                          ) : event.title.toLowerCase().includes("governor") ||
                            event.title.toLowerCase().includes("candidate") ? (
                            <Award className="w-7 h-7 text-white" />
                          ) : (
                            <Calendar className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {event.title}
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-lg font-medium">{event.description}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-4 h-1 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800">
          <NewsletterSection />
        </div>
        <Footer />
      </div>
    </PageLoader>
  )
}
