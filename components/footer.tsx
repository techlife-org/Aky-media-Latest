import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Linkedin, Youtube, Phone, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 pb-12">
          <div className="space-y-6">
            <Link href="/">
              <Image
                src="/pictures/logo.png"
                alt="AKY Media Logo"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-300 leading-relaxed">
              AKY Media Center - Your trusted source for the latest updates on Governor Abba Kabir Yusuf's initiatives,
              policies, and developments shaping Kano State.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Linkedin size={20} />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div></div>

          <div className="space-y-6">
            <div className="bg-white rounded-full p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Call Or Message</p>
                <a href="tel:+2347074222252" className="text-gray-900 font-bold text-lg">
                  +2347074222252
                </a>
              </div>
            </div>

            <div className="bg-white rounded-full p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Email Address:</p>
                <a href="mailto:info@abbakabiryusuf.com" className="text-gray-900 font-bold text-base">
                  info@abbakabiryusuf.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 pb-6">
          <p className="text-center text-gray-400">
            &copy; Copyright 2025 AKY Media Center Designed by{" "}
            <Link
              href="https://techlife.ng"
              target="_blank"
              className="font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Techlife Global Ventures LTD.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
