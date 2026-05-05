import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Menu as MenuIcon, User, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';
import { User as UserType, CartItem } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ user, onLogout, cartCount, onOpenCart, onNavigate, currentPage }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'track', label: 'Track' },
  ];

  if (user) {
    if (user.role === 'customer') navItems.push({ id: 'profile', label: 'Dashboard' });
    if (user.role === 'admin') navItems.push({ id: 'admin', label: 'Developer' });
    if (user.role === 'staff') navItems.push({ id: 'staff', label: 'Portal' });
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#5D4037] flex items-center justify-center text-[#FFD700] font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform ring-4 ring-[#FFD700]/10">
              TH
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFD700] rounded-full border-2 border-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black text-[#5D4037] leading-[0.8] tracking-tighter">TAI <span className="text-[#FFD700]">HUB.</span></h1>
            <p className="text-[9px] text-[#2E7D32] font-black uppercase tracking-[0.3em] mt-1">Indigenous Kitchen</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-sm font-medium transition-colors ${
                currentPage === item.id ? 'text-[#2E7D32] border-b-2 border-[#FFD700]' : 'text-gray-600 hover:text-[#5D4037]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenCart}
            className="relative p-2.5 text-[#5D4037] hover:bg-gray-100 rounded-full transition-colors active:scale-90"
          >
            <ShoppingCart size={24} className="md:w-6 md:h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#2E7D32] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 md:gap-2 bg-gray-100 rounded-full pl-3 pr-1 py-1">
              <span className="text-[10px] md:text-xs font-bold text-[#5D4037] whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] md:max-w-[80px]">
                {user.name.split(' ')[0]}
              </span>
              <button 
                onClick={onLogout}
                className="p-1.5 bg-white text-[#5D4037] rounded-full hover:text-red-600 transition-colors shadow-sm active:scale-95"
              >
                <LogOut size={18} className="md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 py-3 px-6 md:px-8 bg-[#5D4037] text-[#FFD700] rounded-2xl text-xs md:text-sm font-black hover:bg-[#3E2723] transition-all shadow-xl shadow-brown-100/20 active:scale-95 whitespace-nowrap border-b-4 border-[#3E2723]"
            >
              SIGN IN
            </button>
          )}

          <button 
            className="md:hidden p-2.5 text-[#5D4037] active:scale-90"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#5D4037] flex items-center justify-center text-[#FFD700] text-xs font-bold ring-2 ring-[#FFD700]">TH</div>
                <span className="font-bold text-[#5D4037]">Tai Hub</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 py-6 px-4 flex flex-col gap-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl text-lg font-bold ${
                    currentPage === item.id ? 'bg-[#FFF9C4] text-[#2E7D32]' : 'text-gray-700 bg-gray-50'
                  }`}
                >
                  {item.label}
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>

            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 italic">"Traditional Tai Khamyang Food"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
