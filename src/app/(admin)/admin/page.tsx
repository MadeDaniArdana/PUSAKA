'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, ClipboardList, ShoppingBag, Users, 
  TrendingUp, Activity, AlertCircle, Clock, 
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState({
    pendingReports: 0,
    pendingRequests: 0,
    totalWarga: 142, // Dummy data for now
    totalUMKM: 24,   // Dummy data for now
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch counts
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

      // Fetch recent reports as activities
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

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>
            Selamat Datang, {adminName} 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Berikut adalah ringkasan operasional desa hari ini.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 16px', borderRadius: '12px' }}>
          <Activity size={16} color="#60a5fa" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.05em' }}>SISTEM ONLINE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { 
            label: 'Laporan Menunggu', value: stats.pendingReports, icon: AlertCircle, 
            color: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))' 
          },
          { 
            label: 'Permohonan Baru', value: stats.pendingRequests, icon: ClipboardList, 
            color: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))' 
          },
          { 
            label: 'Warga Terdaftar', value: stats.totalWarga, icon: Users, 
            color: '#10b981', bg: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))' 
          },
          { 
            label: 'Aktivitas UMKM', value: stats.totalUMKM, icon: ShoppingBag, 
            color: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))' 
          },
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: stat.bg, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 8px', fontWeight: 500 }}>{stat.label}</p>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div style={{ 
                width: 48, height: 48, borderRadius: '14px', background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1 }}>
        
        {/* Recent Activities (Main Chart/Table Area) */}
        <div style={{ 
          background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              Laporan Infrastruktur Terbaru
            </h2>
            <button style={{ 
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              color: '#cbd5e1', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '0 24px 24px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: '14px' }}>
                Memuat data...
              </div>
            ) : recentActivities.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '12px' }}>
                <CheckCircle2 size={32} color="#10b981" opacity={0.5} />
                <span style={{ fontSize: '14px' }}>Belum ada laporan baru</span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>JUDUL LAPORAN</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>KATEGORI</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>PELAPOR</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity, i) => (
                    <tr key={activity.id} style={{ borderBottom: i === recentActivities.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '16px 8px', fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                        {activity.title}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px' }}>
                          <FileText size={12} /> {activity.category}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: '13px', color: '#94a3b8' }}>
                        {activity.reporter_name}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          background: activity.status === 'Menunggu' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: activity.status === 'Menunggu' ? '#fcd34d' : '#6ee7b7'
                        }}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel - Quick Actions & Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
              Grafik Partisipasi
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="#60a5fa" />
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Outfit' }}>+24%</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>dibandingkan minggu lalu</p>
              </div>
            </div>
            
            {/* Fake Sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
              {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} style={{ 
                  flex: 1, background: i === 6 ? '#3b82f6' : 'rgba(59,130,246,0.2)', 
                  height: `${h}%`, borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s'
                }} />
              ))}
            </div>
          </div>

          <div style={{ 
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px', padding: '24px', flex: 1
          }}>
             <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
              Log Sistem
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { time: '10 min yang lalu', msg: 'Laporan infrastruktur baru #42', type: 'alert' },
                { time: '1 jam yang lalu', msg: 'Permohonan Dokumen disetujui', type: 'success' },
                { time: '2 jam yang lalu', msg: 'Sistem berhasil di-backup', type: 'info' },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ marginTop: '2px' }}>
                    {log.type === 'alert' && <AlertCircle size={14} color="#f59e0b" />}
                    {log.type === 'success' && <CheckCircle2 size={14} color="#10b981" />}
                    {log.type === 'info' && <Clock size={14} color="#60a5fa" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#e2e8f0', margin: '0 0 2px' }}>{log.msg}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{log.time}</p>
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
