'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  MapPin, Plus, Trash2, Save, RotateCcw, Edit3, X, Eye,
  Palette, ChevronDown, Layers, CheckCircle2, AlertCircle,
} from 'lucide-react';
import L from 'leaflet';

interface VillageBoundary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  coordinates: [number, number][];
  created_at: string;
}

const PRESET_COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#dc2626',
  '#d97706', '#0891b2', '#be185d', '#4f46e5',
];

export default function AdminVillageMapPage() {
  const supabase = createClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Data
  const [boundaries, setBoundaries] = useState<VillageBoundary[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [drawColor, setDrawColor] = useState('#16a34a');

  // Form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // UI
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // ───── Leaflet refs for drawn items ─────
  const drawnMarkersRef = useRef<L.Marker[]>([]);
  const drawnPolylineRef = useRef<L.Polyline | null>(null);
  const drawnPolygonPreviewRef = useRef<L.Polygon | null>(null);
  const savedPolygonsRef = useRef<L.Polygon[]>([]);

  // ───── Toast helper ─────
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ───── Fetch boundaries ─────
  const fetchBoundaries = useCallback(async () => {
    const { data, error } = await supabase
      .from('village_boundaries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBoundaries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoundaries();
  }, [fetchBoundaries]);

  // ───── Initialize Leaflet map ─────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-5.4254, 105.2580],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ───── Handle map clicks during drawing mode ─────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const { lat, lng } = e.latlng;
      setCurrentPoints((prev) => [...prev, [lat, lng]]);
    };

    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [isDrawing]);

  // ───── Render drawn points, polyline preview, polygon preview ─────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old drawn markers
    drawnMarkersRef.current.forEach((m) => m.remove());
    drawnMarkersRef.current = [];
    if (drawnPolylineRef.current) { drawnPolylineRef.current.remove(); drawnPolylineRef.current = null; }
    if (drawnPolygonPreviewRef.current) { drawnPolygonPreviewRef.current.remove(); drawnPolygonPreviewRef.current = null; }

    if (currentPoints.length === 0) return;

    // Add markers for each point
    currentPoints.forEach((pt, idx) => {
      const icon = L.divIcon({
        html: `<div style="
          width:22px;height:22px;border-radius:50%;
          background:${drawColor};border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:10px;font-weight:700;
        ">${idx + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        className: '',
      });
      const marker = L.marker(pt, { icon }).addTo(map);
      drawnMarkersRef.current.push(marker);
    });

    // Draw polyline connecting points
    if (currentPoints.length >= 2) {
      drawnPolylineRef.current = L.polyline(currentPoints, {
        color: drawColor,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // If 3+ points, show polygon preview
    if (currentPoints.length >= 3) {
      drawnPolygonPreviewRef.current = L.polygon(currentPoints, {
        color: drawColor,
        weight: 2,
        fillColor: drawColor,
        fillOpacity: 0.12,
        dashArray: '4, 4',
      }).addTo(map);
    }
  }, [currentPoints, drawColor]);

  // ───── Render saved boundaries ─────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old saved polygons
    savedPolygonsRef.current.forEach((p) => p.remove());
    savedPolygonsRef.current = [];

    boundaries.forEach((b) => {
      if (b.coordinates && b.coordinates.length >= 3) {
        const poly = L.polygon(b.coordinates, {
          color: b.color,
          weight: 2.5,
          fillColor: b.color,
          fillOpacity: 0.18,
        }).addTo(map);
        poly.bindPopup(`<div style="font-family:Inter,sans-serif;padding:4px 0">
          <strong style="font-size:14px">${b.name}</strong>
          ${b.description ? `<br/><span style="color:#64748b;font-size:12px">${b.description}</span>` : ''}
          <br/><span style="color:#94a3b8;font-size:11px">${b.coordinates.length} titik koordinat</span>
        </div>`);
        poly.bindTooltip(b.name, { sticky: true });
        savedPolygonsRef.current.push(poly);
      }
    });
  }, [boundaries]);

  // ───── Handlers ─────
  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
    setFormName('');
    setFormDesc('');
    setEditingId(null);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    setFormName('');
    setFormDesc('');
    setEditingId(null);
  };

  const undoLastPoint = () => {
    setCurrentPoints((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast('error', 'Nama wilayah wajib diisi');
      return;
    }
    if (currentPoints.length < 3) {
      showToast('error', 'Minimal 3 titik untuk membentuk wilayah');
      return;
    }

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('village_boundaries')
        .update({
          name: formName.trim(),
          description: formDesc.trim() || null,
          color: drawColor,
          coordinates: currentPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        showToast('error', 'Gagal memperbarui wilayah');
        return;
      }
      showToast('success', 'Wilayah berhasil diperbarui');
    } else {
      // Insert new
      const { error } = await supabase
        .from('village_boundaries')
        .insert({
          name: formName.trim(),
          description: formDesc.trim() || null,
          color: drawColor,
          coordinates: currentPoints,
        });

      if (error) {
        showToast('error', 'Gagal menyimpan wilayah');
        return;
      }
      showToast('success', 'Wilayah berhasil disimpan');
    }

    cancelDrawing();
    fetchBoundaries();
  };

  const handleEdit = (boundary: VillageBoundary) => {
    setEditingId(boundary.id);
    setFormName(boundary.name);
    setFormDesc(boundary.description || '');
    setDrawColor(boundary.color);
    setCurrentPoints(boundary.coordinates);
    setIsDrawing(true);

    // Fly to the boundary
    const map = mapInstanceRef.current;
    if (map && boundary.coordinates.length > 0) {
      const bounds = L.latLngBounds(boundary.coordinates.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus wilayah ini?')) return;
    const { error } = await supabase
      .from('village_boundaries')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('error', 'Gagal menghapus wilayah');
      return;
    }
    showToast('success', 'Wilayah berhasil dihapus');
    fetchBoundaries();
  };

  const focusBoundary = (boundary: VillageBoundary) => {
    const map = mapInstanceRef.current;
    if (map && boundary.coordinates.length > 0) {
      const bounds = L.latLngBounds(boundary.coordinates.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <div style={{
        width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'white', borderRight: '1px solid #e2e8f0',
        overflowY: 'auto', boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#dcfce7', border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={18} color="#16a34a" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Peta Wilayah Desa
              </h1>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Kelola batas wilayah desa</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          {!isDrawing ? (
            <button
              onClick={startDrawing}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              <Plus size={16} /> Gambar Wilayah Baru
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  NAMA WILAYAH *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Desa Sukamaju"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#0f172a', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  DESKRIPSI
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Deskripsi singkat (opsional)"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#0f172a', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  WARNA POLYGON
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDrawColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: 8, border: drawColor === c ? '2.5px solid #0f172a' : '2px solid #e2e8f0',
                        background: c, cursor: 'pointer',
                        boxShadow: drawColor === c ? `0 0 0 2px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Points counter */}
              <div style={{
                padding: '10px 12px', borderRadius: 10,
                background: '#f8fafc', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Titik ditandai: <strong style={{ color: '#0f172a' }}>{currentPoints.length}</strong>
                </span>
                {currentPoints.length > 0 && (
                  <button
                    onClick={undoLastPoint}
                    style={{
                      fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6,
                      padding: '4px 8px', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Undo
                  </button>
                )}
              </div>

              {/* Info */}
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                💡 Klik pada peta untuk menandai titik-titik batas wilayah. Min. 3 titik.
              </p>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSave}
                  disabled={currentPoints.length < 3 || !formName.trim()}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: currentPoints.length >= 3 && formName.trim()
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : '#f1f5f9',
                    color: currentPoints.length >= 3 && formName.trim() ? 'white' : '#94a3b8',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  <Save size={14} /> {editingId ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  onClick={cancelDrawing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px 16px', borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                    color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  <X size={14} /> Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Boundaries List */}
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 12px' }}>
            WILAYAH TERSIMPAN ({boundaries.length})
          </p>

          {loading ? (
            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 20 }}>Memuat data...</p>
          ) : boundaries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <Layers size={32} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Belum ada wilayah yang dipetakan</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {boundaries.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    background: '#f8fafc', border: '1px solid #f1f5f9',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${b.color}60`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f1f5f9')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: b.color, border: '2px solid #e2e8f0',
                    }} />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, flex: 1 }}>
                      {b.name}
                    </h3>
                  </div>
                  {b.description && (
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                      {b.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#475569' }}>
                      {b.coordinates.length} titik · {new Date(b.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => focusBoundary(b)}
                        title="Lihat di peta"
                        style={{
                          width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleEdit(b)}
                        title="Edit"
                        style={{
                          width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        title="Hapus"
                        style={{
                          width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#f87171',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAP ═══ */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Drawing mode indicator */}
        {isDrawing && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 500, background: 'white', borderRadius: 12, padding: '10px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
              Mode Gambar Aktif
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              — Klik peta untuk menandai titik
            </span>
          </div>
        )}

        {/* Coordinate readout */}
        {isDrawing && currentPoints.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 500, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            borderRadius: 10, padding: '8px 16px',
          }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Titik terakhir: {currentPoints[currentPoints.length - 1][0].toFixed(6)}, {currentPoints[currentPoints.length - 1][1].toFixed(6)}
            </span>
          </div>
        )}
      </div>

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#065f46' : '#7f1d1d',
          color: 'white', padding: '12px 20px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}} />
    </div>
  );
}
