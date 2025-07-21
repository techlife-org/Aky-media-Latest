import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Users, Globe, Camera, MessageCircle, Facebook, Twitter, InstagramIcon, X } from "lucide-react"

const socialMediaPlatforms = [
  {
    name: "Facebook",
    handle: "@Abba Kabir Yusuf",
    url: "https://www.facebook.com/share/18p6gDcA1B/?mibextid=LQQJ4d",
    image: "/pictures/facebook.png",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    followers: "381K",
    description: "Official Facebook page for government updates and community engagement",
  },
  {
    name: "X (Twitter)",
    handle: "@Kyusufabba",
    url: "https://x.com/kyusufabba?s=21&t=QVAaej86af3fs31NIYvGSA",
    image: "/pictures/x.png",
    icon: X,
    color: "from-slate-800 to-black",
    followers: "139.1K",
    description: "Real-time updates and direct communication with citizens",
  },
  {
    name: "Instagram",
    handle: "@abba_kabir_yusuf",
    url: "https://www.instagram.com/abba_kabir_yusuf?igsh=MzR0NWNodG56amZw",
    image: "/pictures/instagram.jpg",
    icon: InstagramIcon,
    color: "from-pink-500 to-purple-600",
    followers: "268K",
    description: "Visual stories of development projects and state activities",
  },
  {
    name: "Official Website",
    handle: "abbakabiryusuf.com",
    url: "#",
    image: "/pictures/website.png",
    icon: Globe,
    color: "from-red-600 to-red-800",
    followers: "Official",
    description: "Complete information hub for government policies and initiatives",
  },
]

export default function SocialMediaSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-800 rounded-full mb-6 shadow-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 font-bold text-xl mb-4 tracking-wide uppercase">Connect With Us</p>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Official Social Media
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
              Channels
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay connected with His Excellency Alh. Abba Kabir Yusuf through our official social media platforms.
          </p>
        </div>

        {/* Enhanced Social Media Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {socialMediaPlatforms.map((platform, index) => {
            const IconComponent = platform.icon
            return (
              <Card
                key={platform.name}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-2"
              >
                <div className={`relative h-48 bg-gradient-to-br ${platform.color} overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-lg">{platform.name}</span>
                        <span className="text-white/80 text-sm">{platform.followers}</span>
                      </div>
                    </div>
                  </div>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{platform.name}</h3>
                    <p className="text-lg text-gray-600 font-medium mb-3">{platform.handle}</p>
                    {/* <p className="text-sm text-gray-500 leading-relaxed">{platform.description}</p> */}
                  </div>

                  <Link href={platform.url} target="_blank" rel="noopener noreferrer" className="group/link w-full">
                    <div
                      className={`w-full bg-gradient-to-r ${platform.color} text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 group-hover/link:shadow-lg group-hover/link:scale-105 flex items-center justify-center space-x-3`}
                    >
                      <span>Visit Platform</span>
                      <ExternalLink size={20} className="group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Call to Action
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <h3 className="text-4xl font-bold mb-6">Stay Updated</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Follow our official channels to receive real-time updates on government policies, development projects,
              and important announcements that affect our community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="font-semibold">📱 Mobile Friendly</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="font-semibold">🔔 Real-time Updates</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="font-semibold">✅ Verified Official</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}
