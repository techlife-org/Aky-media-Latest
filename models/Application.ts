import { ObjectId } from 'mongodb';

export interface Application {
  _id?: ObjectId;
  programId: ObjectId;
  youthId: ObjectId;
  
  // Auto-filled from youth profile
  fullName: string;
  email: string;
  phone: string;
  uniqueId: string;
  
  // Application documents
  cv?: {
    url: string;
    public_id: string;
    filename: string;
    uploadedAt: Date;
  };
  additionalDocuments?: {
    url: string;
    public_id: string;
    filename: string;
    type: string; // 'cover_letter', 'certificate', 'portfolio', etc.
    uploadedAt: Date;
  }[];
  
  // Custom question responses
  customResponses?: {
    question: string;
    answer: string;
  }[];
  
  // Application status
  status: 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  adminNotes?: string;
  
  // Timestamps
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  statusUpdatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationRequest {
  programId: string;
  customResponses?: {
    question: string;
    answer: string;
  }[];
}

export interface ApplicationResponse {
  success: boolean;
  data?: Application;
  message?: string;
}