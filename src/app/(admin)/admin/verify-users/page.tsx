'use client';

import { useEffect, useState } from 'react';
import {
  Users, CheckCircle, XCircle, Clock,
  Search, Shield, Mail, Calendar,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function VerifyUsersPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'warga')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  }

  async function verifyUser(profile: Profile) {
    setActionLoading(profile.id);
    // Update profile
    await supabase
      .from('profiles')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    // Notify the user
    await supabase.from('notifications').insert({
      user_id: profile.id,
      title: 'Akun Diverifikasi ✅',
      message: 'Selamat! Akun Anda telah diverifikasi oleh admin. Anda sekarang bisa masuk ke PUSAKA.',
      type: 'verification',
      link: '/login',
    });

    setProfiles(prev =>
      prev.map(p => p.id === profile.id ? { ...p, is_verified: true } : p)
    );
    setActionLoading(null);
  }

  async function rejectUser(profile: Profile) {
    setActionLoading(profile.id);
    // Delete profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id);

    // Optionally delete auth user (requires admin API, skip for now)
    setProfiles(prev => prev.filter(p => p.id !== profile.id));
    setActionLoading(null);
  }

  const filtered = profiles.filter(p => {
    if (filter === 'pending') return !p.is_verified;
    if (filter === 'verified') return p.is_verified;
    return true;
  }).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  const pendingCount = profiles.filter(p => !p.is_verified).length;
  const verifiedCount = profiles.filter(p => p.is_verified).length;

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900 m-0 leading-tight">
            Verifikasi Warga
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Kelola pendaftaran warga baru yang membutuhkan persetujuan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef3c7', border: '1px solid #fde68a',
            padding: '8px 16px', borderRadius: 12,
          }}>
            <Clock size={14} color="#d97706" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>
              {pendingCount} Menunggu
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            padding: '8px 16px', borderRadius: 12,
          }}>
            <CheckCircle size={14} color="#16a34a" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
              {verifiedCount} Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20,
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
          {([
            { key: 'pending', label: 'Menunggu' },
            { key: 'verified', label: 'Terverifikasi' },
            { key: 'all', label: 'Semua' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: filter === f.key ? 'white' : 'transparent',
                color: filter === f.key ? '#0f172a' : '#64748b',
                boxShadow: filter === f.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94a3b8" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{
              padding: '9px 14px 9px 34px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 13,
              outline: 'none', width: 240, background: '#fafafa',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#16a34a'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          />
        </div>
      </div>

      {/* User list */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Memuat data warga...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Users size={36} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
              {filter === 'pending' ? 'Tidak ada warga yang menunggu verifikasi' : 'Tidak ada data warga'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal Daftar</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: 11, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: p.is_verified ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: p.is_verified ? 'white' : '#64748b', fontWeight: 700, fontSize: 13,
                          }}>
                            {(p.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            {p.full_name || 'Tanpa Nama'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                          <Mail size={13} /> {p.email}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                          <Calendar size={12} />
                          {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {p.is_verified ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: '#dcfce7', color: '#16a34a',
                          }}>
                            <CheckCircle size={11} /> Terverifikasi
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: '#fef3c7', color: '#d97706',
                          }}>
                            <Clock size={11} /> Menunggu
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!p.is_verified ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => verifyUser(p)}
                              disabled={actionLoading === p.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 14px', borderRadius: 8, border: 'none',
                                background: '#16a34a', color: 'white', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                opacity: actionLoading === p.id ? 0.6 : 1,
                              }}
                            >
                              <CheckCircle size={13} /> Setujui
                            </button>
                            <button
                              onClick={() => rejectUser(p)}
                              disabled={actionLoading === p.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 14px', borderRadius: 8,
                                border: '1px solid #fecaca', background: '#fef2f2',
                                color: '#dc2626', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                opacity: actionLoading === p.id ? 0.6 : 1,
                              }}
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {filtered.map(p => (
                <div key={p.id} style={{
                  padding: 16, borderRadius: 14, border: '1px solid #f1f5f9',
                  background: '#fafafa',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: p.is_verified ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: p.is_verified ? 'white' : '#64748b', fontWeight: 700, fontSize: 14,
                    }}>
                      {(p.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {p.full_name || 'Tanpa Nama'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{p.email}</p>
                    </div>
                    {p.is_verified ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: '#dcfce7', color: '#16a34a',
                      }}>
                        Terverifikasi
                      </span>
                    ) : (
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: '#fef3c7', color: '#d97706',
                      }}>
                        Menunggu
                      </span>
                    )}
                  </div>
                  {!p.is_verified && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => verifyUser(p)}
                        disabled={actionLoading === p.id}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 5, padding: '9px', borderRadius: 10, border: 'none',
                          background: '#16a34a', color: 'white', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={13} /> Setujui
                      </button>
                      <button
                        onClick={() => rejectUser(p)}
                        disabled={actionLoading === p.id}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 5, padding: '9px', borderRadius: 10,
                          border: '1px solid #fecaca', background: '#fef2f2',
                          color: '#dc2626', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
