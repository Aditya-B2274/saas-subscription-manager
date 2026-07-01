'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import UserDirectoryTable from '@/components/admin/UserDirectoryTable';
import TransactionsTable from '@/components/admin/TransactionsTable';
import styles from '@/styles/admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); 

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) {
        if (res.status === 403) {
          setForbidden(true);
          return;
        }
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load admin data');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin')
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) {
            setForbidden(true);
            return;
          }
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load admin data');
        }
        return res.json();
      })
      .then(json => {
        if (active && json) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [router]);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-role',
          userId,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to update role');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlanChange = async (userId, newPlanId) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate-subscription',
          userId,
          planId: newPlanId,
        }),
      });

      if (!res.ok) throw new Error('Failed to override subscription');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (forbidden) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--danger)', fontFamily: 'var(--font-title)' }}>403</h1>
        <h2 style={{ fontSize: '1.75rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>
          This page is restricted to administrators. You do not have the required permissions to view this dashboard.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
          <Link href="/" className="btn btn-secondary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <div className={styles.navbar}>
          <div className={styles.logo}>SaaSify Admin</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <h2>Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.layout}>
        <div className={styles.navbar}>
          <div className={styles.logo}>SaaSify Admin</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '16px' }}>
          <h2>Error loading admin data</h2>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchAdminData}>Retry</button>
        </div>
      </div>
    );
  }

  const { metrics, users, invoices } = data;

  return (
    <div className={styles.layout}>
      <AdminHeader />

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 className={styles.title}>Admin Panel</h1>
            <span className={styles.adminBadge}>Authorized</span>
          </div>
          <p className={styles.subtitle}>SaaS metrics, user administration, and manual billing simulations.</p>
        </div>

        <div className={styles.infoBanner}>
          <strong>Developer Testing Tip:</strong> {"You can manually override any user's role or subscription tier in the table below. Upgrading a user's subscription will automatically recalculate the platform's MRR and generate mock invoices."}
        </div>

        {}
        <AdminStatsCard metrics={metrics} />

        {}
        <UserDirectoryTable 
          users={users} 
          actionLoading={actionLoading}
          onRoleChange={handleRoleChange}
          onPlanChange={handlePlanChange}
        />

        {}
        <TransactionsTable invoices={invoices} />
      </main>
    </div>
  );
}
