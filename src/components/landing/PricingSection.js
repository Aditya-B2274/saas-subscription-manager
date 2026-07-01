import PricingCard from './PricingCard';
import styles from '@/styles/landing.module.css';

export default function PricingSection({ plans, user }) {
  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className={styles.pricingHeader}>
        <h2 className={styles.pricingTitle}>Simple, Transparent Pricing</h2>
        <p className={styles.pricingDescription}>
          Choose the plan that fits your business. Scale or downgrade at any time.
        </p>
      </div>

      <div className={styles.pricingGrid}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} user={user} />
        ))}
      </div>
    </section>
  );
}
