'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, ClipboardList, ShoppingBag,
  ArrowLeft, Shield, LogOut, Menu, X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-[#060a12]">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-[#080d1a] border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PUSAKA" className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.4))' }} />
          <div>
            <p className="font-outfit text-sm font-bold text-white m-0 leading-none">PUSAKA</p>
            <p className="text-[9px] text-red-500 m-0 font-semibold tracking-wider">ADMIN PANEL</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[220px] shrink-0 h-full
        bg-gradient-to-b from-[#080d1a] to-[#0a1020]
        border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute -right-11 top-4 w-9 h-9 bg-[#1e293b] rounded-full flex items-center justify-center text-slate-400"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-1">
            <img src="/logo.png" alt="PUSAKA" className="w-9 h-9 object-contain" style={{ filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.4)) drop-shadow(0px 2px 3px rgba(0,0,0,0.2))' }} />
            <div>
              <p className="font-outfit text-base font-bold text-white m-0">PUSAKA</p>
              <p className="text-[10px] text-red-600 m-0 font-semibold tracking-wider">ADMIN PANEL</p>
            </div>
          </div>
          {/* Admin user info */}
          <div className="mt-3 p-2 px-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {(user?.user_metadata?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 m-0 truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-[9px] text-red-600 m-0 font-semibold">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          <p className="text-[10px] text-slate-700 font-bold tracking-widest uppercase px-2 pt-2 pb-1">
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
        <div className="p-2 pb-5 border-t border-white/5 flex flex-col gap-1">
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
      <main className="flex-1 overflow-auto bg-[#060a12] pt-[52px] md:pt-0">
        {children}
      </main>
    </div>
  );
}
