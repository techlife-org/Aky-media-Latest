/**
 * Client-side HEIC/HEIF to JPEG conversion using heic2any
 * This script should be loaded in the browser
 */

declare global {
  interface Window {
    heic2any?: any;
  }
}

// Load the heic2any library dynamically
export function loadHeic2Any(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Not in browser, skip loading
      return resolve();
    }

    if (window.heic2any) {
      // Already loaded
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js';
    script.async = true;
    script.onload = () => {
      if (window.heic2any) {
        resolve();
      } else {
        reject(new Error('Failed to load heic2any'));
      }
    };
    script.onerror = (error) => {
      reject(new Error('Failed to load heic2any script'));
    };
    document.head.appendChild(script);
  });
}

// Convert HEIC/HEIF file to JPEG
// Returns the original file if conversion is not needed or fails
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Skip if not a HEIC/HEIF file
  const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                file.name.toLowerCase().endsWith('.heif') ||
                file.type === 'image/heic' || 
                file.type === 'image/heif';

  if (!isHeic) {
    return file;
  }

  try {
    // Try to load the heic2any library if not already loaded
    if (typeof window !== 'undefined' && !window.heic2any) {
      await loadHeic2Any();
    }

    if (typeof window !== 'undefined' && window.heic2any) {
      // Convert HEIC to JPEG using heic2any
      const jpegBlob = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob;
      
      return new File(
        [jpegBlob],
        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        { type: 'image/jpeg' }
      );
    }
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
  }

  // If conversion fails or heic2any is not available, return the original file
  // The server will try to handle it
  return file;
}
