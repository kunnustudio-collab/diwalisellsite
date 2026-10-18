import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getProducts, saveProduct } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await getProducts({ activeOnly: false });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    if (body.price === undefined || Number(body.price) < 0) {
      return NextResponse.json({ error: 'Valid selling price is required' }, { status: 400 });
    }

    const result = await saveProduct(body);

    if (!result.success || !result.product) {
      return NextResponse.json({ error: result.error || 'Failed to save product' }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    console.error('Error saving product in admin:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
