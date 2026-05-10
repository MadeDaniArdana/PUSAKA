'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe, Bell, LogOut, LayoutDashboard, Home,
  Menu, X, Shield, Users, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdminUser, loading: authLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notifTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const userRole = isAdminUser ? 'Administrator' : 'Warga';
  const dashboardHref = isAdminUser ? '/admin' : '/overview';

  const isHomepage = pathname === '/';
  const isPasar = pathname === '/pasar';
  const isDashboard = pathname.startsWith('/overview') || pathname.startsWith('/environment')
    || pathname.startsWith('/command-center') || pathname.startsWith('/village-map')
    || pathname.startsWith('/marketplace') || pathname.startsWith('/administration')
    || pathname.startsWith('/admin');

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    async function fetchNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    }

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setShowUserMenu(true);
  };
  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setShowUserMenu(false), 200);
  };

  const handleNotifEnter = () => {
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    setShowNotifMenu(true);
  };
  const handleNotifLeave = () => {
    notifTimeoutRef.current = setTimeout(() => setShowNotifMenu(false), 200);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <nav className="global-nav">
      {/* Left: Logo + Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,163,74,0.35)', flexShrink: 0,
          }}>
            <Globe size={18} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a', lineHeight: 1.1 }}>PUSAKA</p>
            <p style={{ fontSize: 8, color: '#16a34a', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Smart Village Hub</p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 20 }}>
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isHomepage ? 600 : 500,
              color: isHomepage ? '#16a34a' : '#64748b',
              background: isHomepage ? 'rgba(22,163,74,0.08)' : 'transparent',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (!isHomepage) { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a'; } }}
            onMouseLeave={e => { if (!isHomepage) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; } }}
          >
            <Home size={14} />
            Beranda
          </Link>

          <Link
            href="/pasar"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isPasar ? 600 : 500,
              color: isPasar ? '#16a34a' : '#64748b',
              background: isPasar ? 'rgba(22,163,74,0.08)' : 'transparent',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (!isPasar) { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a'; } }}
            onMouseLeave={e => { if (!isPasar) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; } }}
          >
            <ShoppingBag size={14} />
            Pasar UMKM
          </Link>

          {!authLoading && user && (
            <Link
              href={dashboardHref}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: isDashboard ? 600 : 500,
                color: isDashboard ? '#16a34a' : '#64748b',
                background: isDashboard ? 'rgba(22,163,74,0.08)' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!isDashboard) { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a'; } }}
              onMouseLeave={e => { if (!isDashboard) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; } }}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Right: Auth section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {authLoading ? (
          <div style={{ width: 80, height: 36, borderRadius: 8, background: '#f1f5f9' }} />
        ) : user ? (
          <>
            {/* Notification bell — Desktop */}
            <div
              className="nav-links-desktop"
              style={{ position: 'relative' }}
              onMouseEnter={handleNotifEnter}
              onMouseLeave={handleNotifLeave}
            >
              <button style={{
                position: 'relative', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 8, borderRadius: 10,
                color: '#64748b', transition: 'background 0.2s, color 0.2s',
                display: 'flex', alignItems: 'center',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#0f172a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    minWidth: 16, height: 16, borderRadius: 999,
                    background: '#ef4444', border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: 'white', fontWeight: 700,
                    padding: '0 3px',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifMenu && (
                <div className="user-menu-dropdown" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 320, background: 'white', borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  <div style={{
                    padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifikasi</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11, color: '#16a34a', fontWeight: 600,
                        }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center' }}>
                        <Bell size={24} color="#e2e8f0" style={{ marginBottom: 8 }} />
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '12px 18px', cursor: 'pointer',
                            borderBottom: '1px solid #f8fafc',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{n.title}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{n.message}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 10, color: '#cbd5e1' }}>
                            {new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar + dropdown — Desktop */}
            <div
              className="nav-links-desktop"
              style={{ position: 'relative' }}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <button style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg,#16a34a,#15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 14,
                border: showUserMenu ? '2px solid #bbf7d0' : '2px solid transparent',
                cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: showUserMenu ? '0 0 0 3px rgba(22,163,74,0.15)' : 'none',
              }}>
                {avatarLetter}
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 260, background: 'white', borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  {/* User info with role */}
                  <div style={{
                    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#16a34a,#15803d)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0,
                      border: '2px solid #dcfce7',
                    }}>
                      {avatarLetter}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {displayName}
                      </p>
                      <p style={{
                        margin: '2px 0 0', fontSize: 12, color: '#94a3b8',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {userEmail}
                      </p>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        marginTop: 6, padding: '2px 8px', borderRadius: 999,
                        background: isAdminUser ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${isAdminUser ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {isAdminUser ? <Shield size={10} color="#dc2626" /> : <Users size={10} color="#16a34a" />}
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                          color: isAdminUser ? '#dc2626' : '#16a34a',
                        }}>
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard link */}
                  <div style={{ padding: '6px 8px' }}>
                    <Link href={dashboardHref} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      textDecoration: 'none', color: '#475569',
                      fontSize: 13, fontWeight: 500,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#475569'; }}
                    >
                      <LayoutDashboard size={15} />
                      {isAdminUser ? 'Admin Panel' : 'Dashboard Warga'}
                    </Link>
                  </div>

                  <div style={{ height: 1, background: '#f1f5f9', margin: '0 12px' }} />

                  {/* Logout */}
                  <div style={{ padding: '6px 8px 8px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10, width: '100%',
                        background: 'transparent', border: 'none',
                        color: '#dc2626', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <LogOut size={15} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: 'none', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 8, borderRadius: 10, color: '#64748b',
              }}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        ) : (
          /* Not logged in */
          <>
            <Link href="/login" className="nav-links-desktop" style={{
              fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500,
              padding: '8px 16px', borderRadius: 8, transition: 'background 0.2s',
            }}>
              Masuk
            </Link>
            <Link href="/register" style={{
              fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 600,
              padding: '8px 20px', background: 'linear-gradient(135deg,#16a34a,#15803d)',
              borderRadius: 8, boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}>
              Daftar Gratis
            </Link>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {showMobileMenu && user && (
        <div className="nav-mobile-dropdown user-menu-dropdown" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          padding: '12px 16px', zIndex: 100,
        }}>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 0 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 8,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 14,
              border: '2px solid #dcfce7',
            }}>
              {avatarLetter}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{displayName}</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: '#94a3b8' }}>{userEmail}</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 4, padding: '2px 8px', borderRadius: 999,
                background: isAdminUser ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${isAdminUser ? '#fecaca' : '#bbf7d0'}`,
              }}>
                {isAdminUser ? <Shield size={9} color="#dc2626" /> : <Users size={9} color="#16a34a" />}
                <span style={{ fontSize: 9, fontWeight: 700, color: isAdminUser ? '#dc2626' : '#16a34a' }}>
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              color: isHomepage ? '#16a34a' : '#475569', fontWeight: isHomepage ? 600 : 500, fontSize: 13,
              background: isHomepage ? 'rgba(22,163,74,0.08)' : 'transparent',
            }}>
              <Home size={16} /> Beranda
            </Link>
            <Link href="/pasar" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              color: isPasar ? '#16a34a' : '#475569', fontWeight: isPasar ? 600 : 500, fontSize: 13,
              background: isPasar ? 'rgba(22,163,74,0.08)' : 'transparent',
            }}>
              <ShoppingBag size={16} /> Pasar UMKM
            </Link>
            <Link href={dashboardHref} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              color: isDashboard ? '#16a34a' : '#475569', fontWeight: isDashboard ? 600 : 500, fontSize: 13,
              background: isDashboard ? 'rgba(22,163,74,0.08)' : 'transparent',
            }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />

          {/* Notifications summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            color: '#475569', fontSize: 13,
          }}>
            <Bell size={16} />
            <span>{unreadCount > 0 ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}</span>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 10, background: 'transparent',
              border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13, fontWeight: 500,
            }}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}
    </nav>
  );
}
