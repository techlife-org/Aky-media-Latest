import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Debug log environment variables (don't log actual values in production)
console.log('Cloudinary Config - Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('Cloudinary Config - API Key:', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('Cloudinary Config - API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Configure Cloudinary with environment variables
const configureCloudinary = () => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Missing required Cloudinary environment variables');
    }

    const config = {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    };

    console.log('Initializing Cloudinary with config:', { 
      ...config, 
      api_secret: '***' // Don't log the actual secret
    });

    cloudinary.config(config);
    return cloudinary;
  } catch (error) {
    console.error('Error configuring Cloudinary:', error);
    throw error;
  }
};

// Initialize Cloudinary
const cloudinaryClient = configureCloudinary();

interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

export async function uploadToCloudinary(file: File | Buffer): Promise<CloudinaryUploadResult> {
  console.log('Starting Cloudinary upload...');
  
  try {
    // Convert File to Buffer if needed
    let buffer: Buffer;
    let fileName = 'buffer';
    
    if (file instanceof File) {
      console.log('Processing File object:', file.name, 'size:', file.size, 'type:', file.type);
      buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
    } else {
      console.log('Processing Buffer object');
      buffer = file;
    }
    
    console.log('File size:', buffer.length, 'bytes');
    
    // Convert buffer to base64
    const base64String = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary using promise-based API
    console.log('Uploading to Cloudinary...');
    
    const uploadOptions = {
      folder: 'aky-achievements',
      resource_type: 'auto' as const,  // This tells TypeScript it's a literal type
      filename_override: fileName,
      use_filename: true,
      unique_filename: false
    };
    
    console.log('Upload options:', uploadOptions);
    
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinaryClient.uploader.upload(
        base64String,
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error details:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              stack: error.stack
            });
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          
          if (!result?.secure_url) {
            console.error('No URL returned from Cloudinary. Result:', result);
            return reject(new Error('No URL returned from Cloudinary'));
          }
          
          console.log('Upload successful:', {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            created_at: result.created_at
          });
          
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    throw new Error(error instanceof Error ? error.message : 'Failed to upload file to Cloudinary');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinaryClient.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

export default cloudinaryClient;
