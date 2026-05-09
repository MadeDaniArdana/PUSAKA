# 🔍 PUSAKA — Issue Tracker & Code Review

> Dibuat: 2026-05-09 | Cakupan: seluruh `src/` (app routes, components, hooks, lib, utils, CSS)

---

## Ringkasan

| Kategori | Jumlah | Prioritas |
|---|---|---|
| 🔴 Bug Kritis | 4 | Segera |
| 🟠 Keamanan | 2 | Tinggi |
| 🟡 Duplikasi Kode | 4 | Sedang |
| 🔵 Performa | 3 | Sedang |
| ⚪ UX Bug | 3 | Rendah–Sedang |
| 🟢 Inkonsistensi Minor | 2 | Rendah |

---

## 🔴 Bug Kritis

### [BUG-01] Dua Supabase Client Berbeda — Singleton Konflik

- **File:** `src/lib/supabase.ts` vs `src/utils/supabase/client.ts`
- **Status:** `[ ] Open`

**Masalah:**
Ada dua cara membuat Supabase client yang hidup berdampingan:
- `src/lib/supabase.ts` → `createClient` biasa, **tidak aware cookies/session SSR**
- `src/utils/supabase/client.ts` → `@supabase/ssr`, benar untuk Next.js App Router

`overview/page.tsx` masih mengimpor dari yang lama:
```ts
// ❌ Baris 18 — overview/page.tsx
import { supabase } from '@/lib/supabase';

// ✅ Seharusnya
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
```

**Dampak:** Session user tidak terbaca dengan benar di overview. Statistik bisa menampilkan data acak atau null di production.

---

### [BUG-02] `proxy.ts` Bukan `middleware.ts` — Guard Route Tidak Aktif

- **File:** `src/proxy.ts`
- **Status:** `[ ] Open`

**Masalah:**
Next.js **hanya** menjalankan middleware dari file bernama `middleware.ts` (atau `middleware.js`). File saat ini bernama `proxy.ts` sehingga **tidak pernah dieksekusi**.

```
src/
  proxy.ts     ← ❌ Tidak pernah dipanggil Next.js router
  middleware.ts ← ✅ Yang dibutuhkan
```

**Dampak:** Seluruh proteksi route (redirect ke login, admin-only guard) **tidak berjalan**. User bisa mengakses `/admin`, `/overview`, dll. langsung dari URL tanpa login.

**Fix:** Cukup rename file → `src/middleware.ts`.

---

### [BUG-03] `fetchRequests` Tidak Filter per User — Data Privacy

- **File:** `src/app/(main)/administration/page.tsx` baris 94–97
- **Status:** `[ ] Open`

**Masalah:**
```ts
// ❌ Mengambil SEMUA permohonan dari semua warga
const { data } = await supabase
  .from('requests')
  .select('*')
  .order('created_at', { ascending: false });
```

Tidak ada filter `user_id`, sehingga setiap warga melihat permohonan warga lain.

**Fix:**
```ts
// ✅ Filter berdasarkan user yang login
const { data: { user } } = await supabase.auth.getUser();
const { data } = await supabase
  .from('requests')
  .select('*')
  .eq('user_id', user?.id)
  .order('created_at', { ascending: false });
```

---

### [BUG-04] `loadUser()` Redundan di Administration — Double Network Call

- **File:** `src/app/(main)/administration/page.tsx` baris 99–109
- **Status:** `[ ] Open`

**Masalah:**
```ts
// ❌ Memanggil getSession() lagi padahal useAuth() sudah dipanggil di baris 91
async function loadUser() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user; // ← indentasi juga rusak
  if (user) { setFormData(...) }
}
```

`useAuth()` sudah mengembalikan `user`. Memanggil `getSession()` ulang = 2x network roundtrip tidak perlu.

**Fix:**
```ts
// ✅ Gunakan user dari useAuth yang sudah ada
const { user } = useAuth();
useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    }));
  }
  fetchRequests();
}, [user]);
```

---

## 🟠 Keamanan

### [SEC-01] Logic Admin Check Duplikat — Tidak Reuse `lib/admin.ts`

- **File:** `src/proxy.ts` baris 76–77
- **Status:** `[ ] Open`

