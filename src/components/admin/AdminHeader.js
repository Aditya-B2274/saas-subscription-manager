import Link from 'next/link';
import styles from '@/styles/admin.module.css';

export default function AdminHeader() {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        SaaSify Admin
      </Link>
      <div className={styles.navUser}>
        <span className={styles.userEmail}>Admin Portal</span>
        <Link href="/dashboard" className="btn btn-secondary dashboardBtn" style={{
          fontSize: '0.85rem',
          padding: '6px 12px',
        }}>
          Customer Dashboard
        </Link>
      </div>
    </header>
  );
}
