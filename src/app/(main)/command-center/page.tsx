'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, MapPin, Clock, ChevronRight, Layers, ChevronUp, ChevronDown, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const filterCategories = [
  { id: 'Sampah / Limbah', label: 'Sampah / Limbah', color: '#f59e0b' },
  { id: 'Infrastruktur', label: 'Infrastruktur', color: '#3b82f6' },
  { id: 'Penghijauan', label: 'Penghijauan', color: '#22c55e' },
  { id: 'Air / Drainase', label: 'Air / Drainase', color: '#06b6d4' },
  { id: 'Keamanan', label: 'Keamanan', color: '#ef4444' },
];

const statusColorMap: Record<string, string> = {
  Menunggu: '#ef4444',
  Diproses: '#f59e0b',
  Selesai: '#22c55e'
};

export default function CommandCenterPage() {
  const [activeCategories, setActiveCategories] = useState<string[]>(['Sampah / Limbah', 'Infrastruktur', 'Penghijauan', 'Air / Drainase', 'Keamanan']);
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Menunggu', 'Diproses', 'Selesai']);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setReports(data);
      }
    }
    fetchReports();
  }, []);

  const toggleCategory = (id: string) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filteredReports = reports.filter(r => 
    activeCategories.includes(r.category) && 
    activeStatuses.includes(r.status)
  );

  const highPriorityIssues = filteredReports.filter(r => r.urgency === 'Darurat' || r.urgency === 'Mendesak');
  const mapMarkers = filteredReports.filter(r => r.location_lat && r.location_lng).map((r) => ({
    lat: r.location_lat, lng: r.location_lng, color: statusColorMap[r.status] || '#16a34a', popup: r.title,
  }));

  const filterStatuses = [
    { id: 'Menunggu', label: 'Menunggu', count: reports.filter(r => r.status === 'Menunggu').length, color: '#ef4444' },
    { id: 'Diproses', label: 'Diproses', count: reports.filter(r => r.status === 'Diproses').length, color: '#f59e0b' },
    { id: 'Selesai', label: 'Selesai', count: reports.filter(r => r.status === 'Selesai').length, color: '#22c55e' },
  ];

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Full screen map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapPicker
          center={[-5.4254, 105.2580]}
          zoom={12}
          markers={mapMarkers}
          interactive={false}
          style={{ height: '100%' }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-white rounded-xl px-3 py-2 md:px-4 md:py-2 shadow-lg flex items-center gap-2 text-xs md:text-[13px] font-bold text-slate-900 font-outfit max-w-[calc(100%-100px)] md:max-w-none">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="truncate">Pusat Komando — Langsung</span>
        <span className="text-[10px] md:text-[11px] font-medium text-slate-400 ml-1 hidden sm:inline">
          {highPriorityIssues.length} masalah prioritas
        </span>
      </div>

      {/* Filter toggle button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-3 left-3 z-[500] bg-white border-none rounded-[10px] px-3 py-2 shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-slate-600"
      >
        <Layers size={14} /> Filter
      </button>

      {/* Left Filter Panel */}
      {showFilters && (
        <>
          {/* Mobile overlay backdrop */}
          <div className="fixed inset-0 bg-black/20 z-[499] md:hidden" onClick={() => setShowFilters(false)} />
          <div
            className="fixed inset-x-4 bottom-4 md:absolute md:top-[58px] md:left-4 md:bottom-auto md:right-auto z-[500] w-auto md:w-[220px] bg-white rounded-2xl p-4 shadow-xl animate-fade-in"
          >
            <div className="flex items-center justify-between md:hidden mb-3">
              <h3 className="font-outfit text-sm font-bold text-slate-900">Filter Laporan</h3>
              <button onClick={() => setShowFilters(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
            <h3 className="hidden md:block font-outfit text-[13px] font-bold text-slate-900 mb-3">
              Filter Laporan
            </h3>
            <p className="text-[10px] text-slate-400 mb-2.5 uppercase tracking-wider font-semibold">
              Kustomisasi tampilan peta
            </p>

            <div className="mb-3.5">
              <p className="text-[11px] text-slate-900 font-semibold mb-2 uppercase tracking-wide">
                KATEGORI
              </p>
              {filterCategories.map(({ id, label, color }) => (
                <label key={id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(id)}
                    onChange={() => toggleCategory(id)}
                    style={{ accentColor: color }}
                    className="w-3.5 h-3.5"
                  />
                  <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  <span className="text-xs text-slate-600">{label}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-[11px] text-slate-900 font-semibold mb-2 uppercase tracking-wide">
                STATUS
              </p>
              {filterStatuses.map(({ id, label, count, color }) => (
                <label key={id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeStatuses.includes(id)}
                    onChange={() => setActiveStatuses((prev) => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                    style={{ accentColor: color }}
                    className="w-3.5 h-3.5"
                  />
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-slate-600 flex-1">{label}</span>
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">{count}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile: Bottom toggle for reports list */}
      <button
        onClick={() => setShowMobileList(!showMobileList)}
        className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] bg-white rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-700"
      >
        <Layers size={14} />
        {filteredReports.length} Laporan
        {showMobileList ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Mobile: Bottom sheet reports list */}
      {showMobileList && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[500] bg-white rounded-t-3xl shadow-2xl max-h-[60vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-slate-900" />
              <span className="font-outfit text-[13px] font-bold text-slate-900">Daftar Laporan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {filteredReports.length} Total
              </span>
              <button onClick={() => setShowMobileList(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar">
            {filteredReports.map((issue) => {
              const timeText = new Date(issue.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              const isHighPriority = issue.urgency === 'Darurat' || issue.urgency === 'Mendesak';
              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100"
                  style={{ borderColor: isHighPriority ? '#fee2e2' : undefined }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: statusColorMap[issue.status] || '#16a34a' }} />
                      <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">{issue.category}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {timeText}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-900 mb-1 leading-snug">{issue.title}</h4>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <MapPin size={11} /> {issue.address?.split(',')[0] || 'Lokasi Terlampir'}
                    </div>
                    <div className="flex items-center gap-2">
                      {isHighPriority && (
                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {issue.urgency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: Right List Panel */}
      <div className="hidden md:flex absolute top-4 right-4 bottom-4 z-[500] w-[290px] flex-col gap-2">
        {/* Header */}
        <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between shadow-md border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Layers size={15} className="text-slate-900" />
            <span className="font-outfit text-[13px] font-bold text-slate-900">
              Daftar Laporan
            </span>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {filteredReports.length} Total
          </span>
        </div>

        {/* Issue cards */}
        <div className="flex flex-col gap-2 overflow-y-auto pb-4 no-scrollbar">
          {filteredReports.map((issue) => {
            const timeText = new Date(issue.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            const isHighPriority = issue.urgency === 'Darurat' || issue.urgency === 'Mendesak';
            return (
              <div
                key={issue.id}
                style={{
                  background: 'white', borderRadius: '14px', padding: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: isHighPriority ? '1px solid #fee2e2' : '1px solid #f1f5f9',
                  cursor: 'pointer', transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColorMap[issue.status] || '#16a34a' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {issue.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {timeText}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                  {issue.title}
                </h4>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {issue.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '11px' }}>
                    <MapPin size={11} /> {issue.address?.split(',')[0] || 'Lokasi Terlampir'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isHighPriority && (
                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                        {issue.urgency}
                      </span>
                    )}
                    <button style={{
                      fontSize: '11px', fontWeight: 700, color: '#16a34a',
                      background: `#16a34a14`, border: 'none',
                      padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '3px',
                    }}>
                      Lihat Detail <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-md mt-auto">
          <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            LEGENDA
          </p>
          <div className="flex gap-3 flex-wrap">
            {[
              { color: '#ef4444', label: 'Menunggu' },
              { color: '#f59e0b', label: 'Diproses' },
              { color: '#22c55e', label: 'Selesai' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1 text-[11px] text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom timestamp */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 rounded-lg px-3 py-1.5 text-[11px] text-white/80 flex items-center gap-1.5 backdrop-blur-sm hidden md:flex">
        <Clock size={11} />
        Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')} WIB
      </div>
    </div>
  );
}