**Masalah:**
```ts
// ❌ Di proxy.ts — logic admin ditulis manual, tidak reuse isAdmin()
const isAdminUser =
  (adminEmail && user.email === adminEmail) ||
  user.user_metadata?.role === 'admin';

// ✅ Seharusnya
import { isAdmin } from '@/lib/admin';
const isAdminUser = isAdmin(user);
```

Jika logic admin berubah, harus update 2 tempat → rawan security gap.

---

### [SEC-02] Tracking Number Menggunakan `Math.random()` — Mudah Diprediksi

- **File:** `src/app/(main)/administration/page.tsx` baris 128
- **Status:** `[ ] Open`

**Masalah:**
```ts
// ❌ Math.random() bisa diprediksi, bukan kriptografis
const trackingNumber = 'REQ-' + new Date().getFullYear().toString().slice(-2)
  + '-' + Math.floor(Math.random() * 9000 + 1000);
```

Nomor pelacakan dokumen resmi seharusnya tidak bisa ditebak.

**Fix:**
```ts
// ✅ Gunakan crypto.randomUUID() (built-in browser/Node)
const id = crypto.randomUUID().split('-')[0].toUpperCase();
const trackingNumber = `REQ-${new Date().getFullYear()}-${id}`;
```

---

## 🟡 Duplikasi Kode

### [DUP-01] `createClient()` + `signOut` Diulang di Setiap Komponen

- **File:** `Sidebar.tsx`, `(admin)/layout.tsx`, `login/page.tsx`, `register/page.tsx`, `administration/page.tsx`
- **Status:** `[ ] Open`

Setiap komponen mendefinisikan `const supabase = createClient()` hanya untuk memanggil `signOut()`. Sebaiknya dibuat custom hook:

```ts
// src/hooks/useSignOut.ts
export function useSignOut() {
  const router = useRouter();
  return async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };
}
```

---

### [DUP-02] Loading Screen UI Berbeda di Dua Layout

- **File:** `(main)/layout.tsx` baris 24–44 & `(admin)/layout.tsx` baris 53–71
- **Status:** `[ ] Open`

Dua loading screen berbeda tema (light vs dark) tanpa komponen bersama. Sebaiknya dibuat `<LoadingScreen variant="light" | "dark" />` yang reusable.

---

### [DUP-03] `isActive()` Didefinisikan di Dua Tempat

- **File:** `src/components/Sidebar.tsx` baris 64–68 & `src/app/(admin)/layout.tsx` baris 43–44
- **Status:** `[ ] Open`

Fungsi route-active checker ditulis ulang dengan implementasi berbeda. Sebaiknya diekstrak ke `src/lib/route.ts`.

---

### [DUP-04] `onMouseEnter/onMouseLeave` Inline Tersebar di Ratusan Elemen

- **File:** Seluruh komponen UI
- **Status:** `[ ] Open`

```tsx
// ❌ Pola ini diulang ratusan kali
onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
```

Sebaiknya gunakan CSS class atau Tailwind `hover:` utilities yang sudah tersedia di project.

---

## 🔵 Performa

### [PERF-01] Stats Overview Tidak Akurat — Hitung dari `limit(5)`

- **File:** `src/app/(main)/overview/page.tsx` baris 92–108
- **Status:** `[ ] Open`

**Masalah:**
```ts
// ❌ Fetch hanya 5 data, lalu hitung stats dari situ
supabase.from('reports').select('*').limit(5)
// activeReports = dari 5 data saja — bukan total
```

Stats "Laporan Aktif" harusnya dari total database, bukan 5 entry terakhir.

**Fix:** Pisahkan query untuk stats (tanpa limit, pakai `.select('id, status')`) dan query untuk activity feed (dengan `.limit(5)`).

---

### [PERF-02] `useState` Diimpor tapi Tidak Digunakan di `page.tsx`

- **File:** `src/app/page.tsx` baris 3
- **Status:** `[ ] Open`

```ts
// ❌ useState tidak digunakan setelah refactor animasi
import { useEffect, useRef, useState } from 'react';
```

Import yang tidak digunakan menambah bundle dan menyebabkan lint warning.

**Fix:** Hapus `useState` dari import.

---

### [PERF-03] Leaflet CSS Dimuat Global di Semua Halaman

- **File:** `src/app/layout.tsx` baris 25–30
- **Status:** `[ ] Open`

