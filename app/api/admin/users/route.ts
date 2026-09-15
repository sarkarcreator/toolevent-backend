import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getAdminUser } from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  if (!getAdminUser(req)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } },
      { status: 403 }
    );
  }

  try {
    const users = await db.users.findMany();
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load users' } },
      { status: 500 }
    );
  }
}
