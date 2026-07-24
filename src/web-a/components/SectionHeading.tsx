import React from 'react';
export function SectionHeading({eyebrow, title, text, light=false}:{eyebrow:string;title:string;text?:string;light?:boolean}) {
  return <div className="mx-auto max-w-3xl text-center">
    <p className={`text-xs font-extrabold uppercase tracking-[0.28em] ${light ? 'text-cyan-300' : 'text-cyan-600'}`}>{eyebrow}</p>
    <h2 className={`mt-4 text-3xl font-extrabold leading-tight sm:text-5xl ${light ? 'text-white' : 'text-[#0D1B6E]'}`}>{title}</h2>
    {text && <p className={`mt-5 text-base leading-8 sm:text-lg ${light ? 'text-white/75' : 'text-slate-600'}`}>{text}</p>}
  </div>
}
