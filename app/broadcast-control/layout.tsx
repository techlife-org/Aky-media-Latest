import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Broadcast Control - AKY Media Center",
  description: "Professional live broadcast control panel for Governor Abba Kabir Yusuf's media center with real-time streaming, participant management, and comprehensive broadcast controls.",
  robots: "noindex, nofollow" // Private admin area
}

export default function BroadcastControlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}