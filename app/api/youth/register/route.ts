import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Youth, KANO_LGAS, OCCUPATION_OPTIONS } from '@/models/Youth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to generate unique ID
async function generateUniqueId(lgaCode: string, db: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `KANO-${lgaCode}-${year}`;
  
  // Get the count of registrations for this LGA in current year
  const count = await db.collection('youth').countDocuments({
    lgaCode: lgaCode,
    registeredAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`)
    }
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${sequence}`;
}

// Enhanced NIN validation function according to Nigerian NIN standards
function validateNIN(nin: string): boolean {
  // Remove any spaces or special characters
  const cleanNIN = nin.replace(/\s+/g, '');
  
  // Check if it's exactly 11 digits
  if (!/^\d{11}$/.test(cleanNIN)) {
    return false;
  }
  
  // Additional NIN validation rules for Nigerian NIN
  // NIN should not start with 0
  if (cleanNIN.startsWith('0')) {
    return false;
  }
  
  // Check for obvious invalid patterns (all same digits, sequential)
  const allSameDigits = /^(.)\1{10}$/.test(cleanNIN);
  const sequential = /^(0123456789|1234567890|9876543210|0987654321)/.test(cleanNIN);
  
  if (allSameDigits || sequential) {
    return false;
  }
  
  return true;
}

// Helper function to validate phone number
function validatePhone(phone: string): boolean {
  // Nigerian phone number validation (11 digits starting with 0 or 13 digits starting with +234)
  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const ninNumber = formData.get('ninNumber') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const lga = formData.get('lga') as string;
    const occupation = formData.get('occupation') as string;
    const ninDocument = formData.get('ninDocument') as File;

    // Validate required fields
    if (!fullName || !email || !phone || !dateOfBirth || !ninNumber || !password || !confirmPassword || !lga || !occupation || !ninDocument) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Validate full name format
    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      return NextResponse.json(
        { error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use Nigerian format (e.g., 08012345678 or +2348012345678)' },
        { status: 400 }
      );
    }

    // Enhanced NIN validation
    if (!validateNIN(ninNumber)) {
      if (!/^\d{11}$/.test(ninNumber.replace(/\s+/g, ''))) {
        return NextResponse.json(
          { error: 'Invalid NIN format. NIN must be exactly 11 digits' },
          { status: 400 }
        );
      } else if (ninNumber.replace(/\s+/g, '').startsWith('0')) {
        return NextResponse.json(
          { error: 'Invalid NIN format. NIN cannot start with 0' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Invalid NIN format. Please enter a valid Nigerian NIN' },
          { status: 400 }
        );
      }
    }

    // Validate LGA
    if (!(lga in KANO_LGAS)) {
      return NextResponse.json(
        { error: 'Invalid LGA selected' },
        { status: 400 }
      );
    }

    // Validate occupation
    if (!OCCUPATION_OPTIONS.includes(occupation as any)) {
      return NextResponse.json(
        { error: 'Invalid occupation selected' },
        { status: 400 }
      );
    }

    // Validate date of birth and calculate age
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth' },
        { status: 400 }
      );
    }

    const age = calculateAge(birthDate);
    if (age < 15 || age > 35) {
      return NextResponse.json(
        { error: 'Age must be between 15 and 35 years to qualify for the youth program' },
        { status: 400 }
      );
    }

    // Validate file upload
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(ninDocument.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    if (ninDocument.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if email already exists
    const existingEmail = await db.collection('youth').findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email address is already registered' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingPhone = await db.collection('youth').findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number is already registered' },
        { status: 400 }
      );
    }

    // Check if NIN already exists
    const existingNIN = await db.collection('youth').findOne({ ninNumber });
    if (existingNIN) {
      return NextResponse.json(
        { error: 'NIN is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Upload NIN document to Cloudinary
    const { url, public_id } = await uploadToCloudinary(ninDocument);

    // Generate unique ID
    const lgaCode = KANO_LGAS[lga as keyof typeof KANO_LGAS];
    const uniqueId = await generateUniqueId(lgaCode, db);

    // Get client IP and user agent for metadata
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create youth record
    const youth = {
      _id: new ObjectId(),
      fullName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth: new Date(dateOfBirth),
      age: age,
      ninNumber,
      password: hashedPassword,
      ninDocument: {
        url,
        public_id,
        filename: ninDocument.name,
        uploadedAt: new Date()
      },
      lga,
      lgaCode,
      occupation,
      uniqueId,
      status: 'pending',
      approvalStatus: 'pending' as const,
      onboardingCompleted: false,
      cvUploaded: false,
      dashboardAccess: false,
      registeredAt: new Date(),
      emailVerified: false,
      phoneVerified: false,
      loginAttempts: 0,
      metadata: {
        ip: clientIP,
        userAgent: userAgent,
        location: 'Unknown'
      },
      notifications: {
        email: true,
        sms: true,
        whatsapp: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert youth into database
    const result = await db.collection('youth').insertOne(youth);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: 'Failed to register youth' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email, SMS, and WhatsApp message
    // This would be implemented using your notification service

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        uniqueId,
        fullName,
        lga,
        email: email.toLowerCase(),
        phone,
        registeredAt: youth.registeredAt
      }
    });

  } catch (error) {
    console.error('Error registering youth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}