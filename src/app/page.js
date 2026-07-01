import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { PLANS } from '@/lib/stripe';
import LandingHeader from '@/components/landing/LandingHeader';
import PricingSection from '@/components/landing/PricingSection';
import styles from '@/styles/landing.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className={styles.container}>
      {}
      <LandingHeader user={user} />

      <main>
        {}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            The Ultimate <span className={styles.heroTitleGlow}>Subscription</span> <br />
            Management Platform
          </h1>
          <div className={styles.heroActions}>
            <Link href={user ? "/dashboard" : "/login?signup=true"} className="btn btn-primary">
              Start Free Trial
            </Link>
            <a href="#pricing" className="btn btn-secondary">
              View Pricing
            </a>
          </div>
        </section>

        {}
        <PricingSection plans={PLANS} user={user} />
      </main>
    </div>
  );
}
