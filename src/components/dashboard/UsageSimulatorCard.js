import styles from '@/styles/dashboard.module.css';

export default function UsageSimulatorCard({ plan, simulating, onSimulate }) {
  const isFree = plan.id === 'free';

  return (
    <div className={`glass-panel ${styles.simulateCard}`}>
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Usage Simulator</h3>
        <p className={styles.simulateText}>
          Simulate client API requests to test billing limits and see analytics update in real-time.
        </p>
        {isFree && (
          <div style={{ 
            background: 'var(--warning-bg)', 
            border: '1px solid rgba(217, 119, 6, 0.15)', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px', 
            fontSize: '0.85rem', 
            color: 'var(--warning)' 
          }}>
            Free plan is limited to 100 requests. Try simulating until you hit the limit!
          </div>
        )}
      </div>
      <button 
        className={`btn btn-primary ${styles.simulateBtn}`} 
        onClick={onSimulate}
        disabled={simulating}
      >
        {simulating ? 'Simulating...' : 'Simulate API Request'}
      </button>
    </div>
  );
}
