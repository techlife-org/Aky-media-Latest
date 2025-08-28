# Cloudinary Setup Guide

This guide will help you set up Cloudinary for handling image uploads in the application.

## Prerequisites

1. A Cloudinary account (sign up at [https://cloudinary.com/](https://cloudinary.com/))
2. Your Cloudinary API credentials

## Setting Up Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the placeholder values with your actual Cloudinary credentials:

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (found in your Cloudinary dashboard)
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

## Verifying the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   pnpm dev
   ```

2. Try uploading an image through the application. It should now be uploaded to your Cloudinary account.

## Troubleshooting

1. **Invalid Credentials**
   - Double-check that your Cloudinary credentials are correct
   - Ensure there are no extra spaces or special characters

2. **Upload Failures**
   - Check the browser console for any error messages
   - Verify that your Cloudinary account has sufficient permissions
   - Ensure the file size is within the 5MB limit

3. **CORS Issues**
   - Make sure your Cloudinary account allows requests from your domain
   - Check the browser's network tab for CORS-related errors

## Security Notes

- Never commit your `.env.local` file to version control
- Add `.env.local` to your `.gitignore` file if it's not already there
- Use environment-specific configurations for production deployments
