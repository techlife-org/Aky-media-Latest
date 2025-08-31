"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  ExternalLink,
  Zap,
  Shield,
  Globe,
  BarChart3
} from "lucide-react"

interface SMSBillingData {
  account?: {
    balance: number
    currency: string
    estimatedSmsCount: number
    lowBalanceWarning: boolean
    lastChecked: string
  }
  billing?: {
    provider: string
    topUpUrl: string
    pricingUrl: string
    supportUrl: string
    features: string[]
    pricing: {
      nigeria: {
        price: string
        currency: string
        note: string
      }
      recommendations: {
        starter: {
          amount: string
          smsCount: string
          suitable: string
        }
        business: {
          amount: string
          smsCount: string
          suitable: string
        }
        enterprise: {
          amount: string
          smsCount: string
          suitable: string
        }
      }
    }
  }
}

interface SMSBillingWidgetProps {
  data?: SMSBillingData
  onRefresh?: () => void
}

export default function SMSBillingWidget({ data, onRefresh }: SMSBillingWidgetProps) {
  const [loading, setLoading] = useState(false)

  const handleTopUp = () => {
    if (data?.billing?.topUpUrl) {
      window.open(data.billing.topUpUrl, '_blank')
    }
  }

  const handleViewPricing = () => {
    if (data?.billing?.pricingUrl) {
      window.open(data.billing.pricingUrl, '_blank')
    }
  }

  const handleContactSupport = () => {
    if (data?.billing?.supportUrl) {
      window.open(data.billing.supportUrl, '_blank')
    }
  }

  const getBalanceStatus = () => {
    if (!data?.account) return 'unknown'
    
    const { balance, lowBalanceWarning } = data.account
    
    if (lowBalanceWarning || balance < 10) return 'low'
    if (balance < 50) return 'medium'
    return 'good'
  }

  const getBalanceColor = () => {
    const status = getBalanceStatus()
    switch (status) {
      case 'low': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'good': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getBalanceBadgeVariant = () => {
    const status = getBalanceStatus()
    switch (status) {
      case 'low': return 'destructive'
      case 'medium': return 'secondary'
      case 'good': return 'default'
      default: return 'outline'
    }
  }

  if (!data) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-800 mb-2">SMS Billing</h3>
            <p className="text-purple-600 text-sm">Configure SMS service to view billing information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Balance Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              SMS Account Balance
            </span>
            <Badge variant={getBalanceBadgeVariant()}>
              {getBalanceStatus().toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.account && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                    {data.account.currency} {data.account.balance}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Estimated SMS</p>
                  <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                    ~{data.account.estimatedSmsCount}
                  </p>
                </div>
              </div>

              {data.account.lowBalanceWarning && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Low Balance Warning!</strong> Your SMS balance is running low. 
                    Consider topping up to avoid service interruption.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleTopUp}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Top Up Balance
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Last checked: {new Date(data.account.lastChecked).toLocaleString()}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      {data.billing?.pricing?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recommended Top-Up Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.billing.pricing.recommendations).map(([key, plan]) => (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    key === 'business' 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-lg capitalize mb-2">
                      {key}
                      {key === 'business' && (
                        <Badge className="ml-2 bg-purple-600">Recommended</Badge>
                      )}
                    </h4>
                    <p className="text-2xl font-bold text-purple-600 mb-1">
                      {plan.amount}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {plan.smsCount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.suitable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={handleViewPricing}
                className="mr-2"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Pricing
              </Button>
              <Button 
                variant="outline" 
                onClick={handleContactSupport}
              >
                <Shield className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Features */}
      {data.billing?.features && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              SMS Service Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.billing.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nigeria Pricing Info */}
      {data.billing?.pricing?.nigeria && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Nigeria SMS Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 mb-2">
                {data.billing.pricing.nigeria.price}
              </p>
              <p className="text-sm text-green-700 mb-2">
                per SMS in Nigeria
              </p>
              <p className="text-xs text-green-600">
                {data.billing.pricing.nigeria.note}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://accounts.termii.com', '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Termii Portal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://developers.termii.com', '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              API Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}