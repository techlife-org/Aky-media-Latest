import { Card, CardContent } from "@/components/ui/card"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "Dr. Abdullahi Umar Ganduje",
    position: "Deputy Governor",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 2,
    name: "Alhaji Yusuf Gwarzo",
    position: "Secretary to State Government",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 3,
    name: "Barr. Haruna Dederi",
    position: "Attorney General",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 4,
    name: "Dr. Mariya Mahmoud",
    position: "Commissioner for Health",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 5,
    name: "Prof. Haruna Kiyawa",
    position: "Commissioner for Education",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 6,
    name: "Eng. Mu'azu Magaji",
    position: "Commissioner for Works",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 7,
    name: "Dr. Yusuf Kofar Mata",
    position: "Commissioner for Agriculture",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 8,
    name: "Alhaji Baffa Babba Dan Agundi",
    position: "Commissioner for Local Government",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 9,
    name: "Dr. Amina Abdullahi",
    position: "Commissioner for Women Affairs",
    image: "/placeholder.svg?height=300&width=300",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
]

export default function TeamGrid() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-0"
            >
              <div className="relative overflow-hidden">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Social Media Overlay */}
                <div className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-4">
                    <a
                      href={member.social.facebook}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.instagram}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 text-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-red-600 font-medium">{member.position}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
