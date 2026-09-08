import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { hashPassword, generateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  country: z.enum(['USA', 'UAE', 'UK']).default('USA'),
  currency: z.enum(['USD', 'AED', 'GBP']).default('USD'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Invalid registration details',
            fields: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password, name, country, currency } = result.data;

    const existing = await db.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'An account with this email address already exists.',
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.users.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'USER',
        subscriptionTier: 'REGISTERED',
        countryPreference: country,
        currencyPreference: currency,
        emailVerified: false,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
    });

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
        aiCreditsRemaining: 15,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error?.message || 'Failed to register account',
        },
      },
      { status: 500 }
    );
  }
}
