import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, customerEmail } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: 'Please provide a coupon code.' },
        { status: 400 }
      );
    }

    const cartTotal = typeof subtotal === 'number' ? Math.max(0, subtotal) : 0;
    const result = await validateCoupon(code, cartTotal, customerEmail);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in validate coupon API:', error);
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: 'Internal server error validating coupon.' },
      { status: 500 }
    );
  }
}
