"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Activity,
  TrendingUp,
  Eye,
  Sparkles,
  Zap
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"

interface ServiceStatus {
  available: boolean
  status: number
  data: any
  error?: string
}

interface CommunicationHealth {
  overall: string
  available: number
  total: number
  percentage: number
}

export default function CommunicationPage() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [serviceStatus, setServiceStatus] = useState<{ [key: string]: ServiceStatus }>({})
  const [health, setHealth] = useState<CommunicationHealth | null>(null)

  // Form states
  const [whatsappForm, setWhatsappForm] = useState({
    to: '',
    message: '',
    templateSid: '',
    templateVariables: ''
  })

  const [smsForm, setSmsForm] = useState({
    to: '',
    message: '',
    type: 'single' as 'single' | 'bulk'
  })

  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    html: ''
  })

  // Load service status on component mount
  useEffect(() => {
    checkAllServicesStatus()
  }, [])

  const checkAllServicesStatus = async () => {
    try {
      const response = await fetch('/api/communication/test')
      const data = await response.json()
      
      if (data.success) {
        setServiceStatus(data.services)
        setHealth(data.health)
      }
    } catch (error) {
      console.error('Failed to check services status:', error)
      toast.error('Failed to check services status')
    }
  }

  const setLoadingState = (service: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [service]: isLoading }))
  }

  const testWhatsApp = async () => {
    if (!whatsappForm.to || (!whatsappForm.message && !whatsappForm.templateSid)) {
      toast.error('Please fill in required fields')
      return
    }

    setLoadingState('whatsapp', true)
    
    try {
      const response = await fetch('/api/communication/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappForm)
      })

      const result = await response.json()
      setResults(prev => ({ ...prev, whatsapp: result }))

      if (result.success) {
        toast.success('WhatsApp message sent successfully!')
      } else {
        toast.error(`WhatsApp failed: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`WhatsApp error: ${error.message}`)
      setResults(prev => ({ ...prev, whatsapp: { success: false, error: error.message } }))
    } finally {
      setLoadingState('whatsapp', false)
    }
  }

  const testSMS = async () => {
    if (!smsForm.to || !smsForm.message) {
      toast.error('Please fill in required fields')
      return
    }

    setLoadingState('sms', true)
    
    try {
      const requestData = {
        ...smsForm,
        to: smsForm.type === 'bulk' ? smsForm.to.split(',').map(num => num.trim()) : smsForm.to
      }

      const response = await fetch('/api/communication/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      setResults(prev => ({ ...prev, sms: result }))

      if (result.success) {
        toast.success('SMS sent successfully!')
      } else {
        toast.error(`SMS failed: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`SMS error: ${error.message}`)
      setResults(prev => ({ ...prev, sms: { success: false, error: error.message } }))
    } finally {
      setLoadingState('sms', false)
    }
  }

  const testEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast.error('Please fill in required fields')
      return
    }

    setLoadingState('email', true)
    
    try {
      const requestData = {
        ...emailForm,
        to: emailForm.to.includes(',') ? emailForm.to.split(',').map(email => email.trim()) : emailForm.to
      }

      const response = await fetch('/api/communication/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      setResults(prev => ({ ...prev, email: result }))

      if (result.success) {
        toast.success('Email sent successfully!')
      } else {
        toast.error(`Email failed: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Email error: ${error.message}`)
      setResults(prev => ({ ...prev, email: { success: false, error: error.message } }))
    } finally {
      setLoadingState('email', false)
    }
  }

  const testEmailConfiguration = async () => {
    if (!emailForm.to) {
      toast.error('Please enter a test email address')
      return
    }

    setLoadingState('emailTest', true)
    
    try {
      const response = await fetch('/api/communication/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: emailForm.to.split(',')[0].trim() })
      })

      const result = await response.json()
      setResults(prev => ({ ...prev, emailTest: result }))

      if (result.success) {
        toast.success('Test email sent successfully! Check your inbox.')
      } else {
        toast.error(`Email test failed: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Email test error: ${error.message}`)
      setResults(prev => ({ ...prev, emailTest: { success: false, error: error.message } }))
    } finally {
      setLoadingState('emailTest', false)
    }
  }

  const testAllServices = async () => {
    if (!whatsappForm.to || !smsForm.to || !emailForm.to) {
      toast.error('Please fill in recipient fields for all services')
      return
    }

    setLoadingState('all', true)
    
    try {
      const testData = {
        service: 'all' as const,
        testData: {
          whatsapp: whatsappForm.message || whatsappForm.templateSid ? whatsappForm : undefined,
          sms: smsForm.message ? {
            ...smsForm,
            to: smsForm.type === 'bulk' ? smsForm.to.split(',').map(num => num.trim()) : smsForm.to
          } : undefined,
          email: emailForm.message ? {
            ...emailForm,
            to: emailForm.to.includes(',') ? emailForm.to.split(',').map(email => email.trim()) : emailForm.to
          } : undefined
        }
      }

      const response = await fetch('/api/communication/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      setResults(prev => ({ ...prev, all: result }))

      if (result.success) {
        toast.success(`All services tested! ${result.summary.successful}/${result.summary.total} successful`)
      } else {
        toast.error(`Test completed with ${result.summary.failed} failures`)
      }
    } catch (error: any) {
      toast.error(`Test error: ${error.message}`)
      setResults(prev => ({ ...prev, all: { success: false, error: error.message } }))
    } finally {
      setLoadingState('all', false)
    }
  }

  const getStatusBadge = (service: ServiceStatus | undefined) => {
    if (!service) return <Badge variant="secondary">Unknown</Badge>
    
    if (service.available) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    } else {
      return <Badge variant="destructive">Error</Badge>
    }
  }

  const getResultIcon = (result: any) => {
    if (!result) return null
    
    if (result.success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Communication Center
                      </h1>
                      <p className="text-gray-600 text-lg">Test and manage WhatsApp, SMS, and Email services</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={checkAllServicesStatus}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Service Health Overview */}
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overall Health Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">System Health</p>
                      <p className="text-3xl font-bold text-blue-900">{health.percentage}%</p>
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {health.available}/{health.total} services
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Status */}
              <Card className={`relative overflow-hidden ${serviceStatus.whatsapp?.available ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'} hover:shadow-lg transition-all duration-300`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${serviceStatus.whatsapp?.available ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full -mr-10 -mt-10`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${serviceStatus.whatsapp?.available ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${serviceStatus.whatsapp?.available ? 'text-green-700' : 'text-red-700'}`}>WhatsApp</p>
                      <p className={`text-2xl font-bold ${serviceStatus.whatsapp?.available ? 'text-green-900' : 'text-red-900'}`}>
                        {serviceStatus.whatsapp?.available ? 'Active' : 'Error'}
                      </p>
                      <p className={`text-xs ${serviceStatus.whatsapp?.available ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {serviceStatus.whatsapp?.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Twilio Service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SMS Status */}
              <Card className={`relative overflow-hidden ${serviceStatus.sms?.available ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'} hover:shadow-lg transition-all duration-300`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${serviceStatus.sms?.available ? 'bg-purple-500/10' : 'bg-red-500/10'} rounded-full -mr-10 -mt-10`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${serviceStatus.sms?.available ? 'from-purple-500 to-purple-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${serviceStatus.sms?.available ? 'text-purple-700' : 'text-red-700'}`}>SMS</p>
                      <p className={`text-2xl font-bold ${serviceStatus.sms?.available ? 'text-purple-900' : 'text-red-900'}`}>
                        {serviceStatus.sms?.available ? 'Active' : 'Error'}
                      </p>
                      <p className={`text-xs ${serviceStatus.sms?.available ? 'text-purple-600' : 'text-red-600'} flex items-center gap-1`}>
                        {serviceStatus.sms?.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Infobip Service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Status */}
              <Card className={`relative overflow-hidden ${serviceStatus.email?.available ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'} hover:shadow-lg transition-all duration-300`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${serviceStatus.email?.available ? 'bg-amber-500/10' : 'bg-red-500/10'} rounded-full -mr-10 -mt-10`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${serviceStatus.email?.available ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${serviceStatus.email?.available ? 'text-amber-700' : 'text-red-700'}`}>Email</p>
                      <p className={`text-2xl font-bold ${serviceStatus.email?.available ? 'text-amber-900' : 'text-red-900'}`}>
                        {serviceStatus.email?.available ? 'Active' : 'Error'}
                      </p>
                      <p className={`text-xs ${serviceStatus.email?.available ? 'text-amber-600' : 'text-red-600'} flex items-center gap-1`}>
                        {serviceStatus.email?.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        SMTP Service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <Tabs defaultValue="whatsapp" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-50">
                  <TabsTrigger value="whatsapp" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                    <Mail className="w-4 h-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="test-all" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Zap className="w-4 h-4" />
                    Test All
                  </TabsTrigger>
                </TabsList>

                {/* WhatsApp Tab */}
                <TabsContent value="whatsapp">
                  <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Testing (Twilio)
                </span>
                {getStatusBadge(serviceStatus.whatsapp)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp-to">Recipient Phone Number *</Label>
                    <Input
                      id="whatsapp-to"
                      placeholder="+2348161781643"
                      value={whatsappForm.to}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, to: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +234...)</p>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp-message">Message Text</Label>
                    <Textarea
                      id="whatsapp-message"
                      placeholder="Your appointment is coming up on July 21 at 3PM"
                      value={whatsappForm.message}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="text-center text-gray-500">OR</div>

                  <div>
                    <Label htmlFor="whatsapp-template">Template SID</Label>
                    <Input
                      id="whatsapp-template"
                      placeholder="HXb5b62575e6e4ff6129ad7c8efe1f983e"
                      value={whatsappForm.templateSid}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, templateSid: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp-variables">Template Variables (JSON)</Label>
                    <Input
                      id="whatsapp-variables"
                      placeholder='{"1":"12/1","2":"3pm"}'
                      value={whatsappForm.templateVariables}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, templateVariables: e.target.value }))}
                    />
                  </div>

                  <Button 
                    onClick={testWhatsApp} 
                    disabled={loading.whatsapp}
                    className="w-full"
                  >
                    {loading.whatsapp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send WhatsApp Message
                  </Button>
                </div>

                <div>
                  <Label>Test Result</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    {results.whatsapp ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getResultIcon(results.whatsapp)}
                          <span className="font-medium">
                            {results.whatsapp.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                          {JSON.stringify(results.whatsapp, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No test results yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
                  </Card>
                </TabsContent>

                {/* SMS Tab */}
                <TabsContent value="sms">
                  <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Testing (Infobip)
                </span>
                {getStatusBadge(serviceStatus.sms)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sms-type">SMS Type</Label>
                    <select
                      id="sms-type"
                      className="w-full p-2 border rounded-md"
                      value={smsForm.type}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, type: e.target.value as 'single' | 'bulk' }))}
                    >
                      <option value="single">Single SMS</option>
                      <option value="bulk">Bulk SMS</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="sms-to">
                      Recipient Phone Number(s) *
                    </Label>
                    <Input
                      id="sms-to"
                      placeholder={smsForm.type === 'bulk' ? "+2348161781643,+2347880234567" : "+2348161781643"}
                      value={smsForm.to}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {smsForm.type === 'bulk' ? 'Comma-separated for bulk SMS. ' : 'Single phone number. '}
                      Use international format: +234XXXXXXXXXX or 08XXXXXXXXX
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sms-message">Message Text *</Label>
                    <Textarea
                      id="sms-message"
                      placeholder="Congratulations on sending your first message. Go ahead and check the delivery report in the next step."
                      value={smsForm.message}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {smsForm.message.length}/160 characters
                    </p>
                  </div>

                  <Button 
                    onClick={testSMS} 
                    disabled={loading.sms}
                    className="w-full"
                  >
                    {loading.sms ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send SMS
                  </Button>
                </div>

                <div>
                  <Label>Test Result</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    {results.sms ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getResultIcon(results.sms)}
                          <span className="font-medium">
                            {results.sms.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                          {JSON.stringify(results.sms, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No test results yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
                  </Card>
                </TabsContent>

                {/* Email Tab */}
                <TabsContent value="email">
                  <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Testing (SMTP)
                </span>
                {getStatusBadge(serviceStatus.email)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-to">Recipient Email(s) *</Label>
                    <Input
                      id="email-to"
                      placeholder="user@example.com or user1@example.com,user2@example.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated for multiple recipients. Supports CC and BCC.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email-subject">Subject *</Label>
                    <Input
                      id="email-subject"
                      placeholder="Test Email from AKY Communication Center"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-message">Message Text *</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Hello,\n\nThis is a test email from the AKY Communication Center.\n\nBest regards,\nAKY Team"
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-html">HTML Content (Optional)</Label>
                    <Textarea
                      id="email-html"
                      placeholder="<h1>AKY Communication Test</h1><p>This is a <strong>test email</strong> with HTML formatting.</p><p>Visit our website: <a href='#'>AKY Website</a></p>"
                      value={emailForm.html}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, html: e.target.value }))}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      HTML content will be used if provided, otherwise plain text will be sent.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={testEmailConfiguration} 
                      disabled={loading.emailTest}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading.emailTest ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Test Email Configuration
                    </Button>
                    
                    <Button 
                      onClick={testEmail} 
                      disabled={loading.email}
                      className="w-full"
                      variant="outline"
                    >
                      {loading.email ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Custom Email
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Test Results</Label>
                  <div className="space-y-3">
                    {/* Configuration Test Result */}
                    {results.emailTest && (
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          {getResultIcon(results.emailTest)}
                          <span className="font-medium text-blue-800">
                            Configuration Test: {results.emailTest.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                          {JSON.stringify(results.emailTest, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {/* Custom Email Result */}
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[120px]">
                      {results.email ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getResultIcon(results.email)}
                            <span className="font-medium">
                              Custom Email: {results.email.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                            {JSON.stringify(results.email, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center">No custom email results yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
                  </Card>
                </TabsContent>

                {/* Test All Tab */}
                <TabsContent value="test-all">
                  <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Test All Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will test all three communication services using the data from their respective tabs.
                  Make sure you have filled in the required fields in each tab before running this test.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">WhatsApp</h4>
                  <p className="text-sm text-gray-600">
                    To: {whatsappForm.to || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Message: {whatsappForm.message ? 'Set' : whatsappForm.templateSid ? 'Template' : 'Not set'}
                  </p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">SMS</h4>
                  <p className="text-sm text-gray-600">
                    To: {smsForm.to || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {smsForm.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Message: {smsForm.message ? 'Set' : 'Not set'}
                  </p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Email</h4>
                  <p className="text-sm text-gray-600">
                    To: {emailForm.to || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Subject: {emailForm.subject || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Message: {emailForm.message ? 'Set' : 'Not set'}
                  </p>
                </Card>
              </div>

              <Button 
                onClick={testAllServices} 
                disabled={loading.all}
                className="w-full"
                size="lg"
              >
                {loading.all ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Test All Communication Services
              </Button>

              {results.all && (
                <div className="mt-6">
                  <Label>Test Results Summary</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      {getResultIcon(results.all)}
                      <span className="font-medium">
                        {results.all.success ? 'All Tests Passed' : 'Some Tests Failed'}
                      </span>
                      <Badge variant="outline">
                        {results.all.summary?.successful || 0}/{results.all.summary?.total || 0} successful
                      </Badge>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                      {JSON.stringify(results.all, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}