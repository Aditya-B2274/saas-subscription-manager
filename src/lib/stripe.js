import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = stripeSecretKey && !stripeSecretKey.startsWith('sk_test_51...');

export const stripe = isStripeConfigured ? new Stripe(stripeSecretKey) : null;

export const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    priceId: 'price_free',
    features: [
      '100 API Requests / mo',
      'Basic Analytics',
      '1 User Access',
      'Community Support'
    ],
  },
  {
    id: 'pro',
    name: 'Pro Scale',
    price: 29,
    priceId: 'price_1ToIEd63NjE9FZsoTGuv2kh7',
    features: [
      '10,000 API Requests / mo',
      'Advanced Analytics Dashboard',
      'Priority Email Support',
      'Team Access (up to 5)'
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Custom',
    price: 149,
    priceId: 'price_1ToIFM63NjE9FZso1sUc7aVj',
    features: [
      'Unlimited API Requests',
      'Real-time Analytics Webhooks',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Unlimited Team Members'
    ],
  },
];

export function getPlanByPriceId(priceId) {
  return PLANS.find(plan => plan.priceId === priceId) || PLANS[0];
}

export function getPlanById(planId) {
  return PLANS.find(plan => plan.id === planId) || PLANS[0];
}

export { isStripeConfigured };
