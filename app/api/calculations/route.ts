import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { verifyToken } from '@/lib/auth/jwt';

function getPayload(req: NextRequest) {
  let token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
  }
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  try {
    const payload = getPayload(req);
    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('toolType') || undefined;

    let calculations;
    if (payload?.role === 'ADMIN' && searchParams.get('all') === 'true') {
      calculations = await db.calculations.findMany({ where: { toolType } });
    } else if (payload?.userId) {
      calculations = await db.calculations.findMany({ where: { userId: payload.userId, toolType } });
    } else {
      calculations = await db.calculations.findMany({ where: { toolType } });
      calculations = calculations.filter((calculation: any) => calculation.isPublic === true);
    }

    return NextResponse.json({ success: true, data: calculations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load calculations' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getPayload(req);
    const body = await req.json();

    if (!body.title || !body.toolType || !body.inputs || !body.results) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title, toolType, inputs and results are required' } },
        { status: 400 }
      );
    }

    const calculation = await db.calculations.create({
      data: {
        userId: payload?.userId,
        title: body.title,
        toolType: body.toolType,
        country: body.country || 'USA',
        currency: body.currency || 'USD',
        inputs: body.inputs,
        results: body.results,
        notes: body.notes || '',
        isPublic: body.isPublic === true,
      },
    });

    return NextResponse.json({ success: true, data: calculation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to save calculation' } },
      { status: 500 }
    );
  }
}
