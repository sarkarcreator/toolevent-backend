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
    const settings = await db.settings.get();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load settings' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!getAdminUser(req)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = await db.settings.update(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to update settings' } },
      { status: 500 }
    );
  }
}
