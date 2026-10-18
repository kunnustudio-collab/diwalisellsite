import { NextResponse } from 'next/server';
import { getFAQs } from '@/lib/db';

export async function GET() {
  try {
    const faqs = await getFAQs(true);
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
