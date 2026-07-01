import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';

export default function DashboardHeader({ user, onLogout }) {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        SaaSify
      </Link>
      <div className={styles.navUser}>
        <span className={styles.userEmail}>{user.email}</span>
        {user.role === 'ADMIN' && (
          <Link href="/admin" className={styles.adminBtn}>
            Admin Panel
          </Link>
        )}
        <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
