import styles from '@/styles/admin.module.css';

export default function AdminStatsCard({ metrics }) {
  return (
    <div className={styles.statsGrid}>
      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statLabel}>Total Platform Users</div>
        <div className={styles.statValue}>{metrics.totalUsers}</div>
      </div>

      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statLabel}>Active Subscriptions</div>
        <div className={styles.statValue}>{metrics.activeSubscriptionsCount}</div>
      </div>

      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statLabel}>Monthly Recurring Revenue (MRR)</div>
        <div className={`${styles.statValue} ${styles.statValueMrr}`}>
          ${metrics.mrr.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
