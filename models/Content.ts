import { ObjectId } from 'mongodb';

export interface YouthProgram {
  _id?: ObjectId;
  title: string;
  description: string;
  category: 'skills' | 'entrepreneurship' | 'education' | 'health' | 'sports' | 'arts' | 'technology' | 'agriculture';
  targetOccupations: string[]; // Array of occupation types this program targets
  duration: string; // e.g., "3 months", "6 weeks"
  location: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: Date;
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'active' | 'inactive' | 'completed' | 'upcoming';
  imageUrl?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Music {
  _id?: ObjectId;
  title: string;
  artist: string;
  description?: string;
  genre: 'afrobeat' | 'hip-hop' | 'gospel' | 'traditional' | 'pop' | 'reggae' | 'other';
  audioUrl: string;
  audioPublicId: string;
  duration: number; // in seconds
  coverImageUrl?: string;
  coverImagePublicId?: string;
  lyrics?: string;
  releaseDate?: Date;
  tags: string[];
  isExplicit: boolean;
  status: 'active' | 'inactive';
  playCount: number;
  likes: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  _id?: ObjectId;
  title: string;
  description: string;
  category: 'educational' | 'entertainment' | 'motivational' | 'skills' | 'news' | 'events' | 'testimonials';
  videoUrl: string;
  videoPublicId: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  duration: number; // in seconds
  isReel: boolean; // true for short-form content (reels)
  tags: string[];
  status: 'active' | 'inactive';
  viewCount: number;
  likes: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramApplication {
  _id?: ObjectId;
  programId: ObjectId;
  youthId: ObjectId;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  motivation: string;
  additionalInfo?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentInteraction {
  _id?: ObjectId;
  youthId: ObjectId;
  contentType: 'music' | 'video' | 'program';
  contentId: ObjectId;
  interactionType: 'view' | 'like' | 'share' | 'comment' | 'apply';
  metadata?: {
    watchTime?: number; // for videos
    playTime?: number; // for music
    deviceType?: string;
    location?: string;
  };
  createdAt: Date;
}

// Content categories for filtering
export const PROGRAM_CATEGORIES = [
  'skills',
  'entrepreneurship', 
  'education',
  'health',
  'sports',
  'arts',
  'technology',
  'agriculture'
] as const;

export const MUSIC_GENRES = [
  'afrobeat',
  'hip-hop',
  'gospel',
  'traditional',
  'pop',
  'reggae',
  'other'
] as const;

export const VIDEO_CATEGORIES = [
  'educational',
  'entertainment',
  'motivational',
  'skills',
  'news',
  'events',
  'testimonials'
] as const;

export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];
export type MusicGenre = typeof MUSIC_GENRES[number];
export type VideoCategory = typeof VIDEO_CATEGORIES[number];