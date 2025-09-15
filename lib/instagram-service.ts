/**
 * Instagram Graph API Service
 * Handles posting content to Instagram Business accounts
 */

interface InstagramMediaResponse {
  id: string;
}

interface InstagramPublishResponse {
  id: string;
}

interface InstagramPostData {
  title: string;
  content: string;
  imageUrl: string;
  newsId: string;
  baseUrl: string;
}

export class InstagramService {
  private accessToken: string;
  private businessAccountId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ID || '';
    
    if (!this.accessToken || !this.businessAccountId) {
      console.warn('Instagram credentials not configured. Instagram posting will be disabled.');
    }
  }

  /**
   * Check if Instagram service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.businessAccountId);
  }

  /**
   * Create Instagram media object (Step 1)
   */
  private async createMedia(postData: InstagramPostData): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Instagram service not configured');
    }

    // Prepare caption with title, content, and link
    const caption = this.formatCaption(postData);
    
    const url = `${this.baseUrl}/${this.businessAccountId}/media`;
    
    const params = new URLSearchParams({
      image_url: postData.imageUrl,
      caption: caption,
      access_token: this.accessToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create Instagram media: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    const data: InstagramMediaResponse = await response.json();
    return data.id;
  }

  /**
   * Publish Instagram media (Step 2)
   */
  private async publishMedia(creationId: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Instagram service not configured');
    }

    const url = `${this.baseUrl}/${this.businessAccountId}/media_publish`;
    
    const params = new URLSearchParams({
      creation_id: creationId,
      access_token: this.accessToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to publish Instagram media: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    const data: InstagramPublishResponse = await response.json();
    return data.id;
  }

  /**
   * Format caption for Instagram post
   */
  private formatCaption(postData: InstagramPostData): string {
    // Clean content by removing HTML tags and limiting length
    const cleanContent = this.stripHtml(postData.content);
    const truncatedContent = this.truncateText(cleanContent, 1800); // Instagram has ~2200 char limit
    
    const newsLink = `${postData.baseUrl}/news/${postData.newsId}`;
    
    // Format caption with title, content, and link
    let caption = `📰 ${postData.title}\n\n`;
    caption += `${truncatedContent}\n\n`;
    caption += `🔗 Read full article: ${newsLink}\n\n`;
    caption += `#AKYMedia #KanoState #News #AbbaKabirYusuf #Nigeria`;
    
    return caption;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Find the last space before the limit to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Post content to Instagram (combines both steps)
   */
  async postToInstagram(postData: InstagramPostData): Promise<{
    success: boolean;
    postId?: string;
    error?: string;
  }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Instagram service not configured. Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID.',
        };
      }

      // Validate required data
      if (!postData.imageUrl) {
        return {
          success: false,
          error: 'Image URL is required for Instagram posts',
        };
      }

      if (!postData.title || !postData.content) {
        return {
          success: false,
          error: 'Title and content are required for Instagram posts',
        };
      }

      console.log('Creating Instagram media object...');
      const creationId = await this.createMedia(postData);
      
      console.log('Publishing Instagram media...', { creationId });
      const postId = await this.publishMedia(creationId);
      
      console.log('Instagram post published successfully:', { postId });
      
      return {
        success: true,
        postId,
      };
    } catch (error) {
      console.error('Instagram posting failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Test Instagram API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Instagram service not configured',
        };
      }

      const url = `${this.baseUrl}/${this.businessAccountId}?fields=id,username,account_type&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `API test failed: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`,
        };
      }

      const accountInfo = await response.json();
      
      return {
        success: true,
        accountInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const instagramService = new InstagramService();