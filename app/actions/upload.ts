'use server';

import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth-guard';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

// Guard against malicious executable uploads and memory exhaustion
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface CloudinaryUploadResult {
  publicId: string;
  url: string;
}

interface UploadResponse {
  success: boolean;
  data?: CloudinaryUploadResult;
  error?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  try {
    // Prevent unauthenticated callers from consuming Cloudinary quota or storing arbitrary files
    await requireAdmin();

    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return { success: false, error: 'File gambar wajib dipilih' };
    }

    // Verify format before allocating memory buffer
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Format file tidak didukung. Harap unggah gambar berekstensi JPEG, PNG, WEBP, atau GIF.'
      };
    }

    // Protect server memory from OOM crashes when processing large buffers
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'Ukuran gambar melebihi batas maksimal 5 MB.'
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream upload directly to isolated folder for easier asset lifecycle management
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'alkautsar/uploads' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    if (!result?.public_id || !result?.secure_url) {
      return { success: false, error: 'Gagal mendapatkan respon dari server penyimpanan gambar' };
    }

    return {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url
      }
    };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return { success: false, error: error.message || 'Gagal mengunggah gambar' };
  }
}

export async function deleteImage(publicId: string) {
  try {
    // Only authorized admins may delete assets from cloud storage
    await requireAdmin();

    if (!publicId?.trim()) {
      return { success: false, error: 'Public ID gambar tidak valid' };
    }

    await cloudinary.uploader.destroy(publicId.trim());
    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    return { success: false, error: error.message || 'Gagal menghapus gambar' };
  }
}
