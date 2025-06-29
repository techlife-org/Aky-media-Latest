"use client"

import { useEffect } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, GraduationCap, Briefcase, Award } from "lucide-react"

const timelineEvents = [
  {
    year: "1963",
    title: "Birth",
    description: "His excellency Abba Kabir Yusuf was born on January 5, in Gaya Local Government Area of Kano State.",
    image: "pictures/assets/img/about/1.png",
  },
  {
    year: "1975",
    title: "Primary & Secondary Education",
    description:
      "His excellency Abba Kabir Yusuf attended Sumaila Primary School 1968-1975, Government Secondary School Dawakin Tofa, and Government Secondary School Lautai in Gumel, completing his secondary education in 1980.",
    image: "pictures/assets/img/about/2.png",
  },
  {
    year: "1985",
    title: "National Diploma",
    description:
      "His excellency Abba Kabir Yusuf earned a National Diploma in Civil Engineering from the Federal Polytechnic, Mubi.",
    image: "pictures/assets/img/about/3.png",
  },
  {
    year: "1989",
    title: "Higher Education",
    description:
      "His excellency Abba Kabir Yusuf obtain his Higher National Diploma in Civil Engineering with a specialization in Water Resources/Environmental Engineering from Kaduna Polytechnic and also obtained a postgraduate diploma and a master's degree in business administration from Bayero University, Kano.",
    image: "pictures/assets/img/about/4.png",
  },
  {
    year: "1990",
    title: "National Youth Service",
    description:
      "His excellency Abba Kabir Yusuf completed his National Youth Service Corps at the Kaduna Environmental Protection Agency (KEPA).",
    image: "pictures/assets/img/about/5.png",
  },
  {
    year: "2009-2011",
    title: "Chairman Governing Board",
    description:
      "His excellency Abba Kabir Yusuf served as the chairman of the Governing Board of the National Institute for Educational Planning and Administration (NIEPA), Ondo State",
    image: "pictures/assets/img/about/6.png",
  },
  {
    year: "2011-2015",
    title: "Commissioner of Works",
    description:
      "His excellency Abba Kabir Yusuf became the Commissioner of Works, Housing and Transport in 2011 when Kwankwaso was re-elected as governor of Kano State",
    image: "pictures/assets/img/about/7.png",
  },
  {
    year: "2019",
    title: "PDP Gubernatorial Candidate",
    description: "His excellency Abba Kabir Yusuf ran for governor under the Peoples Democratic Party.",
    image: "pictures/assets/img/he/3.jpg",
  },
  {
    year: "2023-Present",
    title: "Elected as Kano State Governor",
    description:
      "His excellency Abba Kabir Yusuf ran again under the New Nigeria Peoples Party and was declared the winner",
    image: "pictures/assets/img/he/4.jpg",
  },
]

export default function AboutPage() {
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
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6">About Governor</h1>
                <h2 className="text-3xl font-semibold mb-4 text-yellow-300">Alh. Abba Kabir Yusuf</h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  A visionary leader dedicated to transforming Kano State through innovative governance, sustainable
                  development, and inclusive policies that benefit all citizens.
                </p>
                <div className="flex items-center mt-6 space-x-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Governor since 2023</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>Kano State, Nigeria</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <img
                    src="/pictures/assets/img/he/3.png"
                    alt="Governor Abba Kabir Yusuf"
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biography Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Brief Biography</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A journey of dedication, service, and leadership spanning decades of public service and professional
                excellence.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row gap-8 mb-12 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="lg:w-1/2">
                    <Card className="h-full shadow-lg border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className="relative">
                        <img
                          src={event.image || "/pictures/assets/img/he/3.png"}
                          alt={event.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-600 text-white text-lg px-4 py-2">{event.year}</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="lg:w-1/2 flex items-center">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-3 rounded-full">
                          {event.year.includes("Education") ? (
                            <GraduationCap className="w-6 h-6 text-red-600" />
                          ) : event.year.includes("Commissioner") || event.year.includes("Chairman") ? (
                            <Briefcase className="w-6 h-6 text-red-600" />
                          ) : event.year.includes("Governor") || event.year.includes("Candidate") ? (
                            <Award className="w-6 h-6 text-red-600" />
                          ) : (
                            <Calendar className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">Don't miss our latest updates and achievements</p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageLoader>
  )
}
