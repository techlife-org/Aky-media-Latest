// types/message.ts
export interface ContactMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived' | 'spam' | 'deleted' | 'sending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  starred?: boolean;
  hasAttachment?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
  repliedAt?: string;
  archivedAt?: string;
  spamAt?: string;
  deletedAt?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    source: 'website' | 'api' | 'mobile' | 'other';
  };
}