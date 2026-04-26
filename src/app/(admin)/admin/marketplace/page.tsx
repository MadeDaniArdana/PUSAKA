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
    <div style={{ padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>
            Direktori UMKM
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Kelola daftar usaha lokal warga yang tampil di Marketplace.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          style={{ 
            background: '#16a34a', border: 'none', padding: '10px 16px', borderRadius: '10px',
            color: 'white', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
        >
          <Plus size={16} /> Tambah UMKM
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(30,41,59,0.5)', 
        padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' 
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Cari nama toko atau pemilik..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', 
              background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', 
              color: '#f8fafc', fontSize: '13px', outline: 'none' 
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ 
        background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#94a3b8' }}>Memuat direktori...</div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748b', gap: '12px', padding: '40px' }}>
            <AlertCircle size={48} opacity={0.5} />
            <span style={{ fontSize: '15px' }}>Tidak ada UMKM terdaftar</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>INFO UMKM</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>KATEGORI</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>KONTAK PEMILIK</th>
                  <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((biz) => (
                  <tr key={biz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {biz.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={biz.image_url} alt="" style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={20} color="#64748b" />
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: '0 0 4px' }}>{biz.name}</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{biz.description}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', 
                        fontSize: '11px', fontWeight: 600, color: '#cbd5e1' 
                      }}>
                        {biz.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '13px', color: '#e2e8f0', margin: '0 0 4px', fontWeight: 500 }}>{biz.owner_name}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontFamily: 'monospace' }}>{biz.phone_number}</p>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(biz.id, biz.name)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
        )}
      </div>

      {/* Modal Tambah UMKM */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Registrasi UMKM Baru</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NAMA USAHA</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }} placeholder="Contoh: Kedai Mak Nyus" />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>KATEGORI</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }}>
                    <option value="Kuliner" style={{ background: '#0f172a' }}>Kuliner</option>
                    <option value="Jasa" style={{ background: '#0f172a' }}>Jasa</option>
                    <option value="Produk Lokal" style={{ background: '#0f172a' }}>Produk Lokal</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NOMOR WA (TANPA 0)</label>
                  <input required type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }} placeholder="812345678" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NAMA PEMILIK</label>
                <input required type="text" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }} placeholder="Nama lengkap" />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DESKRIPSI (Opsional)</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', resize: 'none' }} placeholder="Jelaskan produk/jasa yang dijual..." />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>URL GAMBAR (Opsional)</label>
                <div style={{ position: 'relative' }}>
                  <ImageIcon size={14} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }} placeholder="https://..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#16a34a', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
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
