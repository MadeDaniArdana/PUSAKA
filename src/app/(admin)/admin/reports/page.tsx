'use client';

import { useEffect, useState } from 'react';
import { FileText, MapPin, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const supabase = createClient();

  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      alert('Gagal mengupdate status');
      return;
    }
    
    // Optimistic UI update
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.reporter_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>
            Manajemen Laporan Warga
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Kelola dan tindak lanjuti laporan infrastruktur dan lingkungan desa.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(30,41,59,0.5)', 
        padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' 
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Cari judul laporan atau nama pelapor..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', 
              background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', 
              color: '#f8fafc', fontSize: '13px', outline: 'none' 
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#94a3b8" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              padding: '10px 14px', borderRadius: '10px', background: 'rgba(15,23,42,0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '13px', outline: 'none' 
            }}
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ 
        background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#94a3b8' }}>
            Memuat laporan...
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748b', gap: '12px', padding: '40px' }}>
            <AlertCircle size={48} opacity={0.5} />
            <span style={{ fontSize: '15px' }}>Tidak ada laporan yang ditemukan</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', width: '30%' }}>DETAIL LAPORAN</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>LOKASI & URGENSI</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>PELAPOR</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>AKSI / STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Detail Laporan */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {report.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={report.image_url} alt="" style={{ width: 64, height: 64, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={20} color="#64748b" />
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: '0 0 4px', lineHeight: 1.4 }}>{report.title}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>{report.category}</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Lokasi */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                        <MapPin size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>{report.address}</span>
                      </div>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                        background: report.urgency === 'Darurat' ? 'rgba(239,68,68,0.15)' : (report.urgency === 'Mendesak' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'),
                        color: report.urgency === 'Darurat' ? '#fca5a5' : (report.urgency === 'Mendesak' ? '#fcd34d' : '#94a3b8')
                      }}>
                        {report.urgency || 'Normal'}
                      </span>
                    </td>
                    
                    {/* Pelapor */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0', margin: '0 0 4px' }}>{report.reporter_name}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                        {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    
                    {/* Aksi / Status */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                        <select
                          value={report.status}
                          onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, outline: 'none', cursor: 'pointer',
                            background: report.status === 'Selesai' ? 'rgba(16,185,129,0.15)' : (report.status === 'Diproses' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)'),
                            color: report.status === 'Selesai' ? '#34d399' : (report.status === 'Diproses' ? '#60a5fa' : '#fbbf24'),
                            border: `1px solid ${report.status === 'Selesai' ? 'rgba(16,185,129,0.3)' : (report.status === 'Diproses' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)')}`
                          }}
                        >
                          <option value="Menunggu" style={{ background: '#0f172a', color: 'white' }}>Menunggu</option>
                          <option value="Diproses" style={{ background: '#0f172a', color: 'white' }}>Diproses</option>
                          <option value="Selesai" style={{ background: '#0f172a', color: 'white' }}>Selesai</option>
                        </select>
                        {report.status === 'Selesai' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '11px' }}>
                            <CheckCircle2 size={12} /> Terselesaikan
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
