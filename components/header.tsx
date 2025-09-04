"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Award, Search, UserPlus, Users, ChevronDown, Video, Play } from "lucide-react"
import { SearchModal } from "./search-modal"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const openSearchModal = () => {
    setIsSearchModalOpen(true)
  }

  const closeSearchModal = () => {
    setIsSearchModalOpen(false)
    setSearchQuery("")
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <Image
                  src="/pictures/logo.png"
                  alt="AKY Media Logo"
                  width={60}
                  height={60}
                  className="h-14 w-auto relative z-10 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                href="/" 
                className="relative px-4 py-2 text-gray-700 hover:text-red-600 transition-all duration-300 font-medium rounded-lg hover:bg-red-50 group"
              >
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                href="/achievements" 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium rounded-lg hover:bg-blue-50 group"
              >
                <span className="relative z-10">Achievements</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                href="/news" 
                className="relative px-4 py-2 text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium rounded-lg hover:bg-purple-50 group"
              >
                <span className="relative z-10">News</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              {/* Enhanced Video Link */}
              <Link 
                href="/video" 
                className="relative px-4 py-2 text-gray-700 hover:text-red-600 transition-all duration-300 font-medium rounded-lg hover:bg-red-50 group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                href="/about" 
                className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 font-medium rounded-lg hover:bg-indigo-50 group"
              >
                <span className="relative z-10">About</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link 
                href="/audio" 
                className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 font-medium rounded-lg hover:bg-indigo-50 group"
              >
                <span className="relative z-10">Music</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                href="/contact" 
                className="relative px-4 py-2 text-gray-700 hover:text-green-600 transition-all duration-300 font-medium rounded-lg hover:bg-green-50 group"
              >
                <span className="relative z-10">Contact</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </nav>

            {/* Enhanced Right Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Enhanced Search */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-blue-200/50 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <Input
                    type="text"
                    placeholder="Search news & achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={openSearchModal}
                    className="w-72 pr-12 border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20 text-sm placeholder:text-gray-400"
                  />
                  <Search
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-300"
                    size={18}
                    onClick={openSearchModal}
                  />
                </div>
              </div>

              {/* Enhanced Youth Program Buttons with Red Theme */}
              <div className="flex items-center gap-3">
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 px-6">
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Register</span>
                  </Button>
                </Link>

                <Link href="/youth-login">
                  <Button 
                    variant="outline" 
                    className="border-2 border-red-600/30 bg-red-50/50 text-red-700 hover:bg-red-100 hover:border-red-600/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 px-6 backdrop-blur-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Login</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 border border-gray-200/50 shadow-sm hover:shadow-md"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-6 border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-blue-200/50 rounded-xl blur-sm"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                    <Input
                      type="text"
                      placeholder="Search news & achievements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={openSearchModal}
                      className="w-full pr-12 border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Search
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                      size={18}
                      onClick={openSearchModal}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-2 mb-6">
                <Link
                  href="/"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  href="/achievements"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Achievements</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  href="/news"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">News</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                {/* Enhanced Mobile Video Link */}
                <Link
                  href="/video"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Videos
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  href="/about"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">About</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  href="/audio"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Music</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  href="/contact"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-medium rounded-xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Contact</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </nav>
              
              {/* Enhanced Mobile Youth Program Buttons with Red Theme */}
              <div className="space-y-3 pt-4 border-t border-gray-200/50">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 py-3">
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Register for Youth Program</span>
                  </Button>
                </Link>
                
                <Link href="/youth-login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-red-600/30 bg-red-50/50 text-red-700 hover:bg-red-100 hover:border-red-600/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 py-3 backdrop-blur-sm"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Youth Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </>
  )
}