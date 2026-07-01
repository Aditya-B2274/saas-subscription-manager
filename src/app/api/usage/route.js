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
      where: { userId: user.id, status: 'active' },
    });

    const activePlan = subscription ? getPlanByPriceId(subscription.stripePriceId) : getPlanByPriceId('price_free');

    
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

    let totalUsage = 0;
    logs.forEach(log => {
      const dateString = new Date(log.timestamp).toISOString().split('T')[0];
      if (dailyUsageMap[dateString] !== undefined) {
        dailyUsageMap[dateString] += log.quantity;
      }
      totalUsage += log.quantity;
    });

    
    const allTimeTotal = await db.usageLog.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });

    const chartData = Object.keys(dailyUsageMap).map(date => ({
      date,
      count: dailyUsageMap[date],
    }));

    return NextResponse.json({
      plan: activePlan,
      totalCurrentPeriod: totalUsage,
      allTimeTotal: allTimeTotal._sum.quantity || 0,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount = 1 } = await request.json().catch(() => ({}));

    
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id, status: 'active' },
    });

    const activePlan = subscription ? getPlanByPriceId(subscription.stripePriceId) : getPlanByPriceId('price_free');

    
    if (activePlan.id === 'free') {
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const currentUsageObj = await db.usageLog.aggregate({
        where: {
          userId: user.id,
          timestamp: { gte: thirtyDaysAgo },
        },
        _sum: { quantity: true },
      });

      const currentUsage = currentUsageObj._sum.quantity || 0;

      if (currentUsage + amount > 100) {
        return NextResponse.json(
          { 
            error: 'Plan Limit Exceeded', 
            message: 'You have exceeded the 100 API request limit for the Free Starter plan. Please upgrade to Pro or Enterprise to continue.',
            limitExceeded: true 
          }, 
          { status: 403 }
        );
      }
    } else if (activePlan.id === 'pro') {
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const currentUsageObj = await db.usageLog.aggregate({
        where: {
          userId: user.id,
          timestamp: { gte: thirtyDaysAgo },
        },
        _sum: { quantity: true },
      });

      const currentUsage = currentUsageObj._sum.quantity || 0;

      if (currentUsage + amount > 10000) {
        return NextResponse.json(
          { 
            error: 'Plan Limit Exceeded', 
            message: 'You have exceeded the 10,000 API request limit for the Pro Scale plan. Please upgrade to Enterprise to continue.',
            limitExceeded: true 
          }, 
          { status: 403 }
        );
      }
    }

    
    const log = await db.usageLog.create({
      data: {
        userId: user.id,
        action: 'api_request',
        quantity: amount,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error logging usage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
