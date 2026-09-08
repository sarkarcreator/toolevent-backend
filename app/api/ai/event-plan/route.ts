import { NextRequest, NextResponse } from 'next/server';
import { generateAIEventPlan } from '@/lib/ai/planner';
import { db } from '@/lib/db/store';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const aiPlanSchema = z.object({
  eventType: z.string().min(2),
  country: z.enum(['USA', 'UAE', 'UK']).default('USA'),
  city: z.string().optional().default(''),
  guestCount: z.number().min(1),
  budget: z.number().min(1),
  currency: z.enum(['USD', 'AED', 'GBP']).default('USD'),
  eventDate: z.string().optional().default(''),
  goals: z.string().optional().default(''),
  audience: z.string().optional().default(''),
  style: z.string().optional().default(''),
  specialRequirements: z.string().optional().default(''),
});

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
    const userId = payload?.userId;

    // Check usage limits
    const monthlyCount = await db.aiUsage.getMonthlyCount(userId);
    const limit = payload?.role === 'ADMIN' ? 9999 : payload?.subscriptionTier === 'PRO' ? 100 : userId ? 15 : 5;

    if (monthlyCount >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `You have reached your monthly limit of ${limit} AI generations. Please upgrade to Pro for higher limits.`,
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = aiPlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Invalid planner parameters',
          },
        },
        { status: 400 }
      );
    }

    const plan = await generateAIEventPlan(result.data);

    // Track usage
    await db.aiUsage.record(userId, 'event-plan', 450);

    // If logged in, automatically save plan to user's savedPlans
    let savedPlanId: string | undefined;
    if (userId) {
      const saved = await db.savedPlans.create({
        data: {
          userId,
          title: plan.title,
          eventType: result.data.eventType,
          country: result.data.country,
          city: result.data.city,
          targetDate: result.data.eventDate,
          guestCount: result.data.guestCount,
          budgetTotal: result.data.budget,
          planData: plan,
        },
      });
      savedPlanId = saved.id;
    }

    const newUsed = await db.aiUsage.getMonthlyCount(userId);
    const remainingCredits = Math.max(0, limit - newUsed);

    return NextResponse.json({
      success: true,
      data: plan,
      savedPlanId,
      remainingCredits,
    });
  } catch (error: any) {
    console.error('AI planner error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_SERVICE_ERROR',
          message: error?.message || 'Failed to generate AI event plan',
        },
      },
      { status: 500 }
    );
  }
}
