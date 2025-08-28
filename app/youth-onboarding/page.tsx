import YouthOnboarding from "@/components/youth-onboarding"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Youth Onboarding | His Excellency's Youth Program",
  description: "Complete your onboarding to personalize your youth program experience.",
  keywords: "youth onboarding, personalization, goals, skills, interests",
}

export default function YouthOnboardingPage() {
  return <YouthOnboarding />
}