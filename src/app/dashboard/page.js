'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import UsageProgressCard from '@/components/dashboard/UsageProgressCard';
import ApiIntegrationCard from '@/components/dashboard/ApiIntegrationCard';
import UsageAnalyticsChart from '@/components/dashboard/UsageAnalyticsChart';
import UsageSimulatorCard from '@/components/dashboard/UsageSimulatorCard';
import InvoicesLedger from '@/components/dashboard/InvoicesLedger';
import MockPortalModal from '@/components/dashboard/MockPortalModal';
import { PLANS } from '@/lib/stripe';
import styles from '@/styles/dashboard.module.css';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [showMockPortal, setShowMockPortal] = useState(false);
  const [portalActionLoading, setPortalActionLoading] = useState(false);

  const showToast = useCallback((message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 4000);
  }, []);

  const handleCheckout = useCallback(async (priceId) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Checkout failed');
      }

      window.location.href = json.url;
    } catch (err) {
      showToast(err.message, true);
    }
  }, [showToast]);

  const handleSimulateRequest = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.limitExceeded) {
          showToast(json.message, true);
        } else {
          throw new Error(json.error || 'Failed to simulate request');
        }
      } else {
        showToast('API Request Simulated successfully! (+1 request)');
        fetch('/api/dashboard')
          .then(res => res.ok && res.json())
          .then(json => json && setData(json));
      }
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSimulating(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to open billing portal');
      }

      if (json.url.includes('portal=mock') || json.url.includes('manage_billing')) {
        setShowMockPortal(true);
      } else {
        window.location.href = json.url;
      }
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleMockPortalAction = async (planType) => {
    setPortalActionLoading(true);
    try {
      const selectedPlan = PLANS.find(p => p.id === planType) || PLANS[0];
      const priceId = selectedPlan.priceId;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) throw new Error('Action failed');

      showToast(planType === 'free' ? 'Subscription cancelled.' : `Upgraded to ${planType} plan!`);
      setShowMockPortal(false);
      fetch('/api/dashboard')
        .then(res => res.ok && res.json())
        .then(json => json && setData(json));
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setPortalActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    let active = true;
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load dashboard data');
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

  useEffect(() => {
    const payment = searchParams.get('payment');
    const portal = searchParams.get('portal');
    const selectPlan = searchParams.get('select_plan');

    if (payment === 'success') {
      setTimeout(() => showToast('Payment successful! Your subscription has been updated.'), 0);
      router.replace('/dashboard');
      fetch('/api/dashboard')
        .then(res => res.ok && res.json())
        .then(json => json && setData(json));
    } else if (payment === 'cancel') {
      setTimeout(() => showToast('Payment cancelled.', true), 0);
      router.replace('/dashboard');
    }

    if (portal === 'mock') {
      setTimeout(() => setShowMockPortal(true), 0);
      router.replace('/dashboard');
    }

    if (selectPlan && data) {
      const selectedPlan = PLANS.find(p => p.id === selectPlan) || PLANS[0];
      setTimeout(() => handleCheckout(selectedPlan.priceId), 0);
      router.replace('/dashboard');
    }
  }, [searchParams, data, handleCheckout, showToast, router]);

  if (loading) {
    return (
      <div className={styles.layout}>
        <div className={styles.navbar}>
          <div className={styles.logo}>SaaSify</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <h2>Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.layout}>
        <div className={styles.navbar}>
          <div className={styles.logo}>SaaSify</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '16px' }}>
          <h2>Error loading dashboard</h2>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  const { user, plan, monthlyUsage, chartData, invoices } = data;

  return (
    <div className={styles.layout}>
      {}
      {toast.show && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '16px 24px',
            zIndex: 1100,
            borderLeft: `4px solid ${toast.isError ? 'var(--danger)' : 'var(--success)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-md)',
            background: '#ffffff',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: toast.isError ? 'var(--danger)' : 'var(--success)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}

      {}
      <DashboardHeader user={user} onLogout={handleLogout} />

      {}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, {user.name || 'User'}. Manage your subscriptions and monitor API usage.</p>
        </div>

        {}
        <div className={styles.grid}>
          {}
          <SubscriptionStatusCard 
            subscription={data.subscription}
            plan={plan}
            onUpgrade={() => {
              const proPlan = PLANS.find(p => p.id === 'pro') || PLANS[0];
              handleCheckout(proPlan.priceId);
            }}
            onManageBilling={handleManageBilling}
          />

          {}
          <UsageProgressCard plan={plan} monthlyUsage={monthlyUsage} />

          {}
          <ApiIntegrationCard userId={user.id} />
        </div>

        {}
        <div className={styles.analyticsRow}>
          {}
          <UsageAnalyticsChart chartData={chartData} />

          {}
          <UsageSimulatorCard 
            plan={plan} 
            simulating={simulating} 
            onSimulate={handleSimulateRequest} 
          />
        </div>

        {}
        <InvoicesLedger invoices={invoices} />
      </main>

      {}
      <MockPortalModal 
        user={user}
        plan={plan}
        show={showMockPortal}
        onClose={() => setShowMockPortal(false)}
        onAction={handleMockPortalAction}
        loading={portalActionLoading}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className={styles.layout}>
        <div className={styles.navbar}>
          <div className={styles.logo}>SaaSify</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
