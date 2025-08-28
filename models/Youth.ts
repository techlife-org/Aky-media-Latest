import { ObjectId } from 'mongodb';

export interface Youth {
  _id?: ObjectId;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  age: number;
  ninNumber: string;
  password: string; // Hashed password
  ninDocument: {
    url: string;
    public_id: string;
    filename: string;
    uploadedAt: Date;
  };
  profilePicture?: {
    url: string;
    public_id: string;
    filename: string;
    uploadedAt: Date;
  };
  cv?: {
    url: string;
    public_id: string;
    filename: string;
    uploadedAt: Date;
  };
  lga: string;
  lgaCode: string;
  occupation: string;
  uniqueId: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'terminated';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  cvUploaded: boolean;
  cvUploadedAt?: Date;
  dashboardAccess: boolean;
  registeredAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActive?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  notifications?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface YouthStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  terminated: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  byLGA: { [key: string]: number };
  byOccupation: { [key: string]: number };
  ageDistribution: {
    '15-20': number;
    '21-25': number;
    '26-30': number;
    '31-35': number;
  };
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ninNumber: string;
  password: string;
  confirmPassword: string;
  ninDocument: File;
  lga: string;
  occupation: string;
}

export interface YouthLoginRequest {
  uniqueId: string;
  password: string;
}

export interface YouthAuthResponse {
  success: boolean;
  youth?: Omit<Youth, 'password'>;
  token?: string;
  message?: string;
}

// Kano LGAs with their codes
export const KANO_LGAS = {
  'Ajingi': 'AJG',
  'Albasu': 'ALB',
  'Bagwai': 'BGW',
  'Bebeji': 'BBJ',
  'Bichi': 'BCH',
  'Bunkure': 'BKR',
  'Dala': 'DLA',
  'Dambatta': 'DMB',
  'Dawakin Kudu': 'DWK',
  'Dawakin Tofa': 'DWT',
  'Doguwa': 'DGW',
  'Fagge': 'FGG',
  'Gabasawa': 'GBS',
  'Garko': 'GRK',
  'Garun Mallam': 'GRM',
  'Gaya': 'GYA',
  'Gezawa': 'GZW',
  'Gwale': 'GWL',
  'Gwarzo': 'GWZ',
  'Kabo': 'KBO',
  'Kano Municipal': 'KMC',
  'Karaye': 'KRY',
  'Kibiya': 'KBY',
  'Kiru': 'KRU',
  'Kumbotso': 'KBT',
  'Kunchi': 'KNC',
  'Kura': 'KRA',
  'Madobi': 'MDB',
  'Makoda': 'MKD',
  'Minjibir': 'MJB',
  'Nasarawa': 'NSW',
  'Rano': 'RNO',
  'Rimin Gado': 'RMG',
  'Rogo': 'RGO',
  'Shanono': 'SHN',
  'Sumaila': 'SML',
  'Takai': 'TKI',
  'Tarauni': 'TRN',
  'Tofa': 'TFA',
  'Tsanyawa': 'TSN',
  'Tudun Wada': 'TDW',
  'Ungogo': 'UGG',
  'Warawa': 'WRW',
  'Wudil': 'WDL'
} as const;

export const OCCUPATION_OPTIONS = [
  'Student',
  'Entrepreneur',
  'Job Seeker',
  'NYSC',
  'Employed',
  'Self-Employed',
  'Unemployed',
  'Artisan',
  'Trader',
  'Farmer',
  'Civil Servant',
  'Other'
] as const;

export type LGAName = keyof typeof KANO_LGAS;
export type LGACode = typeof KANO_LGAS[LGAName];
export type OccupationType = typeof OCCUPATION_OPTIONS[number];