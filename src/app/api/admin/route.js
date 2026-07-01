import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPlanByPriceId } from '@/lib/stripe';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    
    const totalUsers = await db.user.count();

    
    const activeSubscriptions = await db.subscription.findMany({
      where: { status: 'active' },
    });

    
    let mrr = 0;
    activeSubscriptions.forEach(sub => {
      const plan = getPlanByPriceId(sub.stripePriceId);
      mrr += plan.price;
    });

    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscriptions: {
          where: { status: 'active' },
          select: {
            stripePriceId: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: { usageLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    
    const formattedUsers = users.map(user => {
      const activeSub = user.subscriptions[0];
      const plan = activeSub ? getPlanByPriceId(activeSub.stripePriceId) : getPlanByPriceId('price_free');
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        planName: plan.name,
        planId: plan.id,
        subscriptionStatus: activeSub ? activeSub.status : 'none',
        usageCount: user._count.usageLogs,
      };
    });

    
    const invoices = await db.invoice.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeSubscriptionsCount: activeSubscriptions.length,
        mrr,
      },
      users: formattedUsers,
      invoices,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, userId, role, planId } = await request.json();

    if (action === 'update-role') {
      if (!userId || !role) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { role },
      });

      return NextResponse.json({ success: true, user: { id: updatedUser.id, role: updatedUser.role } });
    }

    if (action === 'simulate-subscription') {
      if (!userId || !planId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      
      await db.subscription.deleteMany({ where: { userId } });

      if (planId !== 'free') {
        const stripePriceId = planId === 'enterprise' ? 'price_enterprise_test' : 'price_pro_test';
        const amount = planId === 'enterprise' ? 14900 : 2900;

        
        await db.subscription.create({
          data: {
            userId,
            stripeSubscriptionId: `mock_admin_sub_${Math.random().toString(36).substring(2, 11)}`,
            stripePriceId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        
        await db.invoice.create({
          data: {
            userId,
            stripeInvoiceId: `mock_admin_inv_${Math.random().toString(36).substring(2, 11)}`,
            amount,
            currency: 'usd',
            status: 'paid',
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
