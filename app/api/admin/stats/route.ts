import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
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
    const [
      totalUsers,
      totalCalculations,
      totalPlans,
      totalOrders,
      totalRevenue,
      totalAffiliateClicks,
      totalAIUsage,
      totalBlogPosts,
      totalContactMessages,
      toolRows,
      marketRows,
    ] = await Promise.all([
      db.users.count(),
      db.calculations.count(),
      db.savedPlans.count(),
      db.orders.count(),
      db.orders.totalRevenue(),
      db.affiliates.totalClicks(),
      db.aiUsage.count(),
      db.blog.count(),
      db.contact.count(),
      prisma.calculation.groupBy({
        by: ['toolType'],
        _count: { _all: true },
        orderBy: { _count: { toolType: 'desc' } },
        take: 6,
      }),
      prisma.user.groupBy({
        by: ['countryPreference'],
        _count: { _all: true },
        orderBy: { _count: { countryPreference: 'desc' } },
      }),
    ]);

    const totalMarketUsers = marketRows.reduce((sum, row) => sum + row._count._all, 0);
    const topTools = toolRows.map((row) => ({
      name: row.toolType,
      count: row._count._all,
      category: row.toolType,
    }));
    const marketDistribution = marketRows.map((row) => ({
      market: row.countryPreference,
      percentage: totalMarketUsers ? Math.round((row._count._all / totalMarketUsers) * 100) : 0,
      count: row._count._all,
      currency: row.countryPreference === 'UAE' ? 'AED' : row.countryPreference === 'UK' ? 'GBP' : 'USD',
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCalculations,
        totalPlans,
        totalOrders,
        totalRevenue,
        totalAffiliateClicks,
        totalAIUsage,
        totalBlogPosts,
        totalContactMessages,
        topTools,
        marketDistribution,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load admin metrics' } },
      { status: 500 }
    );
  }
}
