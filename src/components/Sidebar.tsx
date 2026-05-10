'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Leaf, Radio, Shield, ShoppingBag, HelpCircle, Globe,
  LogOut, Plus, Settings, LogIn, User, X, ChevronLeft, ChevronRight, Map,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'LAYANAN',
    items: [
      { href: '/environment', label: 'Lingkungan', icon: Leaf },
      { href: '/command-center', label: 'Pusat Komando', icon: Radio },
      { href: '/village-map', label: 'Peta Wilayah', icon: Map },
    ],
  },
  {
    label: 'ADMINISTRASI',
    items: [
      { href: '/administration', label: 'Permohonan Surat', icon: Shield },
      { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ],
  },
  {
    label: 'SISTEM',
    items: [
      { href: '#help', label: 'Bantuan', icon: HelpCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdminUser, loading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/overview');
    router.refresh();
  };

  const handleNewReport = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/overview') return pathname === '/overview';
    return pathname.startsWith(href);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'W';

  return (
    <>
      {/* ═══ MOBILE: Bottom Navigation Bar — Light Theme ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around', height: 64 }}>
          {[
            { href: '/overview', label: 'Home', icon: LayoutDashboard },
            { href: '/environment', label: 'Lingkungan', icon: Leaf },
            { href: '/command-center', label: 'Komando', icon: Radio },
            { href: '/village-map', label: 'Peta', icon: Map },
            { href: '/marketplace', label: 'Pasar', icon: ShoppingBag },
          ].map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  flex: 1,
                  textDecoration: 'none',
                  color: active ? '#16a34a' : '#94a3b8',
                  position: 'relative',
                  transition: 'color 0.2s',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 3,
                    background: '#16a34a',
                    borderRadius: '0 0 4px 4px',
                  }} />
                )}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: active ? 'rgba(22,163,74,0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <Icon size={19} strokeWidth={active ? 2.4 : 1.7} />
                </div>
                <span style={{ fontSize: 9, lineHeight: 1, fontWeight: active ? 700 : 500 }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══ DESKTOP: Light Vertical Sidebar ═══ */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-full relative"
        style={{
          width: collapsed ? 72 : 240,
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: -12,
            top: 52,
            zIndex: 10,
            width: 24,
            height: 24,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0f172a'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>


        {/* New Report Button */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px 12px 8px' }}>
          <Link
            href="/environment/new"
            onClick={handleNewReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              color: 'white',
              borderRadius: 12,
              padding: collapsed ? '10px 0' : '10px 16px',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(22,163,74,0.30)',
              transition: 'opacity 0.2s',
              width: '100%',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <Plus size={16} />
            {!collapsed && <span>Laporan Baru</span>}
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px', scrollbarWidth: 'none' }}>
          {navSections.map((section, si) => (
            <div key={section.label} style={{ marginTop: si > 0 ? 20 : 8 }}>
              {/* Section Label */}
              {!collapsed ? (
                <p style={{
                  fontSize: 10, fontWeight: 700, color: '#cbd5e1',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '0 8px', margin: '0 0 6px',
                }}>
                  {section.label}
                </p>
              ) : si > 0 ? (
                <div style={{ width: 28, height: 1, background: '#f1f5f9', margin: '0 auto 8px' }} />
              ) : null}

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={collapsed ? label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        borderRadius: 12,
                        textDecoration: 'none',
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
                      {/* Active indicator bar */}
                      {active && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 20,
                          background: '#16a34a',
                          borderRadius: '0 4px 4px 0',
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
            </div>
          ))}

          {/* Admin link */}
          {!loading && isAdminUser && (
            <div style={{ marginTop: 20 }}>
              {!collapsed ? (
                <p style={{
                  fontSize: 10, fontWeight: 700, color: '#fca5a5',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '0 8px', margin: '0 0 6px',
                }}>
                  ADMIN
                </p>
              ) : (
                <div style={{ width: 28, height: 1, background: '#f1f5f9', margin: '0 auto 8px' }} />
              )}
              <Link
                href="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 12,
                  textDecoration: 'none',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: '#dc2626',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fef2f2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                <Settings size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Panel Admin</span>}
              </Link>
            </div>
          )}
        </nav>


      </aside>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)', padding: 16,
        }}>
          <div style={{
            background: 'white', borderRadius: 24, padding: 32,
            width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            textAlign: 'center', position: 'relative',
            border: '1px solid #f1f5f9',
          }}>
            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 32, height: 32, borderRadius: 10,
                border: '1px solid #e2e8f0', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <User size={24} color="#16a34a" />
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Login Diperlukan
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
              Silakan masuk terlebih dahulu untuk membuat laporan baru dan membantu kemajuan desa.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/login?redirect=/environment/new"
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  boxShadow: '0 6px 18px rgba(22,163,74,0.30)',
                }}
              >
                <LogIn size={17} /> Masuk Sekarang
              </Link>
              <Link
                href="/register"
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '13px 20px', borderRadius: 12,
                  border: '1.5px solid #e2e8f0', background: 'white',
                  color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14,
                }}
              >
                Daftar Akun Baru
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  fontSize: 13, color: '#94a3b8', fontWeight: 500, padding: 8,
                  marginTop: 4, background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                Lihat saja dulu →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
