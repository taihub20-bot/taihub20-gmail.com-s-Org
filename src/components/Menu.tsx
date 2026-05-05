import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, UtensilsCrossed } from 'lucide-react';
import FoodCard from './FoodCard';
import { Product } from '../types';

interface MenuProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
}

export default function Menu({ products, onAddToCart }: MenuProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'special' | 'best'>('all');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'special') return matchesSearch && p.isTodaysSpecial;
    if (activeFilter === 'best') return matchesSearch && p.isBestSeller;
    return matchesSearch;
  });

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full min-h-screen">
      <div className="flex flex-col gap-12">
        {/* Promotional Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#5D4037] to-[#3E2723] rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full blur-[80px] opacity-10 translate-x-20 -translate-y-20" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="space-y-4 text-center md:text-left">
                <span className="px-4 py-1.5 bg-[#FFD700] text-[#3E2723] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Season Special</span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Authentic Kitchen <br/> <span className="text-[#FFD700]">30% OFF</span> on 1st Order</h2>
                <p className="text-gray-300 font-medium text-sm md:text-lg">Use code: <span className="text-white font-black border-2 border-dashed border-white/20 px-3 py-1 rounded-xl ml-2 tracking-widest">TAIHUB30</span></p>
             </div>
             <div className="hidden lg:block">
                <div className="w-56 h-56 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-4 rotate-3 ring-8 ring-white/5">
                   <img 
                     src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=500&auto=format&fit=crop" 
                     className="w-full h-full object-cover rounded-[32px] shadow-2xl" 
                     alt="Promo dish"
                   />
                </div>
             </div>
          </div>
        </motion.div>
        <header className="space-y-4 text-center md:text-left">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-[#5D4037] leading-tight mb-4 tracking-tighter">Our Traditional <br /> <span className="text-[#2E7D32]">Menu</span></h1>
                <p className="text-gray-500 font-medium max-w-lg text-sm md:text-base">Genuine spice blends and traditional cooking methods from the Tai Khamyang community.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                   <input 
                    type="text" 
                    placeholder="Find your favorite..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-4 py-4 md:py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#FFD700] transition-colors w-full sm:w-64 font-bold text-gray-700"
                   />
                 </div>
              </div>
           </div>

           <div className="flex flex-wrap gap-2 pt-4">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'special', label: "Today's Special" },
                { id: 'best', label: 'Best Sellers' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
                    activeFilter === f.id 
                    ? 'bg-[#5D4037] text-[#FFD700] ring-4 ring-[#5D4037]/10' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
           </div>
        </header>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filtered.map(product => (
              <FoodCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart} 
              />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-gray-300 gap-6">
            <UtensilsCrossed size={80} strokeWidth={1} className="opacity-20 translate-y-4" />
            <div className="text-center">
               <h3 className="text-2xl font-black text-[#5D4037]/20 uppercase">No results found</h3>
               <p className="font-bold">Try searching for something else or reset filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
