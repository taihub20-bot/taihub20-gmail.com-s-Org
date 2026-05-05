import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Package, MapPin, Phone, Settings, 
  ChevronRight, LogOut, Clock, CheckCircle, Truck, Utensils,
  Search, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Order, User, OrderStatus } from '../types';

interface CustomerProfileProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function CustomerProfile({ user, onLogout, onNavigate }: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'tracking'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const o = await api.getOrders();
      const ordersData = Array.isArray(o) ? o : [];
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Preparing': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Out for Delivery': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Accepted': return <CheckCircle size={16} />;
      case 'Preparing': return <Utensils size={16} />;
      case 'Out for Delivery': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-6">
             <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#5D4037] rounded-full flex items-center justify-center text-[#FFD700] mb-4 text-3xl font-black shadow-lg border-4 border-[#FFD700]/20">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-[#5D4037]">{user.name}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{user.phone}</p>
             </div>
             
             <div className="mt-8 space-y-2">
                {[
                  { id: 'profile', label: 'My Profile', icon: <UserIcon size={18} /> },
                  { id: 'history', label: 'Order History', icon: <Package size={18} /> },
                  { id: 'tracking', label: 'Live Tracking', icon: <Search size={18} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      activeTab === tab.id 
                      ? 'bg-[#5D4037] text-[#FFD700] shadow-xl shadow-brown-100' 
                      : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       {tab.icon}
                       {tab.label}
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
                
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all mt-4"
                >
                   <LogOut size={18} />
                   Logout Access
                </button>
             </div>
          </div>

          <div className="bg-[#FFD700] p-6 rounded-[32px] shadow-sm relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('home')}>
             <div className="relative z-10">
                <h4 className="font-black text-[#5D4037] uppercase text-xs tracking-widest mb-1">Hungry for more?</h4>
                <p className="text-[10px] text-[#5D4037]/70 font-bold leading-tight">Return to menu and explore indigenous Tai flavours.</p>
             </div>
             <Utensils className="absolute -bottom-2 -right-2 text-[#5D4037]/10 w-20 h-20 group-hover:scale-110 transition-transform" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
               <h3 className="text-3xl font-black text-[#5D4037] mb-8">Personal Records</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                           {user.name}
                           <Settings size={14} className="text-gray-300" />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Login Email</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700">
                           {user.email}
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Address</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700 min-h-[100px]">
                           {user.address || 'Address not registered yet.'}
                        </div>
                     </div>
                     <button className="w-full py-4 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brown-100 active:scale-95 transition-all">
                        Update Credentials
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-3xl font-black text-[#5D4037]">Culinary Journey</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total {orders.length} Orders</span>
               </div>
               
               <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Order Ref: {order.id}</p>
                                <p className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                             <p className="text-2xl font-black text-[#5D4037]">₹{order.total}</p>
                          </div>
                       </div>
                       
                       <div className="p-6 bg-gray-50/50">
                          <div className="flex flex-wrap gap-2">
                             {order.items.map((item, i) => (
                               <span key={i} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-600">
                                  {item.quantity}x {item.name}
                               </span>
                             ))}
                          </div>
                          <div className="mt-6 flex justify-between items-center">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                                {order.status}
                             </span>
                             <button className="flex items-center gap-2 text-xs font-black text-[#5D4037] uppercase tracking-widest hover:underline">
                                Details <ExternalLink size={14} />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                       <Package size={48} className="mx-auto mb-4 text-gray-200" />
                       <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Your history is currently empty.</p>
                       <button onClick={() => onNavigate('home')} className="mt-6 px-8 py-3 bg-[#5D4037] text-[#FFD700] rounded-xl font-black text-xs uppercase tracking-widest">Order Now</button>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <h3 className="text-3xl font-black text-[#5D4037]">Live Surveillance</h3>
               {orders.filter(o => o.status !== 'Delivered').map(order => (
                 <div key={order.id} className="bg-[#5D4037] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full blur-[100px] opacity-10 translate-x-32 -translate-y-32" />
                    
                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-10">
                          <div>
                             <p className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-1">Active Shipment</p>
                             <h4 className="text-2xl font-black">Ref: {order.id}</h4>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                             <p className="text-xl font-black text-[#FFD700]">20-30 Min</p>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center mb-10 relative">
                          <div className="absolute left-0 right-0 h-1 bg-white/10 top-1/2 -translate-y-1/2" />
                          <div 
                            className="absolute left-0 h-1 bg-[#FFD700] top-1/2 -translate-y-1/2 transition-all duration-1000" 
                            style={{ width: `${(orders.indexOf(order) + 1) * 25}%` }}
                          />
                          
                          {[
                            { s: 'Pending', i: <Clock size={16} /> },
                            { s: 'Accepted', i: <CheckCircle size={16} /> },
                            { s: 'Preparing', i: <Utensils size={16} /> },
                            { s: 'Out for Delivery', i: <Truck size={16} /> },
                            { s: 'Delivered', i: <CheckCircle size={16} /> }
                          ].map((step, idx) => {
                             const isPast = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= idx;
                             return (
                               <div key={idx} className="relative z-20 flex flex-col items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPast ? 'bg-[#FFD700] text-[#5D4037] scale-110' : 'bg-gray-700 text-gray-500'}`}>
                                     {step.i}
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                       
                       <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[#FFD700] rounded-2xl flex items-center justify-center text-[#5D4037]">
                                <Utensils size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-black uppercase tracking-widest">{order.status}</p>
                                <p className="text-[10px] font-bold text-gray-400">Our indigenous kitchen is hard at work.</p>
                             </div>
                          </div>
                          <button className="px-6 py-3 bg-white text-[#5D4037] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                             Support Chat
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
               {orders.filter(o => o.status !== 'Delivered').length === 0 && (
                  <div className="p-20 text-center bg-gray-50 rounded-[40px] border border-gray-100">
                     <Search size={48} className="mx-auto mb-4 text-gray-200" />
                     <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No active shipments in transit.</p>
                  </div>
               )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
