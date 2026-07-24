import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
export type Pet = {
  id: string;
  name: string;
  breed: string;
  bio: string;
  imageUrl: string;
  huellas: number;
};
type PetCardProps = {
  pet: Pet;
  index: number;
  hasVoted: boolean;
  onVote: (id: string) => void;
};
export function PetCard({ pet, index, hasVoted, onVote }: PetCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20
      }}
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true
      }}
      transition={{
        duration: 0.4,
        delay: Math.min(index, 8) * 0.04,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
      
      <div
        className="relative w-full bg-gray-100 flex-shrink-0"
        style={{
          aspectRatio: '1 / 1'
        }}>
        
        {pet.imageUrl ?
        <img
          src={pet.imageUrl}
          alt={pet.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover" /> :


        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <PawPrint className="w-10 h-10" />
          </div>
        }
      </div>

      <div className="p-2.5 md:p-4 flex flex-col gap-2 flex-grow">
        <div className="min-w-0 h-9 md:h-11">
          <h3 className="font-bold text-brand-navy text-sm md:text-base truncate leading-tight">
            {pet.name}
          </h3>
          <p className="text-xs text-gray-500 truncate leading-tight">
            {pet.breed || '\u00A0'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onVote(pet.id)}
          disabled={hasVoted}
          aria-label={
          hasVoted ?
          `Ya le diste tu huella a ${pet.name}` :
          `Dar una huella a ${pet.name}`
          }
          className={`mt-auto inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-full font-bold text-xs md:text-sm transition-all ${hasVoted ? 'bg-brand-green/10 text-brand-green cursor-default' : 'bg-brand-cyan text-white hover:bg-blue-700'}`}>
          
          <PawPrint
            className={`w-4 h-4 ${hasVoted ? 'fill-brand-green' : ''}`} />
          
          <span>{pet.huellas}</span>
          <span className="hidden sm:inline">
            {hasVoted ? 'Huella dada' : 'Dar Huella'}
          </span>
        </button>
      </div>
    </motion.article>);

}