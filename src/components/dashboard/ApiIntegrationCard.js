import styles from '@/styles/dashboard.module.css';

export default function ApiIntegrationCard({ userId }) {
  return (
    <div className={`glass-panel ${styles.card}`}>
      <div>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>API Integration</span>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
        </div>
        <div className={styles.planNameRow} style={{ marginTop: '8px' }}>
          <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            live_sk_...{userId.substring(0, 5)}
          </span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '16px' }}>
          API Status: <span style={{ color: 'var(--success)' }}>Active</span>
        </div>
      </div>
      <div>
        <p className={styles.cardSubtext}>
          Endpoints running smoothly. SSL secured.
        </p>
      </div>
    </div>
  );
}
