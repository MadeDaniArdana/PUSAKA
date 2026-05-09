'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ChevronRight, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const benefits = [
  { icon: '📋', title: 'Layanan Administrasi', desc: 'Ajukan surat keterangan & KTP tanpa antre' },
  { icon: '🗺️', title: 'Laporkan Infrastruktur', desc: 'Foto & kirim laporan kerusakan jalan' },
  { icon: '🛍️', title: 'Pasarkan Produk UMKM', desc: 'Jangkau pembeli di seluruh kecamatan' },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin.griyasync@gmail.com';
    if (email.trim().toLowerCase() === adminEmail.toLowerCase()) {
      setError('Akses ditolak: Tidak dapat mendaftar dengan email administrator.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          flexDirection: 'column',
          padding: '48px 52px',
          background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(22,163,74,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '45%', right: '8%', width: 110, height: 110, borderRadius: '50%', background: 'rgba(134,239,172,0.15)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
          }}>
            <img src="/logo.png" alt="PUSAKA" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#15803d', letterSpacing: '0.03em' }}>
            PUSAKA
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, gap: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: '999px', padding: '6px 14px', width: 'fit-content',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: '#16a34a' }}>DAFTAR GRATIS</span>
          </div>

          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '38px', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', color: '#14532d' }}>
              Bergabung dengan<br />Komunitas Desa<br />Cerdas
            </h1>
            <p style={{ fontSize: '15px', color: '#4b7c59', lineHeight: 1.7, maxWidth: '320px', margin: 0 }}>
              Akses layanan desa, ajukan surat dengan mudah, dan laporkan infrastruktur untuk kemajuan bersama.
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>{b.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#14532d' }}>{b.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b7c59', marginTop: '2px' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', zIndex: 10,
          color: '#16a34a', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', padding: '8px 0',
        }}>
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#ffffff' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="PUSAKA" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>PUSAKA</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Buat Akun Warga
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Daftarkan diri Anda untuk mengakses portal PUSAKA.
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div style={{
              padding: '24px', borderRadius: '16px', textAlign: 'center',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
                Pendaftaran Berhasil!
              </h3>
              <p style={{ fontSize: '13px', color: '#4b7c59', margin: 0 }}>
                Anda akan diarahkan ke halaman masuk...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{
                  padding: '12px 14px', borderRadius: '10px',
                  background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 500,
                  border: '1px solid #fecaca', display: 'flex', gap: '8px', alignItems: 'flex-start',
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nama Lengkap
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Budi Santoso" required
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      color: '#0f172a', background: '#fafafa', boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#16a34a';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)';
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
                      border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      color: '#0f172a', background: '#fafafa', boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#16a34a';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)';
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
                    placeholder="••••••••" required minLength={6}
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      color: '#0f172a', background: '#fafafa', boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#16a34a';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)';
                      e.currentTarget.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#fafafa';
                    }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0 2px' }}>Minimal 6 karakter</p>
              </div>

              {/* Password strength hint */}
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <CheckCircle size={14} color="#16a34a" />
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Pendaftaran khusus untuk warga desa. Admin dikelola terpisah.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: '4px', width: '100%', padding: '14px', borderRadius: '12px',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#86efac' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white', fontSize: '14px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(22,163,74,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 14px rgba(22,163,74,0.3)';
                }}
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                {!loading && <ChevronRight size={16} />}
              </button>
            </form>
          )}

          {/* Login link */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
