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

  // const fetchMessages = async () => {
  //   try {
  //     const response = await fetch(`/api/dashboard/messages?status=${activeFolder === "inbox" ? "all" : activeFolder}`)
  //     const data = await response.json()
  //     setMessages(data.messages || [])
  //   } catch (error) {
  //     console.error("Error fetching messages:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchMessages = async () => {
    try {
      // Map folder names to status values
      const statusMap: Record<string, string> = {
        inbox: "all",
        read: "read",
        sent: "sent",  // This should be handled by your API
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

  // const getFilteredMessages = () => {
  //   let filtered = messages

  //   // Filter by folder
  //   switch (activeFolder) {
  //     case "inbox":
  //       filtered = messages.filter((m) => m.status === "new" || m.status === "read")
  //       break
  //     case "read":
  //       filtered = messages.filter((m) => m.status === "read")
  //       break
  //     case "sent":
  //       filtered = messages.filter((m) => m.status === "replied" || m.status === "sent")
  //       break
  //     case "outbox":
  //       filtered = messages.filter((m) => m.status === "sending")
  //       break
  //     case "spam":
  //       filtered = messages.filter((m) => m.status === "spam")
  //       break
  //     case "archived":
  //       filtered = messages.filter((m) => m.status === "archived")
  //       break
  //     case "deleted":
  //       filtered = messages.filter((m) => m.status === "deleted")
  //       break
  //     default:
  //       filtered = messages
  //   }

  //   // Filter by search term
  //   if (searchTerm) {
  //     filtered = filtered.filter(
  //       (message) =>
  //         message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         message.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  //     )
  //   }

  //   return filtered
  // } 
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
  
    // Rest of your filtering logic...
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
      ? `\n\n----------------------------------------\nOriginal message from ${message.firstName} ${message.lastName} (${message.email}):\n\n${message.message}`
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
      const response = await fetch("/api/dashboard/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedMessage.email,
          subject: replySubject,
          html: replyContent,
          replyTo: process.env.EMAIL_FROM || process.env.SMTP_USER,
          recipientName: `${selectedMessage.firstName} ${selectedMessage.lastName}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

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
        description: "Failed to send reply. Please try again.",
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

    setIsSending(true)
    try {
      const response = await fetch("/api/dashboard/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          html: composeData.content,
          type: "new",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
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
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setShowCompose(true)}>
              <Send className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-2">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive ? "bg-red-100 text-red-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${item.color || "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeFolder}</h1>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Messages List */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages in {activeFolder}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (message.status === "new") {
                          updateMessageStatus(message._id, "read")
                        }
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?._id === message._id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
                      } ${message.status === "new" ? "bg-blue-25 font-medium" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getMessageIcon(message)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm truncate ${message.status === "new" ? "font-semibold" : "font-medium"}`}
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
                        <p className={`text-sm mb-1 truncate ${message.status === "new" ? "font-medium" : ""}`}>
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
            <div className="flex-1 flex flex-col">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "archived")}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "spam")}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage._id, "deleted")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedMessage.firstName} {selectedMessage.lastName}
                          </p>
                          <p className="text-xs">{selectedMessage.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-auto">
                        {selectedMessage.mobile && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{selectedMessage.mobile}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-white rounded-lg border p-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    {!replyMode && (
                      <div className="mt-6 flex gap-2">
                        <Button onClick={() => handleReply(selectedMessage)} className="bg-red-600 hover:bg-red-700">
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button variant="outline">
                          <Forward className="w-4 h-4 mr-2" />
                          Forward
                        </Button>
                      </div>
                    )}

                    {replyMode && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="text-lg">Reply to {selectedMessage.firstName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="includeOriginal"
                              checked={includeOriginalMessage}
                              onChange={(e) => {
                                setIncludeOriginalMessage(e.target.checked)
                                const originalMessage = e.target.checked
                                  ? `\n\n----------------------------------------\nOriginal message from ${selectedMessage.firstName} ${selectedMessage.lastName} (${selectedMessage.email}):\n\n${selectedMessage.message}`
                                  : ""
                                setReplyContent(originalMessage)
                              }}
                              className="rounded"
                            />
                            <label htmlFor="includeOriginal" className="text-sm text-gray-700">
                              Include original message
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <Input
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                              placeholder="Reply subject"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Type your reply here..."
                              className="min-h-[200px] resize-y"
                              rows={8}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button variant="outline" onClick={() => setReplyMode(false)} disabled={isSending}>
                              Cancel
                            </Button>
                            <Button
                              onClick={sendReply}
                              disabled={isSending || !replyContent.trim()}
                              className="bg-red-600 hover:bg-red-700"
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
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Select a message to read</p>
                    <p className="text-sm">Choose a message from the list to view its contents</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Message</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    placeholder="recipient@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    placeholder="Type your message here..."
                    className="min-h-[200px] resize-y"
                    rows={8}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)} disabled={isSending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={sendNewEmail}
                    disabled={isSending || !composeData.to || !composeData.subject || !composeData.content}
                    className="bg-red-600 hover:bg-red-700"
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
                        Send
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
