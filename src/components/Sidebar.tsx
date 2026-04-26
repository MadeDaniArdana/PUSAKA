'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Leaf, Radio, Shield, ShoppingBag, HelpCircle,
  LogOut, Plus, Settings, LogIn, User, X, Menu
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/environment', label: 'Environment', icon: Leaf },
  { href: '/command-center', label: 'Command Center', icon: Radio },
  { href: '/administration', label: 'Administration', icon: Shield },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdminUser, loading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="PUSAKA Logo" className="w-8 h-8 object-contain transition-transform hover:scale-105" style={{ filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.25)) drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
          <span className="font-outfit font-bold text-[18px] text-slate-800">PUSAKA</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-[108px] bg-white border-r border-slate-200
          flex flex-col flex-shrink-0 h-full transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Close Button (Hidden on Desktop) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute -right-12 top-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-500"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-5 pb-4 px-2">
          <img src="/logo.png" alt="PUSAKA" className="w-10 h-10 object-contain mb-1 transition-transform hover:scale-105" style={{ filter: 'drop-shadow(2px 5px 6px rgba(0,0,0,0.25)) drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: '#0f172a', letterSpacing: '-0.01em' }}>
            PUSAKA
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '1px' }}>
            Smart Village
          </span>
        </div>

        {/* New Report Button */}
        <div className="px-3 mb-4">
          <Link
            href="/environment/new"
            onClick={handleNewReport}
            className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 px-1 text-[11px] font-semibold transition-colors shadow-sm"
          >
            <Plus size={14} />
            New Report
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto no-scrollbar">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all duration-200
                  ${active ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-green-600 rounded-r-md" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom — Auth Section */}
        <div className="flex flex-col gap-1 px-2 pb-5 mt-auto">
          <button className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors text-[10px] font-medium">
            <HelpCircle size={18} strokeWidth={1.8} />
            <span>Help</span>
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="flex flex-col items-center gap-1 py-2 px-1 border-t border-slate-100 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm">
                      {avatarLetter}
                    </div>
                    <span className="text-[9px] text-slate-600 font-semibold text-center w-full truncate px-1">
                      {displayName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors text-[10px] font-medium"
                  >
                    <LogOut size={18} strokeWidth={1.8} />
                    <span>Logout</span>
                  </button>

                  {isAdminUser && (
                    <Link
                      href="/admin"
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors text-[10px] font-bold mt-1"
                    >
                      <Settings size={16} strokeWidth={2} />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors text-[10px] font-bold mt-1"
                >
                  <LogIn size={18} strokeWidth={2} />
                  <span>Masuk</span>
                </Link>
              )}
            </>
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
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white text-sm font-bold shadow-lg shadow-green-600/20 hover:from-green-700 hover:to-green-800 transition-all"
              >
                <LogIn size={18} /> Masuk Sekarang
              </Link>
              <Link
                href="/register"
                onClick={() => setShowLoginPrompt(false)}
                className="flex items-center justify-center p-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 text-sm font-bold hover:border-slate-300 transition-colors"
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
