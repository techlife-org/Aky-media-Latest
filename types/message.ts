export interface ContactMessage {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    mobile?: string // For backward compatibility
    subject: string
    message: string
    status: "new" | "read" | "replied" | "archived"
    createdAt: string
    updatedAt: string
    readAt?: string
    repliedAt?: string
  }
  
  export interface MessageReplyData {
    to: string
    subject: string
    html: string
    replyTo?: string
    recipientName?: string
  }
  