import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPlanByPriceId } from '@/lib/stripe';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }, 
    });

    const activePlan = subscription && subscription.status === 'active' 
      ? getPlanByPriceId(subscription.stripePriceId) 
      : getPlanByPriceId('price_free');

    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await db.usageLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: sevenDaysAgo },
      },
      orderBy: { timestamp: 'asc' },
    });

    
    const dailyUsageMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      dailyUsageMap[dateString] = 0;
    }

    logs.forEach(log => {
      const dateString = new Date(log.timestamp).toISOString().split('T')[0];
      if (dailyUsageMap[dateString] !== undefined) {
        dailyUsageMap[dateString] += log.quantity;
      }
    });

    const chartData = Object.keys(dailyUsageMap).map(date => ({
      date,
      count: dailyUsageMap[date],
    }));

    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyUsageObj = await db.usageLog.aggregate({
      where: {
        userId: user.id,
        timestamp: { gte: thirtyDaysAgo },
      },
      _sum: { quantity: true },
    });
    const monthlyUsage = monthlyUsageObj._sum.quantity || 0;

    
    const invoices = await db.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      subscription: subscription ? {
        id: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripePriceId: subscription.stripePriceId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      } : null,
      plan: activePlan,
      monthlyUsage,
      chartData,
      invoices,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
