import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateSiteSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
