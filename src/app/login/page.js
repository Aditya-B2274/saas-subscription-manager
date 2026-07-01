'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('signup') === 'true';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(isSignUp ? 'Account created successfully! Redirecting...' : 'Logged in successfully! Redirecting...');
      
      
      setTimeout(() => {
        const redirectPath = searchParams.get('redirect') || 'dashboard';
        const selectPlan = searchParams.get('select_plan');
        const url = selectPlan ? `/${redirectPath}?select_plan=${selectPlan}` : `/${redirectPath}`;
        router.push(url);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`glass-panel ${styles.card}`}>
        <h2 className={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className={styles.subtitle}>
          {isSignUp 
            ? 'Sign up to start managing your SaaS subscriptions.' 
            : 'Sign in to access your billing and usage dashboard.'}
        </p>

        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              required
              className={styles.input}
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerText}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => {
              setError('');
              setSuccess('');
              const params = new URLSearchParams(searchParams.toString());
              if (!isSignUp) {
                params.set('signup', 'true');
              } else {
                params.delete('signup');
              }
              router.replace(`/login?${params.toString()}`);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/" className={styles.footerLink} style={{ fontSize: '0.85rem' }}>
            Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.wrapper}>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
