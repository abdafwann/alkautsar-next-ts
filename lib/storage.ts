import { v2 as cloudinary } from 'cloudinary';

// Initialize the external storage provider
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

export interface UploadResult {
  publicId: string;
  url: string;
}

/**
 * Standardized storage wrapper for image uploads.
 * If we switch from Cloudinary to AWS S3, Supabase Storage, or Google Cloud Storage,
 * we only need to change the implementation inside this function.
 */
export async function uploadToStorage(buffer: Buffer, folder: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed with no result'));
        } else {
          resolve({
            publicId: result.public_id,
            url: result.secure_url
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Standardized storage wrapper for deleting images.
 */
export async function deleteFromStorage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