```html
<!-- ❌ Di root layout — dimuat di SEMUA halaman -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

Leaflet hanya dipakai di `MapPicker.tsx`. CSS ini (~3KB) terbuang di halaman landing, login, admin, dll.

**Fix:** Import CSS di dalam `MapPicker.tsx` saja, atau pakai `next/head` di halaman yang memuatnya.

---

## ⚪ UX Bug

### [UX-01] Dropdown Notifikasi Tidak Tutup saat Klik di Luar

- **File:** `src/app/(main)/overview/page.tsx` baris 170–185
- **Status:** `[ ] Open`

Dropdown notifikasi hanya bisa ditutup dengan klik tombol bell lagi. Tidak ada `clickOutside` handler.

**Fix:**
```ts
useEffect(() => {
  if (!showNotif) return;
  const handler = () => setShowNotif(false);
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, [showNotif]);
```

---

### [UX-02] `selectedDocType` Tidak Reset saat Modal Form Ditutup

- **File:** `src/app/(main)/administration/page.tsx` baris 138–139
- **Status:** `[ ] Open`

```ts
// ❌ Hanya reset field form, tidak reset jenis dokumen yang dipilih
setFormData(prev => ({ ...prev, nik: '', kk: '', purpose: '' }));
// setSelectedDocType('') ← hilang!
```

Efek: Jika user buka form dokumen A → tutup → klik dokumen B, header modal masih menampilkan nama dokumen A.

---

### [UX-03] `alert()` Native Digunakan untuk Feedback — Terlihat Usang

- **File:** `src/app/(main)/administration/page.tsx` baris 122, 137, 142
- **Status:** `[ ] Open`

```ts
// ❌ alert() memblokir thread dan tidak bisa di-style
alert('Nama dan NIK harus diisi');
alert('Permohonan berhasil diajukan dengan nomor: ' + trackingNumber);
```

**Fix:** Ganti dengan toast notification. Opsi:
- Install `sonner` (ringan, modern): `npm install sonner`
- Atau buat komponen `<Toast />` sendiri menggunakan `animate-fade-in` yang sudah ada di `globals.css`

---

## 🟢 Inkonsistensi Minor

### [MIN-01] CSS Variables `--sidebar-bg` & `--sidebar-width` Tidak Digunakan

- **File:** `src/app/globals.css` baris 32–34
- **Status:** `[ ] Open`

```css
--sidebar-width: 108px;  /* ← tidak dipakai, sidebar pakai inline style */
--sidebar-bg: #0f172a;   /* ← tidak dipakai, sidebar sudah light theme */
```

Sisa dari versi dark sidebar lama. Perlu dibersihkan.

---

### [MIN-02] `eslint-disable` di `useAuth.ts` Menutupi Dependency Warning

- **File:** `src/hooks/useAuth.ts` baris 48
- **Status:** `[ ] Open`

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

`supabase` yang dibuat di dalam komponen seharusnya jadi dependency `useEffect`. Sebaiknya `createClient()` dipindah ke luar komponen (module level) agar tidak perlu suppress lint.

---

## ✅ Selesai

| ID | Deskripsi | Selesai |
|---|---|---|
| — | *(belum ada yang selesai)* | — |

---

## 📋 Prioritas Penyelesaian

```
SEGERA:
  [ ] BUG-02 — Rename proxy.ts → middleware.ts
  [ ] BUG-01 — Migrasi overview/page.tsx ke @/utils/supabase/client
  [ ] BUG-03 — Filter fetchRequests per user_id

BERIKUTNYA:
  [ ] BUG-04 — Hapus loadUser() redundan
  [ ] SEC-01 — Reuse isAdmin() di middleware
  [ ] UX-03  — Ganti alert() dengan toast notification
  [ ] UX-01  — Click-outside handler untuk notifikasi

REFACTOR (Backlog):
  [ ] DUP-01 — Custom hook useSignOut()
  [ ] DUP-04 — CSS class untuk hover states
  [ ] PERF-01 — Pisahkan stats query dari activity query
  [ ] PERF-02 — Hapus import useState yang tidak digunakan
  [ ] PERF-03 — Pindahkan Leaflet CSS ke MapPicker
  [ ] SEC-02  — Ganti Math.random() dengan crypto.randomUUID()
  [ ] MIN-01  — Hapus CSS variables tidak terpakai
  [ ] MIN-02  — Refactor useAuth untuk hilangkan eslint-disable
```
