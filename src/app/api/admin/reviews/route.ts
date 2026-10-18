import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getReviews, moderateReview } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as any) || 'all';

  const reviews = await getReviews({ status });
  return NextResponse.json({ reviews });
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, replyText } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Review ID and action are required' }, { status: 400 });
    }

    const updated = await moderateReview(id, action, replyText);
    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}
