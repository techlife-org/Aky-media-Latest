# Instagram Integration Guide

This guide explains how to set up and use the Instagram Graph API integration for automatically posting news articles to Instagram.

## Overview

The Instagram integration automatically posts news articles to your Instagram Business account when they are created through the dashboard. The system:

1. **Creates news article** in the database
2. **Automatically posts to Instagram** if an image is provided
3. **Returns status** of both operations
4. **Handles errors gracefully** - news creation succeeds even if Instagram posting fails

## Setup Instructions

### 1. Facebook Developer Account Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the following products to your app:
   - **Instagram Basic Display**
   - **Instagram Graph API**

### 2. Instagram Business Account

1. Ensure you have an **Instagram Business Account** (not personal)
2. Connect it to a **Facebook Page**
3. The Facebook Page must be associated with your Facebook App

### 3. Get Access Token

#### Option A: Using Graph API Explorer (Recommended for testing)
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate User Access Token with these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
4. Exchange for a long-lived token (60 days)

#### Option B: Using App Review (For production)
1. Submit your app for review with required permissions
2. Get approved for Instagram content publishing
3. Generate long-lived access tokens

### 4. Get Instagram Business Account ID

1. Use Graph API Explorer or make a request to:
   ```
   GET https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN
   ```
2. Find your Facebook Page ID
3. Get Instagram Business Account ID:
   ```
   GET https://graph.facebook.com/v18.0/{page-id}?fields=instagram_business_account&access_token=YOUR_ACCESS_TOKEN
   ```

### 5. Environment Configuration

Add these variables to your `.env` file:

```env
# Instagram Graph API Configuration
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_BUSINESS_ID=your_instagram_business_account_id_here
```

## API Usage

### News Creation with Instagram Posting

**Endpoint:** `POST /api/dashboard/news`

**Request Body:**
```json
{
  \"title\": \"Breaking News: Important Announcement\",
  \"content\": \"<p>This is the full content of the news article...</p>\",
  \"doc_type\": \"news\",
  \"attachment\": {
    \"url\": \"https://example.com/image.jpg\",
    \"type\": \"image\",
    \"name\": \"news-image.jpg\"
  }
}
```

**Response:**
```json
{
  \"id\": \"60f7b3b3b3b3b3b3b3b3b3b3\",
  \"title\": \"Breaking News: Important Announcement\",
  \"content\": \"<p>This is the full content...</p>\",
  \"doc_type\": \"news\",
  \"attachment\": {
    \"url\": \"https://example.com/image.jpg\",
    \"type\": \"image\",
    \"name\": \"news-image.jpg\"
  },
  \"created_at\": \"2023-12-07T10:30:00.000Z\",
  \"updated_at\": \"2023-12-07T10:30:00.000Z\",
  \"views\": 0,
  \"instagramPostStatus\": {
    \"attempted\": true,
    \"success\": true,
    \"error\": null,
    \"postId\": \"18123456789012345\"
  }
}
```

### Instagram Post Status

The `instagramPostStatus` object contains:

- **`attempted`**: Whether Instagram posting was attempted
- **`success`**: Whether the Instagram post was successful
- **`error`**: Error message if posting failed (null if successful)
- **`postId`**: Instagram post ID if successful (null if failed)

### Testing Instagram Integration

#### Test Connection
```bash
GET /api/test-instagram
```

Response:
```json
{
  \"configured\": true,
  \"success\": true,
  \"accountInfo\": {
    \"id\": \"your_instagram_business_id\",
    \"username\": \"your_instagram_username\",
    \"account_type\": \"BUSINESS\"
  },
  \"timestamp\": \"2023-12-07T10:30:00.000Z\"
}
```

#### Test Posting
```bash
POST /api/test-instagram
Content-Type: application/json

{
  \"title\": \"Test Article\",
  \"content\": \"This is a test post\",
  \"imageUrl\": \"https://via.placeholder.com/1080x1080/0066cc/ffffff?text=Test\",
  \"newsId\": \"test-123\"
}
```

## Instagram Post Format

The system automatically formats Instagram posts as follows:

```
📰 [Article Title]

[Article Content - HTML stripped, truncated to ~1800 chars]

🔗 Read full article: https://yourdomain.com/news/[article-id]

#AKYMedia #KanoState #News #AbbaKabirYusuf #Nigeria
```

## Requirements and Limitations

### Image Requirements
- **Required**: An image attachment is required for Instagram posts
- **Format**: JPG, PNG supported
- **Size**: Recommended 1080x1080px (square) or 1080x1350px (portrait)
- **File size**: Max 8MB

### Content Limitations
- **Caption length**: Max ~2200 characters (system truncates to 1800 to be safe)
- **HTML**: Automatically stripped from content
- **Links**: Only one link allowed (automatically added to caption)

### Rate Limits
- **Instagram API**: 200 requests per hour per user
- **Content Publishing**: 25 posts per day per Instagram account

## Error Handling

The system handles errors gracefully:

1. **News creation always succeeds** - even if Instagram posting fails
2. **Instagram errors are logged** but don't affect news creation
3. **Detailed error messages** are returned in the response
4. **Automatic retries** are not implemented (manual retry required)

### Common Errors

1. **\"Instagram service not configured\"**
   - Missing `INSTAGRAM_ACCESS_TOKEN` or `INSTAGRAM_BUSINESS_ID`
   - Solution: Add environment variables

2. **\"Image URL is required\"**
   - No image attachment provided
   - Solution: Include image in attachment object

3. **\"Invalid access token\"**
   - Token expired or invalid
   - Solution: Generate new long-lived token

4. **\"Rate limit exceeded\"**
   - Too many API calls
   - Solution: Wait and retry later

## Security Considerations

1. **Access Token Security**
   - Store tokens securely in environment variables
   - Use long-lived tokens (60 days) instead of short-lived ones
   - Rotate tokens before expiration

2. **Content Validation**
   - System validates image URLs
   - Content is sanitized before posting
   - Malicious content is filtered

3. **Error Information**
   - Sensitive error details are not exposed to clients
   - Full error details are logged server-side only

## Monitoring and Maintenance

### Logs to Monitor
- Instagram posting attempts and results
- API rate limit warnings
- Token expiration warnings
- Failed posts for manual retry

### Regular Maintenance
- **Token Renewal**: Refresh access tokens before expiration
- **Error Review**: Check logs for failed posts
- **Rate Limit Monitoring**: Track API usage
- **Content Review**: Ensure posts meet Instagram guidelines

## Troubleshooting

### Instagram Posts Not Appearing
1. Check if account is Instagram Business (not personal)
2. Verify Facebook Page connection
3. Ensure app has proper permissions
4. Check if content meets Instagram guidelines

### API Errors
1. Test connection with `/api/test-instagram`
2. Verify environment variables are set
3. Check access token validity
4. Review error logs for specific issues

### Performance Issues
1. Monitor API rate limits
2. Check image loading times
3. Review content processing speed
4. Consider implementing queue for high volume

## Support

For additional help:
1. Check Facebook Developer documentation
2. Review Instagram Graph API guides
3. Test with Graph API Explorer
4. Contact Facebook Developer Support for API issues