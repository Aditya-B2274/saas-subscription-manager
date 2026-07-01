import Link from 'next/link';
import styles from '@/styles/landing.module.css';

export default function LandingHeader({ user }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}></div>
        <span>SaaSify</span>
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <span className={styles.navLink}>Hello, {user.name || user.email}</span>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="adminBtn btn btn-secondary" style={{
                fontSize: '0.85rem',
                padding: '6px 12px',
                background: 'rgba(139, 92, 246, 0.08)',
                color: '#7c3aed',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                marginRight: '8px'
              }}>
                Admin Panel
              </Link>
            )}
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.navLink}>
              Sign In
            </Link>
            <Link href="/login?signup=true" className="btn btn-primary">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
