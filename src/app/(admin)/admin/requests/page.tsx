'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Filter, AlertCircle, FileCheck, XCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequestForUpload, setSelectedRequestForUpload] = useState<any>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      alert('Gagal mengupdate status permohonan');
      return;
    }
    
    // Optimistic UI update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const openUploadModal = (req: any) => {
    setSelectedRequestForUpload(req);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedRequestForUpload(null);
    setFileToUpload(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUploadAndComplete = async () => {
    if (!fileToUpload || !selectedRequestForUpload) return;
    setIsUploading(true);

    try {
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `documents/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, fileToUpload);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('requests')
        .update({ status: 'Selesai', file_url: publicUrl })
        .eq('id', selectedRequestForUpload.id);
      
      if (updateError) throw updateError;
      
      setRequests(prev => prev.map(r => r.id === selectedRequestForUpload.id ? { ...r, status: 'Selesai', file_url: publicUrl } : r));
      closeUploadModal();
      alert('Dokumen berhasil diunggah dan status diperbarui menjadi Selesai.');
    } catch (err: any) {
      alert('Gagal mengunggah dokumen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.requester_name?.toLowerCase().includes(search.toLowerCase()) || 
                          r.tracking_number?.includes(search) || 
                          r.type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>
            Manajemen Permohonan Surat
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Proses pengajuan dokumen administrasi digital warga.
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
            placeholder="Cari nama pemohon, NIK, atau jenis surat..." 
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
            <option value="Disetujui">Disetujui</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
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
            Memuat permohonan...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748b', gap: '12px', padding: '40px' }}>
            <AlertCircle size={48} opacity={0.5} />
            <span style={{ fontSize: '15px' }}>Tidak ada permohonan yang ditemukan</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>JENIS DOKUMEN</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>DATA PEMOHON</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', width: '25%' }}>KEPERLUAN</th>
                  <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>AKSI / STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    
                    {/* Jenis Dokumen */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileCheck size={18} color="#60a5fa" />
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: '0 0 4px', textTransform: 'capitalize' }}>
                            {req.type?.replace(/-/g, ' ') || 'Dokumen'}
                          </p>
                          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                            {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Data Pemohon */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 4px' }}>{req.requester_name}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>No. Resi: <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{req.tracking_number}</span></p>
                      </div>
                    </td>

                    {/* Keperluan */}
                    <td style={{ padding: '20px', verticalAlign: 'top' }}>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        Pengajuan layanan administrasi digital
                      </p>
                    </td>
                    
                    {/* Aksi / Status */}
                    <td style={{ padding: '20px', verticalAlign: 'top', textAlign: 'right' }}>
                      {req.status === 'Menunggu' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'Ditolak')}
                            style={{ 
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444',
                              padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                          >
                            <XCircle size={14} /> Tolak
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'Disetujui')}
                            style={{ 
                              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981',
                              padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)' }}
                          >
                            <CheckCircle2 size={14} /> Setujui
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{ 
                            display: 'inline-block', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                            background: req.status === 'Selesai' || req.status === 'Disetujui' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: req.status === 'Selesai' || req.status === 'Disetujui' ? '#34d399' : '#f87171',
                            border: `1px solid ${req.status === 'Selesai' || req.status === 'Disetujui' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                          }}>
                            {req.status}
                          </span>
                          {(req.status === 'Disetujui') && (
                            <button 
                              onClick={() => openUploadModal(req)}
                              style={{ 
                                background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '11px', 
                                fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                              }}
                            >
                              Tandai Selesai & Kirim
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>Unggah Dokumen Final</h2>
              <button onClick={closeUploadModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
                Unggah file dokumen surat (PDF) untuk pemohon <strong style={{ color: 'white' }}>{selectedRequestForUpload?.requester_name}</strong>. Setelah diunggah, pemohon dapat mengunduhnya langsung dari dashboard mereka.
              </p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px', padding: '32px', 
                  textAlign: 'center', cursor: 'pointer', background: 'rgba(15,23,42,0.4)', transition: 'border 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              >
                <Upload size={32} color="#64748b" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#f8fafc', fontWeight: 600 }}>
                  {fileToUpload ? fileToUpload.name : 'Pilih File Dokumen (PDF)'}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>Maksimal 5MB</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={closeUploadModal} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Batal
              </button>
              <button 
                onClick={handleUploadAndComplete} 
                disabled={!fileToUpload || isUploading}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', background: '#3b82f6', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: (!fileToUpload || isUploading) ? 'not-allowed' : 'pointer', opacity: (!fileToUpload || isUploading) ? 0.7 : 1 }}
              >
                {isUploading ? 'Mengunggah...' : 'Unggah & Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
