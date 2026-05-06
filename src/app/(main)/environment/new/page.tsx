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
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 md:p-10">
      <div className="max-w-[440px] w-full text-center bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
        {/* Icon */}
        <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
          <User size={32} className="text-green-600" />
        </div>

        <h1 className="font-outfit text-lg md:text-[22px] font-bold text-slate-900 mb-2">
          Login untuk Buat Laporan
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-2">
          Untuk mengirimkan laporan infrastruktur atau lingkungan, Anda perlu masuk terlebih dahulu.
        </p>
        <p className="text-[13px] text-slate-400 mb-6 md:mb-7">
          Tidak perlu login untuk <strong className="text-green-600">melihat laporan</strong> yang sudah ada.
        </p>

        {/* Decorative steps */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-7 text-left">
          {[
            { num: '1', text: 'Masuk atau daftar akun gratis' },
            { num: '2', text: 'Isi detail laporan & lokasi' },
            { num: '3', text: 'Laporan diterima warga & admin' },
          ].map(({ num, text }) => (
            <div key={num} className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">
                {num}
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/login?redirect=/environment/new"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white text-sm font-bold no-underline shadow-lg shadow-green-600/30"
          >
            <LogIn size={16} />
            Masuk Sekarang
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center p-3.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-900 text-sm font-semibold no-underline"
          >
            Daftar Akun Baru
          </Link>
          <Link
            href="/environment"
            className="text-[13px] text-slate-400 no-underline p-1.5"
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
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-green-600 rounded-full animate-spin" />
          <span className="text-sm">Memeriksa akun...</span>
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
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Panel - Form */}
      <div className="w-full md:w-[340px] shrink-0 bg-white md:border-r border-b md:border-b-0 border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 md:pb-4 border-b border-slate-100">
          <h1 className="font-outfit text-lg md:text-xl font-bold text-slate-900 m-0">
            Buat Laporan Baru
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Bantu jaga lingkungan kita tetap bersih dan aman.
          </p>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-4 md:px-5 md:py-4">

          {/* Title */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              JUDUL LAPORAN
            </label>
            <input
              type="text"
              placeholder="Contoh: Jalan berlubang depan balai desa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-slate-200 text-[13px] text-slate-900 outline-none transition-colors focus:border-green-600 font-inter"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              KATEGORI MASALAH
            </label>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
              {categories.map(({ id, label, icon: Icon, color }) => {
                const active = selectedCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(id)}
                    className="flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: active ? color : '#e2e8f0',
                      background: active ? `${color}14` : 'white',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? color : '#94a3b8' }} />
                    <span className="text-[10px] md:text-[11px] font-medium text-center leading-tight" style={{ color: active ? color : '#94a3b8', fontWeight: active ? 600 : 400 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              TINGKAT URGENSI
            </label>
            <div className="flex gap-2">
              {urgencyOptions.map((u) => {
                const active = urgency === u;
                const colors: Record<string, string> = { Normal: '#16a34a', Mendesak: '#f59e0b', Darurat: '#ef4444' };
                return (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className="flex-1 py-2 px-1 rounded-lg text-xs cursor-pointer transition-all"
                    style={{
                      fontWeight: active ? 600 : 400,
                      border: active ? `1.5px solid ${colors[u]}` : '1.5px solid #e2e8f0',
                      background: active ? `${colors[u]}14` : 'white',
                      color: active ? colors[u] : '#94a3b8',
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              FOTO BUKTI ({photos.length}/5)
            </label>
            {photos.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-14 h-14 md:w-16 md:h-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full border-none bg-red-500 text-white cursor-pointer flex items-center justify-center"
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
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-green-600 bg-green-50' : 'border-slate-300 bg-slate-50/50'
                }`}
              >
                <Camera size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 m-0 leading-relaxed">
                  <span className="text-green-600 font-semibold">Klik untuk unggah</span> atau seret & lepas
                  <br /><span className="text-[10px]">PNG, JPG, GIF (maks. 5MB)</span>
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotoUpload(e.target.files)} />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              DESKRIPSI ({description.length}/1000)
            </label>
            <textarea
              placeholder="Berikan detail tentang masalah ini..."
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-slate-200 text-[13px] text-slate-900 outline-none resize-none font-inter transition-colors focus:border-green-600"
            />
          </div>

          {/* Location */}
          <div className="mb-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              LOKASI
            </label>
            <div className="flex items-start gap-2 p-2.5 border-[1.5px] border-slate-200 rounded-[10px] bg-slate-50">
              <MapPin size={15} className="text-green-600 mt-0.5 shrink-0" />
              <span className="text-[13px] text-slate-900 flex-1">{location.address}</span>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Lokasi Anda saat ini' });
                    });
                  }
                }}
                className="text-[11px] font-semibold text-green-600 bg-transparent border-none cursor-pointer p-0 shrink-0"
              >
                Sesuaikan
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Klik pada peta untuk memilih lokasi yang tepat
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-3.5 md:px-5 md:py-3.5 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => router.push('/environment')}
            className="flex-1 py-2.5 rounded-[10px] border-[1.5px] border-slate-200 bg-white text-[13px] font-semibold text-slate-600 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] py-2.5 rounded-[10px] border-none bg-green-600 text-white text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Upload size={14} />
            {isSubmitting ? 'Mengunggah...' : 'Kirim Laporan'}
          </button>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative h-[300px] md:h-full">
        <MapPicker
          center={[location.lat, location.lng]}
          zoom={15}
          markers={[{ lat: location.lat, lng: location.lng, color: selectedCat?.color || '#16a34a' }]}
          onLocationSelect={(lat, lng) => setLocation((prev) => ({ ...prev, lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }))}
          style={{ height: '100%' }}
        />

        <div className="absolute top-3 right-3 bg-white rounded-[10px] px-3 py-2 shadow-md text-xs font-semibold text-slate-600 flex items-center gap-1.5 z-[400]">
          <MapPin size={13} className="text-green-600" />
          Klik peta untuk memilih lokasi
        </div>
      </div>
    </div>
  );
}
