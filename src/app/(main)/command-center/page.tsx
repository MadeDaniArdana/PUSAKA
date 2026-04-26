'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, MapPin, Clock, ChevronRight, Layers } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(true);
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
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'white', borderRadius: '12px', padding: '8px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '8px',
        zIndex: 500, fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
        Pusat Komando — Langsung
        <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginLeft: '4px' }}>
          {highPriorityIssues.length} masalah prioritas
        </span>
      </div>

      {/* Filter toggle button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 500,
          background: 'white', border: 'none', borderRadius: '10px', padding: '8px 12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 600, color: '#475569',
        }}
      >
        <Layers size={14} /> Filter
      </button>

      {/* Left Filter Panel */}
      {showFilters && (
        <div style={{
          position: 'absolute', top: 58, left: 16, zIndex: 500, width: '220px',
          background: 'white', borderRadius: '16px', padding: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
          className="animate-fade-in"
        >
          <h3 style={{ fontFamily: 'Outfit', fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
            Filter Laporan
          </h3>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Kustomisasi tampilan peta
          </p>

          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              KATEGORI
            </p>
            {filterCategories.map(({ id, label, color }) => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeCategories.includes(id)}
                  onChange={() => toggleCategory(id)}
                  style={{ accentColor: color, width: 14, height: 14 }}
                />
                <div style={{ width: 8, height: 8, borderRadius: '2px', background: color }} />
                <span style={{ fontSize: '12px', color: '#475569' }}>{label}</span>
              </label>
            ))}
          </div>

          <div>
            <p style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STATUS
            </p>
            {filterStatuses.map(({ id, label, count, color }) => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeStatuses.includes(id)}
                  onChange={() => setActiveStatuses((prev) => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                  style={{ accentColor: color, width: 14, height: 14 }}
                />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '12px', color: '#475569', flex: 1 }}>{label}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '1px 6px', borderRadius: '999px' }}>{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Right List Panel */}
      <div style={{
        position: 'absolute', top: 16, right: 16, bottom: 16, zIndex: 500,
        width: '290px', display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {/* Header */}
        <div style={{
          background: 'white', borderRadius: '14px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={15} color="#0f172a" />
            <span style={{ fontFamily: 'Outfit', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Daftar Laporan
            </span>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 700, background: '#f1f5f9',
            color: '#475569', padding: '2px 8px', borderRadius: '999px',
          }}>
            {filteredReports.length} Total
          </span>
        </div>

        {/* Issue cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
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
        <div style={{
          background: 'white', borderRadius: '12px', padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: 'auto',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            LEGENDA
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { color: '#ef4444', label: 'Menunggu' },
              { color: '#f59e0b', label: 'Diproses' },
              { color: '#22c55e', label: 'Selesai' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom timestamp */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(15,23,42,0.8)', borderRadius: '8px', padding: '6px 14px',
        zIndex: 500, fontSize: '11px', color: 'rgba(255,255,255,0.8)',
        display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(8px)',
      }}>
        <Clock size={11} />
        Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')} WIB
      </div>
    </div>
  );
}
