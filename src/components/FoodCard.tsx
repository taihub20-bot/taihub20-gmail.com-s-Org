import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Info, Clock } from 'lucide-react';
import { Product } from '../types';

interface FoodCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  key?: string | number;
}

export default function FoodCard({ product, onAddToCart }: FoodCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBestSeller && (
            <span className="bg-[#FFD700] text-[#3E2723] text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-tighter">
              <Star size={10} fill="#3E2723" />
              Best Seller
            </span>
          )}
          {product.isTodaysSpecial && (
            <span className="bg-[#2E7D32] text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-tighter">
              Today's Special
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
          <span className="font-black text-[#2E7D32] text-xl">₹{product.price}</span>
        </div>
        
        <div className="flex items-center gap-1.5 mb-3">
           <Clock size={10} className="text-gray-400 md:w-[12px] md:h-[12px]" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Est: 35-45 Min</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow italic leading-relaxed">
          {product.description}
        </p>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-3.5 bg-[#5D4037] text-[#FFD700] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#3E2723] transition-all group active:scale-95 shadow-lg shadow-brown-100"
        >
          <ShoppingBag size={18} className="md:w-[20px] md:h-[20px] group-hover:scale-110 transition-transform" />
          Add To Cart
        </button>
      </div>
    </motion.div>
  );
}
