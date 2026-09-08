import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  try {
    const affiliates = await db.affiliates.findMany();
    return NextResponse.json({ success: true, data: affiliates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
