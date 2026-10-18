import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { saveFAQ, deleteFAQ } from '@/lib/db';

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
    const updated = await saveFAQ({ ...body, id: params.id });
    return NextResponse.json({ success: true, faq: updated });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
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

  const deleted = await deleteFAQ(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
