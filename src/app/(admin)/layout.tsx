'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, ClipboardList, ShoppingBag,
  ArrowLeft, Shield, LogOut, Menu, X, Map, Globe,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reports', label: 'Laporan', icon: FileText },
  { href: '/admin/requests', label: 'Permohonan', icon: ClipboardList },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/admin/village-map', label: 'Peta Wilayah', icon: Map },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdminUser, loading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdminUser) {
        router.replace('/login');
      } else {
        setChecked(true);
      }
    }
  }, [loading, user, isAdminUser, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Show nothing while checking auth (prevents flash)
  if (loading || !checked) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(22,163,74,0.30)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <Globe size={28} color="white" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#0f172a', fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 4px' }}>PUSAKA</p>
            <p style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter, sans-serif', margin: 0 }}>Memeriksa akses admin...</p>
          </div>
          <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3" style={{
        background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={16} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 800, margin: 0, color: '#0f172a' }}>PUSAKA</p>
            <p style={{ fontSize: 9, color: '#16a34a', margin: 0, fontWeight: 600, letterSpacing: '0.08em' }}>ADMIN PANEL</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{
          padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b',
        }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar — Light Theme (matches user Sidebar) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 shrink-0 h-full flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: collapsed ? 72 : 240,
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
          transition: 'width 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden"
          style={{
            position: 'absolute', right: -44, top: 16,
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <X size={18} />
        </button>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex"
          style={{
            position: 'absolute', right: -12, top: 52, zIndex: 10,
            width: 24, height: 24, background: 'white',
            border: '1px solid #e2e8f0', borderRadius: '50%',
            alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '24px 0 20px' : '24px 20px 20px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,163,74,0.30)', flexShrink: 0,
          }}>
            <Globe size={18} color="white" />
          </div>
          {!collapsed && (
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a', lineHeight: 1.2 }}>PUSAKA</p>
              <p style={{ fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px', scrollbarWidth: 'none' }}>
          {!collapsed ? (
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#cbd5e1',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '8px 8px 6px', margin: 0,
            }}>
              NAVIGASI
            </p>
          ) : (
            <div style={{ height: 8 }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {adminNav.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderRadius: 12, textDecoration: 'none',
                    padding: collapsed ? '10px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: active ? 'rgba(22,163,74,0.08)' : 'transparent',
                    color: active ? '#16a34a' : '#64748b',
                    fontWeight: active ? 600 : 400,
                    position: 'relative',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#64748b';
                    }
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, background: '#16a34a', borderRadius: '0 4px 4px 0',
                    }} />
                  )}
                  <Icon size={17} strokeWidth={active ? 2.3 : 1.7} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ fontSize: 13 }}>{label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: collapsed ? '12px 8px' : '12px 14px' }}>
          <Link
            href="/overview"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: 12, textDecoration: 'none',
              padding: collapsed ? '10px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#64748b', transition: 'background 0.15s',
              fontSize: 13, marginBottom: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
          >
            <ArrowLeft size={15} />
            {!collapsed && <span>Kembali ke Aplikasi</span>}
          </Link>

          {/* User info + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0,
              border: '2px solid #dcfce7',
            }}>
              {avatarLetter}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </p>
                  <p style={{ fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 600 }}>Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#cbd5e1', padding: 4, borderRadius: 8,
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-[52px] md:pt-0" style={{ background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}
