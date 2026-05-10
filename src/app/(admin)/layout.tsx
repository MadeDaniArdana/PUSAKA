'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, ClipboardList, ShoppingBag,
  Shield, Menu, X, Map, Globe,
  ChevronLeft, ChevronRight, Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reports', label: 'Laporan', icon: FileText },
  { href: '/admin/requests', label: 'Permohonan', icon: ClipboardList },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/admin/village-map', label: 'Peta Wilayah', icon: Map },
  { href: '/admin/verify-users', label: 'Verifikasi Warga', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Global Navbar — top */}
      <Navbar />

      {/* Sidebar + Content — below navbar */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 shrink-0 flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
          style={{
            width: collapsed ? 72 : 240,
            top: 'var(--navbar-height)',
            background: 'white',
            borderRight: '1px solid #e2e8f0',
            boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
            transition: 'width 0.3s ease, transform 0.3s ease',
            height: 'calc(100vh - var(--navbar-height))',
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
              position: 'absolute', right: -12, top: 20, zIndex: 10,
              width: 24, height: 24, background: 'white',
              border: '1px solid #e2e8f0', borderRadius: '50%',
              alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>


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
        </aside>

        {/* Mobile sidebar toggle — floating */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed z-30"
          style={{
            bottom: 20, left: 16,
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', color: 'white',
            boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
          }}
        >
          <Menu size={20} />
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-auto" style={{ background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
