import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    if (!isStripeConfigured) {
      return NextResponse.json({ url: '/dashboard?portal=mock' });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'You do not have an active billing profile yet.' },
        { status: 400 }
      );
    }

    
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong opening the billing portal' },
      { status: 500 }
    );
  }
}
