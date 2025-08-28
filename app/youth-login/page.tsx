import YouthLogin from "@/components/youth-login"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Youth Login | His Excellency's Youth Program",
  description: "Login to access your youth dashboard and program benefits.",
  keywords: "youth login, dashboard access, Kano youth program",
}

export default function YouthLoginPage() {
  return <YouthLogin />
}