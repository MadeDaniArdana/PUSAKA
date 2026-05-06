'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Typically, wait for email confirmation. For simplicity, just redirect if session exists
      alert('Pendaftaran berhasil! Silakan masuk.');
      router.push('/login');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Left Banner */}
      <div style={{
        flex: 1, flexDirection: 'column', padding: '40px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white', position: 'relative', overflow: 'hidden',
      }} className="hidden lg:flex">
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'auto', zIndex: 10 }}>
          <img src="/logo.png" alt="PUSAKA" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(3px 8px 10px rgba(0,0,0,0.4)) drop-shadow(0px 3px 4px rgba(0,0,0,0.2))' }} />
          <span style={{ fontFamily: 'Outfit', fontSize: '26px', fontWeight: 800, letterSpacing: '0.02em' }}>
            PUSAKA
          </span>
        </div>

        <div style={{ zIndex: 10 }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '42px', fontWeight: 700, lineHeight: 1.1, marginBottom: '20px' }}>
            Bergabung dengan<br />Komunitas Cerdas
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '400px' }}>
            Akses layanan desa, ajukan surat dengan mudah, dan laporkan infrastruktur untuk kemajuan bersama.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Buat Akun Warga
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Daftarkan diri Anda untuk mengakses portal PUSAKA.
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '12px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NAMA LENGKAP
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'Inter',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ALAMAT EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'Inter',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                KATA SANDI
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'Inter',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', width: '100%', padding: '14px', borderRadius: '10px',
                border: 'none', background: '#16a34a', color: 'white', fontSize: '14px',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#15803d'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#16a34a'; }}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
