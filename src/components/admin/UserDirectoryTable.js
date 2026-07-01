import styles from '@/styles/admin.module.css';

export default function UserDirectoryTable({ users, actionLoading, onRoleChange, onPlanChange }) {
  return (
    <div className={`glass-panel ${styles.tableCard}`}>
      <h3 className={styles.tableTitle}>User Directory & Plan Management</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Plan</th>
              <th className={styles.th}>Total API Requests</th>
              <th className={styles.th}>Joined Date</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userObj) => {
              const isUserPro = userObj.planId === 'pro';
              const isUserEnt = userObj.planId === 'enterprise';
              const isUserFree = userObj.planId === 'free';
              const isLoading = actionLoading === userObj.id;
              
              return (
                <tr key={userObj.id} className={styles.tr} style={{ opacity: isLoading ? 0.5 : 1 }}>
                  <td className={styles.td}>
                    <div style={{ fontWeight: '600' }}>{userObj.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {userObj.id}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={`badge`} style={{ 
                      background: userObj.role === 'ADMIN' ? 'var(--success-bg)' : 'rgba(0, 0, 0, 0.03)', 
                      color: userObj.role === 'ADMIN' ? 'var(--success)' : 'var(--text-muted)',
                      border: userObj.role === 'ADMIN' ? '1px solid rgba(5, 150, 105, 0.15)' : '1px solid var(--border-color)'
                    }}>
                      {userObj.role}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={`
                      ${styles.planBadge} 
                      ${isUserFree ? styles.planBadgeFree : ''} 
                      ${isUserPro ? styles.planBadgePro : ''} 
                      ${isUserEnt ? styles.planBadgeEnterprise : ''}
                    `}>
                      {userObj.planName}
                    </span>
                  </td>
                  <td className={styles.td} style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {userObj.usageCount.toLocaleString()}
                  </td>
                  <td className={styles.td} style={{ color: 'var(--text-muted)' }}>
                    {new Date(userObj.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <select 
                        className={styles.select}
                        value={userObj.role}
                        onChange={(e) => onRoleChange(userObj.id, e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="CUSTOMER">Make Customer</option>
                        <option value="ADMIN">Make Admin</option>
                      </select>

                      <select 
                        className={styles.select}
                        value={userObj.planId}
                        onChange={(e) => onPlanChange(userObj.id, e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="free">Free Starter</option>
                        <option value="pro">Pro Scale</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
