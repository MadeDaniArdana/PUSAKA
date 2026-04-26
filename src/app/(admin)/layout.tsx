'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, ClipboardList, ShoppingBag,
  ArrowLeft, Shield, LogOut,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reports', label: 'Laporan', icon: FileText },
  { href: '/admin/requests', label: 'Permohonan', icon: ClipboardList },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdminUser, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdminUser) {
        router.replace('/login');
      } else {
        setChecked(true);
      }
    }
  }, [loading, user, isAdminUser, router]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Show nothing while checking auth (prevents flash)
  if (loading || !checked) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: '#060a12',
      }}>
        <div style={{ textAlign: 'center', color: '#4b5563' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #1f2937',
            borderTopColor: '#dc2626', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
          <p style={{ fontSize: '13px' }}>Memeriksa akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060a12' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, height: '100%',
        background: 'linear-gradient(180deg, #080d1a 0%, #0a1020 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <img src="/logo.png" alt="PUSAKA" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.4)) drop-shadow(0px 2px 3px rgba(0,0,0,0.2))' }} />
            <div>
              <p style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>PUSAKA</p>
              <p style={{ fontSize: '10px', color: '#dc2626', margin: 0, fontWeight: 600, letterSpacing: '0.08em' }}>ADMIN PANEL</p>
            </div>
          </div>
          {/* Admin user info */}
          <div style={{
            marginTop: '12px', padding: '8px 10px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {(user?.user_metadata?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p style={{ fontSize: '9px', color: '#dc2626', margin: 0, fontWeight: 600 }}>Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '10px', color: '#374151', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
            NAVIGASI
          </p>
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                  transition: 'all 0.15s',
                  background: active ? 'rgba(220,38,38,0.15)' : 'transparent',
                  color: active ? '#f87171' : '#4b5563',
                  border: active ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400 }}>{label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link
            href="/overview"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
              borderRadius: '10px', textDecoration: 'none', color: '#4b5563',
              border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.15s', fontSize: '13px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'transparent'; }}
          >
            <ArrowLeft size={14} /> Kembali ke Aplikasi
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
              borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)',
              background: 'rgba(239,68,68,0.05)', color: '#ef4444',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              transition: 'all 0.15s', width: '100%',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', background: '#060a12' }}>
        {children}
      </main>
    </div>
  );
}
