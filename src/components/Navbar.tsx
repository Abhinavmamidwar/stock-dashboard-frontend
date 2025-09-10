'use client';
import React from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <nav style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(17,24,39,0.8), rgba(17,24,39,0.6))',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 18px rgba(59,130,246,0.8)' }} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>Stock Analytics Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{user.email}</span>}
          {user && (<Button onClick={handleLogout}>Logout</Button>)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
