import styles from '@/styles/dashboard.module.css';

export default function UsageProgressCard({ plan, monthlyUsage }) {
  const isPro = plan.id === 'pro';
  const isEnterprise = plan.id === 'enterprise';

  
  let limit = 100;
  if (isPro) limit = 10000;
  if (isEnterprise) limit = Infinity;
  
  const usagePercentage = limit === Infinity ? 0 : Math.min(100, (monthlyUsage / limit) * 100);

  return (
    <div className={`glass-panel ${styles.card}`}>
      <div>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Monthly Usage</span>
          <svg className={styles.cardIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className={styles.cardValue}>
          {monthlyUsage.toLocaleString()}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            {limit === Infinity ? ' / Unlimited' : ` / ${limit.toLocaleString()}`}
          </span>
        </div>
      </div>
      
      <div>
        {!isEnterprise && (
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${usagePercentage}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '3px' }}></div>
          </div>
        )}
        <p className={styles.cardSubtext}>
          {isEnterprise 
            ? 'Unlimited API requests' 
            : `${Math.round(usagePercentage)}% of monthly quota used (30-day window)`}
        </p>
      </div>
    </div>
  );
}
