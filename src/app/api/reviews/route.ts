import { NextRequest, NextResponse } from 'next/server';
import { getReviews, submitReview } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;

    const reviews = await getReviews({
      productId,
      status: 'approved',
    });

    // Compute aggregate statistics
    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
        : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    return NextResponse.json({
      reviews,
      totalCount,
      averageRating,
      distribution,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, customer_name, customer_email, rating, title, comment } = body;

    if (!customer_name?.trim() || !customer_email?.trim() || !title?.trim() || !comment?.trim()) {
      return NextResponse.json(
        { error: 'All fields (name, email, title, and review) are required.' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Please provide a valid rating between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    const review = await submitReview({
      product_id,
      customer_name,
      customer_email,
      rating: Number(rating),
      title,
      comment,
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Thank you! Your review has been submitted and will appear once approved by our moderation team.',
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
