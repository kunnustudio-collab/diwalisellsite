import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { saveDiscount, deleteDiscount } from '@/lib/db';

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
    const updated = await saveDiscount({ ...body, id: params.id });
    return NextResponse.json({ success: true, discount: updated });
  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
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

  const deleted = await deleteDiscount(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
