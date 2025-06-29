"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Achievement", href: "/achievement" },
    { name: "News and Updates", href: "/news" },
    { name: "Audio", href: "/audio" },
    { name: "Video", href: "/video" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="w-1/6">
              <Link href="/">
                <Image
                  src="/pictures/logo.png"
                  alt="AKY Media Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </Link>
            </div>

            {/* Navigation Menu */}
            <div className="w-2/3">
              <nav className="flex justify-center">
                <ul className="flex items-center space-x-8">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Live Broadcast Button */}
            <div className="w-1/6 flex justify-end">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full">
                <Link href="/live">
                  <span className="font-medium">Live broadcast</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Logo */}
            <Link href="/">
              <Image
                src="/pictures/logo.png"
                alt="AKY Media Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-red-600">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 py-4">
              <nav>
                <ul className="space-y-4">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Mobile Live Broadcast Button */}
              <div className="mt-6">
                <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/live" onClick={() => setIsMobileMenuOpen(false)}>
                    Live broadcast
                  </Link>
                </Button>
              </div>

              {/* Mobile Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">📞</span>
                    <a href="tel:+2347074222252" className="text-gray-600 hover:text-red-600">
                      +2347074222252
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">✉️</span>
                    <a href="mailto:info@abbakabiryusuf.com" className="text-gray-600 hover:text-red-600">
                      info@abbakabiryusuf.com
                    </a>
                  </div>
                </div>

                {/* Mobile Social Links */}
                <div className="mt-4">
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-red-600">
                      <span className="sr-only">Facebook</span>📘
                    </a>
                    <a href="#" className="text-gray-400 hover:text-red-600">
                      <span className="sr-only">Twitter</span>🐦
                    </a>
                    <a href="#" className="text-gray-400 hover:text-red-600">
                      <span className="sr-only">Instagram</span>📷
                    </a>
                    <a href="#" className="text-gray-400 hover:text-red-600">
                      <span className="sr-only">YouTube</span>📺
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default Header
