import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { MongoClient } from 'mongodb'

// Initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI || '')

// Create a transporter for NodeMailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function POST(request: Request) {
    try {
        const { newsId } = await request.json()

        if (!newsId) {
            return NextResponse.json(
                { error: 'News ID is required' },
                { status: 400 }
            )
        }

        // Connect to MongoDB
        await client.connect()
        const db = client.db(process.env.MONGODB_DB)

        // Fetch the news article
        const news = await db.collection('news').findOne({ _id: newsId })
        if (!news) {
            return NextResponse.json(
                { error: 'News article not found' },
                { status: 404 }
            )
        }

        // Fetch subscribers
        const subscribers = await db.collection('subscribers').find({}).toArray()
        if (subscribers.length === 0) {
            return NextResponse.json(
                { message: 'No subscribers found' },
                { status: 200 }
            )
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const newsUrl = `${baseUrl}/news/${news._id}`

        // Create email template
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .news-image { max-width: 100%; height: auto; margin-bottom: 20px; }
          .button {
            display: inline-block; 
            padding: 10px 20px; 
            margin: 20px 0; 
            background-color: #2563eb; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${news.title}</h1>
        </div>
        <div class="content">
          ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" class="news-image">` : ''}
          <p>${news.content.substring(0, 200)}...</p>
          <a href="${newsUrl}" class="button">Read Full Article</a>
        </div>
        <div class="footer">
          <p>You're receiving this email because you subscribed to our newsletter.</p>
          <p><a href="${baseUrl}/unsubscribe">Unsubscribe</a> | <a href="${baseUrl}">Visit Website</a></p>
        </div>
      </body>
      </html>
    `

        // Send emails to all subscribers
        const sendPromises = subscribers.map(subscriber => {
            return transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'Your Site Name'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: news.title,
                html: emailHtml,
            })
        })

        await Promise.all(sendPromises)

        return NextResponse.json({
            message: `Newsletter sent successfully to ${subscribers.length} subscribers`,
        })

    } catch (error) {
        console.error('Error sending newsletter:', error)
        return NextResponse.json(
            { error: 'Failed to send newsletter' },
            { status: 500 }
        )
    } finally {
        await client.close()
    }
}
