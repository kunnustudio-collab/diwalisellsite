import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDiscounts, saveDiscount } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const discounts = await getDiscounts();
  return NextResponse.json({ discounts });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.code?.trim()) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }
    if (!body.value || Number(body.value) <= 0) {
      return NextResponse.json({ error: 'Valid discount value is required' }, { status: 400 });
    }

    const saved = await saveDiscount(body);
    return NextResponse.json({ success: true, discount: saved });
  } catch (error) {
    console.error('Error saving discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
