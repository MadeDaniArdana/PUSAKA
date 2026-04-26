'use client';

import {
  Bell,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const quickActions = [
  { href: '/environment/new', icon: AlertTriangle, label: 'Laporkan Masalah', color: '#ef4444', bg: '#fee2e2' },
  { href: '/administration', icon: FileText, label: 'Ajukan Dokumen', color: '#3b82f6', bg: '#dbeafe' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Jelajahi Pasar', color: '#8b5cf6', bg: '#ede9fe' },
];

const featured = [
  {
    name: 'Warung Kopi Jaya',
    desc: 'Kopi lokal otentik & camilan.',
    tag: 'Buka Sekarang',
    tagColor: '#16a34a',
    gradient: 'linear-gradient(135deg, #7c3f00 0%, #b45309 100%)',
  },
  {
    name: 'Batik Nusantara',
    desc: 'Kain batik handmade pilihan.',
    tag: 'Buka Sekarang',
    tagColor: '#16a34a',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
  },
];

function StatCard({
  label, value, sub, subColor, icon: Icon, iconBg,
}: {
  label: string; value: string; sub: string; subColor?: string;
  icon: React.ElementType; iconBg: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color: '#475569' }} />
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>{value}</div>
      <div style={{ fontSize: '12px', color: subColor || '#94a3b8' }}>{sub}</div>
    </div>
  );
}

export default function OverviewPage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const f = featured[featuredIdx];
  const [stats, setStats] = useState({ activeReports: 0, totalReports: 0, approvedRequests: 0, totalRequests: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userName, setUserName] = useState('Warga');
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Warga');
      }
      const [reportsRes, requestsRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const reps = reportsRes.data || [];
      const reqs = requestsRes.data || [];

      let activeReps = reps.filter(r => r.status === 'Menunggu' || r.status === 'Diproses').length;
      let appReqs = reqs.filter(r => r.status === 'Disetujui').length;
      
      setStats({
        activeReports: activeReps,
        totalReports: reps.length,
        approvedRequests: appReqs,
        totalRequests: reqs.length
      });

      const activities = [];
      for (const r of reps) {
        activities.push({
          id: 'rep-' + r.id,
          title: r.title,
          status: r.status,
          statusKey: r.status === 'Selesai' ? 'completed' : (r.status === 'Diproses' ? 'processing' : 'pending'),
          description: r.description.substring(0, 50) + '...',
          time: new Date(r.created_at).toLocaleDateString('id-ID'),
          dot: r.status === 'Selesai' ? '#16a34a' : (r.status === 'Diproses' ? '#3b82f6' : '#f59e0b'),
          created_at: new Date(r.created_at).getTime()
        });
      }
      for (const r of reqs) {
        activities.push({
          id: 'req-' + r.id,
          title: 'Permohonan ' + r.type,
          status: r.status,
          statusKey: r.status === 'Disetujui' ? 'completed' : (r.status === 'Diproses' ? 'processing' : 'pending'),
          description: r.requester_name,
          time: new Date(r.created_at).toLocaleDateString('id-ID'),
          dot: r.status === 'Disetujui' ? '#16a34a' : (r.status === 'Diproses' ? '#3b82f6' : '#f59e0b'),
          created_at: new Date(r.created_at).getTime()
        });
      }

      activities.sort((a, b) => b.created_at - a.created_at);
      setRecentActivity(activities.slice(0, 5));
    }
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900 m-0 leading-tight">
            Selamat Datang, {userName} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Ini yang sedang terjadi di desa Anda hari ini.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: '1px solid #e2e8f0',
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={18} color="#475569" />
            <span style={{
              position: 'absolute', top: 8, right: 8, width: 8, height: 8,
              background: '#ef4444', borderRadius: '50%', border: '2px solid white',
            }} />
          </button>
          
          {showNotif && (
            <div style={{
              position: 'absolute', top: 50, right: 50, width: 280, background: 'white', 
              border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>Notifikasi</h3>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px' }}>Baru</span>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#334155', fontWeight: 500 }}>Selamat datang di PUSAKA!</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Portal cerdas desa telah aktif. Anda kini dapat melaporkan infrastruktur dan mengajukan surat digital.</p>
              </div>
            </div>
          )}

          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase',
            }}>{userName.charAt(0)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Village Vitality Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', right: -20, top: -20, width: 140, height: 140,
              background: 'rgba(22,163,74,0.08)', borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', right: 40, top: 40, width: 80, height: 80,
              background: 'rgba(22,163,74,0.06)', borderRadius: '50%',
            }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, color: '#14532d', margin: '0 0 16px' }}>
              Vitalitas Desa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Populasi" value="1,248" sub="+12 tahun ini" subColor="#16a34a" icon={Users} iconBg="#dcfce7" />
              <StatCard label="Laporan Aktif" value={stats.activeReports.toString()} sub="Sedang ditangani" subColor="#f59e0b" icon={AlertTriangle} iconBg="#fef3c7" />
              <StatCard label="Surat Disetujui" value={stats.approvedRequests.toString()} sub="Baru-baru ini" icon={CheckCircle} iconBg="#dbeafe" />
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Aktivitas Terkini
              </h2>
              <Link
                href="/environment"
                style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Lihat Semua <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentActivity.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: i < recentActivity.length - 1 ? '1px solid #f8fafc' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ marginTop: '5px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{item.title}</span>
                      <span className={`badge badge-${item.statusKey}`}>{item.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.4 }}>{item.description}</p>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
              Aksi Cepat
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickActions.map(({ href, icon: Icon, label, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    textDecoration: 'none',
                    color: '#0f172a',
                    transition: 'all 0.15s',
                    background: 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
                  </div>
                  <ChevronRight size={14} color="#cbd5e1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Local Business */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Bisnis Unggulan
              </h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setFeaturedIdx((i) => (i - 1 + featured.length) % featured.length)}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={12} />
                </button>
                <button onClick={() => setFeaturedIdx((i) => (i + 1) % featured.length)}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Business card */}
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '100px', background: f.gradient, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                <div>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.2)',
                    color: 'white', padding: '2px 8px', borderRadius: '999px', backdropFilter: 'blur(4px)',
                  }}>
                    {f.tag}
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, color: 'white', fontFamily: 'Outfit' }}>
                    {f.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{f.desc}</p>
                </div>
              </div>
              <div style={{ padding: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: -6 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 22, height: 22, borderRadius: '50%', border: '2px solid white',
                      background: ['#4ade80', '#60a5fa', '#f472b6'][i],
                      marginLeft: i > 0 ? '-6px' : 0,
                    }} />
                  ))}
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px', lineHeight: '22px' }}>+119</span>
                </div>
                <Link
                  href="/marketplace"
                  style={{
                    fontSize: '12px', fontWeight: 600, color: 'white', background: '#0f172a',
                    padding: '5px 12px', borderRadius: '6px', textDecoration: 'none',
                  }}
                >
                  Kunjungi Toko
                </Link>
              </div>
            </div>

            {/* Village announcements teaser */}
            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} color="#16a34a" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Pengumuman Desa</span>
              </div>
              <p style={{ fontSize: '12px', color: '#14532d', margin: '4px 0 0', lineHeight: 1.4 }}>
                Kerja bakti setiap Minggu pagi pukul 07.00 WIB. Harap hadir!
              </p>
              <span style={{ fontSize: '10px', color: '#86efac' }}>
                <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                2 hari lalu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
