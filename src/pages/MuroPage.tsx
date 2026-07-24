import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  Fragment } from
'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Dog,
  Camera,
  PawPrint,
  ClipboardEdit,
  Trophy,
  Search,
  X,
  Loader2 } from
'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { PetRegistrationModal } from '../components/PetRegistrationModal';
import { PetCard, type Pet } from '../components/PetCard';
import { getVoterKey, loadVotedIds, persistVotedIds } from '../utils/petWall';

// Render up to 100 eligible pets before loading the next block on scroll.
const PAGE_SIZE = 100;

function mapRow(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    bio: row.bio,
    imageUrl: row.photo_url,
    huellas: row.huellas ?? 0
  };
}
export function MuroPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(() => loadVotedIds());
  // Top 5 ranking — fetched independently so it always reflects the real leaders.
  const [topPets, setTopPets] = useState<Pet[]>([]);
  // Main feed (infinite scroll, ordered by huellas)
  const [pets, setPets] = useState<Pet[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Search
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const isSearching = debouncedQuery.trim().length > 0;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // ---- Top 5 ----
  const fetchTop = useCallback(async () => {
    const { data } = await supabase.
    from('public_pet_wall').
    select('id, name, breed, bio, photo_url, huellas').
    order('huellas', {
      ascending: false
    }).
    limit(5);
    if (data) setTopPets(data.map(mapRow));
  }, []);
  // ---- Paginated feed ----
  const fetchPage = useCallback(async (pageIndex: number) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase.
    from('public_pet_wall').
    select('id, name, breed, bio, photo_url, huellas').
    order('huellas', {
      ascending: false
    }).
    range(from, to);
    if (error || !data)
    return {
      rows: [] as Pet[],
      more: false
    };
    return {
      rows: data.map(mapRow),
      more: data.length === PAGE_SIZE
    };
  }, []);
  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    const { rows, more } = await fetchPage(0);
    setPets(rows);
    setPage(0);
    setHasMore(more);
    setLoading(false);
  }, [fetchPage]);
  useEffect(() => {
    loadFirstPage();
    fetchTop();
    const channel = supabase.
    channel('muro_page_changes').
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pet_huellas'
      },
      () => {
        fetchTop();
        if (!isSearching) loadFirstPage();
      }
    ).
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'registration_pets'
      },
      () => {
        fetchTop();
        if (!isSearching) loadFirstPage();
      }
    ).
    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || isSearching) return;
    setLoadingMore(true);
    const next = page + 1;
    const { rows, more } = await fetchPage(next);
    setPets((prev) => [...prev, ...rows]);
    setPage(next);
    setHasMore(more);
    setLoadingMore(false);
  }, [loadingMore, hasMore, isSearching, page, fetchPage]);
  // Infinite-scroll observer
  useEffect(() => {
    if (isSearching) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      {
        rootMargin: '300px'
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, isSearching]);
  // ---- Debounce search input ----
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);
  // ---- Run search query ----
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      // Restore the paginated feed
      loadFirstPage();
      return;
    }
    let cancelled = false;
    setSearching(true);
    (async () => {
      const escaped = q.replace(/[%,]/g, '');
      const { data } = await supabase.
      from('public_pet_wall').
      select('id, name, breed, bio, photo_url, huellas').
      or(`name.ilike.%${escaped}%,breed.ilike.%${escaped}%`).
      order('huellas', {
        ascending: false
      }).
      limit(100);
      if (cancelled) return;
      setPets(data ? data.map(mapRow) : []);
      setHasMore(false);
      setSearching(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);
  // ---- Voting (optimistic, shared with home) ----
  const applyDelta = (id: string, delta: number) => {
    const bump = (arr: Pet[]) =>
    arr.map((p) =>
    p.id === id ?
    {
      ...p,
      huellas: Math.max(0, p.huellas + delta)
    } :
    p
    );
    setPets(bump);
    setTopPets(bump);
  };
  const handleDarHuella = async (id: string) => {
    if (votedIds.has(id)) {
      toast.info('Ya le diste tu huella a esta mascota 🐾');
      return;
    }
    applyDelta(id, +1);
    const nextVoted = new Set(votedIds).add(id);
    setVotedIds(nextVoted);
    persistVotedIds(nextVoted);
    const { error } = await supabase.from('pet_huellas').insert({
      pet_id: id,
      voter_key: getVoterKey()
    });
    if (error && error.code !== '23505') {
      applyDelta(id, -1);
      const reverted = new Set(nextVoted);
      reverted.delete(id);
      setVotedIds(reverted);
      persistVotedIds(reverted);
      toast.error('No pudimos registrar tu huella. Intenta de nuevo.');
    }
  };
  return (
    <div className="pt-20 bg-brand-navy min-h-screen">
      <Toaster position="top-center" richColors />
      <PetRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)} />
      

      {/* Hero */}
      <section className="relative py-20 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <img
            src="/PATRON_HUELLAS_fondo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover" />
          
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-brand-cyan hover:text-white transition-colors mb-8 text-sm">
            
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-4xl md:text-6xl text-white mb-4 font-bold">
            
            El Muro de las <span className="text-brand-cyan">Huellas</span>
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            transition={{
              delay: 0.2
            }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            
            Todas las mascotas del movimiento. Dales tu huella y ayúdalas a ser
            la <strong className="text-white">Mascota Influencer 2026</strong>.
          </motion.p>
        </div>
      </section>

      <section className="bg-white pb-24 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 4 Steps */}
          <div className="flex flex-row justify-center items-start gap-2 md:gap-10 mb-10">
            {[
            {
              icon: Dog,
              color: 'navy',
              label: '1. Regístralo'
            },
            {
              icon: Camera,
              color: 'cyan',
              label: '2. Súbelo'
            },
            {
              icon: PawPrint,
              color: 'yellow',
              label: '3. Huellas',
              sub: '1 Like = 1 Huella'
            },
            {
              icon: Trophy,
              color: 'green',
              label: '4. ¡Gana!',
              sub: 'Mascota Influencer'
            }].
            map((step, i, arr) => {
              const Icon = step.icon;
              const colorMap: Record<string, string> = {
                navy: 'bg-brand-navy/10 text-brand-navy',
                cyan: 'bg-brand-cyan/10 text-brand-cyan',
                yellow: 'bg-brand-yellow/10 text-brand-yellow',
                green: 'bg-brand-green/10 text-brand-green'
              };
              return (
                <Fragment key={i}>
                  <div className="flex flex-col items-center flex-1 md:flex-initial">
                    <div
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-3 ${colorMap[step.color]}`}>
                      
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="font-semibold text-brand-navy text-[11px] md:text-base text-center leading-tight">
                      {step.label}
                    </span>
                    {step.sub &&
                    <span className="hidden md:block text-xs text-gray-500 mt-1">
                        {step.sub}
                      </span>
                    }
                  </div>
                  {i < arr.length - 1 &&
                  <div className="hidden md:block w-12 h-0.5 bg-gray-200 mt-7" />
                  }
                </Fragment>);

            })}
          </div>

          {/* Register CTA */}
          <div className="text-center mb-12">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-3 bg-brand-cyan hover:bg-blue-700 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1">
              
              <ClipboardEdit className="w-5 h-5 md:w-6 md:h-6" />
              Registra a tu mascota
            </button>
          </div>

          {/* Top 5 ranking */}
          {topPets.length > 0 &&
          <div className="mb-10 bg-brand-navy rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-brand-yellow" />
                <h2 className="text-lg md:text-2xl font-bold text-white">
                  Top 5 Influencers
                </h2>
              </div>
              <div className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide justify-start md:justify-center px-2 pt-3 pb-2">
                {topPets.map((pet, index) =>
              <div
                key={pet.id}
                className="flex-shrink-0 flex flex-col items-center w-16 md:w-20">
                
                    <div className="relative">
                      <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 border-2 ${index === 0 ? 'border-brand-yellow' : 'border-white/20'} overflow-hidden`}>
                    
                        {pet.imageUrl &&
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover object-center" />

                    }
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-yellow text-brand-navy text-[11px] font-bold flex items-center justify-center shadow-md border-2 border-brand-navy">
                        {index + 1}
                      </div>
                    </div>
                    <span className="text-[11px] md:text-sm font-semibold text-white mt-2 truncate w-full text-center">
                      {pet.name}
                    </span>
                    <span className="text-[10px] md:text-xs text-brand-cyan font-bold whitespace-nowrap">
                      {pet.huellas} 🐾
                    </span>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar mascota por nombre o raza…"
              className="w-full pl-12 pr-12 py-3.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-base" />
            
            {query &&
            <button
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors">
              
                <X className="w-5 h-5" />
              </button>
            }
          </div>

          {/* Grid */}
          {loading || searching ?
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Array.from({
              length: 8
            }).map((_, i) =>
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
              
                  <div className="w-full aspect-square bg-gray-200" />
                  <div className="p-2.5 md:p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-7 bg-gray-200 rounded" />
                  </div>
                </div>
            )}
            </div> :
          pets.length === 0 ?
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-cyan/10 flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">
                {isSearching ?
              'Sin resultados' :
              'Aún no hay mascotas en el Muro'}
              </h3>
              <p className="text-gray-500">
                {isSearching ?
              `No encontramos mascotas que coincidan con "${debouncedQuery}".` :
              'Inscríbete a la Caminata Canina y tu mascota aparecerá aquí automáticamente.'}
              </p>
            </div> :

          <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {pets.map((pet, index) =>
              <PetCard
                key={pet.id}
                pet={pet}
                index={index}
                hasVoted={votedIds.has(pet.id)}
                onVote={handleDarHuella} />

              )}
              </div>

              {/* Infinite-scroll sentinel + loader (only when not searching) */}
              {!isSearching && hasMore &&
            <div
              ref={sentinelRef}
              className="flex justify-center items-center py-10 text-gray-400">
              
                  {loadingMore &&
              <Loader2 className="w-6 h-6 animate-spin text-brand-cyan" />
              }
                </div>
            }
            </>
          }
        </div>
      </section>
    </div>);

}