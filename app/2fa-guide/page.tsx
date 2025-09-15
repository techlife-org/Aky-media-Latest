"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Smartphone, Download, Settings, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TwoFactorGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Two-Factor Authentication Setup Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure your AKY Admin Dashboard with an additional layer of protection using Google Authenticator
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What is 2FA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                What is Two-Factor Authentication?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Two-Factor Authentication (2FA) adds an extra layer of security to your account by requiring 
                both your password and a time-based code from your mobile device.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Benefits:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Protects against password theft</li>
                  <li>• Prevents unauthorized access</li>
                  <li>• Industry-standard security practice</li>
                  <li>• Works offline on your phone</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Enter your email and password as usual</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Open Google Authenticator on your phone</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Enter the 6-digit code to complete login</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 1: Download App</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Install Google Authenticator from your app store
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://apps.apple.com/app/google-authenticator/id388497605"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black text-white text-xs py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Download for iOS
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-green-600 text-white text-xs py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download for Android
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 2: Setup Account</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Scan the QR code or enter the secret key manually
                </p>
                <Link href="/setup-2fa">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Start Setup
                  </Button>
                </Link>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 3: Verify</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Enter the 6-digit code to complete setup
                </p>
                <div className="text-green-600 font-semibold text-sm">
                  Setup Complete!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-700">Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">🔐 Security Tips:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Keep your phone secure with a lock screen</li>
                    <li>• Don't share your authenticator codes with anyone</li>
                    <li>• Save your secret key in a secure location as backup</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">📱 Troubleshooting:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Ensure your phone's time is synchronized</li>
                    <li>• Try refreshing the authenticator app</li>
                    <li>• Contact IT support if you lose access to your phone</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">🔄 Backup Options:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Save the secret key during setup</li>
                    <li>• Consider setting up on multiple devices</li>
                    <li>• Keep backup codes if provided</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-y-4">
          <Link href="/setup-2fa">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white mr-4">
              <Shield className="w-5 h-5 mr-2" />
              Setup 2FA Now
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}