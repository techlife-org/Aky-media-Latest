"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Radio,
  Settings,
  Newspaper,
  Video,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Broadcast Control", href: "/dashboard/broadcast", icon: Radio },
    { name: "News Management", href: "/dashboard/news", icon: Newspaper },
    { name: "Video Management", href: "/dashboard/video", icon: Video }, // Corrected path to match API
    { name: "Website Traffic", href: "/dashboard/traffic", icon: BarChart3 },
    { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
    { name: "Contact Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:flex-shrink-0 lg:h-screen lg:flex lg:flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
          <h2 className="text-xl font-bold text-white">AKY Admin</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-200">
            <X className="w-6 h-6" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>
        <nav className="flex flex-col flex-1 mt-6 px-3">
          <div className="space-y-2 flex-grow">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-red-50 text-red-700 border-r-4 border-red-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 pb-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">AKY Admin</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>
        {/* Page content */}
        <div className="flex-1 bg-gray-50 p-6">{children}</div>
      </div>
    </div>
  )
}
