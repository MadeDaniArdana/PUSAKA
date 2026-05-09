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
    <div className="p-4 md:p-6 lg:p-8 min-h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h1 className="font-outfit text-xl md:text-[28px] font-bold text-slate-900 m-0 mb-2">
          Manajemen Laporan Warga
        </h1>
        <p className="text-sm text-slate-400 m-0">
          Kelola dan tindak lanjuti laporan infrastruktur dan lingkungan desa.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 md:mb-6 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari judul laporan atau nama pelapor..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 px-3.5 pl-10 rounded-[10px] bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-3.5 rounded-[10px] bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl flex-1 overflow-hidden flex flex-col shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center flex-1 text-slate-400">
            Memuat laporan...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-3 p-10">
            <AlertCircle size={48} className="opacity-50" />
            <span className="text-[15px]">Tidak ada laporan yang ditemukan</span>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200 w-[30%]">DETAIL LAPORAN</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">LOKASI & URGENSI</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">PELAPOR</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">AKSI / STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-100">
                      <td className="p-5 align-top">
                        <div className="flex gap-3">
                          {report.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={report.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <FileText size={20} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900 m-0 mb-1 leading-snug">{report.title}</p>
                            <p className="text-xs text-slate-500 m-0 mb-1.5">{report.category}</p>
                            <p className="text-xs text-slate-400 m-0 line-clamp-2">{report.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="flex items-start gap-1.5 mb-2">
                          <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-[13px] text-slate-700 leading-snug">{report.address}</span>
                        </div>
                        <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold uppercase" style={{
                          background: report.urgency === 'Darurat' ? '#fee2e2' : (report.urgency === 'Mendesak' ? '#fef3c7' : '#f1f5f9'),
                          color: report.urgency === 'Darurat' ? '#dc2626' : (report.urgency === 'Mendesak' ? '#d97706' : '#64748b')
                        }}>
                          {report.urgency || 'Normal'}
                        </span>
                      </td>
                      <td className="p-5 align-top">
                        <p className="text-[13px] font-medium text-slate-700 m-0 mb-1">{report.reporter_name}</p>
                        <p className="text-[11px] text-slate-500 m-0">
                          {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="p-5 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          <select
                            value={report.status}
                            onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-md text-xs font-semibold outline-none cursor-pointer"
                            style={{
                              background: report.status === 'Selesai' ? '#dcfce7' : (report.status === 'Diproses' ? '#dbeafe' : '#fef3c7'),
                              color: report.status === 'Selesai' ? '#16a34a' : (report.status === 'Diproses' ? '#2563eb' : '#d97706'),
                              border: `1px solid ${report.status === 'Selesai' ? '#bbf7d0' : (report.status === 'Diproses' ? '#bfdbfe' : '#fde68a')}`
                            }}
                          >
                            <option value="Menunggu" style={{ background: 'white', color: '#0f172a' }}>Menunggu</option>
                            <option value="Diproses" style={{ background: 'white', color: '#0f172a' }}>Diproses</option>
                            <option value="Selesai" style={{ background: 'white', color: '#0f172a' }}>Selesai</option>
                          </select>
                          {report.status === 'Selesai' && (
                            <div className="flex items-center gap-1 text-emerald-500 text-[11px]">
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

            {/* Mobile card view */}
            <div className="md:hidden flex flex-col gap-3 p-3 overflow-y-auto">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex gap-3 mb-3">
                    {report.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 m-0 mb-1 truncate">{report.title}</p>
                      <p className="text-[11px] text-slate-500 m-0">{report.category} • {report.reporter_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[11px]">
                    <MapPin size={12} className="text-blue-400 shrink-0" />
                    <span className="truncate">{report.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase" style={{
                      background: report.urgency === 'Darurat' ? '#fee2e2' : (report.urgency === 'Mendesak' ? '#fef3c7' : '#f1f5f9'),
                      color: report.urgency === 'Darurat' ? '#dc2626' : (report.urgency === 'Mendesak' ? '#d97706' : '#64748b')
                    }}>
                      {report.urgency || 'Normal'}
                    </span>
                    <select
                      value={report.status}
                      onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold outline-none cursor-pointer"
                      style={{
                        background: report.status === 'Selesai' ? '#dcfce7' : (report.status === 'Diproses' ? '#dbeafe' : '#fef3c7'),
                        color: report.status === 'Selesai' ? '#16a34a' : (report.status === 'Diproses' ? '#2563eb' : '#d97706'),
                        border: `1px solid ${report.status === 'Selesai' ? '#bbf7d0' : (report.status === 'Diproses' ? '#bfdbfe' : '#fde68a')}`
                      }}
                    >
                      <option value="Menunggu" style={{ background: 'white', color: '#0f172a' }}>Menunggu</option>
                      <option value="Diproses" style={{ background: 'white', color: '#0f172a' }}>Diproses</option>
                      <option value="Selesai" style={{ background: 'white', color: '#0f172a' }}>Selesai</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
