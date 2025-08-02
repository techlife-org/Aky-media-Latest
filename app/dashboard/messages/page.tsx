"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Calendar, Search, Eye, Trash2, MessageSquare, User, Clock, Send, Archive } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"
import type { ContactMessage } from "@/types/message"
import { Textarea } from "@/components/ui/textarea"

// Dynamically import ReactQuill to avoid SSR issues
// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
// import "react-quill/dist/quill.snow.css"

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyMode, setReplyMode] = useState(false)
  const [replySubject, setReplySubject] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  // const quillRef = useRef<any>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/dashboard/messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/dashboard/messages/${messageId}/read`, {
        method: "PATCH",
      })
      fetchMessages()
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const archiveMessage = async (messageId: string) => {
    try {
      await fetch(`/api/dashboard/messages/${messageId}/archive`, {
        method: "PATCH",
      })
      toast({
        title: "Success",
        description: "Message archived successfully",
      })
      fetchMessages()
      setSelectedMessage(null)
    } catch (error) {
      console.error("Error archiving message:", error)
      toast({
        title: "Error",
        description: "Failed to archive message",
        variant: "destructive",
      })
    }
  }

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message)
    setReplySubject(`Re: ${message.subject}`)
    setReplyContent(
      `\n\n----------------------------------------\nOriginal message from ${message.firstName} ${message.lastName} (${message.email}):\n\n${message.message}`,
    )
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

      // Mark as replied in the database
      await fetch(`/api/dashboard/messages/${selectedMessage._id}/replied`, {
        method: "PATCH",
      })

      toast({
        title: "Success",
        description: "Reply sent successfully",
      })

      // Reset form and update messages
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

  const deleteMessage = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await fetch(`/api/dashboard/messages/${messageId}`, {
          method: "DELETE",
        })
        fetchMessages()
        setSelectedMessage(null)
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting message:", error)
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive",
        })
      }
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || message.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-2">Manage and respond to contact form submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Messages</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {messages.filter((m) => m.status === "new").length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read Messages</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {messages.filter((m) => m.status === "read").length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Replied</p>
                  <p className="text-3xl font-bold text-green-600">
                    {messages.filter((m) => m.status === "replied").length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {messages.filter((m) => m.status === "archived").length}
                  </p>
                </div>
                <Archive className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Messages List */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card
                key={message._id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?._id === message._id ? "ring-2 ring-red-500" : ""
                } ${message.status === "new" ? "border-l-4 border-l-blue-500" : ""}`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {message.firstName} {message.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{message.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{message.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                    {message.mobile && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {message.mobile}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage && (
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Message Details</CardTitle>
                  <div className="flex gap-2">
                    {selectedMessage.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(selectedMessage._id)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => archiveMessage(selectedMessage._id)}>
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMessage(selectedMessage._id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedMessage.email}</span>
                    </div>
                    {selectedMessage.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedMessage.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleReply(selectedMessage)} className="bg-red-600 hover:bg-red-700">
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                </div>

                {/* Reply Form */}
                {replyMode && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Send Reply</h4>
                    <div className="space-y-4">
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
                          value={replyContent.replace(/<[^>]*>/g, "")} // Strip HTML tags for display
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type your reply here..."
                          className="min-h-[200px] resize-y"
                          rows={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Plain text message. HTML formatting will be applied automatically in the email.
                        </p>
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
