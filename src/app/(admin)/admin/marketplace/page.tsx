'use client';

import { useEffect, useState } from 'react';
import { Search, Store, Trash2, Plus, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminMarketplacePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Kuliner', description: '', owner_name: '', phone_number: '', image_url: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchBusinesses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
    if (data) setBusinesses(data);
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase.from('businesses').insert([{
      ...formData, rating: 5.0 // default rating
    }]).select();

    setIsSubmitting(false);
    if (error) {
      alert('Gagal menambahkan UMKM: ' + error.message);
      return;
    }
    
    if (data) {
      setBusinesses(prev => [data[0], ...prev]);
      setShowForm(false);
      setFormData({ name: '', category: 'Kuliner', description: '', owner_name: '', phone_number: '', image_url: '' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari direktori?`)) return;
    
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus UMKM');
    } else {
      setBusinesses(prev => prev.filter(b => b.id !== id));
    }
  };

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 md:mb-6">
        <div>
          <h1 className="font-outfit text-xl md:text-[28px] font-bold text-slate-900 m-0 mb-2">
            Direktori UMKM
          </h1>
          <p className="text-sm text-slate-400 m-0">
            Kelola daftar usaha lokal warga yang tampil di Marketplace.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 border-none px-4 py-2.5 rounded-[10px] text-white text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-green-600/30 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus size={16} /> Tambah UMKM
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 md:gap-4 mb-5 md:mb-6 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-[400px]">
          <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari nama toko atau pemilik..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 px-3.5 pl-10 rounded-[10px] bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none"
          />
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl flex-1 overflow-hidden flex flex-col shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center flex-1 text-slate-400">Memuat direktori...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-3 p-10">
            <AlertCircle size={48} className="opacity-50" />
            <span className="text-[15px]">Tidak ada UMKM terdaftar</span>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">INFO UMKM</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">KATEGORI</th>
                    <th className="text-left p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">KONTAK PEMILIK</th>
                    <th className="text-right p-4 px-5 text-xs text-slate-500 font-semibold border-b border-slate-200">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((biz) => (
                    <tr key={biz.id} className="border-b border-slate-100">
                      <td className="p-4 px-5">
                        <div className="flex items-center gap-3">
                          {biz.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={biz.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Store size={20} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900 m-0 mb-1">{biz.name}</p>
                            <p className="text-xs text-slate-400 m-0 line-clamp-1">{biz.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 px-5">
                        <span className="bg-slate-100 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-600">
                          {biz.category}
                        </span>
                      </td>
                      <td className="p-4 px-5">
                        <p className="text-[13px] text-slate-700 m-0 mb-1 font-medium">{biz.owner_name}</p>
                        <p className="text-xs text-slate-400 m-0 font-mono">{biz.phone_number}</p>
                      </td>
                      <td className="p-4 px-5 text-right">
                        <button 
                          onClick={() => handleDelete(biz.id, biz.name)}
                          className="bg-transparent border-none text-red-500 cursor-pointer p-2 rounded-lg transition-colors hover:bg-red-500/10"
                          title="Hapus UMKM"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden flex flex-col gap-3 p-3 overflow-y-auto">
              {filtered.map((biz) => (
                <div key={biz.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex gap-3 mb-3">
                    {biz.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={biz.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Store size={18} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 m-0 mb-0.5 truncate">{biz.name}</p>
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600">{biz.category}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(biz.id, biz.name)}
                      className="bg-transparent border-none text-red-500 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10 shrink-0 self-start"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 m-0 mb-1">{biz.owner_name} • <span className="font-mono">{biz.phone_number}</span></p>
                  <p className="text-[11px] text-slate-500 m-0 line-clamp-1">{biz.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah UMKM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 md:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="font-outfit text-lg font-semibold text-slate-900 m-0">Registrasi UMKM Baru</h2>
              <button onClick={() => setShowForm(false)} className="bg-transparent border-none text-slate-400 cursor-pointer"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 md:p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">NAMA USAHA</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full py-2.5 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none" placeholder="Contoh: Kedai Mak Nyus" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">KATEGORI</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full py-2.5 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none">
                    <option value="Kuliner">Kuliner</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Produk Lokal">Produk Lokal</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">NOMOR WA (TANPA 0)</label>
                  <input required type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full py-2.5 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none" placeholder="812345678" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">NAMA PEMILIK</label>
                <input required type="text" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} className="w-full py-2.5 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none" placeholder="Nama lengkap" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">DESKRIPSI (Opsional)</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full py-2.5 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none resize-none" placeholder="Jelaskan produk/jasa yang dijual..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">URL GAMBAR (Opsional)</label>
                <div className="relative">
                  <ImageIcon size={14} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full py-2.5 px-3.5 pl-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[13px] outline-none" placeholder="https://..." />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-[10px] bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-semibold cursor-pointer">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-[10px] bg-green-600 border-none text-white text-[13px] font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan UMKM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
