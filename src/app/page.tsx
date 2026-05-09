'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, MapPin, Users, FileText, ShoppingBag,
  Zap, Shield, Globe, ChevronRight, CheckCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const villages = [
  { name: 'Desa Sukamaju', kabupaten: 'Way Kanan', fitur: 'Administrasi Digital', icon: FileText, color: '#2563eb', bg: '#dbeafe', warga: '1.248', tahun: '2023' },
  { name: 'Desa Bandar Agung', kabupaten: 'Lampung Tengah', fitur: 'Pelaporan Lingkungan', icon: Zap, color: '#d97706', bg: '#fef3c7', warga: '2.103', tahun: '2023' },
  { name: 'Desa Tanjung Raya', kabupaten: 'Mesuji', fitur: 'Marketplace UMKM', icon: ShoppingBag, color: '#7c3aed', bg: '#ede9fe', warga: '987', tahun: '2024' },
  { name: 'Desa Gunung Sugih', kabupaten: 'Lampung Tengah', fitur: 'Command Center', icon: Shield, color: '#dc2626', bg: '#fee2e2', warga: '3.421', tahun: '2024' },
  { name: 'Desa Gedong Tataan', kabupaten: 'Pesawaran', fitur: 'Layanan Terpadu', icon: Globe, color: '#16a34a', bg: '#dcfce7', warga: '1.876', tahun: '2024' },
  { name: 'Desa Branti Raya', kabupaten: 'Lampung Selatan', fitur: 'Pelaporan & Administrasi', icon: FileText, color: '#0891b2', bg: '#cffafe', warga: '2.654', tahun: '2024' },
  { name: 'Desa Trimodadi', kabupaten: 'Lampung Utara', fitur: 'Marketplace UMKM', icon: ShoppingBag, color: '#b45309', bg: '#fef3c7', warga: '1.102', tahun: '2025' },
  { name: 'Desa Wargomulyo', kabupaten: 'Pringsewu', fitur: 'Layanan Terpadu', icon: Globe, color: '#6d28d9', bg: '#ede9fe', warga: '1.567', tahun: '2025' },
];

const features = [
  { icon: FileText, title: 'Administrasi Digital', desc: 'Ajukan KTP, KK, surat keterangan & dokumen desa secara online tanpa antre.', color: '#2563eb', bg: '#dbeafe' },
  { icon: Zap, title: 'Pelaporan Lingkungan', desc: 'Laporkan masalah infrastruktur desa langsung dari smartphone Anda.', color: '#d97706', bg: '#fef3c7' },
  { icon: ShoppingBag, title: 'Marketplace UMKM', desc: 'Dukung produk lokal desa dan perluas jangkauan usaha Anda.', color: '#7c3aed', bg: '#ede9fe' },
  { icon: Shield, title: 'Command Center', desc: 'Pantau kondisi desa secara real-time dalam satu dashboard terpusat.', color: '#16a34a', bg: '#dcfce7' },
];

const stats = [
  { label: 'Desa Aktif', value: 8, suffix: '+', color: '#16a34a' },
  { label: 'Warga Terlayani', value: 14958, suffix: '', color: '#2563eb' },
  { label: 'Laporan Selesai', value: 342, suffix: '', color: '#7c3aed' },
  { label: 'Dokumen Diproses', value: 1247, suffix: '', color: '#d97706' },
];

