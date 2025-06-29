"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Mail, Bell, Shield, Globe, Save, Eye, EyeOff, Key, Database, Wifi } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "@/hooks/use-toast"

interface SiteSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  adminName: string
  enableNotifications: boolean
  enableNewsletter: boolean
  enableComments: boolean
  maintenanceMode: boolean
  maxFileSize: number
  allowedFileTypes: string[]
}

interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
  sessionTimeout: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "AKY Media Center",
    siteDescription: "Official media center for Governor Abba Kabir Yusuf",
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@abbakabiryusuf.com",
    adminName: "Administrator",
    enableNotifications: true,
    enableNewsletter: true,
    enableComments: false,
    maintenanceMode: false,
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: 30,
  })

  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalSubscribers: 0,
    totalNews: 0,
    totalMessages: 0,
    storageUsed: "0 MB",
    lastBackup: "Never",
  })

  useEffect(() => {
    fetchSystemStats()
    loadSettings()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("/api/dashboard/system-stats")
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data)
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/dashboard/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.siteSettings) setSiteSettings({ ...siteSettings, ...data.siteSettings })
        if (data.securitySettings) setSecuritySettings({ ...securitySettings, ...data.securitySettings })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSiteSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/settings/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Site settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSecuritySettings = async () => {
    if (securitySettings.newPassword && securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(securitySettings),
      })

      if (response.ok) {
        toast({
          title: "Security Updated",
          description: "Security settings have been updated successfully.",
        })
        setSecuritySettings({
          ...securitySettings,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        throw new Error("Failed to update security settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testEmailNotification = async () => {
    try {
      const response = await fetch("/api/dashboard/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: siteSettings.adminEmail,
          subject: "Test Email Notification",
          message: "This is a test email to verify the notification system is working.",
        }),
      })

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your email inbox for the test message.",
        })
      } else {
        throw new Error("Failed to send test email")
      }
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: "Could not send test email. Check your email configuration.",
        variant: "destructive",
      })
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System", icon: Database },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your application settings and preferences.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={siteSettings.adminEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, adminEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Newsletter Signup</Label>
                      <p className="text-sm text-gray-600">Allow visitors to subscribe to newsletter</p>
                    </div>
                    <Switch
                      checked={siteSettings.enableNewsletter}
                      onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, enableNewsletter: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                    </div>
                    <Switch
                      checked={siteSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, maintenanceMode: checked })}
                    />
                  </div>
                </div>

                <Button onClick={saveSiteSettings} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                    }
                  />
                </div>

                <Button onClick={saveSecuritySettings} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  <Shield className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Security"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send email notifications for important events</p>
                  </div>
                  <Switch
                    checked={siteSettings.enableNotifications}
                    onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, enableNotifications: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Test Email Configuration</Label>
                  <p className="text-sm text-gray-600 mb-3">Send a test email to verify your email settings</p>
                  <Button onClick={testEmailNotification} variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                </div>

                <Button onClick={saveSiteSettings} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalSubscribers}</div>
                    <div className="text-sm text-gray-600">Total Subscribers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalNews}</div>
                    <div className="text-sm text-gray-600">News Articles</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalMessages}</div>
                    <div className="text-sm text-gray-600">Contact Messages</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Used</span>
                    <Badge variant="secondary">{systemStats.storageUsed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Backup</span>
                    <Badge variant="secondary">{systemStats.lastBackup}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <Wifi className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
