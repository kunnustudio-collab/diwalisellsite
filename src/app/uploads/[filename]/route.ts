import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    
    // Check multiple potential locations (public/uploads and data/uploads)
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'uploads', sanitizedFilename),
      path.join(process.cwd(), 'data', 'uploads', sanitizedFilename),
      path.join(process.cwd(), 'uploads', sanitizedFilename),
    ];

    let targetPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        targetPath = p;
        break;
      }
    }

    if (!targetPath) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(targetPath);
    
    // Determine content type by extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
