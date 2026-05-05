import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Clock, MapPin, ShieldCheck, Utensils, MessageCircle, Star, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

interface HomeProps {
  onNavigate: (page: string) => void;
  topProducts: any[];
}

export default function Home({ onNavigate, topProducts }: HomeProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-4 pt-20 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#fcf8f2] clip-path-slant hidden lg:block" />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/20 text-[#5D4037] rounded-full text-xs font-black uppercase tracking-widest">
              <Star size={14} fill="#FFD700" className="text-[#FFD700]" />
              <span>Authentic Tai Khamyang Kitchen</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] text-[#5D4037] tracking-tighter">
              BEYOND <br />
              <span className="text-[#FFD700]">TASTE.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
              We bring the ancestral recipes of the <span className="text-[#5D4037] font-bold">Tai Hub</span> straight to your table. Clean, healthy, and deeply traditional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('menu')}
                className="w-full sm:w-auto px-10 py-5 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                EXPLORE MENU
                <ChevronRight size={22} strokeWidth={3} />
              </button>
              <button 
                onClick={() => onNavigate('track')}
                className="w-full sm:w-auto px-10 py-5 bg-gray-100 text-[#5D4037] rounded-2xl font-black text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                TRACK ORDER
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
             <div className="absolute -inset-4 bg-[#FFD700] rounded-[60px] rotate-3 opacity-10 blur-2xl" />
             <div className="relative rounded-[50px] overflow-hidden shadow-2xl ring-12 ring-white/50">
                <img 
                  src="/src/assets/images/regenerated_image_1777954123649.jpg" 
                  alt="Traditional Platter"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                   <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-1">Weekly Special</p>
                   <p className="text-2xl font-black">Heritage Pork Platter</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="bg-[#fcf8f2] py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { icon: <Clock size={24} className="text-[#2E7D32]" />, label: 'Fast Delivery', val: '30-45m' },
            { icon: <Utensils size={24} className="text-[#5D4037]" />, label: 'Tradition', val: 'Ancestral' },
            { icon: <ShieldCheck size={24} className="text-[#2E7D32]" />, label: 'Quality', val: '100% Fresh' },
            { icon: <MapPin size={24} className="text-[#5D4037]" />, label: 'Service', val: 'Cloud Kitchen' }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3 bg-white/50 p-6 rounded-3xl md:bg-transparent md:p-0">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center md:shadow-sm">
                {item.icon}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">{item.label}</h4>
                <p className="text-lg md:text-xl font-black text-[#3E2723]">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-xs font-black text-[#2E7D32] uppercase tracking-[0.3em] mb-4">Chef's Recommendations</h2>
            <h3 className="text-4xl md:text-5xl font-black text-[#3E2723] leading-tight">Must-Try Traditional <br /> Delicacies</h3>
          </div>
          <button 
            onClick={() => onNavigate('menu')}
            className="text-[#5D4037] font-bold flex items-center gap-2 hover:gap-4 transition-all"
          >
            EXPLORE FULL MENU <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topProducts.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer relative overflow-hidden rounded-3xl"
              onClick={() => onNavigate('menu')}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent' to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                 <p className="text-[#FFD700] text-sm font-bold uppercase mb-2">₹{p.price}</p>
                 <h4 className="text-white text-2xl font-black leading-tight mb-2">{p.name}</h4>
                 <div className="flex items-center gap-2 text-white/60 text-sm">
                   <Clock size={14} />
                   <span>Prepared with love</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Location / Contact */}
      <section className="bg-[#5D4037] py-24 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black leading-none">Find Us <br /> <span className="text-[#FFD700]">In The Heart</span> <br /> Of The Tradition</h2>
            <div className="flex flex-col items-center md:items-start gap-6">
               <div className="flex flex-col md:flex-row items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={28} className="text-[#FFD700]" />
                 </div>
                 <div className="md:text-left text-center">
                    <h4 className="font-bold text-xl mb-0.5">Our Location</h4>
                    <p className="text-gray-300">Tai Hub Cloud Kitchen, Assam, India</p>
                 </div>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone size={28} className="text-[#FFD700]" />
                 </div>
                 <div className="md:text-left text-center">
                    <h4 className="font-bold text-xl mb-0.5">Order Hotline</h4>
                    <p className="text-gray-300">+91 {WHATSAPP_NUMBER}</p>
                 </div>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700">
             {/* Mock Google Maps for look and feel, using an image */}
             <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Map Location" />
             <div className="absolute inset-0 bg-[#2E7D32]/20 mix-blend-overlay" />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-[#3E2723]">
                 <div className="w-10 h-10 bg-[#5D4037] rounded-full flex items-center justify-center text-[#FFD700] text-xs font-bold">TH</div>
                 <div>
                   <p className="font-black text-sm">Tai Hub Traditional Kitchen</p>
                   <p className="text-xs opacity-60">Ready for pickup & delivery</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 px-4 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFD700] rounded-full blur-[100px] opacity-10 -translate-x-32 -translate-y-32" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-[#5D4037] tracking-tight">Our Community</h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Stories from our happy diners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Rahul Gogoi", text: "Best ethnic food in the region! The Pork Curry reminded me of my grandma's kitchen.", stars: 5 },
              { name: "Priya Borah", text: "Healthy, fresh, and authentic. The bamboo shoot stir fry is a must-try for everyone.", stars: 5 },
              { name: "Amit Saikia", text: "Fast delivery and the packaging was excellent. Still hot when it reached me!", stars: 4 }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(review.stars)].map((_, idx) => (
                      <Star key={idx} size={16} className="fill-[#FFD700] text-[#FFD700]" />
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium italic text-lg leading-relaxed">"{review.text}"</p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-[#5D4037] text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-extrabold text-[#5D4037]">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto bg-[#5D4037] rounded-[50px] p-12 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[120px] opacity-10 translate-x-20 -translate-y-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-7xl font-black text-[#FFD700] leading-none tracking-tighter">
              HUNGRY FOR <br/> <span className="text-white">AUTHENTICITY?</span>
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto text-lg font-medium leading-relaxed">
              Order now and experience the true flavours of Tai Khamyang culture delivered right to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <button 
                onClick={() => onNavigate('menu')}
                className="w-full sm:w-auto px-12 py-6 bg-[#FFD700] text-[#3E2723] rounded-full font-black text-xl hover:bg-white hover:scale-105 transition-all shadow-2xl active:scale-95"
              >
                ORDER ONLINE
              </button>
              <button 
                onClick={() => onNavigate('track')}
                className="w-full sm:w-auto px-12 py-6 bg-white/10 text-white rounded-full font-black text-xl border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
              >
                TRACK ORDER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <motion.button
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         onClick={() => window.open(`https://wa.me/91${WHATSAPP_NUMBER}`, '_blank')}
         className="fixed bottom-8 right-8 z-[40] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform md:w-16 md:h-16 active:scale-90"
      >
        <MessageCircle size={32} />
      </motion.button>
    </div>
  );
}
