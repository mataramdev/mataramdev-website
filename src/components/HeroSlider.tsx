"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Slider media hero — mengikuti mockup `ui_design_canva/html/...` apa adanya:
 * kotak `aspect-[740/526]` berborder 3px, tombol panah 40×40 di `bottom:36px`
 * (kiri 18px / kanan 18px), dan titik 12×12 di `bottom:12px` yang melebar jadi
 * 32px dengan latar merah saat aktif.
 *
 * Perilaku:
 * - auto-advance tiap 5 detik, berhenti total kalau `prefers-reduced-motion`
 *   aktif (panah & titik tetap bisa dipakai manual);
 * - auto-advance juga berhenti saat kursor/fokus berada di dalam slider supaya
 *   pengguna tidak kehilangan kendali;
 * - panah disembunyikan di layar ≤900px seperti mockup (titik tetap tampil).
 */

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  /** Badge status di pojok kanan atas (mis. label event terdekat). */
  badge?: string | null;
}

const AUTO_DELAY_MS = 5000;

export default function HeroSlider({ slides, badge }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  // Baca preferensi gerak pengguna — berubah real-time kalau OS mengubahnya.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Auto-rotate. Dihentikan saat reduced-motion, saat slider di-hover/fokus,
  // atau saat cuma ada satu slide.
  useEffect(() => {
    if (count < 2 || reducedMotion || paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [count, reducedMotion, paused]);

  if (count === 0) return null;

  // Kalau daftar slide menyusut (data berubah), index lama bisa ke luar rentang.
  // Diturunkan saat render — bukan lewat effect — supaya tidak ada render ganda.
  const activeIndex = index < count ? index : 0;

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      className="relative aspect-[740/526] border-[3px] border-[var(--hard-border)] bg-brand-navy shadow-[10px_10px_0_0_var(--hard-shadow)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      data-testid="hero-slider"
    >
      {slides.map((slide, i) => {
        const active = i === activeIndex;
        return (
          <Image
            key={`${i}-${slide.src}`}
            src={slide.src}
            // Hanya slide aktif yang dibacakan pembaca layar; sisanya
            // opacity-0 tapi masih ada di DOM (transisi mulus).
            alt={active ? slide.alt : ""}
            aria-hidden={!active}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            loading={i === 0 ? "eager" : "lazy"}
            className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      {badge && (
        <span className="absolute right-3.5 top-3.5 z-10 border-2 border-[var(--hard-border)] bg-brand-orange px-4 py-1.5 font-mono text-[11px] font-bold uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)]">
          {badge}
        </span>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Foto sebelumnya"
            className="absolute bottom-9 left-[18px] z-10 hidden size-10 items-center justify-center border-[3px] border-[var(--hard-border)] bg-white font-black text-black shadow-[3px_3px_0_0_var(--hard-shadow)] hover:bg-brand-yellow min-[901px]:flex"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Foto berikutnya"
            className="absolute bottom-9 right-[18px] z-10 hidden size-10 items-center justify-center border-[3px] border-[var(--hard-border)] bg-white font-black text-black shadow-[3px_3px_0_0_var(--hard-shadow)] hover:bg-brand-yellow min-[901px]:flex"
          >
            <span aria-hidden="true">›</span>
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={`${i}-${slide.src}`}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Tampilkan foto ${i + 1} dari ${count}`}
                  aria-current={active || undefined}
                  className={`h-3 border-2 border-[var(--hard-border)] transition-all duration-300 motion-reduce:transition-none ${
                    active ? "w-8 bg-accent-500" : "w-3 bg-white hover:bg-brand-yellow"
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
