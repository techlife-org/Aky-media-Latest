import { ObjectId } from 'mongodb';

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  phone?: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'terminated';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: string;
  lastActive?: Date;
  emailVerified: boolean;
  phoneVerified?: boolean;
  welcomeEmailSent?: boolean;
  welcomeEmailSentAt?: Date;
  welcomeSMSSent?: boolean;
  welcomeSMSSentAt?: Date;
  welcomeWhatsAppSent?: boolean;
  welcomeWhatsAppSentAt?: Date;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
  };
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  terminated: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  emailVerified: number;
  phoneVerified: number;
}

export interface SubscriptionRequest {
  email: string;
  phone?: string;
  name?: string;
  source?: string;
}

export interface SubscriberAction {
  id: string;
  subscriberId: string;
  action: 'view' | 'message' | 'status_change' | 'email_sent' | 'sms_sent' | 'whatsapp_sent';
  details?: any;
  performedBy: string;
  performedAt: Date;
}