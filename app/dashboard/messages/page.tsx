"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Trash2,
  MessageSquare,
  User,
  Clock,
  Send,
  Archive,
  Inbox,
  Star,
  AlertTriangle,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  Flag,
  Check,
  Filter,
  Eye,
  RefreshCw,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Menu,
  Bell,
  Settings,
  Tag,
  PaperPlane,
  DraftingCompass,
  CircleCheck,
  CircleX,
  CircleAlert,
  CircleHelp,
  CircleDot,
  Hash,
  AtSign,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Server,
  Database,
  Shield,
  Lock,
  Unlock,
  Key,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Trophy,
  Award,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  EyeOff,
  Volume2,
  VolumeX,
  Volume1,
  Volume,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Cast,
  CastConnected,
  CastOff,
  Power,
  PowerOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  Cloudy,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Wind,
  MapPin,
  Navigation,
  Navigation2,
  Compass,
  Anchor,
  Globe,
  Github,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Twitch,
  Discord,
  Slack,
  Skype,
  Whatsapp,
  Telegram,
  SlackIcon,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Expand,
  Collapse,
  Move,
  MoveDiagonal,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronFirst,
  ChevronLast,
  Play,
  Pause,
  Stop,
  Rewind,
  FastForward,
  SkipBack,
  SkipForward,
  Volume2Icon,
  VolumeXIcon,
  Volume1Icon,
  VolumeIcon,
  WifiIcon,
  WifiOffIcon,
  BluetoothIcon,
  BluetoothConnectedIcon,
  BluetoothOffIcon,
  CastIcon,
  CastConnectedIcon,
  CastOffIcon,
  PowerIcon,
  PowerOffIcon,
  BatteryIcon,
  BatteryChargingIcon,
  BatteryFullIcon,
  BatteryLowIcon,
  BatteryMediumIcon,
  BatteryWarningIcon,
  ThermometerIcon,
  ThermometerSnowflakeIcon,
  ThermometerSunIcon,
  CloudIcon,
  CloudDrizzleIcon,
  CloudLightningIcon,
  CloudOffIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudyIcon,
  SunriseIcon,
  SunsetIcon,
  MoonIcon,
  SunIcon,
  WindIcon,
  MapPinIcon,
  NavigationIcon,
  Navigation2Icon,
  CompassIcon,
  AnchorIcon,
  GlobeIcon,
  GithubIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  TwitchIcon,
  DiscordIcon,
  SkypeIcon,
  WhatsappIcon,
  TelegramIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MaximizeIcon,
  MinimizeIcon,
  ExpandIcon,
  CollapseIcon,
  MoveIcon,
  MoveDiagonalIcon,
  MoveHorizontalIcon,
  MoveVerticalIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ShuffleIcon,
  RepeatIcon,
  Repeat1Icon,
  CornerUpLeftIcon,
  CornerUpRightIcon,
  CornerDownLeftIcon,
  CornerDownRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ChevronsUpIcon,
  ChevronsDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  RewindIcon,
  FastForwardIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"
import type { ContactMessage } from "@/types/message"
import { useSearchParams, useRouter } from "next/navigation"

