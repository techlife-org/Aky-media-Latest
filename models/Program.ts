import { ObjectId } from 'mongodb';

export interface Program {
  _id?: ObjectId;
  title: string;
  description: string;
  category: string;
  targetOccupations: string[];
  duration: string;
  location: string;
  requirements: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'completed';
  imageUrl?: string;
  currentParticipants: number;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  
  // Application settings
  applicationRequired: boolean;
  applicationDeadline?: Date;
  requiredDocuments: ('cv' | 'cover_letter' | 'certificates' | 'portfolio' | 'other')[];
  customQuestions?: {
    question: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[]; // For select type
    required: boolean;
  }[];
  
  // Application statistics
  totalApplications: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramRequest {
  title: string;
  description: string;
  category: string;
  targetOccupations: string[];
  duration: string;
  location: string;
  requirements: string[];
  benefits: string[];
  status?: 'active' | 'inactive' | 'completed';
  imageUrl?: string;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
  applicationRequired: boolean;
  applicationDeadline?: string;
  requiredDocuments: ('cv' | 'cover_letter' | 'certificates' | 'portfolio' | 'other')[];
  customQuestions?: {
    question: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    required: boolean;
  }[];
}

export interface ProgramResponse {
  success: boolean;
  data?: Program;
  message?: string;
}