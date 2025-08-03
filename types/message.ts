export interface ContactMessage {
  _id: string
  firstName: string
  lastName: string
  email: string
  mobile?: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "archived" | "spam" | "deleted" | "sending"
  starred?: boolean
  hasAttachment?: boolean
  createdAt: string
  updatedAt?: string
  readAt?: string
  repliedAt?: string
  archivedAt?: string
  deletedAt?: string
  spamMarkedAt?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  isDefault?: boolean
}

export interface EmailStats {
  total: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
}

export interface SentEmail {
  _id: string
  to: string
  subject: string
  content: string
  type: "new" | "reply"
  originalMessageId?: string
  status: "sent" | "delivered" | "bounced"
  messageId: string
  sentAt: string
  createdAt: string
}
