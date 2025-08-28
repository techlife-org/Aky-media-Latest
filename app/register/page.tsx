import MultiStepRegistration from "@/components/multi-step-registration"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Youth Program Registration | His Excellency's Youth Program",
  description: "Register for His Excellency's Youth Program in Kano State. Join thousands of young people in empowering initiatives and opportunities.",
  keywords: "youth registration, Kano youth program, His Excellency, youth empowerment, Nigeria youth",
}

export default function RegisterPage() {
  return <MultiStepRegistration />
}