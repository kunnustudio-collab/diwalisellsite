import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const sort = (searchParams.get('sort') as any) || undefined;

    const products = await getProducts({
      activeOnly: true,
      category,
      featured,
      search,
      sort,
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
