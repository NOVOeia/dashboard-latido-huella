import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALL_PHOTOS = [
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.01%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.00%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.59%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.00%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.59%20PM%20%284%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.01%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.00%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.59%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.59%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.00%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.59%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.57%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.57%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.58%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.05%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.57%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.58%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.58%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.05%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.17.57%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.05%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.04%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.04%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.04%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.03%20PM%20%284%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.04%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.05%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.03%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.03%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.03%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.03%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.02%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.01%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.02%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.10%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.10%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.02%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.02%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.01%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.10%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.10%20PM%20%284%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.08%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.08%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.08%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.09%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.07%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.09%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.08%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.10%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.09%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.09%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.07%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.07%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.07%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.06%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.13%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.06%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.06%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.06%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.14%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.13%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.11%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.13%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.13%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.11%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.12%20PM%20%283%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.12%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.12%20PM%20%281%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.12%20PM%20%282%29.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.11%20PM.jpeg',
  'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/community-event-photos/fotos%20evento/WhatsApp%20Image%202026-07-26%20at%202.18.11%20PM%20%282%29.jpeg',
]

export function GalleryPage() {
  const [active, setActive] = useState<number|null>(null)

  const prev = () => setActive(i => i === null ? null : (i - 1 + ALL_PHOTOS.length) % ALL_PHOTOS.length)
  const next = () => setActive(i => i === null ? null : (i + 1) % ALL_PHOTOS.length)

  return (
    <div style={{ minHeight: '100vh', background: '#08155f' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px 24px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: '#00BCD4', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 8px' }}>La comunidad cuenta la historia</p>
        <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 8px' }}>Galeria viva</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 16px' }}>{ALL_PHOTOS.length} momentos del evento</p>
        <Link to="/deja-tu-huella" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00BCD4', color: '#08155f', padding: '10px 24px', borderRadius: 50, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
          + Subir mis fotos
        </Link>
      </div>

      {/* Masonry Grid */}
      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', columns: 'auto 280px', columnGap: 12 }}>
        {ALL_PHOTOS.map((photo, i) => (
          <motion.div key={photo}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 12) * 0.04 }}
            onClick={() => setActive(i)}
            style={{ breakInside: 'avoid', marginBottom: 12, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
            whileHover={{ scale: 1.02 }}>
            <img src={photo} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover' }} loading="lazy"/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,21,95,0.7) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}/>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setActive(null)}>
            <button onClick={e => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 101 }}>
              <ChevronLeft size={24}/>
            </button>
            <motion.img
              key={active}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={ALL_PHOTOS[active]}
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 16, objectFit: 'contain' }}
              alt=""/>
            <button onClick={e => { e.stopPropagation(); next() }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 101 }}>
              <ChevronRight size={24}/>
            </button>
            <button onClick={() => setActive(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 101 }}>
              <X size={20}/>
            </button>
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {active + 1} / {ALL_PHOTOS.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}