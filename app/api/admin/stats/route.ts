import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  try {
    const totalUsers = await db.users.count();
    const totalCalculations = await db.calculations.count();
    const totalPlans = await db.savedPlans.count();
    const totalOrders = await db.orders.count();
    const totalRevenue = await db.orders.totalRevenue();
    const totalAffiliateClicks = await db.affiliates.totalClicks();
    const totalAIUsage = await db.aiUsage.count();
    const totalBlogPosts = await db.blog.count();
    const totalContactMessages = await db.contact.count();

    const topTools = [
      { name: 'Event Budget Calculator', count: 1842, category: 'Budget' },
      { name: 'Event Profit Calculator', count: 1290, category: 'Profit' },
      { name: 'Wedding Budget Calculator', count: 1145, category: 'Weddings' },
      { name: 'Ticket Price Calculator', count: 960, category: 'Ticketing' },
      { name: 'Event ROI Calculator', count: 780, category: 'Corporate' },
      { name: 'Break-Even Calculator', count: 650, category: 'Planning' },
    ];

    const marketDistribution = [
      { market: 'USA', percentage: 54, count: 2840, currency: 'USD' },
      { market: 'UAE (Dubai & Abu Dhabi)', percentage: 26, count: 1360, currency: 'AED' },
      { market: 'UK (London & Regional)', percentage: 20, count: 1050, currency: 'GBP' },
    ];

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
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
