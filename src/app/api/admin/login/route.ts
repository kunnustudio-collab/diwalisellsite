import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const admin = await verifyAdminCredentials(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createAdminToken(admin);

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
