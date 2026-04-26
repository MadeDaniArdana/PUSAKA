'use client';

import Link from 'next/link';
import { Plus, MapPin, Clock, Filter, ChevronDown, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';

const statusColors: Record<string, { bg: string; color: string }> = {
  Menunggu: { bg: '#fef3c7', color: '#b45309' },
  Diverifikasi: { bg: '#dbeafe', color: '#1d4ed8' },
  Diproses: { bg: '#ede9fe', color: '#6d28d9' },
  Selesai: { bg: '#dcfce7', color: '#15803d' },
  Ditolak: { bg: '#fee2e2', color: '#dc2626' },
};

const urgencyColors: Record<string, string> = { Normal: '#94a3b8', Mendesak: '#f59e0b', Darurat: '#ef4444' };

export default function EnvironmentPage() {
  const [filter, setFilter] = useState('Semua');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setReports(data);
      }
      setLoading(false);
    }
    fetchReports();
  }, []);

  const filtered = filter === 'Semua' ? reports : reports.filter((r) => r.status === filter || r.category === filter);

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-[26px] font-bold text-slate-900 m-0 leading-tight">
            Laporan Lingkungan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan kelola laporan warga di wilayah Anda.
          </p>
        </div>
        <Link
          href="/environment/new"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm w-full md:w-auto"
        >
          <Plus size={16} />
          Buat Laporan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {[
          { label: 'Total Laporan', value: reports.length, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Menunggu', value: reports.filter(r => r.status === 'Menunggu').length, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Diproses', value: reports.filter(r => r.status === 'Diproses').length, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Selesai', value: reports.filter(r => r.status === 'Selesai').length, color: '#16a34a', bg: '#dcfce7' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '14px', padding: '16px 20px',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>{s.value}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4 items-center overflow-x-auto no-scrollbar pb-2">
        <Filter size={16} className="text-slate-400 shrink-0" />
        <div className="flex gap-2 items-center">
          {['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Infrastruktur', 'Kebersihan', 'Keamanan'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${filter === f ? 'bg-green-600 text-white border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden md:block">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-600 hover:bg-slate-50">
            <span>Urutkan: Terbaru</span> <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Reports list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
           <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Memuat laporan...</div>
        ) : filtered.length === 0 ? (
           <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada laporan.</div>
        ) : filtered.map((report) => {
          const s = statusColors[report.status] || statusColors['Menunggu'];
          const categoryClass = report.category.toLowerCase().replace(' ', '-');
          const timeText = new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          
          return (
            <div
              key={report.id}
              style={{
                background: 'white', borderRadius: '14px', padding: '16px 20px',
                border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', gap: '16px', alignItems: 'center',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              {/* Urgency indicator */}
              <div style={{ width: 4, height: 48, borderRadius: '999px', background: urgencyColors[report.urgency] || urgencyColors['Normal'], flexShrink: 0 }} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>{report.id.substring(0, 8)}</span>
                  <span className={`badge badge-${categoryClass}`}>{report.category}</span>
                  <span style={{ fontSize: '10px', background: s.bg, color: s.color, padding: '2px 6px', borderRadius: '999px', fontWeight: 600 }}>
                    {report.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 m-0">{report.title}</h3>
                <div className="flex flex-col md:flex-row gap-1 md:gap-3 mt-1.5">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={11} className="shrink-0" /> <span className="truncate max-w-[200px]">{report.address || 'Lokasi tidak diketahui'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} className="shrink-0" /> {timeText}
                  </span>
                </div>
              </div>

              <button style={{
                width: 36, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Eye size={15} color="#475569" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
