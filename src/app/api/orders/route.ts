import { NextRequest, NextResponse } from 'next/server';
import { createOrder, CreateOrderInput } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderInput;

    // Validate required fields
    if (!body.customer_name?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!body.customer_phone?.trim()) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 });
    }
    if (!body.shipping_address?.trim() || !body.city?.trim() || !body.pin_code?.trim()) {
      return NextResponse.json(
        { error: 'Complete delivery address, city, and PIN code are required' },
        { status: 400 }
      );
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const result = await createOrder(body);

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || 'Failed to place order' }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
