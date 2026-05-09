'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, ClipboardList, ShoppingBag, Users, 
  TrendingUp, Activity, AlertCircle, Clock, 
  CheckCircle, ArrowRight, Bell, Map,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

function StatCard({
  label, value, sub, subColor, icon: Icon, iconBg,
}: {
  label: string; value: string; sub: string; subColor?: string;
  icon: React.ElementType; iconBg: string;
}) {
  return (
    <div style={{
      flex: 1, padding: 20, background: 'white', borderRadius: 16,
      border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color: '#475569' }} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>{value}</div>
      <div style={{ fontSize: 12, color: subColor || '#94a3b8' }}>{sub}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState({
    pendingReports: 0,
    pendingRequests: 0,
    totalWarga: 142,
    totalUMKM: 24,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Menunggu');

      const { count: requestsCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Menunggu');

      setStats(prev => ({
        ...prev,
        pendingReports: reportsCount || 0,
        pendingRequests: requestsCount || 0,
      }));

      const { data: recentReports } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentReports) {
        setRecentActivities(recentReports);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const adminName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrator';

  const quickActions = [
    { href: '/admin/reports', icon: FileText, label: 'Kelola Laporan', color: '#ef4444', bg: '#fee2e2' },
    { href: '/admin/requests', icon: ClipboardList, label: 'Kelola Permohonan', color: '#3b82f6', bg: '#dbeafe' },
    { href: '/admin/marketplace', icon: ShoppingBag, label: 'Kelola Marketplace', color: '#8b5cf6', bg: '#ede9fe' },
    { href: '/admin/village-map', icon: Map, label: 'Peta Wilayah', color: '#16a34a', bg: '#dcfce7' },
  ];

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900 m-0 leading-tight">
            Selamat Datang, {adminName} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Berikut adalah ringkasan operasional desa hari ini.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            padding: '8px 16px', borderRadius: 12,
          }}>
            <Activity size={14} color="#16a34a" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', letterSpacing: '0.03em' }}>SISTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Admin Vitality Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
            border: '1px solid #bbf7d0', borderRadius: 20, padding: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: -20, top: -20, width: 140, height: 140,
              background: 'rgba(22,163,74,0.08)', borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', right: 40, top: 40, width: 80, height: 80,
              background: 'rgba(22,163,74,0.06)', borderRadius: '50%',
            }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: '#14532d', margin: '0 0 16px' }}>
              Ringkasan Desa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Laporan Menunggu" value={loading ? '...' : stats.pendingReports.toString()} sub="Perlu ditinjau" subColor="#f59e0b" icon={AlertCircle} iconBg="#fef3c7" />
              <StatCard label="Permohonan Baru" value={loading ? '...' : stats.pendingRequests.toString()} sub="Menunggu persetujuan" subColor="#3b82f6" icon={ClipboardList} iconBg="#dbeafe" />
              <StatCard label="Warga Terdaftar" value={stats.totalWarga.toString()} sub="+12 tahun ini" subColor="#16a34a" icon={Users} iconBg="#dcfce7" />
              <StatCard label="UMKM Aktif" value={stats.totalUMKM.toString()} sub="Terdaftar di marketplace" icon={ShoppingBag} iconBg="#ede9fe" />
            </div>
          </div>

          {/* Recent Reports Table */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
            padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Laporan Infrastruktur Terbaru
              </h2>
              <Link
                href="/admin/reports"
                style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Lihat Semua <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>
                Memuat data...
              </div>
            ) : recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle size={32} color="#16a34a" style={{ opacity: 0.4, marginBottom: 8 }} />
                <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Belum ada laporan baru</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Judul Laporan</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategori</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pelapor</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((activity, i) => {
                        const statusColor = activity.status === 'Menunggu' ? '#f59e0b' : activity.status === 'Diproses' ? '#3b82f6' : '#16a34a';
                        const statusBg = activity.status === 'Menunggu' ? '#fef3c7' : activity.status === 'Diproses' ? '#dbeafe' : '#dcfce7';
                        return (
                          <tr key={activity.id} style={{ borderBottom: i < recentActivities.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                            <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                              {activity.title}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#475569' }}>
                                <FileText size={12} /> {activity.category}
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>
                              {activity.reporter_name}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusBg, color: statusColor }}>
                                {activity.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile card view */}
                <div className="md:hidden flex flex-col gap-3">
                  {recentActivities.map((activity) => {
                    const statusColor = activity.status === 'Menunggu' ? '#f59e0b' : activity.status === 'Diproses' ? '#3b82f6' : '#16a34a';
                    const statusBg = activity.status === 'Menunggu' ? '#fef3c7' : activity.status === 'Diproses' ? '#dbeafe' : '#dcfce7';
                    return (
                      <div key={activity.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1, marginRight: 8 }}>{activity.title}</p>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: statusBg, color: statusColor, flexShrink: 0 }}>
                            {activity.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {activity.category}</span>
                          <span>• {activity.reporter_name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
            padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
              Aksi Cepat
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map(({ href, icon: Icon, label, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12, border: '1px solid #f1f5f9',
                    textDecoration: 'none', color: '#0f172a', transition: 'all 0.15s', background: 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                  </div>
                  <ArrowRight size={14} color="#cbd5e1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Participation Trend */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
            padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
              Grafik Partisipasi
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Outfit' }}>+24%</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>dibandingkan minggu lalu</p>
              </div>
            </div>
            {/* Sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: '4px 4px 0 0', transition: 'all 0.3s',
                  background: i === 5 ? '#16a34a' : '#dcfce7',
                  height: `${h}%`,
                }} />
              ))}
            </div>
          </div>

          {/* System Log */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
            padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
              Log Sistem
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { time: '10 min yang lalu', msg: 'Laporan infrastruktur baru #42', type: 'alert' },
                { time: '1 jam yang lalu', msg: 'Permohonan Dokumen disetujui', type: 'success' },
                { time: '2 jam yang lalu', msg: 'Sistem berhasil di-backup', type: 'info' },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ marginTop: 2 }}>
                    {log.type === 'alert' && <AlertCircle size={14} color="#f59e0b" />}
                    {log.type === 'success' && <CheckCircle size={14} color="#16a34a" />}
                    {log.type === 'info' && <Clock size={14} color="#3b82f6" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: '#0f172a', margin: '0 0 2px' }}>{log.msg}</p>
                    <p style={{ fontSize: 11, color: '#cbd5e1', margin: 0 }}>{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
