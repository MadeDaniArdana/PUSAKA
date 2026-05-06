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
    <div className="p-4 md:p-6 lg:p-8 min-h-full flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
        <div>
          <h1 className="font-outfit text-xl md:text-[28px] font-bold text-slate-50 m-0 mb-2">
            Selamat Datang, {adminName} 👋
          </h1>
          <p className="text-sm text-slate-400 m-0">
            Berikut adalah ringkasan operasional desa hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl w-fit">
          <Activity size={16} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 tracking-wide">SISTEM ONLINE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
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
          <div key={i} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: stat.bg }} />
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs md:text-[13px] text-slate-400 m-0 mb-2 font-medium">{stat.label}</p>
                <h3 className="font-outfit text-2xl md:text-[32px] font-bold text-slate-50 m-0">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={20} color={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 md:gap-6 flex-1">
        
        {/* Recent Activities (Main Chart/Table Area) */}
        <div className="bg-slate-800/50 border border-white/5 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="font-outfit text-base md:text-lg font-semibold text-slate-200 m-0">
              Laporan Infrastruktur Terbaru
            </h2>
            <button className="bg-transparent border border-white/10 rounded-lg text-slate-300 text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5 w-fit">
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full text-slate-500 text-sm">
                Memuat data...
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <CheckCircle2 size={32} className="text-green-500 opacity-50" />
                <span className="text-sm">Belum ada laporan baru</span>
              </div>
            ) : (
              <>
                {/* Desktop table view */}
                <table className="hidden md:table w-full border-collapse mt-4">
                  <thead>
                    <tr>
                      <th className="text-left p-3 text-xs text-slate-500 font-semibold border-b border-white/5">JUDUL LAPORAN</th>
                      <th className="text-left p-3 text-xs text-slate-500 font-semibold border-b border-white/5">KATEGORI</th>
                      <th className="text-left p-3 text-xs text-slate-500 font-semibold border-b border-white/5">PELAPOR</th>
                      <th className="text-left p-3 text-xs text-slate-500 font-semibold border-b border-white/5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, i) => (
                      <tr key={activity.id} className={i < recentActivities.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                        <td className="p-4 text-[13px] text-slate-50 font-medium">
                          {activity.title}
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md text-slate-300 text-xs">
                            <FileText size={12} /> {activity.category}
                          </div>
                        </td>
                        <td className="p-4 text-[13px] text-slate-400">
                          {activity.reporter_name}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold" style={{
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
                {/* Mobile card view */}
                <div className="md:hidden flex flex-col gap-3 mt-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[13px] font-medium text-slate-50 m-0 flex-1 mr-2">{activity.title}</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold shrink-0" style={{
                          background: activity.status === 'Menunggu' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: activity.status === 'Menunggu' ? '#fcd34d' : '#6ee7b7'
                        }}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><FileText size={11} /> {activity.category}</span>
                        <span>• {activity.reporter_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Quick Actions & Trend */}
        <div className="flex flex-col gap-5 md:gap-6">
          
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/[0.08] rounded-3xl p-5 md:p-6 relative overflow-hidden">
            <div className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full bg-blue-500/10" />
            <h2 className="font-outfit text-base md:text-lg font-semibold text-slate-200 mb-4">
              Grafik Partisipasi
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white m-0 font-outfit">+24%</h3>
                <p className="text-xs text-slate-400 m-0">dibandingkan minggu lalu</p>
              </div>
            </div>
            
            {/* Fake Sparkline */}
            <div className="flex items-end gap-2 h-[60px]">
              {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t transition-all duration-300" style={{ 
                  background: i === 6 ? '#3b82f6' : 'rgba(59,130,246,0.2)', 
                  height: `${h}%`,
                }} />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-5 md:p-6 flex-1">
             <h2 className="font-outfit text-base md:text-lg font-semibold text-slate-200 mb-4">
              Log Sistem
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { time: '10 min yang lalu', msg: 'Laporan infrastruktur baru #42', type: 'alert' },
                { time: '1 jam yang lalu', msg: 'Permohonan Dokumen disetujui', type: 'success' },
                { time: '2 jam yang lalu', msg: 'Sistem berhasil di-backup', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5">
                    {log.type === 'alert' && <AlertCircle size={14} className="text-amber-500" />}
                    {log.type === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {log.type === 'info' && <Clock size={14} className="text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-200 m-0 mb-0.5">{log.msg}</p>
                    <p className="text-[11px] text-slate-600 m-0">{log.time}</p>
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
