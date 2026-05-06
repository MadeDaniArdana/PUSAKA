'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Leaf, Radio, Shield, ShoppingBag, HelpCircle,
  LogOut, Plus, Settings, LogIn, User, X, ChevronLeft, ChevronRight,
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
    if (href === '/overview') return pathname === '/overview' || pathname === '/';
    return pathname.startsWith(href);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'W';

  return (
    <>
      {/* ═══ MOBILE: Bottom Navigation Bar ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0f1a] border-t border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-stretch justify-around h-[60px]">
          {[
            { href: '/overview', label: 'Home', icon: LayoutDashboard },
            { href: '/environment', label: 'Lingkungan', icon: Leaf },
            { href: '/command-center', label: 'Komando', icon: Radio },
            { href: '/administration', label: 'Surat', icon: Shield },
            { href: '/marketplace', label: 'Pasar', icon: ShoppingBag },
          ].map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 flex-1 no-underline transition-colors relative
                  ${active ? 'text-green-400' : 'text-slate-500'}
                `}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-green-500 rounded-b-full" />
                )}
                <Icon size={20} strokeWidth={active ? 2.4 : 1.6} />
                <span className={`text-[9px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 text-slate-500 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-[9px]">
                  {avatarLetter}
                </div>
                <span className="text-[9px] leading-none font-medium">Akun</span>
              </button>
            ) : (
              <Link href="/login" className="flex flex-col items-center justify-center gap-0.5 flex-1 text-green-400 no-underline">
                <LogIn size={20} strokeWidth={1.8} />
                <span className="text-[9px] leading-none font-bold">Masuk</span>
              </Link>
            )
          )}
        </div>
      </nav>

      {/* ═══ DESKTOP: Dark Vertical Sidebar ═══ */}
      <aside className={`
        hidden md:flex flex-col shrink-0 h-full relative
        bg-[#0b0f1a] border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[52px] z-10 w-6 h-6 bg-[#1a2035] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#253050] transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 pt-6 pb-5 ${collapsed ? 'justify-center px-0' : ''}`}>
          <img
            src="/logo.png"
            alt="PUSAKA"
            className="w-9 h-9 object-contain shrink-0"
            style={{ filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.4))' }}
          />
          {!collapsed && (
            <div>
              <p className="font-outfit text-[15px] font-bold text-white m-0 leading-tight">PUSAKA</p>
              <p className="text-[10px] text-slate-500 m-0 font-semibold tracking-wider uppercase">Smart Village Hub</p>
            </div>
          )}
        </div>

        {/* New Report Button */}
        <div className={`px-3 mb-2 ${collapsed ? 'px-2' : ''}`}>
          <Link
            href="/environment/new"
            onClick={handleNewReport}
            className={`
              flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white
              rounded-xl py-2.5 text-[13px] font-semibold transition-colors shadow-lg shadow-green-600/20 no-underline
              ${collapsed ? 'px-0 w-full' : 'px-4'}
            `}
          >
            <Plus size={16} />
            {!collapsed && <span>Laporan Baru</span>}
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          {navSections.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'mt-5' : 'mt-2'}>
              {/* Section Label */}
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-3 mb-2">
                  {section.label}
                </p>
              )}
              {collapsed && si > 0 && (
                <div className="w-6 h-px bg-white/[0.06] mx-auto mb-2" />
              )}

              {/* Items */}
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={collapsed ? label : undefined}
                      className={`
                        group relative flex items-center gap-3 rounded-xl no-underline transition-all duration-200
                        ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                        ${active
                          ? 'bg-green-500/10 text-green-400'
                          : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green-500 rounded-r-full" />
                      )}
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.6} className="shrink-0" />
                      {!collapsed && (
                        <span className={`text-[13px] ${active ? 'font-semibold' : 'font-normal'}`}>
                          {label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin link inside navigation */}
          {!loading && isAdminUser && (
            <div className="mt-5">
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-3 mb-2">
                  ADMIN
                </p>
              )}
              {collapsed && <div className="w-6 h-px bg-white/[0.06] mx-auto mb-2" />}
              <Link
                href="/admin"
                className={`
                  flex items-center gap-3 rounded-xl no-underline transition-all duration-200
                  ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                  text-red-400 hover:bg-red-500/10
                `}
              >
                <Settings size={18} strokeWidth={1.6} className="shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium">Panel Admin</span>}
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom — User Profile */}
        <div className={`border-t border-white/[0.06] p-3 ${collapsed ? 'px-2' : 'px-4'}`}>
          {!loading && (
            user ? (
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border-2 border-white/10">
                  {avatarLetter}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-200 m-0 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-600 m-0 font-medium">Warga</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className={`text-slate-600 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-1 ${collapsed ? 'hidden' : ''}`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`
                  flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 
                  text-green-400 no-underline transition-colors hover:bg-green-500/20
                  ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                `}
              >
                <LogIn size={16} />
                {!collapsed && <span className="text-[13px] font-semibold">Masuk</span>}
              </Link>
            )
          )}
        </div>
      </aside>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-slate-900/60 z-[2000] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[380px] shadow-2xl text-center relative">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-500"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <User size={24} className="text-green-600" />
            </div>

            <h2 className="font-outfit text-xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Silakan masuk terlebih dahulu untuk membuat laporan baru dan membantu kemajuan desa.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/login?redirect=/environment/new"
                onClick={() => setShowLoginPrompt(false)}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white text-sm font-bold shadow-lg shadow-green-600/20 hover:from-green-700 hover:to-green-800 transition-all no-underline"
              >
                <LogIn size={18} /> Masuk Sekarang
              </Link>
              <Link
                href="/register"
                onClick={() => setShowLoginPrompt(false)}
                className="flex items-center justify-center p-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 text-sm font-bold hover:border-slate-300 transition-colors no-underline"
              >
                Daftar Akun Baru
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-[13px] text-slate-500 font-medium p-2 mt-2 hover:text-slate-800 transition-colors"
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
