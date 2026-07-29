import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
type Sponsor = {
  name: string;
  src: string;
};

export function SponsorsBannerSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    fetch(`https://adkqijensfxzzftylktm.supabase.co/rest/v1/public_sponsors?is_active=eq.true&order=display_order&select=name,logo_url`, {
      headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka3FpamVuc2Z4enpmdHlsa3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ1OTMsImV4cCI6MjA5Mzc1MDU5M30.Yk7hafWIWMsKQtcCZ4f03_hCVtAUgoTt4soxEgEuLrY' }
    }).then(r => r.json()).then(data => setSponsors(data.map((s: any) => ({ name: s.name, src: s.logo_url }))))
  }, [])

  if (sponsors.length === 0) return null;
// Shared animation config so both layers stay in sync
const MARQUEE_ANIMATE = {
  x: ['0%', '-50%'] as [string, string]
};
const MARQUEE_TRANSITION = {
  duration: 45,
  ease: 'linear' as const,
  repeat: Infinity
};
// Shared track classes so both layers have identical layout
const TRACK_CLASSES = 'flex gap-3 md:gap-4 py-2 md:py-2.5 px-3 md:px-4 w-max';
const TILE_CLASSES = 'relative shrink-0 w-32 h-32 md:w-36 md:h-36';
  const loop = [...sponsors, ...sponsors];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = (i: number) => hoveredIndex === i || activeIndex === i;
  return <section aria-label="Marcas patrocinadoras" className="relative w-full z-20 -mt-12 md:-mt-16 -mb-12 md:-mb-16 pointer-events-none">
      <div className="relative max-w-7xl mx-auto px-4 pointer-events-auto">
        {/* Breathing glow shadow layer (behind the ribbon) */}
        <motion.div aria-hidden="true" className="absolute inset-x-6 inset-y-2 rounded-3xl bg-brand-cyan/40 blur-2xl" animate={{
        opacity: [0.35, 0.6, 0.35],
        scale: [0.98, 1.02, 0.98]
      }} transition={{
        duration: 3.2,
        ease: 'easeInOut',
        repeat: Infinity
      }} />

        {/* Stage holds both layers stacked */}
        <div className="relative">
          {/* LAYER 1 — Visual masked ribbon. Clips marquee and fades edges to transparent. */}
          <div className="relative rounded-3xl bg-white/95 border border-white/80 overflow-hidden" style={{
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 30px 60px -16px rgba(0, 191, 206, 0.25)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}>
            <motion.div className={TRACK_CLASSES} animate={MARQUEE_ANIMATE} transition={MARQUEE_TRANSITION}>
              {loop.map((sponsor, i) => <div key={`v-${sponsor.name}-${i}`} className={`${TILE_CLASSES} rounded-2xl bg-white overflow-hidden transition-transform duration-300 ease-out ${isOpen(i) ? 'scale-110 -translate-y-1 shadow-[0_16px_36px_-8px_rgba(0,191,206,0.45)]' : ''}`}>
                  <img src={sponsor.src} alt={sponsor.name} className="w-full h-full object-contain p-3 md:p-4" loading="lazy" />
                </div>)}
            </motion.div>
          </div>

          {/* LAYER 2 — Interactive overlay. Same layout, NO mask, NO overflow clip.
          Holds invisible hitboxes + tooltips so tooltips escape the ribbon freely. */}
          <div className="absolute inset-0 pointer-events-none" style={{
          overflow: 'visible'
        }}>
            <motion.div className={TRACK_CLASSES} animate={MARQUEE_ANIMATE} transition={MARQUEE_TRANSITION}>
              {loop.map((sponsor, i) => <div key={`i-${sponsor.name}-${i}`} className={`${TILE_CLASSES} pointer-events-auto`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex((prev) => prev === i ? null : prev)}>
                  <button type="button" onClick={() => setActiveIndex((prev) => prev === i ? null : i)} aria-label={`${sponsor.name} — patrocinador`} className="absolute inset-0 cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2" />

                  {/* Tooltip — escapes upward freely because overlay has overflow:visible */}
                  <div role="tooltip" className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-30 transition-all duration-200 ${isOpen(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                    <div className="whitespace-nowrap px-3 py-1.5 rounded-full bg-brand-navy text-white text-[11px] md:text-xs font-medium shadow-lg">
                      🐾 ¡Únete tú también!
                    </div>
                    <div className="w-2 h-2 bg-brand-navy rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                </div>)}
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
}