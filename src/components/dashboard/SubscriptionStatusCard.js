import styles from '@/styles/dashboard.module.css';

export default function SubscriptionStatusCard({ subscription, plan, onUpgrade, onManageBilling }) {
  const isFree = plan.id === 'free';

  return (
    <div className={`glass-panel ${styles.card}`}>
      <div>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Current Subscription</span>
          <span className={`badge ${isFree ? 'badge-warning' : 'badge-success'}`}>
            {subscription ? subscription.status : 'Free'}
          </span>
        </div>
        <div className={styles.planNameRow}>
          <h3 className={styles.planName}>{plan.name}</h3>
        </div>
        <div className={styles.cardValue}>
          ${plan.price}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/mo</span>
        </div>
      </div>
      
      <div>
        {subscription && (
          <p className={styles.cardSubtext}>
            Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        {isFree ? (
          <button className="btn btn-primary" onClick={onUpgrade} style={{ width: '100%', marginTop: '16px' }}>
            Upgrade to Pro
          </button>
        ) : (
          <button className={`btn btn-secondary ${styles.manageBillingBtn}`} onClick={onManageBilling}>
            Manage Billing
          </button>
        )}
      </div>
    </div>
  );
}
