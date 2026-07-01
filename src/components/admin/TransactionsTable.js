import styles from '@/styles/admin.module.css';

export default function TransactionsTable({ invoices }) {
  return (
    <div className={`glass-panel ${styles.tableCard}`}>
      <h3 className={styles.tableTitle}>Recent Transactions</h3>
      <div className={styles.tableWrapper}>
        {invoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '16px 0' }}>No transactions recorded yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Invoice ID</th>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontFamily: 'monospace' }}>
                    {inv.stripeInvoiceId}
                  </td>
                  <td className={styles.td}>
                    {inv.user.email}
                  </td>
                  <td className={styles.td}>
                    ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                  </td>
                  <td className={styles.td}>
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                  <td className={styles.td}>
                    <span className="badge badge-success">{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
