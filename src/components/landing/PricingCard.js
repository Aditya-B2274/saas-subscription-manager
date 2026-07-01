import Link from 'next/link';
import styles from '@/styles/landing.module.css';

export default function PricingCard({ plan, user }) {
  const isPro = plan.id === 'pro';
  const isFree = plan.id === 'free';
  const isEnterprise = plan.id === 'enterprise';

  return (
    <div className={`glass-panel ${styles.pricingCard} ${isPro ? styles.pricingCardPopular : ''}`}>
      {isPro && <div className={styles.popularBadge}>Most Popular</div>}
      
      <h3 className={styles.planName}>{plan.name}</h3>
      <div className={styles.planPrice}>
        <span className={styles.priceNumber}>${plan.price}</span>
        <span className={styles.pricePeriod}>/month</span>
      </div>
      
      <p className={styles.planDescription}>
        {isFree && 'Perfect for exploring the platform and testing our API integrations.'}
        {isPro && 'Great for growing startups and businesses needing advanced analytics.'}
        {isEnterprise && 'Customizable enterprise grade features with dedicated support.'}
      </p>
      
      <ul className={styles.featuresList}>
        {plan.features.map((feature, i) => (
          <li key={i} className={styles.featureItem}>
            <svg className={styles.featureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link 
        href={
          user 
            ? `/dashboard?select_plan=${plan.id}` 
            : `/login?redirect=dashboard&select_plan=${plan.id}`
        } 
        className={`btn ${isPro ? 'btn-primary' : 'btn-secondary'} ${styles.cardAction}`}
      >
        {isFree ? 'Get Started' : `Upgrade to ${plan.name}`}
      </Link>
    </div>
  );
}
