import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { sendPasswordResetEmail } from '@/lib/email/mailer';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address.' } },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Do not reveal whether an email address is registered.
    if (!user) {
      return NextResponse.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, used: false } });
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const appUrl = (process.env.FRONTEND_APP_URL || 'https://toolbox.events').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'EMAIL_SERVICE_ERROR', message: 'We could not send the reset email right now. Please try again later.' } },
      { status: 500 }
    );
  }
}
