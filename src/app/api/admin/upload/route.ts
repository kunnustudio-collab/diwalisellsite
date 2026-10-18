import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const uploadType = (formData.get('type') as string) || 'product';

    // Support both multiple files ('files') and single file ('file')
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const filesToProcess: File[] = [];
    if (rawFiles && rawFiles.length > 0) {
      filesToProcess.push(...rawFiles.filter((f) => f && f.size > 0));
    } else if (singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    // Limit to max 10 files per request
    if (filesToProcess.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images can be uploaded simultaneously.' },
        { status: 400 }
      );
    }

    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const savedUrls: string[] = [];

    for (const file of filesToProcess) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            error: `Invalid file type for "${file.name}". Please upload PNG, JPG, JPEG or WebP images only.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds maximum allowed limit of 8MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeExt = path.extname(file.name).toLowerCase() || (file.type === 'image/png' ? '.png' : '.jpg');
      const prefix = uploadType === 'qr' ? 'upi-qr' : 'product';
      const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${safeExt}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      savedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      url: savedUrls[0],
      urls: savedUrls,
      count: savedUrls.length,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}
