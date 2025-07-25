import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  status: 'completed' | 'ongoing' | 'determined';
  progress: number;
  category: string;
  date: string;
  location: string;
  impact: string;
  details: string[];
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['completed', 'ongoing', 'determined'],
      default: 'ongoing'
    },
    progress: { 
      type: Number, 
      required: true, 
      min: 0, 
      max: 100,
      default: 0 
    },
    category: { 
      type: String, 
      required: true,
      enum: ['infrastructure', 'education', 'healthcare', 'finance', 'agriculture', 'environment', 'security']
    },
    date: { type: String, required: true },
    location: { type: String, required: true },
    impact: { type: String, required: true },
    details: { type: [String], required: true },
    icon: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
