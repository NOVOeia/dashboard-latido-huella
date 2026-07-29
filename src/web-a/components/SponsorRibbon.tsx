import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export function SponsorRibbon() {
  const [sponsors, setSponsors] = useState<any[]>([])

  useEffect(() => {
    supabase.from('public_sponsors')
      .select('id, name, logo_url')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setSponsors(data || []))
  }, [])

  if (sponsors.length === 0) return null

  const loop = [...sponsors, ...sponsors]

  return (
    <section id="aliados" className="overflow-hidden bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-cyan-600">Aliados del evento</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#0D1B6E]">Marcas que hicieron posible esta huella</h2>
      </div>
      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-5 px-5">
          {loop.map((s, i) => (
            <div key={`${s.id}-${i}`} className="flex h-32 w-40 shrink-0 items-center justify-center rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60">
              <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain"
                onError={e => (e.currentTarget.style.display = 'none')}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}