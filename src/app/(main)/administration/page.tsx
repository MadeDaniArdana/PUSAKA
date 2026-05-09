'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  FileCheck,
  Building2,
  Heart,
  Store,
  Baby,
  X,
  Download,
  MoreVertical,
  ChevronRight,
  Clock,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';

const documentTypes = [
  {
    id: 'Surat Domisili',
    icon: Building2,
    title: 'Surat Domisili',
    desc: 'Sertifikat Domisili. Diperlukan untuk perbankan, sekolah, dan pendaftaran resmi.',
    color: '#3b82f6',
    bg: '#dbeafe',
  },
  {
    id: 'Pengantar RT',
    icon: FileText,
    title: 'Pengantar RT',
    desc: 'Surat Pengantar Lingkungan. Digunakan sebagai validasi awal untuk keperluan dinas yang lebih tinggi.',
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  {
    id: 'SKTM',
    icon: Heart,
    title: 'SKTM',
    desc: 'Surat Keterangan Tidak Mampu. Untuk mendapatkan bantuan sosial dan keringanan biaya.',
    color: '#ef4444',
    bg: '#fee2e2',
  },
  {
    id: 'SKU',
    icon: Store,
    title: 'SKU',
    desc: 'Surat Keterangan Usaha. Legalitas usaha mikro dan kecil di lingkungan desa.',
    color: '#f59e0b',
    bg: '#fef3c7',
  },
  {
    id: 'Ket. Kelahiran',
    icon: Baby,
    title: 'Ket. Kelahiran',
    desc: 'Surat Keterangan Kelahiran sebagai dokumen pendukung akta kelahiran.',
    color: '#22c55e',
    bg: '#dcfce7',
  },
  {
    id: 'Ket. Kematian',
    icon: FileCheck,
    title: 'Ket. Kematian',
    desc: 'Surat Keterangan Kematian untuk keperluan administrasi dan legalitas warisan.',
    color: '#64748b',
    bg: '#f1f5f9',
  },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  Disetujui: { bg: '#dcfce7', color: '#15803d' },
  Menunggu: { bg: '#fef3c7', color: '#b45309' },
  Ditolak: { bg: '#fee2e2', color: '#dc2626' },
  Diproses: { bg: '#dbeafe', color: '#1d4ed8' },
};

export default function AdministrationPage() {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', nik: '', kk: '', purpose: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();

  const fetchRequests = async () => {
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (data) setMyRequests(data);
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
      if (user) {
        setFormData(prev => ({ ...prev, name: user.user_metadata?.full_name || user.email?.split('@')[0] || '' }));
      }
    }
    loadUser();
    fetchRequests();
  }, []);

  const handleAjukanClick = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login?redirect=/administration');
      return;
    }
    setSelectedDocType(docId);
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async () => {
    if (!formData.name || !formData.nik) {
      alert('Nama dan NIK harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      const trackingNumber = 'REQ-' + new Date().getFullYear().toString().slice(-2) + '-' + Math.floor(Math.random() * 9000 + 1000);
      const { error } = await supabase.from('requests').insert([{
        type: documentTypes.find(d => d.id === selectedDocType)?.title || selectedDocType,
        status: 'Menunggu',
        tracking_number: trackingNumber,
        requester_name: formData.name,
      }]);

      if (!error) {
        alert('Permohonan berhasil diajukan dengan nomor: ' + trackingNumber);
        setShowRequestForm(false);
        setFormData(prev => ({ ...prev, nik: '', kk: '', purpose: '' })); // keep name
        fetchRequests();
      } else {
        alert('Gagal mengajukan: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 relative">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Administrasi Digital
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
            Kelola permintaan dokumen kewarganegaraan Anda secara efisien. Pilih jenis dokumen di bawah untuk memulai permohonan baru atau cek status yang ada.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Available Documents */}
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} />
              Dokumen Tersedia
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documentTypes.map(({ id, icon: Icon, title, desc, color, bg }) => (
                <div
                  key={id}
                  style={{
                    background: 'white', borderRadius: '14px', padding: '16px',
                    border: selectedDocType === id ? `2px solid ${color}` : '1px solid #f1f5f9',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => setSelectedDocType(id)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
                  onMouseLeave={(e) => { if (selectedDocType !== id) e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, marginTop: '2px' }}>{desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAjukanClick(id, e)}
                    style={{
                      width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${color}`,
                      background: `${color}10`, color, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.color = color; }}
                  >
                    <FileCheck size={13} />
                    {user ? 'Ajukan Dokumen' : '🔒 Login untuk Ajukan'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} />
                Permohonan Saya
              </h2>
              <button style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Lihat Semua
              </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Table header */}
              <div className="grid grid-cols-[100px_1fr_40px] md:grid-cols-[130px_100px_1fr_120px_40px] gap-2 p-3 px-4 bg-slate-50 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">No. Lacak</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Tanggal</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest col-span-2 md:col-span-1">Jenis / Info</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Status</span>
                <span></span>
              </div>
              {/* Rows */}
              {myRequests.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada permohonan.</div>
              ) : myRequests.map((req) => {
                const s = statusStyle[req.status];
                const active = selectedRequest?.id === req.id;
                const timeText = new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`grid grid-cols-[1fr_40px] md:grid-cols-[130px_100px_1fr_120px_40px] gap-2 p-3 px-4 cursor-pointer items-center border-b border-slate-50 transition-colors ${active ? 'bg-green-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <span className="text-xs font-bold text-green-600 font-mono hidden md:block">{req.tracking_number}</span>
                    <span className="text-xs text-slate-400 hidden md:block">{timeText}</span>
                    <div className="flex flex-col md:block">
                      <span className="text-[13px] font-semibold text-slate-900">{req.type}</span>
                      <span className="text-[10px] text-slate-500 md:hidden mt-0.5">{timeText} • {req.tracking_number}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 md:hidden`} style={{ background: s?.bg, color: s?.color }}>
                        {req.status}
                      </span>
                    </div>
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit" style={{ background: s?.bg || '#fef3c7', color: s?.color || '#b45309' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s?.color || '#b45309' }} />
                      {req.status}
                    </span>
                    <button style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MoreVertical size={13} color="#94a3b8" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Process timeline */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', marginTop: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
                Alur Persetujuan
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                {[
                  { label: 'Diajukan', color: '#16a34a', done: true },
                  { label: 'Review RT', color: '#16a34a', done: selectedRequest?.status !== 'Menunggu' },
                  { label: 'Proses Admin', color: '#3b82f6', done: selectedRequest?.status === 'Disetujui', active: selectedRequest?.status === 'Diproses' },
                  { label: 'Siap Unduh', color: '#94a3b8', done: selectedRequest?.status === 'Disetujui' },
                ].map(({ label, color, done, active }, i, arr) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: done || active ? color : '#e2e8f0',
                        border: active ? `3px solid ${color}30` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: active ? `0 0 0 4px ${color}20` : 'none',
                      }}>
                        {done && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                        {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: '10px', color: done || active ? '#0f172a' : '#94a3b8', fontWeight: done || active ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: done ? '#16a34a' : '#e2e8f0', margin: '-14px 4px 0' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Detail Panel (Drawer on Mobile) */}
      {selectedRequest && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSelectedRequest(null)} />
          <div
            className="fixed inset-y-0 right-0 w-full max-w-[320px] lg:static lg:w-[300px] flex flex-col shrink-0 bg-white border-l border-slate-200 overflow-y-auto z-50 animate-slide-in-right"
          >
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Detail Dokumen
            </h2>
            <button
              onClick={() => setSelectedRequest(null)}
              style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ padding: '20px', flex: 1 }}>
            {/* Request ID & Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No. Lacak</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>{selectedRequest.tracking_number}</div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px',
                background: statusStyle[selectedRequest.status]?.bg || '#fef3c7',
                color: statusStyle[selectedRequest.status]?.color || '#b45309',
              }}>
                {selectedRequest.status}
              </span>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Jenis', value: selectedRequest.type },
                { label: 'Tanggal Diajukan', value: new Date(selectedRequest.created_at).toLocaleDateString('id-ID') },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f1f5f9', margin: '16px 0' }} />

            {/* Applicant Info */}
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
              Informasi Pemohon
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <User size={13} style={{ color: '#94a3b8', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Nama Lengkap</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedRequest.requester_name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Download button */}
          {(selectedRequest.status === 'Disetujui' || selectedRequest.status === 'Selesai') && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => {
                  if (selectedRequest.file_url) {
                    window.open(selectedRequest.file_url, '_blank');
                  } else {
                    alert('Dokumen fisik sedang disiapkan di balai desa. Jika ada versi digital, akan muncul di sini nanti.');
                  }
                }}
                style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: '#0f172a', color: 'white', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'background 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
              >
                <Download size={15} />
                Unduh PDF
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-[1000] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[460px] shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Ajukan {documentTypes.find(d => d.id === selectedDocType)?.title}
              </h2>
              <button onClick={() => setShowRequestForm(false)} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                 <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>NAMA LENGKAP</label>
                 <input type="text" placeholder="Masukkan nama lengkap..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter' }} />
              </div>
              <div>
                 <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>NIK (16 DIGIT)</label>
                 <input type="text" placeholder="Masukkan nik (16 digit)..." value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter' }} />
              </div>
              <div>
                 <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>NOMOR KK</label>
                 <input type="text" placeholder="Masukkan nomor kk..." value={formData.kk} onChange={(e) => setFormData({...formData, kk: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter' }} />
              </div>
              <div>
                 <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>KEPERLUAN / TUJUAN</label>
                 <textarea rows={3} placeholder="Masukkan keperluan / tujuan..." value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'Inter' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setShowRequestForm(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  Batal
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ChevronRight size={14} /> {isSubmitting ? 'Mengajukan...' : 'Ajukan Permohonan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
