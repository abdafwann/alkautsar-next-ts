import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((options, callback) => ({
        end: vi.fn(() => {
          callback(null, {
            public_id: 'sample_id',
            secure_url: 'https://res.cloudinary.com/sample.jpg'
          });
        }),
      })),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

describe('Upload Server Action (upload.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated upload requests', async () => {
    const { requireAdmin } = await import('@/lib/auth-guard');
    const { uploadImage } = await import('@/app/actions/upload');

    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'));

    const formData = new FormData();
    const result = await uploadImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  it('should reject upload when no file is provided', async () => {
    const { requireAdmin } = await import('@/lib/auth-guard');
    const { uploadImage } = await import('@/app/actions/upload');

    (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ adminId: '1', role: 'ADMIN' });

    const formData = new FormData();
    const result = await uploadImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('File gambar wajib dipilih');
  });

  it('should reject non-image MIME types', async () => {
    const { requireAdmin } = await import('@/lib/auth-guard');
    const { uploadImage } = await import('@/app/actions/upload');

    (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ adminId: '1', role: 'ADMIN' });

    const fakeExeFile = new File(['binary content'], 'script.exe', { type: 'application/x-msdownload' });
    const formData = new FormData();
    formData.append('file', fakeExeFile);

    const result = await uploadImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Format file tidak didukung');
  });

  it('should allow valid image uploads and return publicId and url', async () => {
    const { requireAdmin } = await import('@/lib/auth-guard');
    const { uploadImage } = await import('@/app/actions/upload');

    (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ adminId: '1', role: 'ADMIN' });

    const validImage = new File(['image bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', validImage);

    const result = await uploadImage(formData);

    expect(result.success).toBe(true);
    expect(result.data?.publicId).toBe('sample_id');
    expect(result.data?.url).toBe('https://res.cloudinary.com/sample.jpg');
  });

  it('should reject unauthorized deleteImage requests', async () => {
    const { requireAdmin } = await import('@/lib/auth-guard');
    const { deleteImage } = await import('@/app/actions/upload');

    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'));

    const result = await deleteImage('sample_id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });
});
