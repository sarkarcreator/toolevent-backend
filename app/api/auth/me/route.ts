import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await db.users.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const aiUsed = await db.aiUsage.getMonthlyCount(user.id);
    const limit = user.role === 'ADMIN' ? 9999 : user.subscriptionTier === 'PRO' ? 100 : 15;
    const aiCreditsRemaining = Math.max(0, limit - aiUsed);

    return NextResponse.json({
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
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, user: null, error: error?.message }, { status: 500 });
  }
}