export default function BerandaPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const villagesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const foldLeftRef = useRef<HTMLDivElement>(null);
  const foldRightRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power2.out' });
      gsap.fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'power2.out', stagger: 0.1 });

      // ── UNFOLD / LIPATAN animation ──
      // Container fades in first
      gsap.fromTo(imageWrapRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: 'power2.out' }
      );
      // Left panel: rotates from -90deg (folded left) to 0 (open)
      gsap.fromTo(foldLeftRef.current,
        { rotationY: -90, transformOrigin: 'right center', opacity: 0 },
        { rotationY: 0, opacity: 1, duration: 1.1, delay: 0.55, ease: 'power3.out' }
      );
      // Right panel: rotates from 90deg (folded right) to 0 (open), slight delay
      gsap.fromTo(foldRightRef.current,
        { rotationY: 90, transformOrigin: 'left center', opacity: 0 },
        { rotationY: 0, opacity: 1, duration: 1.1, delay: 0.75, ease: 'power3.out' }
      );
      // Floating chips appear after unfold
      gsap.fromTo('.hero-chip',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 1.6, stagger: 0.15, ease: 'back.out(1.7)' }
      );

      // Floating blobs
      gsap.to('.hero-blob', {
        y: '-=15', duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.5, from: 'random' }
      });

      // Stats counter — FIX: gunakan gsap.to() dengan plain object, bukan fromTo()
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const statCards = document.querySelectorAll('.stat-card');
          if (statCards.length) {
            gsap.fromTo('.stat-card',
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
          }

          document.querySelectorAll('.stat-number').forEach((el) => {
            const target = parseInt(el.getAttribute('data-target') || '0');
            const proxy = { val: 0 };
            // FIX: pakai gsap.to() pada plain object, bukan fromTo()
            gsap.to(proxy, {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate() {
                el.textContent = Math.round(proxy.val).toLocaleString('id-ID');
              },
            });
          });
        },
      });

      // Village cards
      ScrollTrigger.create({
        trigger: villagesRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const cards = document.querySelectorAll('.village-card');
          if (cards.length) {
            gsap.fromTo('.village-card',
              { opacity: 0, y: 40, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' }
            );
          }
        },
      });

      // Feature cards
      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const cards = document.querySelectorAll('.feature-card');
          if (cards.length) {
            gsap.fromTo('.feature-card',
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
          }}>
            <Globe size={20} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>PUSAKA</p>
            <p style={{ fontSize: 9, color: '#16a34a', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Smart Village Hub</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'background 0.2s' }}>
            Masuk
          </Link>
          <Link href="/register" style={{
            fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 600,
            padding: '8px 20px', background: 'linear-gradient(135deg,#16a34a,#15803d)',
            borderRadius: 8, boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
          }}>
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 0 0', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 60%, #faf5ff 100%)',
      }}>
        {/* Decorative blobs */}
        <div className="hero-blob" style={{
          position: 'absolute', top: '5%', left: '-8%', width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)', pointerEvents: 'none',
        }} />
        <div className="hero-blob" style={{
          position: 'absolute', top: '40%', right: '5%', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none',
        }} />

        {/* Two-column wrapper */}
        <div className="hero-grid">
          {/* LEFT — Text Content (rata kiri) */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)',
              borderRadius: 999, padding: '6px 16px', marginBottom: 24,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em' }}>
                PLATFORM AKTIF · LAMPUNG
              </span>
            </div>

            <h1 className="hero-title" style={{
              fontFamily: 'Outfit', fontSize: 'clamp(34px,4vw,58px)', fontWeight: 800,
              lineHeight: 1.1, margin: '0 0 20px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #16a34a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Transformasi Digital<br />Desa Lampung<br />Dimulai dari Sini
            </h1>

            <p className="hero-desc" style={{
              fontSize: 16, color: '#475569', lineHeight: 1.75,
              margin: '0 0 36px', maxWidth: 480,
            }}>
              PUSAKA menghubungkan warga, perangkat desa, dan pelaku UMKM dalam satu ekosistem digital yang cerdas, transparan, dan inklusif.
            </p>

            {/* Trust badges */}
            <div className="hero-desc" style={{ display: 'flex', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                { icon: '🏡', text: '8 Desa Aktif' },
                { icon: '👥', text: '14.958 Warga' },
                { icon: '📄', text: '1.247 Dokumen' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: '#475569', fontWeight: 500,
                }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/login" className="hero-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white',
                borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
              }}>
                Masuk ke Dashboard <ArrowRight size={16} />
              </Link>
              <a href="#desa" className="hero-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                background: 'white', color: '#0f172a', borderRadius: 12, textDecoration: 'none',
                fontWeight: 600, fontSize: 14, border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                Lihat Profil Desa <ChevronRight size={16} />
              </a>
            </div>
          </div>

          {/* RIGHT — Village Illustration with UNFOLD animation */}
          <div
            className="hero-image-col"
            ref={imageWrapRef}
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              perspective: 1200,
              opacity: 0, // GSAP will animate this in
            }}
          >
            {/* Glow ring */}
            <div style={{
              position: 'absolute', inset: '-20px', borderRadius: 32,
              background: 'radial-gradient(ellipse at center, rgba(22,163,74,0.14) 0%, rgba(37,99,235,0.07) 55%, transparent 78%)',
              pointerEvents: 'none',
            }} />

            {/* ── FOLD WRAPPER ── */}
            <div style={{
              width: '100%', maxWidth: 580,
              display: 'flex',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(22,163,74,0.10)',
              border: '1px solid rgba(255,255,255,0.85)',
              position: 'relative',
            }}>
              {/* Left panel — shows left half of image */}
              <div
                ref={foldLeftRef}
                style={{
                  flex: 1, overflow: 'hidden',
                  transformOrigin: 'right center',
                  opacity: 0, // GSAP will animate
                  position: 'relative',
                }}
              >
                <img
                  src="/desa.jpg"
                  alt="Ilustrasi Desa Smart Village Lampung — bagian kiri"
                  style={{
                    width: '200%', // show only left half
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'left center',
                    display: 'block',
                    minHeight: 320,
                  }}
                />
                {/* Fold crease shadow */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 18, height: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.10))',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Right panel — shows right half of image */}
              <div
                ref={foldRightRef}
                style={{
                  flex: 1, overflow: 'hidden',
                  transformOrigin: 'left center',
                  opacity: 0, // GSAP will animate
                  position: 'relative',
                }}
              >
                <img
                  src="/desa.jpg"
                  alt="Ilustrasi Desa Smart Village Lampung — bagian kanan"
                  style={{
                    width: '200%', // show only right half
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'right center',
                    marginLeft: '-100%', // offset to show right side
                    display: 'block',
                    minHeight: 320,
                  }}
                />
                {/* Fold crease shadow */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: 18, height: '100%',
                  background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.10))',
                  pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Floating stat chip — bottom left */}
            <div className="hero-chip" style={{
              position: 'absolute', bottom: -16, left: -20,
              background: 'white', borderRadius: 14, padding: '12px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', gap: 10,
              border: '1px solid #e2e8f0', opacity: 0,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="#16a34a" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Jangkauan</p>
                <p style={{ margin: 0, fontSize: 13, color: '#0f172a', fontWeight: 700 }}>Lampung, Indonesia</p>
              </div>
            </div>

            {/* Floating users chip — top right */}
            <div className="hero-chip" style={{
              position: 'absolute', top: -16, right: -16,
              background: 'white', borderRadius: 14, padding: '12px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', gap: 10,
              border: '1px solid #e2e8f0', opacity: 0,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#2563eb" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Warga Aktif</p>
                <p style={{ margin: 0, fontSize: 13, color: '#0f172a', fontWeight: 700 }}>14.958+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{
        padding: '64px 24px',
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card" style={{
              textAlign: 'center', padding: '28px 20px',
              background: '#f8fafc', borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 44, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                <span className="stat-number" data-target={s.value}>0</span>{s.suffix}
              </div>
              <p style={{ color: '#64748b', fontSize: 13, margin: '8px 0 0', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
              Fitur Platform PUSAKA
            </h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Semua yang dibutuhkan desa modern dalam satu platform.</p>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="feature-card" style={{
                padding: 28, background: 'white', border: '1px solid #e2e8f0',
                borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Villages */}
      <section id="desa" ref={villagesRef} style={{ padding: '80px 24px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)',
              borderRadius: 999, padding: '4px 14px', marginBottom: 16,
            }}>
              <MapPin size={12} color="#16a34a" />
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em' }}>LAMPUNG · 8 DESA AKTIF</span>
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
              Desa Smart Village di Lampung
            </h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Desa-desa pelopor yang telah mengadopsi sistem tata kelola digital berbasis PUSAKA.</p>
          </div>

          <div className="villages-grid">
            {villages.map(({ name, kabupaten, fitur, icon: Icon, color, bg, warga, tahun }) => (
              <div key={name} className="village-card" style={{
                padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 16, transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${color}18`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={19} style={{ color }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 999 }}>
                    Aktif {tahun}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{name}</h3>
                <p style={{ fontSize: 12, color: '#16a34a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <MapPin size={10} /> {kabupaten}
                </p>
                <div style={{ padding: '6px 10px', background: bg, borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color, fontWeight: 700 }}>{fitur}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={11} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{warga} warga terdaftar</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg,#f0fdf4 0%,#eff6ff 100%)',
        borderTop: '1px solid #e2e8f0',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(22,163,74,0.35)',
          }}>
            <CheckCircle size={30} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 34, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Siap Bergabung?</h2>
          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: '0 0 32px' }}>
            Masuk ke dashboard untuk melaporkan masalah desa, mengajukan dokumen, atau menjelajahi produk UMKM lokal.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
              background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white',
              borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14,
              boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
            }}>
              Masuk Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
              background: 'white', color: '#0f172a', borderRadius: 12, textDecoration: 'none',
              fontWeight: 600, fontSize: 14, border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              Buat Akun Baru
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px', borderTop: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, background: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>PUSAKA</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>— Smart Village Hub Lampung</span>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>© 2025 PUSAKA. Mendorong Desa Maju Indonesia.</p>
      </footer>
    </div>
  );
}
