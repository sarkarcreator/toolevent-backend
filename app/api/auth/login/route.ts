import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { verifyPassword, generateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide a valid email and password.',
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await db.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password.',
          },
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password.',
          },
        },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
    });

    const aiUsed = await db.aiUsage.getMonthlyCount(user.id);
    const limit = user.role === 'ADMIN' ? 9999 : user.subscriptionTier === 'PRO' ? 100 : 15;
    const aiCreditsRemaining = Math.max(0, limit - aiUsed);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        countryPreference: user.countryPreference,
        currencyPreference: user.currencyPreference,
        aiCreditsRemaining,
      },
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error?.message || 'Login failed',
        },
      },
      { status: 500 }
    );
  }
}
