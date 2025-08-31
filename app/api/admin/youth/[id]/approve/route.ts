import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid youth ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update youth approval status
    const result = await db.collection('youth').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'approved',
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: 'admin', // In a real app, this would be the admin's ID
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Youth not found' },
        { status: 404 }
      );
    }

    // Get the updated youth data for notifications
    const youth = await db.collection('youth').findOne({ _id: new ObjectId(id) });

    if (youth) {
      // Send approval notification via email, SMS, and WhatsApp
      console.log(`✅ User Approved: ${youth.fullName} (${youth.uniqueId})`);
      console.log(`📧 Sending approval notification to: ${youth.email}`);
      console.log(`📱 Sending SMS to: ${youth.phone}`);
      
      // Notification content that would be sent:
      const notificationMessage = `
🎉 CONGRATULATIONS! Your User Program Registration has been APPROVED!

Dear ${youth.fullName},

We're excited to welcome you to His Excellency's User Program!

🔑 Your Login Details:
• Unique ID: ${youth.uniqueId}
• Password: [Use the password you created during registration]

🌐 Access Your Dashboard:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/youth-login

📚 What's Next:
• Login to access programs
• Explore music and video content
• Apply for available programs
• Stay updated with notifications

Welcome to the future of Kano youth empowerment!

Best regards,
His Excellency's User Program Team
      `;
      
      console.log('📄 Notification Content:', notificationMessage);
      
      // TODO: Implement actual email/SMS sending here
      // await sendEmail(youth.email, "🎉 User Program Registration Approved!", notificationMessage);
      // await sendSMS(youth.phone, notificationMessage);
      // await sendWhatsApp(youth.phone, notificationMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'User approved successfully'
    });

  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}