interface SidebarItem {
  id: string
  label: string
  icon: any
  count?: number
  color?: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyMode, setReplyMode] = useState(false)
  const [replySubject, setReplySubject] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [filterStatus, setFilterStatus] = useState("all")

  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    content: "",
  })
  const [includeOriginalMessage, setIncludeOriginalMessage] = useState(true)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const folder = searchParams.get("folder") || "inbox"
    setActiveFolder(folder)
    fetchMessages()
  }, [searchParams])

  const fetchMessages = async () => {
    try {
      // Map folder names to status values
      const statusMap: Record<string, string> = {
        inbox: "all",
        read: "read",
        sent: "replied",  // Only show replied for sent
        outbox: "sending",
        spam: "spam",
        archived: "archived",
        deleted: "deleted"
      };
  
      const status = statusMap[activeFolder] || "all";
      const response = await fetch(`/api/dashboard/messages?status=${status}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      count: messages.filter((m) => m.status === "new" || m.status === "read").length,
      color: "text-blue-600",
    },
    {
      id: "read",
      label: "Read",
      icon: Check,
      count: messages.filter((m) => m.status === "read").length,
      color: "text-yellow-600",
    },
    {
      id: "sent",
      label: "Sent",
      icon: Send,
      count: messages.filter((m) => m.status === "replied").length, // Only count replied as sent
      color: "text-green-600",
    },
    {
      id: "outbox",
      label: "Outbox",
      icon: Clock,
      count: messages.filter((m) => m.status === "sending").length,
      color: "text-orange-600",
    },
    {
      id: "spam",
      label: "Spam",
      icon: AlertTriangle,
      count: messages.filter((m) => m.status === "spam").length,
      color: "text-red-600",
    },
    {
      id: "archived",
      label: "Archived",
      icon: Archive,
      count: messages.filter((m) => m.status === "archived").length,
      color: "text-gray-600",
    },
    {
      id: "deleted",
      label: "Deleted",
      icon: Trash2,
      count: messages.filter((m) => m.status === "deleted").length,
      color: "text-red-500",
    },
  ]

  const getFilteredMessages = () => {
    let filtered = messages;
  
    // Filter by folder
    switch (activeFolder) {
      case "inbox":
        filtered = messages.filter((m) => m.status === "new" || m.status === "read");
        break;
      case "read":
        filtered = messages.filter((m) => m.status === "read");
        break;
      case "sent":
        filtered = messages.filter((m) => m.status === "replied"); // Only show replied for sent
        break;
      case "outbox":
        filtered = messages.filter((m) => m.status === "sending");
        break;
      case "spam":
        filtered = messages.filter((m) => m.status === "spam");
        break;
      case "archived":
        filtered = messages.filter((m) => m.status === "archived");
        break;
      case "deleted":
        filtered = messages.filter((m) => m.status === "deleted");
        break;
      default:
        filtered = messages;
    }
  
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status if not "all"
    if (filterStatus !== "all") {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }
  
    return filtered;
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/dashboard/messages/${messageId}/${status}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // If message not found, refresh the list and show appropriate message
        if (response.status === 404) {
          await fetchMessages()
          return toast({
            title: "Message Not Found",
            description: "The message was not found. The list has been refreshed.",
            variant: "destructive",
          })
        }
        throw new Error(result.error || 'Failed to update message status')
      }
      
      // If we got here, the update was successful
      await fetchMessages()
      
      // Only show success toast if we're not refreshing the list
      if (status !== 'read') {
        toast({
          title: "Success",
          description: `Message marked as ${status} successfully`,
        })
      }
    } catch (error) {
      console.error(`Error updating message status to ${status}:`, error)
      
      // Handle network errors or other issues
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      
      toast({
        title: "Error",
        description: `Failed to update message: ${errorMessage}`,
        variant: "destructive",
      })
      
      // Always refresh the message list on error to ensure consistency
      await fetchMessages()
    }
  }

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message)
    setReplySubject(`Re: ${message.subject}`)
    const originalMessage = includeOriginalMessage
      ? `

----------------------------------------
Original message from ${message.firstName} ${message.lastName} (${message.email}):

${message.message}`
      : ""
    setReplyContent(originalMessage)
    setReplyMode(true)
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // First, send the email using the communication email API
      const emailResponse = await fetch("/api/communication/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedMessage.email,
          subject: replySubject,
          html: replyContent,
          message: replyContent.replace(/<[^>]*>/g, ''), // Plain text version
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Failed to send email")
      }

      // If email was sent successfully, update the message status
      await updateMessageStatus(selectedMessage._id, "replied")

      toast({
        title: "Success",
        description: "Reply sent successfully",
      })

      setReplyMode(false)
      setReplyContent("")
      setReplySubject("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "spam":
        return "bg-red-100 text-red-800"
      case "deleted":
        return "bg-red-200 text-red-900"
      case "sending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMessageIcon = (message: ContactMessage) => {
    if (message.status === "replied") return <Reply className="w-4 h-4 text-green-600" />
    if (message.status === "new") return <Mail className="w-4 h-4 text-blue-600" />
    if (message.starred) return <Star className="w-4 h-4 text-yellow-500 fill-current" />
    return <MessageSquare className="w-4 h-4 text-gray-400" />
  }

  const refreshMessages = () => {
    setLoading(true)
    fetchMessages()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen">
          <div className="w-64 bg-gray-50 p-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const filteredMessages = getFilteredMessages()

  const sendNewEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(composeData.to)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // Use the communication email API with template
      const response = await fetch("/api/communication/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          html: composeData.content,
          message: composeData.content.replace(/<[^>]*>/g, ''), // Plain text version
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email")
      }

      toast({
        title: "Success",
        description: "Email sent successfully",
      })

      setShowCompose(false)
      setComposeData({ to: "", subject: "", content: "" })
      fetchMessages()
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          {/* Compose Button */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
            <Button 
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => setShowCompose(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Compose New
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeFolder === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveFolder(item.id)
                      router.push(`/dashboard/messages?folder=${item.id}`)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      isActive 
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold shadow-sm border border-red-200" 
                        : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                        isActive 
                          ? "bg-red-100 text-red-600" 
                          : "bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500"
                      }`}>
                        <Icon className={`w-5 h-5 ${item.color || "text-gray-400"}`} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge 
                        className={`text-xs font-bold ${
                          isActive 
                            ? "bg-red-600 text-white" 
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Stats */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Messages</span>
                <span className="text-sm font-bold text-gray-900">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Unread</span>
                <span className="text-sm font-bold text-blue-600">
                  {messages.filter(m => m.status === "new").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Replied</span>
                <span className="text-sm font-bold text-green-600">
                  {messages.filter(m => m.status === "replied").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <Inbox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-red-700 bg-clip-text text-transparent">
                    {activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)} Messages
                  </h1>
                  <p className="text-sm text-gray-500">
                    {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 bg-gray-50 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshMessages}
                  className="border-gray-300 hover:bg-gray-100 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="spam">Spam</option>
                    <option value="archived">Archived</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                <Flag className="w-4 h-4 mr-2" />
                Spam
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Messages List */}
            <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">No messages found</h3>
                  <p className="text-gray-500 mb-6">There are no messages in your {activeFolder} folder</p>
                  <Button 
                    onClick={() => setShowCompose(true)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Compose Message
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (message.status === "new") {
                          updateMessageStatus(message._id, "read")
                        }
                      }}
                      className={`p-5 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-l-4 ${
                        selectedMessage?._id === message._id 
                          ? "bg-red-50 border-l-red-500 shadow-sm" 
                          : message.status === "new" 
                            ? "bg-blue-25 border-l-blue-500 font-medium" 
                            : "border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getMessageIcon(message)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-sm truncate ${
                                  message.status === "new" ? "font-bold text-gray-900" : "font-medium text-gray-700"
                                }`}
                              >
                                {message.firstName} {message.lastName}
                              </span>
                              {message.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{message.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(message.status)} variant="secondary">
                            {message.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="ml-8">
                        <p className={`text-sm mb-2 truncate ${message.status === "new" ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Detail */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="border-b border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 truncate">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "archived")}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "spam")}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "deleted")}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {selectedMessage.firstName} {selectedMessage.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        {selectedMessage.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedMessage.mobile}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Message Actions */}
                    {!replyMode && (
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleReply(selectedMessage)} 
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                          <Forward className="w-4 h-4 mr-2" />
                          Forward
                        </Button>
                        <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                          <Star className="w-4 h-4 mr-2" />
                          Star
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg mb-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    {replyMode && (
                      <Card className="mt-6 border-2 border-red-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 rounded-t-2xl">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Reply className="w-5 h-5 text-red-600" />
                            Reply to {selectedMessage.firstName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl">
                            <input
                              type="checkbox"
                              id="includeOriginal"
                              checked={includeOriginalMessage}
                              onChange={(e) => {
                                setIncludeOriginalMessage(e.target.checked)
                                const originalMessage = e.target.checked
                                  ? `

----------------------------------------
Original message from ${selectedMessage.firstName} ${selectedMessage.lastName} (${selectedMessage.email}):

${selectedMessage.message}`
                                  : ""
                                setReplyContent(originalMessage)
                              }}
                              className="rounded text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="includeOriginal" className="text-sm font-medium text-gray-700">
                              Include original message in reply
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <Input
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                              placeholder="Reply subject"
                              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Type your reply here..."
                              className="min-h-[250px] resize-y border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl p-4"
                              rows={10}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => setReplyMode(false)} 
                              disabled={isSending}
                              className="border-gray-300 hover:bg-gray-100 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={sendReply}
                              disabled={isSending || !replyContent.trim()}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                            >
                              {isSending ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Sending...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Reply
                                </span>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
                  <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Select a message</h3>
                    <p className="text-gray-600 mb-6">
                      Choose a message from the list to view its contents and reply
                    </p>
                    <Button 
                      onClick={() => setShowCompose(true)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Compose New Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <PaperPlane className="w-6 h-6" />
                    Compose New Message
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCompose(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    placeholder="recipient@example.com"
                    type="email"
                    className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Email subject"
                    className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <Textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    placeholder="Type your message here..."
                    className="min-h-[300px] resize-y border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl p-4 text-base"
                    rows={12}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCompose(false)} 
                    disabled={isSending}
                    className="border-gray-300 hover:bg-gray-100 rounded-xl px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendNewEmail}
                    disabled={isSending || !composeData.to || !composeData.subject || !composeData.content}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                  >
                    {isSending ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
