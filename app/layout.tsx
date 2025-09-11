import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Abba Kabir Yusuf Media Center",
  description: "Official website of Governor Abba Kabir Yusuf of Kano State, featuring news, media updates, and official communications.",
  generator: "AKY Digital Hub",
  keywords: "Abba Kabir Yusuf, Governor Kano, Kano State Governor, Governor AKY, Abba Yusuf Kano, Kano State Government, Nigerian Politics, Kano State News, Media Center, Official Website, Governor's Office, Kano State Updates, Abba Kabir Yusuf News, AKY Media, Kano State Government News",
  authors: [{ name: "AKY Digital Hub" }],
  creator: "AKY Digital Hub",
  publisher: "AKY Media",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://abbakabiryusuf.com/",
    title: "Abba Kabir Yusuf Media Center",
    description: "Official website of Governor Abba Kabir Yusuf of Kano State, featuring news, media updates, and official communications.",
    siteName: "AKY Digital Hub",
    images: [
      {
        url: "https://res.cloudinary.com/sirdurx/image/upload/v1751198131/ws9mxanccjnahx9oz6zx.png",
        width: 1200,
        height: 630,
        alt: "Governor Abba Kabir Yusuf of Kano State",
        type: "image/png"
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abba Kabir Yusuf Media Center",
    description: "Official website of Governor Abba Kabir Yusuf of Kano State, featuring news, media updates, and official communications.",
    images: ["https://res.cloudinary.com/sirdurx/image/upload/v1751198131/ws9mxanccjnahx9oz6zx.png"],
  },
  icons: {
    icon: "/pictures/logo.png",
    apple: "/pictures/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
