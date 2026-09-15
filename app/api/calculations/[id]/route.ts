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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getPayload(req);
    const calculation = await db.calculations.findUnique({ where: { id } });

    if (!calculation) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Calculation not found' } }, { status: 404 });

    const canRead = calculation.isPublic || payload?.role === 'ADMIN' || calculation.userId === payload?.userId;
    if (!canRead) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access to this calculation is not allowed' } }, { status: 403 });

    return NextResponse.json({ success: true, data: calculation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load calculation' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getPayload(req);
    const calculation = await db.calculations.findUnique({ where: { id } });
    if (!calculation) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Calculation not found' } }, { status: 404 });
    if (payload?.role !== 'ADMIN' && calculation.userId !== payload?.userId) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot modify this calculation' } }, { status: 403 });

    const body = await req.json();
    const updated = await db.calculations.update({
      where: { id },
      data: {
        title: body.title,
        toolType: body.toolType,
        country: body.country,
        currency: body.currency,
        inputs: body.inputs,
        results: body.results,
        notes: body.notes,
        isPublic: body.isPublic === true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to update calculation' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getPayload(req);
    const calculation = await db.calculations.findUnique({ where: { id } });
    if (!calculation) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Calculation not found' } }, { status: 404 });
    if (payload?.role !== 'ADMIN' && calculation.userId !== payload?.userId) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot delete this calculation' } }, { status: 403 });

    await db.calculations.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Calculation deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to delete calculation' } }, { status: 500 });
  }
}
