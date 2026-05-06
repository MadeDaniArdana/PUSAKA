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
    <div className="p-4 md:p-6 lg:p-8 min-h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h1 className="font-outfit text-xl md:text-[28px] font-bold text-slate-50 m-0 mb-2">
          Manajemen Permohonan Surat
        </h1>
        <p className="text-sm text-slate-400 m-0">
          Proses pengajuan dokumen administrasi digital warga.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 md:mb-6 bg-slate-800/50 p-3 md:p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari nama pemohon, NIK, atau jenis surat..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 px-3.5 pl-10 rounded-[10px] bg-slate-900/60 border border-white/10 text-slate-50 text-[13px] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-3.5 rounded-[10px] bg-slate-900/60 border border-white/10 text-slate-50 text-[13px] outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-slate-800/50 border border-white/5 rounded-2xl flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center flex-1 text-slate-400">
            Memuat permohonan...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-3 p-10">
            <AlertCircle size={48} className="opacity-50" />
            <span className="text-[15px]">Tidak ada permohonan yang ditemukan</span>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="text-left p-4 px-5 text-xs text-slate-400 font-semibold border-b border-white/5">JENIS DOKUMEN</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-400 font-semibold border-b border-white/5">DATA PEMOHON</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-400 font-semibold border-b border-white/5 w-[25%]">KEPERLUAN</th>
                    <th className="text-right p-4 px-5 text-xs text-slate-400 font-semibold border-b border-white/5">AKSI / STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b border-white/[0.04]">
                      <td className="p-5 align-top">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <FileCheck size={18} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-50 m-0 mb-1 capitalize">{req.type?.replace(/-/g, ' ') || 'Dokumen'}</p>
                            <p className="text-[11px] text-slate-500 m-0">
                              {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <p className="text-sm font-semibold text-slate-200 m-0 mb-1">{req.requester_name}</p>
                        <p className="text-[11px] text-slate-400 m-0">No. Resi: <span className="text-slate-300 font-mono">{req.tracking_number}</span></p>
                      </td>
                      <td className="p-5 align-top">
                        <p className="text-[13px] text-slate-300 m-0 leading-relaxed line-clamp-2">
                          Pengajuan layanan administrasi digital
                        </p>
                      </td>
                      <td className="p-5 align-top text-right">
                        {req.status === 'Menunggu' ? (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Ditolak')}
                              className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors hover:bg-red-500/20"
                            >
                              <XCircle size={14} /> Tolak
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Disetujui')}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors hover:bg-emerald-500/20"
                            >
                              <CheckCircle2 size={14} /> Setujui
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-block px-3 py-1.5 rounded-md text-[11px] font-bold uppercase" style={{
                              background: req.status === 'Selesai' || req.status === 'Disetujui' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: req.status === 'Selesai' || req.status === 'Disetujui' ? '#34d399' : '#f87171',
                              border: `1px solid ${req.status === 'Selesai' || req.status === 'Disetujui' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                              {req.status}
                            </span>
                            {(req.status === 'Disetujui') && (
                              <button 
                                onClick={() => openUploadModal(req)}
                                className="bg-transparent border-none text-blue-400 text-[11px] font-semibold cursor-pointer underline"
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

            {/* Mobile card view */}
            <div className="md:hidden flex flex-col gap-3 p-3 overflow-y-auto">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <FileCheck size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-50 m-0 mb-0.5 capitalize">{req.type?.replace(/-/g, ' ') || 'Dokumen'}</p>
                      <p className="text-[11px] text-slate-400 m-0">{req.requester_name} • <span className="font-mono">{req.tracking_number}</span></p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 m-0 mb-3">
                    {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  
                  {req.status === 'Menunggu' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'Ditolak')}
                        className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 py-2 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center justify-center gap-1 transition-colors hover:bg-red-500/20"
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'Disetujui')}
                        className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-2 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center justify-center gap-1 transition-colors hover:bg-emerald-500/20"
                      >
                        <CheckCircle2 size={13} /> Setujui
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase" style={{
                        background: req.status === 'Selesai' || req.status === 'Disetujui' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: req.status === 'Selesai' || req.status === 'Disetujui' ? '#34d399' : '#f87171',
                      }}>
                        {req.status}
                      </span>
                      {(req.status === 'Disetujui') && (
                        <button 
                          onClick={() => openUploadModal(req)}
                          className="bg-transparent border-none text-blue-400 text-[11px] font-semibold cursor-pointer underline"
                        >
                          Selesai & Kirim
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1000] flex items-center justify-center p-4 md:p-5">
          <div className="bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-[480px] shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-outfit text-lg md:text-xl font-bold text-white m-0">Unggah Dokumen Final</h2>
              <button onClick={closeUploadModal} className="bg-transparent border-none text-slate-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Unggah file dokumen surat (PDF) untuk pemohon <strong className="text-white">{selectedRequestForUpload?.requester_name}</strong>. Setelah diunggah, pemohon dapat mengunduhnya langsung dari dashboard mereka.
              </p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-2xl p-6 md:p-8 text-center cursor-pointer bg-slate-900/40 transition-colors hover:border-white/40"
              >
                <Upload size={32} className="text-slate-500 mx-auto mb-3" />
                <p className="m-0 text-sm text-slate-50 font-semibold">
                  {fileToUpload ? fileToUpload.name : 'Pilih File Dokumen (PDF)'}
                </p>
                <p className="m-0 mt-2 text-xs text-slate-500">Maksimal 5MB</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
            </div>

            <div className="flex gap-3">
              <button onClick={closeUploadModal} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-50 text-sm font-semibold cursor-pointer">
                Batal
              </button>
              <button 
                onClick={handleUploadAndComplete} 
                disabled={!fileToUpload || isUploading}
                className="flex-[2] py-3 rounded-xl bg-blue-600 border-none text-white text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
