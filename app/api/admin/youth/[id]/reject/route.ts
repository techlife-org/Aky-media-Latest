import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { reason } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid youth ID' },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update youth approval status
    const result = await db.collection('youth').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'rejected',
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: 'admin', // In a real app, this would be the admin's ID
          rejectionReason: reason.trim(),
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
      // Send rejection notification via email, SMS, and WhatsApp
      console.log(`❌ Youth Rejected: ${youth.fullName} (${youth.uniqueId})`);
      console.log(`📧 Sending rejection notification to: ${youth.email}`);
      console.log(`📱 Sending SMS to: ${youth.phone}`);
      
      // Notification content that would be sent:
      const notificationMessage = `
Youth Program Registration Update

Dear ${youth.fullName},

We regret to inform you that your registration for His Excellency's Youth Program has been rejected.

📄 Reason for Rejection:
${reason}

📞 Need Help?
If you believe this is an error or need clarification, please contact our support team:
• Email: support@abbakabiryusuf.com
• Phone: +234 XXX XXX XXXX

🔄 Reapplication:
You may be eligible to reapply after addressing the issues mentioned above.

Thank you for your interest in the Youth Program.

Best regards,
His Excellency's Youth Program Team
      `;
      
      console.log('📄 Rejection Notification Content:', notificationMessage);
      
      // TODO: Implement actual email/SMS sending here
      // await sendEmail(youth.email, "Youth Program Registration Update", notificationMessage);
      // await sendSMS(youth.phone, notificationMessage);
      // await sendWhatsApp(youth.phone, notificationMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Youth rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting youth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}