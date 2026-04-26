'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2, Construction, Leaf, Droplets, Shield, MapPin,
  Camera, X, Upload, LogIn, User,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const categories = [
  { id: 'waste', label: 'Sampah / Limbah', icon: Trash2, color: '#f59e0b' },
  { id: 'infrastructure', label: 'Infrastruktur', icon: Construction, color: '#3b82f6' },
  { id: 'greenery', label: 'Penghijauan', icon: Leaf, color: '#22c55e' },
  { id: 'drainage', label: 'Air / Drainase', icon: Droplets, color: '#06b6d4' },
  { id: 'security', label: 'Keamanan', icon: Shield, color: '#ef4444' },
];

const urgencyOptions = ['Normal', 'Mendesak', 'Darurat'];

// ─── Login Wall — shown when user is not authenticated ───────────────────────
function LoginWall() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', padding: '40px',
    }}>
      <div style={{
        maxWidth: '440px', width: '100%', textAlign: 'center',
        background: 'white', borderRadius: '24px', padding: '40px 36px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '20px',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <User size={32} color="#16a34a" />
        </div>

        <h1 style={{
          fontFamily: 'Outfit', fontSize: '22px', fontWeight: 700,
          color: '#0f172a', margin: '0 0 8px',
        }}>
          Login untuk Buat Laporan
        </h1>
        <p style={{
          fontSize: '14px', color: '#64748b', lineHeight: 1.7,
          margin: '0 0 8px',
        }}>
          Untuk mengirimkan laporan infrastruktur atau lingkungan, Anda perlu masuk terlebih dahulu.
        </p>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 28px' }}>
          Tidak perlu login untuk <strong style={{ color: '#16a34a' }}>melihat laporan</strong> yang sudah ada.
        </p>

        {/* Decorative steps */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '28px', textAlign: 'left',
        }}>
          {[
            { num: '1', text: 'Masuk atau daftar akun gratis' },
            { num: '2', text: 'Isi detail laporan & lokasi' },
            { num: '3', text: 'Laporan diterima warga & admin' },
          ].map(({ num, text }) => (
            <div key={num} style={{
              flex: 1, background: '#f8fafc', borderRadius: '12px',
              padding: '12px 10px', textAlign: 'center',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#16a34a', color: 'white',
                fontSize: '11px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 6px',
              }}>{num}</div>
              <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.4 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/login?redirect=/environment/new"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
            }}
          >
            <LogIn size={16} />
            Masuk Sekarang
          </Link>
          <Link
            href="/register"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px', borderRadius: '12px',
              border: '1.5px solid #e2e8f0', background: 'white',
              color: '#0f172a', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}
          >
            Daftar Akun Baru
          </Link>
          <Link
            href="/environment"
            style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none', padding: '6px' }}
          >
            ← Lihat laporan yang ada
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { user, loading } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('waste');
  const [urgency, setUrgency] = useState('Normal');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<{file: File, url: string}[]>([]);
  const [location, setLocation] = useState({
    lat: -5.4254,
    lng: 105.2580,
    address: 'Bandar Lampung, Lampung',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Lokasi Anda saat ini (Otomatis)',
        });
      }, (err) => {
        console.warn('Gagal mendapatkan lokasi otomatis:', err.message);
      });
    }
  }, []);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: {file: File, url: string}[] = [];
    Array.from(files).slice(0, 5 - photos.length).forEach((file) => {
      const url = URL.createObjectURL(file);
      newPhotos.push({ file, url });
    });
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      alert('Judul dan deskripsi harus diisi!');
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user;
      const reporterName = u?.user_metadata?.full_name || u?.email || 'Warga';

      let uploadedImageUrl = null;

      if (photos.length > 0) {
        const file = photos[0].file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error('Gagal mengunggah foto: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(fileName);
        uploadedImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('reports')
        .insert([{
          title,
          description,
          category: selectedCat?.label || 'Infrastruktur',
          urgency,
          status: 'Menunggu',
          location_lat: location.lat,
          location_lng: location.lng,
          address: location.address,
          image_url: uploadedImageUrl,
          reporter_name: reporterName,
        }]);

      if (error) throw new Error('Gagal mengirim laporan: ' + error.message);

      alert('Laporan berhasil dikirim!');
      router.push('/environment');
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  // Loading skeleton
  if (loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8',
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: '#16a34a', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
          <span style={{ fontSize: '14px' }}>Memeriksa akun...</span>
        </div>
      </div>
    );
  }

  // Not authenticated — show login wall
  if (!user) {
    return <LoginWall />;
  }

  // Authenticated — show form
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Panel - Form */}
      <div style={{
        width: '340px', flexShrink: 0, background: 'white',
        borderRight: '1px solid #e2e8f0', display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Buat Laporan Baru
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
            Bantu jaga lingkungan kita tetap bersih dan aman.
          </p>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              JUDUL LAPORAN
            </label>
            <input
              type="text"
              placeholder="Contoh: Jalan berlubang depan balai desa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#0f172a',
                outline: 'none', transition: 'border 0.2s', fontFamily: 'Inter',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
              KATEGORI MASALAH
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {categories.map(({ id, label, icon: Icon, color }) => {
                const active = selectedCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '12px 8px', borderRadius: '12px',
                      border: active ? `2px solid ${color}` : '2px solid #e2e8f0',
                      background: active ? `${color}14` : 'white',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={20} style={{ color: active ? color : '#94a3b8' }} />
                    <span style={{ fontSize: '11px', fontWeight: active ? 600 : 400, color: active ? color : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
              TINGKAT URGENSI
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {urgencyOptions.map((u) => {
                const active = urgency === u;
                const colors: Record<string, string> = { Normal: '#16a34a', Mendesak: '#f59e0b', Darurat: '#ef4444' };
                return (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      border: active ? `1.5px solid ${colors[u]}` : '1.5px solid #e2e8f0',
                      background: active ? `${colors[u]}14` : 'white',
                      color: active ? colors[u] : '#94a3b8',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
              FOTO BUKTI ({photos.length}/5)
            </label>
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', width: 64, height: 64 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 18, height: 18, borderRadius: '50%', border: 'none',
                        background: '#ef4444', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#16a34a' : '#d1d5db'}`,
                  borderRadius: '12px', padding: '20px', textAlign: 'center',
                  cursor: 'pointer', background: isDragging ? '#f0fdf4' : '#fafafa',
                  transition: 'all 0.2s',
                }}
              >
                <Camera size={24} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Klik untuk unggah</span> atau seret & lepas
                  <br /><span style={{ fontSize: '10px' }}>PNG, JPG, GIF (maks. 5MB)</span>
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotoUpload(e.target.files)} />
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              DESKRIPSI ({description.length}/1000)
            </label>
            <textarea
              placeholder="Berikan detail tentang masalah ini..."
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#0f172a',
                outline: 'none', resize: 'none', fontFamily: 'Inter', transition: 'border 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              LOKASI
            </label>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc',
            }}>
              <MapPin size={15} style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#0f172a', flex: 1 }}>{location.address}</span>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Lokasi Anda saat ini' });
                    });
                  }
                }}
                style={{
                  fontSize: '11px', fontWeight: 600, color: '#16a34a', background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                }}
              >
                Sesuaikan
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Klik pada peta untuk memilih lokasi yang tepat
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => router.push('/environment')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
              background: 'white', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
              background: '#16a34a', color: 'white', fontSize: '13px', fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s', opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#16a34a'; }}
          >
            <Upload size={14} />
            {isSubmitting ? 'Mengunggah...' : 'Kirim Laporan'}
          </button>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapPicker
          center={[location.lat, location.lng]}
          zoom={15}
          markers={[{ lat: location.lat, lng: location.lng, color: selectedCat?.color || '#16a34a' }]}
          onLocationSelect={(lat, lng) => setLocation((prev) => ({ ...prev, lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }))}
          style={{ height: '100%' }}
        />

        <div style={{
          position: 'absolute', top: 16, right: 16, background: 'white', borderRadius: '10px',
          padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: '12px',
          fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px',
          zIndex: 400,
        }}>
          <MapPin size={13} color="#16a34a" />
          Klik peta untuk memilih lokasi
        </div>
      </div>
    </div>
  );
}
