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
  status: string
  data: any
  error?: string
}

interface CommunicationHealth {
  overall: string
  available: number
  total: number
  percentage: number
}

interface Template {
  id: string
  name: string
  category: 'contact-us' | 'subscribers' | 'news' | 'achievements'
  type: 'whatsapp' | 'sms' | 'email'
  subject?: string
  content: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

interface TemplateFormData {
  name: string
  category: 'contact-us' | 'subscribers' | 'news' | 'achievements'
  type: 'whatsapp' | 'sms' | 'email'
  subject: string
  content: string
  variables: string[]
}

export default function CommunicationPage() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [serviceStatus, setServiceStatus] = useState<{ [key: string]: ServiceStatus }>({})
  const [health, setHealth] = useState<CommunicationHealth | null>(null)
  
  // Template management state
  const [templates, setTemplates] = useState<Template[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    category: 'contact-us',
    type: 'whatsapp',
    subject: '',
    content: '',
    variables: []
  })
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [activeTab, setActiveTab] = useState('templates')
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<'contact-us' | 'subscribers' | 'news' | 'achievements'>('contact-us')

  // Form states
  const [whatsappForm, setWhatsappForm] = useState({
    to: '',
    message: ''
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

  // Load service status and templates on component mount
  useEffect(() => {
    checkAllServicesStatus()
    loadTemplates()
    const interval = setInterval(checkAllServicesStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAllServicesStatus = async () => {
    try {
      const response = await fetch('/api/communication/test')
      const data = await response.json()
      
      if (data.success) {
        console.log('Service Status Update:', data.services)
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

  // Template management functions
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/communication/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      // Initialize with default templates if API fails
      initializeDefaultTemplates()
    }
  }

  const initializeDefaultTemplates = () => {
    const defaultTemplates: Template[] = [
      // Contact Us Templates
      {
        id: 'contact-whatsapp-1',
        name: 'Contact Us Response - WhatsApp',
        category: 'contact-us',
        type: 'whatsapp',
        content: 'Hello {{name}},\n\nThank you for contacting AKY Media! We have received your message and will get back to you within 24 hours.\n\nYour inquiry: {{message}}\n\nBest regards,\nAKY Media Team',
        variables: ['name', 'message'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-sms-1',
        name: 'Contact Us Response - SMS',
        category: 'contact-us',
        type: 'sms',
        content: 'Hi {{name}}, thanks for contacting AKY Media! We\'ll respond to your inquiry within 24hrs. Ref: {{ref}}',
        variables: ['name', 'ref'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-email-1',
        name: 'Contact Us Response - Email',
        category: 'contact-us',
        type: 'email',
        subject: 'Thank you for contacting AKY Media - {{ref}}',
        content: 'Dear {{name}},\n\nThank you for reaching out to AKY Media. We have received your message and appreciate you taking the time to contact us.\n\nYour Message:\n{{message}}\n\nOur team will review your inquiry and respond within 24 hours. If your matter is urgent, please call us at +234-XXX-XXXX.\n\nReference Number: {{ref}}\n\nBest regards,\nAKY Media Customer Service Team\n\nEmail: notify@abbakabiryusuf.info\nWebsite: https://abbakabiryusuf.com',
        variables: ['name', 'message', 'ref'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Subscribers Templates
      {
        id: 'subscribers-whatsapp-1',
        name: 'Welcome New Subscriber - WhatsApp',
        category: 'subscribers',
        type: 'whatsapp',
        content: 'Welcome to AKY Media, {{name}}! 🎉\n\nThank you for subscribing to our updates. You\'ll now receive:\n• Latest news and updates\n• Exclusive content\n• Event notifications\n\nStay connected with us!',
        variables: ['name'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'subscribers-sms-1',
        name: 'Welcome New Subscriber - SMS',
        category: 'subscribers',
        type: 'sms',
        content: 'Welcome {{name}}! You\'re now subscribed to AKY Media updates. Reply STOP to unsubscribe.',
        variables: ['name'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'subscribers-email-1',
        name: 'Welcome New Subscriber - Email',
        category: 'subscribers',
        type: 'email',
        subject: 'Welcome to AKY Media Newsletter - {{name}}',
        content: 'Dear {{name}},\n\nWelcome to the AKY Media community! 🎉\n\nThank you for subscribing to our newsletter. You\'ve joined thousands of readers who stay updated with:\n\n• Latest news and insights\n• Exclusive interviews and content\n• Event announcements and invitations\n• Youth program updates\n• Achievement highlights\n\nWhat to expect:\n- Weekly newsletter every Friday\n- Breaking news alerts\n- Special announcements\n\nYou can manage your subscription preferences or unsubscribe at any time by clicking the link at the bottom of our emails.\n\nWelcome aboard!\n\nBest regards,\nThe AKY Media Team\n\nWebsite: https://abbakabiryusuf.com\nEmail: notify@abbakabiryusuf.info',
        variables: ['name'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // News Templates
      {
        id: 'news-whatsapp-1',
        name: 'Breaking News Alert - WhatsApp',
        category: 'news',
        type: 'whatsapp',
        content: '🚨 BREAKING NEWS\n\n{{headline}}\n\n{{summary}}\n\nRead full story: {{link}}\n\n#AKYMedia #News',
        variables: ['headline', 'summary', 'link'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'news-sms-1',
        name: 'News Alert - SMS',
        category: 'news',
        type: 'sms',
        content: 'NEWS: {{headline}} - {{summary}} Read more: {{link}}',
        variables: ['headline', 'summary', 'link'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'news-email-1',
        name: 'News Article - Email',
        category: 'news',
        type: 'email',
        subject: '{{headline}} - AKY Media News',
        content: 'Dear {{name}},\n\n{{headline}}\n\n{{content}}\n\nPublished: {{date}}\nAuthor: {{author}}\n\nRead the full article on our website: {{link}}\n\nStay informed with AKY Media.\n\nBest regards,\nAKY Media Editorial Team',
        variables: ['name', 'headline', 'content', 'date', 'author', 'link'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Achievements Templates
      {
        id: 'achievements-whatsapp-1',
        name: 'Achievement Announcement - WhatsApp',
        category: 'achievements',
        type: 'whatsapp',
        content: '🏆 ACHIEVEMENT UNLOCKED!\n\nCongratulations {{name}}! 🎉\n\nYou have achieved: {{achievement}}\n\n{{description}}\n\nDate: {{date}}\n\nWell done! Keep up the excellent work!\n\n#Achievement #Success #AKYMedia',
        variables: ['name', 'achievement', 'description', 'date'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'achievements-sms-1',
        name: 'Achievement Alert - SMS',
        category: 'achievements',
        type: 'sms',
        content: 'Congratulations {{name}}! You achieved: {{achievement}} on {{date}}. Well done!',
        variables: ['name', 'achievement', 'date'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'achievements-email-1',
        name: 'Achievement Certificate - Email',
        category: 'achievements',
        type: 'email',
        subject: 'Congratulations on Your Achievement - {{achievement}}',
        content: 'Dear {{name}},\n\nCongratulations! 🎉\n\nWe are delighted to inform you that you have successfully achieved:\n\n{{achievement}}\n\nAchievement Details:\n{{description}}\n\nDate Achieved: {{date}}\nCategory: {{category}}\nLevel: {{level}}\n\nThis achievement reflects your dedication, hard work, and commitment to excellence. We are proud to have you as part of the AKY Media community.\n\nYour achievement certificate is attached to this email. You can also view and download it from your dashboard.\n\nKeep up the excellent work!\n\nBest regards,\nAKY Media Achievement Team\n\nWebsite: https://abbakabiryusuf.com\nEmail: notify@abbakabiryusuf.info',
        variables: ['name', 'achievement', 'description', 'date', 'category', 'level'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    setTemplates(defaultTemplates)
    // Save to localStorage as fallback
    localStorage.setItem('aky-communication-templates', JSON.stringify(defaultTemplates))
  }

  const saveTemplate = async (templateData: TemplateFormData) => {
    try {
      const template: Template = {
        id: editingTemplate?.id || `template-${Date.now()}`,
        ...templateData,
        createdAt: editingTemplate?.createdAt || new Date(),
        updatedAt: new Date()
      }

      const response = await fetch('/api/communication/templates', {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        await loadTemplates()
        toast.success(`Template ${editingTemplate ? 'updated' : 'created'} successfully!`)
      } else {
        // Fallback to localStorage
        const updatedTemplates = editingTemplate 
          ? templates.map(t => t.id === editingTemplate.id ? template : t)
          : [...templates, template]
        setTemplates(updatedTemplates)
        localStorage.setItem('aky-communication-templates', JSON.stringify(updatedTemplates))
        toast.success(`Template ${editingTemplate ? 'updated' : 'created'} successfully!`)
      }

      setShowTemplateModal(false)
      setEditingTemplate(null)
      resetTemplateForm()
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template')
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/communication/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        // Fallback to localStorage
        const updatedTemplates = templates.filter(t => t.id !== templateId)
        setTemplates(updatedTemplates)
        localStorage.setItem('aky-communication-templates', JSON.stringify(updatedTemplates))
      }
      toast.success('Template deleted successfully!')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    }
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'contact-us',
      type: 'whatsapp',
      subject: '',
      content: '',
      variables: []
    })
  }

  const openTemplateModal = (template?: Template) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({
        name: template.name,
        category: template.category,
        type: template.type,
        subject: template.subject || '',
        content: template.content,
        variables: template.variables
      })
    } else {
      setEditingTemplate(null)
      resetTemplateForm()
    }
    setShowTemplateModal(true)
  }

  const applyTemplate = (template: Template) => {
    if (template.type === 'whatsapp') {
      setWhatsappForm(prev => ({ ...prev, message: template.content }))
      setActiveTab('whatsapp')
    } else if (template.type === 'sms') {
      setSmsForm(prev => ({ ...prev, message: template.content }))
      setActiveTab('sms')
    } else if (template.type === 'email') {
      setEmailForm(prev => ({ 
        ...prev, 
        subject: template.subject || '',
        message: template.content 
      }))
      setActiveTab('email')
    }
    toast.success('Template applied successfully!')
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{(.*?)}}/g)
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : []
  }

  const getTemplatesByCategory = (category: string, type?: string) => {
    return templates.filter(t => {
      const categoryMatch = t.category === category
      const typeMatch = type ? t.type === type : true
      return categoryMatch && typeMatch
    })
  }

  // Template categories
  const templateCategories = [
    { id: 'contact-us', name: 'Contact Us', icon: '📞', description: 'Response templates for customer inquiries' },
    { id: 'subscribers', name: 'Subscribers', icon: '👥', description: 'Welcome and subscription management templates' },
    { id: 'news', name: 'News', icon: '📰', description: 'News alerts and article templates' },
    { id: 'achievements', name: 'Achievements', icon: '🏆', description: 'Achievement and recognition templates' }
  ]

  const testWhatsApp = async () => {
    if (!whatsappForm.to || !whatsappForm.message) {
      toast.error('Please fill in recipient phone number and message')
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
        toast.success(`WhatsApp message sent successfully via ${result.data?.provider || 'Termii'}!`)
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
          {/* Header */}
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

          {/* Service Health Overview */}
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
              <Card className={`relative overflow-hidden ${serviceStatus.whatsapp?.available ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'} hover:shadow-lg transition-all duration-300`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${serviceStatus.whatsapp?.available ? 'bg-green-500/10' : 'bg-orange-500/10'} rounded-full -mr-10 -mt-10`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${serviceStatus.whatsapp?.available ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${serviceStatus.whatsapp?.available ? 'text-green-700' : 'text-orange-700'}`}>WhatsApp</p>
                      <p className={`text-2xl font-bold ${serviceStatus.whatsapp?.available ? 'text-green-900' : 'text-orange-900'}`}>
                        {serviceStatus.whatsapp?.available ? 'Active' : 'Error'}
                      </p>
                      <p className={`text-xs ${serviceStatus.whatsapp?.available ? 'text-green-600' : 'text-orange-600'} flex items-center gap-1`}>
                        {serviceStatus.whatsapp?.available ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Termii WhatsApp API
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
                        Termii SMS Service
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
                        Enhanced SMTP
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-50">
                  <TabsTrigger value="templates" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Sparkles className="w-4 h-4" />
                    Templates
                  </TabsTrigger>
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
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates">
                  <div className="space-y-6">
                    {/* Template Categories */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {templateCategories.map((category) => (
                        <Button
                          key={category.id}
                          variant={activeTemplateCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTemplateCategory(category.id as any)}
                          className="flex items-center gap-2"
                        >
                          <span>{category.icon}</span>
                          {category.name}
                        </Button>
                      ))}
                    </div>

                    {/* Template Management */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {templateCategories.find(c => c.id === activeTemplateCategory)?.name} Templates
                        </h3>
                        <p className="text-sm text-gray-600">
                          {templateCategories.find(c => c.id === activeTemplateCategory)?.description}
                        </p>
                      </div>
                      <Button onClick={() => openTemplateModal()} className="bg-blue-600 hover:bg-blue-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getTemplatesByCategory(activeTemplateCategory).map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {template.type.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {template.variables.length} variables
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => applyTemplate(template)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openTemplateModal(template)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-xs text-gray-600 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                              {template.content.substring(0, 100)}...
                            </div>
                            {template.variables.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {template.variables.slice(0, 3).map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs px-1 py-0">
                                    {variable}
                                  </Badge>
                                ))}
                                {template.variables.length > 3 && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    +{template.variables.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {getTemplatesByCategory(activeTemplateCategory).length === 0 && (
                      <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No templates yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Create your first {templateCategories.find(c => c.id === activeTemplateCategory)?.name.toLowerCase()} template
                        </p>
                        <Button onClick={() => openTemplateModal()} className="bg-blue-600 hover:bg-blue-700">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Template
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* WhatsApp Tab */}
                <TabsContent value="whatsapp">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          WhatsApp Business API Testing
                        </span>
                        {getStatusBadge(serviceStatus.whatsapp)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          {/* Template Selection */}
                          <div>
                            <Label htmlFor="whatsapp-template">Use Template (Optional)</Label>
                            <select
                              id="whatsapp-template"
                              className="w-full p-2 border rounded-md"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const template = templates.find(t => t.id === e.target.value)
                                  if (template) applyTemplate(template)
                                }
                              }}
                            >
                              <option value="">Select a template...</option>
                              {templateCategories.map((category) => {
                                const categoryTemplates = getTemplatesByCategory(category.id, 'whatsapp')
                                if (categoryTemplates.length === 0) return null
                                return (
                                  <optgroup key={category.id} label={`${category.icon} ${category.name}`}>
                                    {categoryTemplates.map((template) => (
                                      <option key={template.id} value={template.id}>
                                        {template.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              })}
                            </select>
                          </div>

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
                            <Label htmlFor="whatsapp-message">Message Text *</Label>
                            <Textarea
                              id="whatsapp-message"
                              placeholder="Hello! This is a test message from AKY Communication System."
                              value={whatsappForm.message}
                              onChange={(e) => setWhatsappForm(prev => ({ ...prev, message: e.target.value }))}
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <Button 
                              onClick={testWhatsApp} 
                              disabled={loading.whatsapp || !whatsappForm.to || !whatsappForm.message}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {loading.whatsapp ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Send WhatsApp Message
                            </Button>
                          </div>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          SMS Testing (Termii)
                        </span>
                        {getStatusBadge(serviceStatus.sms)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          {/* Template Selection */}
                          <div>
                            <Label htmlFor="sms-template">Use Template (Optional)</Label>
                            <select
                              id="sms-template"
                              className="w-full p-2 border rounded-md"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const template = templates.find(t => t.id === e.target.value)
                                  if (template) applyTemplate(template)
                                }
                              }}
                            >
                              <option value="">Select a template...</option>
                              {templateCategories.map((category) => {
                                const categoryTemplates = getTemplatesByCategory(category.id, 'sms')
                                if (categoryTemplates.length === 0) return null
                                return (
                                  <optgroup key={category.id} label={`${category.icon} ${category.name}`}>
                                    {categoryTemplates.map((template) => (
                                      <option key={template.id} value={template.id}>
                                        {template.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              })}
                            </select>
                          </div>

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
                            <Label htmlFor="sms-to">Recipient Phone Number(s) *</Label>
                            <Input
                              id="sms-to"
                              placeholder={smsForm.type === 'bulk' ? "+2348161781643,+2347880234567" : "+2348161781643"}
                              value={smsForm.to}
                              onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {smsForm.type === 'bulk' ? 'Comma-separated for bulk SMS. ' : 'Single phone number. '}
                              Use international format: +234XXXXXXXXXX
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="sms-message">Message Text *</Label>
                            <Textarea
                              id="sms-message"
                              placeholder="Congratulations on sending your first message."
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Email Testing (Enhanced SMTP)
                        </span>
                        {getStatusBadge(serviceStatus.email)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          {/* Template Selection */}
                          <div>
                            <Label htmlFor="email-template">Use Template (Optional)</Label>
                            <select
                              id="email-template"
                              className="w-full p-2 border rounded-md"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const template = templates.find(t => t.id === e.target.value)
                                  if (template) applyTemplate(template)
                                }
                              }}
                            >
                              <option value="">Select a template...</option>
                              {templateCategories.map((category) => {
                                const categoryTemplates = getTemplatesByCategory(category.id, 'email')
                                if (categoryTemplates.length === 0) return null
                                return (
                                  <optgroup key={category.id} label={`${category.icon} ${category.name}`}>
                                    {categoryTemplates.map((template) => (
                                      <option key={template.id} value={template.id}>
                                        {template.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              })}
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="email-to">Recipient Email(s) *</Label>
                            <Input
                              id="email-to"
                              placeholder="user@example.com"
                              value={emailForm.to}
                              onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                            />
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

                          <Button 
                            onClick={testEmail} 
                            disabled={loading.email}
                            className="w-full"
                          >
                            {loading.email ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Send Email
                          </Button>
                        </div>

                        <div>
                          <Label>Test Result</Label>
                          <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                            {results.email ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {getResultIcon(results.email)}
                                  <span className="font-medium">
                                    {results.email.success ? 'Success' : 'Failed'}
                                  </span>
                                </div>
                                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                  {JSON.stringify(results.email, null, 2)}
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Welcome New Subscriber"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Category and Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-category">Category *</Label>
                    <select
                      id="template-category"
                      className="w-full p-2 border rounded-md"
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                    >
                      {templateCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="template-type">Communication Type *</Label>
                    <select
                      id="template-type"
                      className="w-full p-2 border rounded-md"
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                {/* Subject (Email only) */}
                {templateForm.type === 'email' && (
                  <div>
                    <Label htmlFor="template-subject">Email Subject *</Label>
                    <Input
                      id="template-subject"
                      placeholder="e.g., Welcome to AKY Media - {name}"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <Label htmlFor="template-content">Message Content *</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Enter your template content. Use {variable} for dynamic content."
                    value={templateForm.content}
                    onChange={(e) => {
                      const content = e.target.value
                      const variables = extractVariables(content)
                      setTemplateForm(prev => ({ ...prev, content, variables }))
                    }}
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{{'} variable {'}}'}  syntax for dynamic content. Example: Hello {'{{'} name {'}}'},  welcome to {'{{'} company {'}}'}!
                  </p>
                </div>

                {/* Variables Preview */}
                {templateForm.variables.length > 0 && (
                  <div>
                    <Label>Detected Variables</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {templateForm.variables.map((variable) => (
                        <Badge key={variable} variant="secondary">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {templateForm.type === 'email' && templateForm.subject && (
                      <div className="mb-2">
                        <strong>Subject:</strong> {templateForm.subject}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {templateForm.content || 'Enter content to see preview...'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <div>
                    {editingTemplate && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this template?')) {
                            deleteTemplate(editingTemplate.id)
                            setShowTemplateModal(false)
                          }
                        }}
                      >
                        Delete Template
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => saveTemplate(templateForm)}
                      disabled={!templateForm.name || !templateForm.content || (templateForm.type === 'email' && !templateForm.subject)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}