import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getProductByIdOrSlug, saveProduct, deleteProduct } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await getProductByIdOrSlug(params.id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await saveProduct({ ...body, id: params.id });

    if (!result.success || !result.product) {
      return NextResponse.json({ error: result.error || 'Failed to update product' }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    console.error('Error updating product in admin:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteProduct(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
