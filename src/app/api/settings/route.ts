import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    // Exclude private secrets from public storefront endpoint
    const { youpi_webhook_secret, ...publicSettings } = settings;
    return NextResponse.json({ settings: publicSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
