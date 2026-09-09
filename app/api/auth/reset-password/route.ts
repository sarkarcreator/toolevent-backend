import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/jwt';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid reset token and a password of at least 8 characters.' } },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used || resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_RESET_TOKEN', message: 'This password reset link is invalid or has expired.' } },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Password reset failed.' } },
      { status: 500 }
    );
  }
}
