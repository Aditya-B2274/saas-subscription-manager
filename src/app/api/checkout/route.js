import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    
    if (!isStripeConfigured) {
      console.log('Stripe is not configured. Running in Mock Mode.');
      
      
      if (priceId === 'price_free') {
        await db.subscription.deleteMany({ where: { userId: user.id } });
        return NextResponse.json({ url: '/dashboard?payment=success&plan=free' });
      }

      
      const amount = priceId === 'price_enterprise_test' ? 14900 : 2900;

      
      await db.subscription.deleteMany({ where: { userId: user.id } });
      await db.subscription.create({
        data: {
          userId: user.id,
          stripeSubscriptionId: `mock_sub_${Math.random().toString(36).substring(2, 11)}`,
          stripePriceId: priceId,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        },
      });

      
      await db.invoice.create({
        data: {
          userId: user.id,
          stripeInvoiceId: `mock_inv_${Math.random().toString(36).substring(2, 11)}`,
          amount,
          currency: 'usd',
          status: 'paid',
          pdfUrl: null,
        },
      });

      return NextResponse.json({ url: '/dashboard?payment=success&mock=true' });
    }

    
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;

      
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    
    
    if (priceId === 'price_free') {
      
      const activeSub = await db.subscription.findFirst({
        where: { userId: user.id, status: 'active' },
      });
      
      if (activeSub && !activeSub.stripeSubscriptionId.startsWith('mock_')) {
        await stripe.subscriptions.cancel(activeSub.stripeSubscriptionId);
      }
      
      await db.subscription.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ url: '/dashboard?plan=free' });
    }

    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during checkout' },
      { status: 500 }
    );
  }
}
