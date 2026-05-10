'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone, Star, Store, Coffee, Wrench, ShoppingBag, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  { id: 'Semua', label: 'Semua', icon: Store },
  { id: 'Kuliner', label: 'Kuliner', icon: Coffee },
  { id: 'Jasa', label: 'Jasa', icon: Wrench },
  { id: 'Produk', label: 'Produk Lokal', icon: ShoppingBag },
];

export default function MarketplaceManagePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Kuliner', description: '', phone: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();

  const ownerName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Warga';

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_name', ownerName)
      .order('created_at', { ascending: false });
    if (data) setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/marketplace');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `businesses/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('reports')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('businesses').insert([{
        name: formData.name,
        category: formData.category,
        description: formData.description,
        phone_number: formData.phone,
        owner_name: ownerName,
        image_url: imageUrl,
        rating: 5.0,
      }]);

      if (error) throw error;

      setShowAddModal(false);
      setFormData({ name: '', category: 'Kuliner', description: '', phone: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchBusinesses();
    } catch (err: any) {
      alert('Gagal mendaftarkan UMKM: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      const { error } = await supabase.from('businesses').delete().eq('id', id);
      if (error) throw error;
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-10 min-h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-outfit text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          Kelola <span className="text-green-600">UMKM</span> Anda
        </h1>
        <p className="text-sm text-slate-500 max-w-[500px] leading-relaxed mb-6">
          Tambah, edit, atau hapus produk dan jasa UMKM milik Anda. Produk yang Anda daftarkan akan tampil di <strong>Pasar UMKM</strong> publik.
        </p>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Tambah UMKM Baru
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari produk Anda..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
              background: 'white', border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
              transition: 'border 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#16a34a'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(({ id, label, icon: Icon }) => {
          const active = activeCategory === id;
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 999, border: active ? '1px solid #16a34a' : '1px solid #e2e8f0',
                background: active ? '#f0fdf4' : 'white',
                color: active ? '#15803d' : '#64748b', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#94a3b8' }}>Memuat produk Anda...</div>
      ) : filteredBusinesses.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#94a3b8', textAlign: 'center' }}>
          <Store size={48} opacity={0.3} style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#475569', margin: '0 0 8px' }}>Belum Ada Produk UMKM</h3>
          <p style={{ fontSize: 14, margin: '0 0 16px' }}>Anda belum mendaftarkan UMKM. Klik tombol di atas untuk mulai.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20,
        }}>
          {filteredBusinesses.map(biz => (
            <div key={biz.id} style={{
              background: 'white', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              {/* Delete button */}
              <button
                onClick={() => handleDelete(biz.id)}
                disabled={deleteId === biz.id}
                style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 10,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                  border: '1px solid #fecaca', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#dc2626', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  opacity: deleteId === biz.id ? 0.5 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
                title="Hapus produk ini"
              >
                <Trash2 size={14} />
              </button>

              {/* Image */}
              <div style={{ height: 140, background: '#f1f5f9' }}>
                {biz.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={biz.image_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                  }}>
                    <Store size={36} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                    {biz.name}
                  </h2>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#15803d',
                    background: '#f0fdf4', padding: '3px 8px', borderRadius: 6, border: '1px solid #bbf7d0',
                  }}>
                    {biz.category}
                  </span>
                </div>
                <p style={{
                  fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '0 0 12px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {biz.description || 'Tidak ada deskripsi.'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#fef3c7', padding: '3px 8px', borderRadius: 6,
                    color: '#d97706', fontSize: 11, fontWeight: 700,
                  }}>
                    <Star size={11} fill="currentColor" /> {biz.rating ? biz.rating.toFixed(1) : '5.0'}
                  </div>
                  {biz.phone_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                      <Phone size={11} /> {biz.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[1000] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-outfit text-xl font-bold text-slate-900 m-0">Daftarkan Toko/UMKM</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Foto Produk/Toko</label>
                <div
                  className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${imagePreview ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Klik untuk unggah foto</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Nama Toko/Usaha</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500" placeholder="Contoh: Kedai Kopi Senja" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Kategori</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500 bg-white">
                  {categories.filter(c => c.id !== 'Semua').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Nomor WhatsApp</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500" placeholder="Contoh: 081234567890" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Deskripsi Pendek</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500 resize-none" placeholder="Ceritakan singkat tentang usaha Anda..." />
              </div>

              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan UMKM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
