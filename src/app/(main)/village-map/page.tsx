'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layers, MapPin, Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

interface VillageBoundary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  coordinates: [number, number][];
  created_at: string;
}

export default function VillageMapPage() {
  const [boundaries, setBoundaries] = useState<VillageBoundary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoundary, setSelectedBoundary] = useState<VillageBoundary | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    async function fetchBoundaries() {
      const { data } = await supabase
        .from('village_boundaries')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setBoundaries(data);
      setLoading(false);
    }
    fetchBoundaries();
  }, []);

  const polygons = boundaries.map((b) => ({
    coordinates: b.coordinates,
    color: b.color,
    name: b.name,
    description: b.description || undefined,
  }));

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Full screen map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapPicker
          center={[-5.4254, 105.2580]}
          zoom={12}
          markers={[]}
          polygons={polygons}
          interactive={false}
          style={{ height: '100%' }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-white rounded-xl px-3 py-2 md:px-4 md:py-2 shadow-lg flex items-center gap-2 text-xs md:text-[13px] font-bold text-slate-900 font-outfit max-w-[calc(100%-100px)] md:max-w-none">
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="truncate">Peta Wilayah Desa</span>
        <span className="text-[10px] md:text-[11px] font-medium text-slate-400 ml-1 hidden sm:inline">
          {boundaries.length} wilayah terdaftar
        </span>
      </div>

      {/* Mobile: Bottom toggle */}
      <button
        onClick={() => setShowMobileList(!showMobileList)}
        className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] bg-white rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-700"
      >
        <Layers size={14} />
        {boundaries.length} Wilayah
        {showMobileList ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Mobile: Bottom sheet list */}
      {showMobileList && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[500] bg-white rounded-t-3xl shadow-2xl max-h-[60vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-slate-900" />
              <span className="font-outfit text-[13px] font-bold text-slate-900">Daftar Wilayah</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {boundaries.length} Total
              </span>
              <button onClick={() => setShowMobileList(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar">
            {boundaries.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: b.color }} />
                  <h4 className="text-[13px] font-bold text-slate-900 m-0">{b.name}</h4>
                </div>
                {b.description && (
                  <p className="text-xs text-slate-500 mb-1.5">{b.description}</p>
                )}
                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <MapPin size={11} />
                  {b.coordinates.length} titik koordinat
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Right Panel */}
      <div className="hidden md:flex absolute top-4 right-4 bottom-4 z-[500] w-[290px] flex-col gap-2">
        {/* Header */}
        <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between shadow-md border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Layers size={15} className="text-slate-900" />
            <span className="font-outfit text-[13px] font-bold text-slate-900">
              Daftar Wilayah
            </span>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {boundaries.length} Total
          </span>
        </div>

        {/* Boundary cards */}
        <div className="flex flex-col gap-2 overflow-y-auto pb-4 no-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-400">Memuat data...</div>
          ) : boundaries.length === 0 ? (
            <div className="bg-white rounded-[14px] p-6 shadow-md text-center">
              <Layers size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-[13px] text-slate-400 m-0">Belum ada wilayah yang dipetakan</p>
            </div>
          ) : (
            boundaries.map((b) => (
              <div
                key={b.id}
                style={{
                  background: 'white', borderRadius: 14, padding: 14,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: selectedBoundary?.id === b.id ? `2px solid ${b.color}` : '1px solid #f1f5f9',
                  cursor: 'pointer', transition: 'transform 0.15s, border-color 0.2s',
                }}
                onClick={() => setSelectedBoundary(selectedBoundary?.id === b.id ? null : b)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: b.color, flexShrink: 0 }} />
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.name}</h4>
                </div>
                {b.description && (
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {b.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 11 }}>
                    <MapPin size={11} />
                    {b.coordinates.length} titik
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    {new Date(b.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Expanded info */}
                {selectedBoundary?.id === b.id && (
                  <div style={{
                    marginTop: 10, paddingTop: 10,
                    borderTop: '1px solid #f1f5f9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Info size={12} color="#3b82f6" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>Detail Koordinat</span>
                    </div>
                    <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: 10, color: '#64748b', lineHeight: 1.6 }}>
                      {b.coordinates.map((coord, idx) => (
                        <div key={idx}>
                          #{idx + 1}: {coord[0].toFixed(6)}, {coord[1].toFixed(6)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-md mt-auto">
          <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            LEGENDA WILAYAH
          </p>
          <div className="flex gap-2 flex-wrap">
            {boundaries.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center gap-1 text-[11px] text-slate-600">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
                {b.name.length > 15 ? b.name.slice(0, 15) + '…' : b.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
