import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { eventPhotos } from '../data';

type Item={id:string;url:string;comment?:string;full_name?:string;pet_name?:string};
export function CommunityGallery({limit}:{limit?:number}){
 const [items,setItems]=useState<Item[]>([]); const [active,setActive]=useState<Item|null>(null);
 useEffect(()=>{(async()=>{const {data,error}=await supabase.from('community_event_submissions').select('id,full_name,pet_name,comment,photo_paths,created_at').eq('status','approved').eq('publish_in_gallery',true).order('created_at',{ascending:false}); if(error||!data?.length){setItems(eventPhotos.map((url,i)=>({id:`f-${i}`,url})));return;} const rows:Item[]=[]; for(const row of data){for(const path of row.photo_paths||[]){const {data:pub}=supabase.storage.from('community-event-photos').getPublicUrl(path); rows.push({id:`${row.id}-${path}`,url:pub.publicUrl,comment:row.comment,full_name:row.full_name,pet_name:row.pet_name});}} setItems(rows);})();},[]);
 const shown=useMemo(()=>limit?items.slice(0,limit):items,[items,limit]);
 return <><div className="columns-2 gap-3 md:columns-3 lg:columns-4">{shown.map((item,i)=><button key={item.id} onClick={()=>setActive(item)} className="group relative mb-3 block w-full overflow-hidden rounded-2xl bg-slate-100 text-left"><img src={item.url} alt={item.comment||'Latido y Huella'} className="w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-[#07104a]/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"/><span className="absolute bottom-3 left-3 right-3 line-clamp-2 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{item.comment||'Un momento que dejó huella'}</span></button>)}</div>
 {active&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#030726]/95 p-4" onClick={()=>setActive(null)}><button className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white"><X/></button><div className="max-h-[90vh] max-w-5xl" onClick={e=>e.stopPropagation()}><img src={active.url} className="max-h-[75vh] w-auto rounded-3xl object-contain"/><div className="mx-auto mt-4 max-w-2xl text-center text-white"><p className="text-lg">{active.comment}</p>{active.full_name&&<p className="mt-2 text-sm text-cyan-300">{active.full_name}{active.pet_name?` · ${active.pet_name}`:''}</p>}</div></div></div>}
 </>
}
