import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getFAQs, saveFAQ } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const faqs = await getFAQs(false);
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.question?.trim() || !body.answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const saved = await saveFAQ(body);
    return NextResponse.json({ success: true, faq: saved });
  } catch (error) {
    console.error('Error saving FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
