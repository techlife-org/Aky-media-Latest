import MobileYouthDashboard from "@/components/mobile-youth-dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Youth Dashboard | His Excellency's Youth Program",
  description: "Access your personalized youth dashboard with programs, music, videos, and more.",
  keywords: "youth dashboard, programs, music, videos, profile management",
}

export default function YouthDashboardPage() {
  return <MobileYouthDashboard />
}

