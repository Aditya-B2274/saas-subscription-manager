import styles from '@/styles/dashboard.module.css';

export default function MockPortalModal({ user, plan, show, onClose, onAction, loading }) {
  if (!show) return null;

  const isPro = plan.id === 'pro';
  const isEnterprise = plan.id === 'enterprise';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Simulated Stripe Billing Portal
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>LOGGED IN AS</p>
            <p style={{ fontWeight: '600' }}>{user.email}</p>
          </div>

          <h4 style={{ fontSize: '1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Current Plan</h4>
          <div className={styles.modalRow}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{plan.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>${plan.price}/month billing period</div>
            </div>
            <div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Billing Actions</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isPro && (
              <button 
                className="btn btn-primary" 
                onClick={() => onAction('enterprise')}
                disabled={loading}
              >
                Upgrade to Enterprise ($149/mo)
              </button>
            )}
            {isEnterprise && (
              <button 
                className="btn btn-secondary" 
                onClick={() => onAction('pro')}
                disabled={loading}
              >
                Downgrade to Pro ($29/mo)
              </button>
            )}
            
            <button 
              className="btn btn-secondary" 
              onClick={() => onAction('free')}
              disabled={loading}
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(220, 38, 38, 0.03)' }}
            >
              Cancel Subscription (Downgrade to Free)
            </button>
          </div>

          <div className={styles.modalActions}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
