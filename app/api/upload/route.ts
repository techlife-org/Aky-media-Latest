import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file extensions and their MIME types
const ALLOWED_TYPES = {
  // Standard image formats
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  // Apple formats
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  // Document formats
  '.pdf': 'application/pdf',
  // Fallback for iOS HEIC files that might not report correct MIME type
  '': 'image/jpeg', // Fallback for files with no extension
} as const;

// Helper to get file extension with dot (e.g., '.jpg')
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return ''; // No extension found
  return filename.slice(lastDot).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Get file info
    const fileName = file.name.toLowerCase();
    const fileExtension = getFileExtension(fileName);
    const mimeType = file.type.toLowerCase();

    // Check if extension is allowed (allow empty extension as fallback)
    const allowedExtensions = Object.keys(ALLOWED_TYPES).filter(ext => ext);
    if (fileExtension && !(fileExtension in ALLOWED_TYPES)) {
      return NextResponse.json(
        { 
          error: `Unsupported file extension "${fileExtension}". Allowed extensions: ${allowedExtensions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Get the expected MIME type for this extension (default to the file's MIME type if not found)
    const expectedMimeType = fileExtension ? 
      (ALLOWED_TYPES[fileExtension as keyof typeof ALLOWED_TYPES] || mimeType) : 
      mimeType;
    
    // For HEIC/HEIF files, we'll convert them to JPEG
    const isHeic = ['.heic', '.heif'].includes(fileExtension) || 
                  ['image/heic', 'image/heif'].includes(mimeType);
    
    // If it's a HEIC/HEIF file, we'll convert it to JPEG
    let fileToUpload = file;
    if (isHeic) {
      try {
        // Convert HEIC to JPEG using a simple approach (client-side conversion is better)
        // For now, we'll just rename the extension and let Cloudinary handle it
        fileToUpload = new File([file], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
          type: 'image/jpeg',
        });
      } catch (error) {
        console.error('Error converting HEIC file:', error);
        return NextResponse.json(
          { error: 'Failed to process HEIC/HEIF image. Please convert it to JPEG/PNG format.' },
          { status: 400 }
        );
      }
    }

    // Upload to Cloudinary
    const { url, public_id } = await uploadToCloudinary(fileToUpload);

    // Use the expected MIME type from our allowed types
    const responseMimeType = ALLOWED_TYPES[fileExtension as keyof typeof ALLOWED_TYPES];
    
    return NextResponse.json({
      url,
      public_id,
      filename: file.name,
      size: file.size,
      type: responseMimeType,
    });
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
// This is important for file uploads from the client
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
