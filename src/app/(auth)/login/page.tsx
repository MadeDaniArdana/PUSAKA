'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ChevronRight, ShieldCheck, Shield, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email atau kata sandi salah. Silakan periksa kembali.');
      setLoading(false);
    } else {
      router.push(role === 'admin' ? '/admin' : redirectTo);
      router.refresh();
    }
  };

  const switchRole = (newRole: 'warga' | 'admin') => {
    setRole(newRole);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Left Banner */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', padding: '48px',
        background: 'linear-gradient(160deg, #0a0f1e 0%, #0f172a 40%, #161f35 100%)',
        color: 'white', position: 'relative', overflow: 'hidden',
      }} className="lg-flex">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800 }}>GriyaSync</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, gap: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '999px', padding: '4px 12px', width: 'fit-content' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, letterSpacing: '0.05em' }}>SISTEM AKTIF</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '40px', fontWeight: 800, lineHeight: 1.15, margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Platform Tata<br />Kelola Desa<br />Terpadu
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, maxWidth: '340px', margin: 0 }}>
            Satu portal untuk layanan administrasi digital, pelaporan infrastruktur, dan pemberdayaan UMKM warga.
          </p>
          <Link href="/overview" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#4ade80', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
            padding: '8px 0', width: 'fit-content',
          }}>
            👁️ Lihat laporan tanpa login →
          </Link>
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Role Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '14px', padding: '4px', marginBottom: '28px', gap: '4px' }}>
            {([
              { key: 'warga', label: 'Masuk sebagai Warga', icon: Users },
              { key: 'admin', label: 'Masuk sebagai Admin', icon: Shield },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchRole(key)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: role === key ? 700 : 500, transition: 'all 0.2s',
                  background: role === key
                    ? (key === 'admin' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'white')
                    : 'transparent',
                  color: role === key ? (key === 'admin' ? '#f87171' : '#0f172a') : '#94a3b8',
                  boxShadow: role === key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              {role === 'admin' ? '🛡️ Akses Admin Panel' : '👋 Selamat Datang'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {role === 'admin'
                ? 'Masuk dengan akun administrator untuk mengelola platform.'
                : 'Masuk untuk membuat laporan atau mengajukan dokumen.'}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{ padding: '12px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alamat Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                    border: `1.5px solid ${role === 'admin' ? 'rgba(220,38,38,0.3)' : '#e2e8f0'}`,
                    fontSize: '14px', outline: 'none', color: '#0f172a',
                    background: role === 'admin' ? '#fef2f2' : 'white',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = role === 'admin' ? '#dc2626' : '#16a34a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = role === 'admin' ? 'rgba(220,38,38,0.3)' : '#e2e8f0')}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                    border: `1.5px solid ${role === 'admin' ? 'rgba(220,38,38,0.3)' : '#e2e8f0'}`,
                    fontSize: '14px', outline: 'none', color: '#0f172a',
                    background: role === 'admin' ? '#fef2f2' : 'white',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = role === 'admin' ? '#dc2626' : '#16a34a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = role === 'admin' ? 'rgba(220,38,38,0.3)' : '#e2e8f0')}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: '4px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: role === 'admin'
                  ? (loading ? '#374151' : 'linear-gradient(135deg, #1e293b, #0f172a)')
                  : (loading ? '#86efac' : 'linear-gradient(135deg, #16a34a, #15803d)'),
                color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: role === 'admin' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              {loading ? 'Memproses...' : (role === 'admin' ? '🛡️ Masuk ke Admin Panel' : 'Masuk Akun')}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>

          {/* Guest access */}
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>👁️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Tidak ingin login?</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>Anda tetap bisa melihat laporan & peta tanpa akun.</p>
            </div>
            <Link href="/overview" style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Lihat →
            </Link>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) { .lg-flex { display: flex !important; } }
      `}} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}
