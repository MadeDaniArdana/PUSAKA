'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Phone, Star, Store, Coffee, Wrench, ShoppingBag, Globe } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';

const categories = [
  { id: 'Semua', label: 'Semua', icon: Store },
  { id: 'Kuliner', label: 'Kuliner', icon: Coffee },
  { id: 'Jasa', label: 'Jasa', icon: Wrench },
  { id: 'Produk', label: 'Produk Lokal', icon: ShoppingBag },
];

export default function PasarPublicPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const supabase = createClient();

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setBusinesses(data);
      setLoading(false);
    }
    fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatWhatsApp = (phone: string, bizName: string) => {
    if (!phone) return '';
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = '62' + formatted.substring(1);
    const message = encodeURIComponent(`Halo, saya melihat produk/jasa ${bizName} di PUSAKA. Saya ingin bertanya lebih lanjut.`);
    return `https://api.whatsapp.com/send?phone=${formatted}&text=${message}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
        padding: '48px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #bbf7d0',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          background: 'rgba(22,163,74,0.08)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30, width: 160, height: 160,
          background: 'rgba(22,163,74,0.06)', borderRadius: '50%',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', padding: '6px 14px', borderRadius: 999,
          border: '1px solid #bbf7d0', marginBottom: 16,
          boxShadow: '0 2px 8px rgba(22,163,74,0.08)',
        }}>
          <ShoppingBag size={13} color="#16a34a" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Marketplace Desa
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 800, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.2,
        }}>
          Pasar <span style={{ color: '#16a34a' }}>PUSAKA</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 auto', maxWidth: 500, lineHeight: 1.6 }}>
          Dukung ekonomi lokal! Temukan berbagai kuliner, produk kerajinan, dan jasa terbaik dari warga desa.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* Search + Filter */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 32, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama toko, produk, atau jasa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
                background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                color: '#0f172a', fontSize: 14, outline: 'none', transition: 'border 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#16a34a'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {categories.map(({ id, label, icon: Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                  borderRadius: 999, border: active ? '1px solid #16a34a' : '1px solid #e2e8f0',
                  background: active ? '#f0fdf4' : 'white',
                  color: active ? '#15803d' : '#64748b', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 12px rgba(22,163,74,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#94a3b8' }}>
            Memuat produk UMKM...
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#94a3b8', textAlign: 'center' }}>
            <Store size={48} opacity={0.3} style={{ marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'Outfit', fontSize: 20, color: '#475569', margin: '0 0 8px' }}>Belum Ada UMKM</h3>
            <p style={{ fontSize: 14, margin: 0 }}>Coba ubah kata kunci pencarian atau kategori.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24,
          }}>
            {filteredBusinesses.map(biz => (
              <div
                key={biz.id}
                style={{
                  background: 'white', borderRadius: 24, overflow: 'hidden',
                  boxShadow: '0 10px 32px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                  display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Image */}
                <div style={{ height: 160, background: '#f1f5f9', position: 'relative' }}>
                  {biz.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={biz.image_url} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                    }}>
                      <Store size={40} color="#94a3b8" />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    color: '#15803d', display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {biz.category}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h2 style={{
                      fontFamily: 'Outfit', fontSize: 18, fontWeight: 700,
                      color: '#0f172a', margin: 0, lineHeight: 1.3,
                    }}>
                      {biz.name}
                    </h2>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: '#fef3c7', padding: '4px 8px', borderRadius: 6,
                      color: '#d97706', fontSize: 12, fontWeight: 700,
                    }}>
                      <Star size={12} fill="currentColor" /> {biz.rating ? biz.rating.toFixed(1) : '5.0'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 12 }}>
                    <MapPin size={14} /> Pemilik: <span style={{ fontWeight: 600, color: '#475569' }}>{biz.owner_name}</span>
                  </div>

                  <p style={{
                    fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 20px',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {biz.description || 'Tidak ada deskripsi.'}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <a
                      href={formatWhatsApp(biz.phone_number, biz.name)}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: '#16a34a', color: 'white', padding: 12, borderRadius: 12,
                        fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
                    >
                      <Phone size={16} /> Hubungi Penjual
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{
          marginTop: 48, textAlign: 'center', padding: '24px 0',
          borderTop: '1px solid #f1f5f9',
        }}>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Menampilkan <strong style={{ color: '#0f172a' }}>{filteredBusinesses.length}</strong> UMKM dari total <strong style={{ color: '#0f172a' }}>{businesses.length}</strong> terdaftar
          </p>
        </div>
      </div>
    </div>
  );
}
