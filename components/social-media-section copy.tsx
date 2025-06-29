import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

const socialMediaPlatforms = [
  {
    name: "Facebook",
    handle: "@Abba Kabir Yusuf",
    url: "https://www.facebook.com/share/18p6gDcA1B/?mibextid=LQQJ4d",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "X (Twitter)",
    handle: "@Kyusufabba",
    url: "https://x.com/kyusufabba?s=21&t=QVAaej86af3fs31NIYvGSA",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Instagram",
    handle: "@abba_kabir_yusuf",
    url: "https://www.instagram.com/abba_kabir_yusuf?igsh=MzR0NWNodG56amZw",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Website",
    handle: "abbakabiryusuf.com",
    url: "#",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function SocialMediaSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-red-600 font-medium text-lg mb-4">Social Media</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Official Social Media</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            His Excellency Alh. Abba Kabir Yusuf's official social media handles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {socialMediaPlatforms.map((platform) => (
            <Card key={platform.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src={platform.image || "/placeholder.svg"} alt={platform.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{platform.name}</h3>
                <p className="text-gray-600 mb-4">{platform.handle}</p>
                <Link
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  Click to Visit <ExternalLink size={16} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
