"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Monitor,
  Smartphone,
  UserCheck,
  FolderKanban,
  Send,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'sidebar' | 'tabs'>('sidebar')
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check screen size and set view mode
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setViewMode('tabs')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Broadcast Control", href: "/dashboard/broadcast", icon: Radio },
    { name: "Communication Center", href: "/dashboard/communication", icon: Send },
    { name: "User Management", href: "/dashboard/youth-management", icon: UserCheck },
    { name: "Project Management", href: "/dashboard/project-management", icon: FolderKanban },
    { name: "Achievements", href: "/dashboard/achievements", icon: BarChart3 },
    { name: "News Management", href: "/dashboard/news", icon: Newspaper },
    { name: "Video Management", href: "/dashboard/video", icon: Video },
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

  // Get current tab value for tabs mode
  const getCurrentTab = () => {
    const currentNav = navigation.find(item => item.href === pathname)
    return currentNav ? currentNav.href : navigation[0].href
  }

  if (viewMode === 'tabs' && !isMobile) {
    // Desktop tabs mode - Fixed header and tabs, scrollable content
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                AKY Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'sidebar' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('sidebar')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Sidebar
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('tabs')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Tabs
                </Button>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Fixed Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <Tabs value={getCurrentTab()} className="w-full">
              <TabsList className="grid w-full grid-cols-12 h-12 bg-gray-50">
                {navigation.map((item) => (
                  <TabsTrigger
                    key={item.name}
                    value={item.href}
                    className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white"
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Scrollable Page content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>
    )
  }

  // Sidebar mode (default) - Fixed sidebar, scrollable content
  return (
    <div className="h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:flex-shrink-0 lg:flex lg:flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-red-600 via-red-700 to-red-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-white">AKY Admin</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-200">
            <X className="w-6 h-6" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        {/* View Mode Toggle (Desktop only) */}
        {!isMobile && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'sidebar' ? 'default' : 'ghost'}
                onClick={() => setViewMode('sidebar')}
                className="flex-1 h-8 text-xs"
              >
                <Monitor className="w-3 h-3 mr-1" />
                Sidebar
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                onClick={() => setViewMode('tabs')}
                className="flex-1 h-8 text-xs"
              >
                <Smartphone className="w-3 h-3 mr-1" />
                Tabs
              </Button>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <nav className="flex flex-col flex-1 mt-2 px-4 overflow-y-auto">
          <div className="space-y-1 flex-grow">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-l-4 border-red-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:shadow-sm"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors ${
                  pathname === item.href
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500"
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.name}</span>
                {pathname === item.href && (
                  <div className="ml-auto w-2 h-2 bg-red-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
          
          {/* Logout Button */}
          <div className="mt-6 pb-6 flex-shrink-0">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 bg-transparent transition-all duration-200"
            >
              <div className="p-2 rounded-lg mr-3 bg-red-50 text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">AKY Admin</h1>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Scrollable Page content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}