import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getOrders } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase().trim();

  let orders = await getOrders();

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.order_status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(search) ||
        o.customer_name.toLowerCase().includes(search) ||
        o.customer_email.toLowerCase().includes(search) ||
        o.customer_phone.includes(search)
    );
  }

  return NextResponse.json({ orders });
}
