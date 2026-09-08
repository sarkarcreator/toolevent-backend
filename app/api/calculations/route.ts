import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId;

    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('toolType') || undefined;

    // If user is logged in, filter by their userId, unless ADMIN requesting all
    let calculations;
    if (payload?.role === 'ADMIN' && searchParams.get('all') === 'true') {
      calculations = await db.calculations.findMany({ where: { toolType } });
    } else if (userId) {
      calculations = await db.calculations.findMany({ where: { userId, toolType } });
    } else {
      // Return public calculations or recent guest calculations
      calculations = await db.calculations.findMany({ where: { toolType } });
    }

    return NextResponse.json({
      success: true,
      data: calculations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const payload = token ? verifyToken(token) : null;
    const body = await req.json();

    if (!body.title || !body.toolType || !body.inputs || !body.results) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title, toolType, inputs and results are required',
          },
        },
        { status: 400 }
      );
    }

    const calculation = await db.calculations.create({
      data: {
        userId: payload?.userId || 'usr_demo_02',
        title: body.title,
        toolType: body.toolType,
        country: body.country || 'USA',
        currency: body.currency || 'USD',
        inputs: body.inputs,
        results: body.results,
        notes: body.notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
