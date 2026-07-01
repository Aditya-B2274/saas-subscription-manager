import styles from '@/styles/dashboard.module.css';

export default function InvoicesLedger({ invoices }) {
  return (
    <div className={`glass-panel ${styles.tableCard}`}>
      <h3 className={styles.tableTitle}>Billing Invoices</h3>
      <div className={styles.tableWrapper}>
        {invoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '16px 0' }}>No invoices found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Invoice ID</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontFamily: 'monospace' }}>
                    {inv.stripeInvoiceId.substring(0, 15)}...
                  </td>
                  <td className={styles.td}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.td}>
                    ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                  </td>
                  <td className={styles.td}>
                    <span className="badge badge-success">{inv.status}</span>
                  </td>
                  <td className={styles.td}>
                    {inv.pdfUrl ? (
                      <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.invoicePdfLink}>
                        Download PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Receipt (Mock)</span>
                    )}
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
