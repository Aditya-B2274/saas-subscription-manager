import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed:`, error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const eventType = event.type;
  console.log(`Received Stripe Webhook Event: ${eventType}`);

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription;
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error('No userId found in session metadata');
            break;
          }

          
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

          
          await db.subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              status: stripeSubscription.status,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
            create: {
              userId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
          });

          
          await db.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object;
        
        
        const user = await db.user.findUnique({
          where: { stripeCustomerId: stripeSubscription.customer },
        });

        if (!user) {
          console.error(`User not found for customer: ${stripeSubscription.customer}`);
          break;
        }

        
        await db.subscription.upsert({
          where: { stripeSubscriptionId: stripeSubscription.id },
          update: {
            status: stripeSubscription.status,
            stripePriceId: stripeSubscription.items.data[0].price.id,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0].price.id,
            status: stripeSubscription.status,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        
        
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubscription.id },
          data: { status: 'canceled' },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        
        if (invoice.subscription) {
          const user = await db.user.findUnique({
            where: { stripeCustomerId: invoice.customer },
          });

          if (!user) {
            console.error(`User not found for customer: ${invoice.customer}`);
            break;
          }

          await db.invoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            update: {
              status: 'paid',
              pdfUrl: invoice.invoice_pdf,
            },
            create: {
              userId: user.id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              pdfUrl: invoice.invoice_pdf,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
