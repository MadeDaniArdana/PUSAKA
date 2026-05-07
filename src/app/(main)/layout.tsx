'use client';

import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setChecking(false);
      }
    });
  }, [pathname, router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(22,163,74,0.30)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <img src="/logo.png" alt="PUSAKA" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#0f172a', fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 4px' }}>PUSAKA</p>
            <p style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter, sans-serif', margin: 0 }}>Memeriksa sesi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col w-full relative pb-[60px] md:pb-0">
        {children}
      </main>
    </div>
  );
}
