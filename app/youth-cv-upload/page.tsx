import YouthCVUpload from "@/components/youth-cv-upload"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upload CV | His Excellency's Youth Program",
  description: "Upload your CV to complete your profile and access the youth dashboard.",
  keywords: "CV upload, resume, profile completion, youth dashboard",
}

export default function YouthCVUploadPage() {
  return <YouthCVUpload />
}