'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ChevronRight, Shield, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const features = [
  { icon: '📋', title: 'Administrasi Digital', desc: 'Ajukan surat & dokumen tanpa antre' },
  { icon: '🗺️', title: 'Pelaporan Infrastruktur', desc: 'Laporkan kerusakan jalan & fasilitas' },
  { icon: '🛍️', title: 'Pasar UMKM Desa', desc: 'Promosikan produk lokal secara digital' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/overview';
  const supabase = createClient();

  const [role, setRole] = useState<'warga' | 'admin'>('warga');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email atau kata sandi salah. Silakan periksa kembali.');
      setLoading(false);
    } else {
      // Admin bypasses verification
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (role === 'admin' || (adminEmail && email.toLowerCase() === adminEmail.toLowerCase())) {
        router.push('/admin');
        router.refresh();
        return;
      }

      // Check if warga is verified
      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', authData.user.id)
          .single();

        if (profile && !profile.is_verified) {
          // Not verified — sign out and show error
          await supabase.auth.signOut();
          setError('Akun Anda belum diverifikasi oleh admin desa. Silakan tunggu persetujuan.');
          setLoading(false);
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    }
  };

  const switchRole = (newRole: 'warga' | 'admin') => {
    setRole(newRole);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const isAdmin = role === 'admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          flexDirection: 'column',
          padding: '48px 52px',
          background: isAdmin
            ? 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)'
            : 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -120, right: -120, width: 380, height: 380,
          borderRadius: '50%',
          background: isAdmin ? 'rgba(148,163,184,0.12)' : 'rgba(22,163,74,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 280, height: 280,
          borderRadius: '50%',
          background: isAdmin ? 'rgba(100,116,139,0.08)' : 'rgba(74,222,128,0.1)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '10%', width: 120, height: 120,
          borderRadius: '50%',
          background: isAdmin ? 'rgba(148,163,184,0.06)' : 'rgba(134,239,172,0.15)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: isAdmin ? '#1e293b' : 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isAdmin ? '0 4px 16px rgba(30,41,59,0.25)' : '0 4px 16px rgba(22,163,74,0.3)',
          }}>
            <img src="/logo.png" alt="PUSAKA" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: isAdmin ? '#0f172a' : '#15803d', letterSpacing: '0.03em' }}>
            PUSAKA
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, gap: '32px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: isAdmin ? 'rgba(30,41,59,0.08)' : 'rgba(22,163,74,0.1)',
            border: `1px solid ${isAdmin ? 'rgba(30,41,59,0.15)' : 'rgba(22,163,74,0.2)'}`,
            borderRadius: '999px', padding: '6px 14px', width: 'fit-content',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isAdmin ? '#64748b' : '#22c55e',
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: isAdmin ? '#475569' : '#16a34a' }}>
              {isAdmin ? 'PANEL ADMINISTRATOR' : 'SISTEM AKTIF'}
            </span>
          </div>

          <div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '38px', fontWeight: 800,
              lineHeight: 1.15, margin: '0 0 16px',
              color: isAdmin ? '#0f172a' : '#14532d',
            }}>
              {isAdmin ? (
                <>Portal Manajemen<br />Desa Cerdas</>
              ) : (
                <>Platform Tata<br />Kelola Desa<br />Terpadu</>
              )}
            </h1>
            <p style={{ fontSize: '15px', color: isAdmin ? '#64748b' : '#4b7c59', lineHeight: 1.7, maxWidth: '320px', margin: 0 }}>
              {isAdmin
                ? 'Kelola seluruh aspek administrasi dan operasional desa dari satu dasbor terpusat.'
                : 'Satu portal untuk layanan administrasi digital, pelaporan infrastruktur, dan pemberdayaan UMKM warga.'}
            </p>
          </div>

          {/* Feature list */}
          {!isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {features.map((f) => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>{f.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#14532d' }}>{f.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#4b7c59' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Kelola laporan warga', 'Proses dokumen administrasi', 'Monitor aktivitas platform'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', zIndex: 10,
          color: isAdmin ? '#64748b' : '#16a34a', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', padding: '8px 0',
        }}>
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#ffffff' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: isAdmin ? '#1e293b' : 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="PUSAKA" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>PUSAKA</span>
          </div>

          {/* Role Toggle */}
          <div style={{
            display: 'flex', background: '#f8fafc', borderRadius: '14px',
            padding: '4px', marginBottom: '28px', gap: '4px',
            border: '1px solid #e2e8f0',
          }}>
            {([
              { key: 'warga', label: 'Warga', icon: Users },
              { key: 'admin', label: 'Admin', icon: Shield },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchRole(key)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  fontSize: '13px', fontWeight: role === key ? 700 : 500,
                  transition: 'all 0.2s ease',
                  background: role === key
                    ? (key === 'admin' ? '#1e293b' : '#ffffff')
                    : 'transparent',
                  color: role === key
                    ? (key === 'admin' ? '#ffffff' : '#15803d')
                    : '#94a3b8',
                  boxShadow: role === key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Icon size={14} />
                Masuk sebagai {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              {isAdmin ? '🛡️ Akses Admin Panel' : '👋 Selamat Datang'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              {isAdmin
                ? 'Masuk dengan akun administrator untuk mengelola platform.'
                : 'Masuk untuk membuat laporan atau mengajukan dokumen.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 500,
                border: '1px solid #fecaca', display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Alamat Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                    border: `1.5px solid ${isAdmin ? '#e2e8f0' : '#e2e8f0'}`,
                    fontSize: '14px', outline: 'none', color: '#0f172a',
                    background: '#fafafa', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = isAdmin ? '#475569' : '#16a34a';
                    e.currentTarget.style.boxShadow = isAdmin ? '0 0 0 3px rgba(71,85,105,0.1)' : '0 0 0 3px rgba(22,163,74,0.1)';
                    e.currentTarget.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', color: '#0f172a',
                    background: '#fafafa', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = isAdmin ? '#475569' : '#16a34a';
                    e.currentTarget.style.boxShadow = isAdmin ? '0 0 0 3px rgba(71,85,105,0.1)' : '0 0 0 3px rgba(22,163,74,0.1)';
                    e.currentTarget.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                marginTop: '4px', width: '100%', padding: '14px', borderRadius: '12px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: isAdmin
                  ? (loading ? '#94a3b8' : '#1e293b')
                  : (loading ? '#86efac' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'),
                color: 'white', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : (isAdmin ? '0 4px 14px rgba(30,41,59,0.25)' : '0 4px 14px rgba(22,163,74,0.3)'),
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = isAdmin ? '0 6px 18px rgba(30,41,59,0.3)' : '0 6px 18px rgba(22,163,74,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = loading ? 'none' : (isAdmin ? '0 4px 14px rgba(30,41,59,0.25)' : '0 4px 14px rgba(22,163,74,0.3)');
              }}
            >
              {loading ? 'Memproses...' : (isAdmin ? '🛡️ Masuk ke Admin Panel' : 'Masuk Akun')}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>

          {/* Guest access */}
          <div style={{
            marginTop: '18px', padding: '14px 16px', borderRadius: '12px',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>👁️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#15803d' }}>Tidak ingin login?</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#4b7c59', marginTop: '2px' }}>Anda tetap bisa melihat laporan & peta tanpa akun.</p>
            </div>
            <Link href="/overview" style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Lihat →
            </Link>
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
        Memuat...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
