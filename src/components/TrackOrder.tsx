import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Clock, Utensils, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

interface TrackOrderProps {
  onBack: () => void;
  customerId?: string;
}

export default function TrackOrder({ onBack, customerId }: TrackOrderProps) {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerId) {
      loadCustomerOrders();
    }
  }, [customerId]);

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const orders = await api.getOrders();
      const ordersData = Array.isArray(orders) ? orders : [];
      setCustomerOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError('Order not found. Please check your ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps: { status: OrderStatus; icon: any; label: string }[] = [
    { status: 'Pending', icon: <Package size={20} className="md:w-6 md:h-6" />, label: 'Order Received' },
    { status: 'Accepted', icon: <Clock size={20} className="md:w-6 md:h-6" />, label: 'Accepted' },
    { status: 'Preparing', icon: <Utensils size={20} className="md:w-6 md:h-6" />, label: 'In Kitchen' },
    { status: 'Out for Delivery', icon: <Truck size={20} className="md:w-6 md:h-6" />, label: 'On the Way' },
    { status: 'Delivered', icon: <CheckCircle size={20} className="md:w-6 md:h-6" />, label: 'Delivered' }
  ];

  const currentStepIndex = order ? steps.findIndex(s => s.status === order.status) : -1;

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto w-full min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
             <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-black text-[#5D4037]">
            {customerId ? 'My Orders' : 'Track Your Order'}
          </h2>
        </div>

        {!customerId && (
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Paste your Order ID here..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#FFD700] transition-colors shadow-sm text-lg font-bold text-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black hover:bg-[#3E2723] transition-colors shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'TRACK'}
            </button>
          </form>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold flex items-center gap-3">
             <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
             {error}
          </div>
        )}

        {customerId && customerOrders.length > 0 && !order && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Your Recent History</h3>
            <div className="space-y-3">
              {customerOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOrder(o)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#fcf8f2] rounded-3xl transition-all border border-gray-100 shadow-sm hover:shadow-md group"
                >
                  <div className="text-left flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#5D4037] group-hover:bg-white transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="font-black text-[#5D4037] text-lg uppercase tracking-tight">{o.id}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ring-1 ${
                      o.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-100' : 
                      o.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-amber-100' : 
                      'bg-brown-50 text-brown-700 ring-brown-100'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {order && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-50 flex flex-col gap-10"
          >
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Report for</p>
                  <h3 className="text-2xl font-black text-[#3E2723]">{order.customerName}</h3>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">ID: {order.id}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-bold text-gray-400">TOTAL PAID</p>
                  <p className="text-3xl font-black text-[#2E7D32]">₹{order.total}</p>
               </div>
            </div>

            {/* Stepper */}
            <div className="relative pl-4">
              <div className="absolute left-6 top-8 bottom-8 w-1.5 bg-gray-100 rounded-full" />
              <div 
                className="absolute left-6 top-8 w-1.5 bg-[#2E7D32] transition-all duration-1000 rounded-full" 
                style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
              
              <div className="space-y-8 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={step.status} className="flex items-center gap-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                        isCompleted 
                        ? 'bg-[#2E7D32] border-[#2E7D32] text-white' 
                        : 'bg-white border-gray-100 text-gray-300 shadow-none'
                      } ${isCurrent ? 'ring-8 ring-[#2E7D32]/10 scale-110' : ''}`}>
                        {React.cloneElement(step.icon, { size: 24 })}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-black uppercase tracking-[0.15em] text-sm ${isCompleted ? 'text-[#3E2723]' : 'text-gray-300'}`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                           <p className="text-xs text-[#2E7D32] font-black mt-1 bg-green-50 px-3 py-1 rounded-lg inline-block">OUR CHEFS ARE ACTIVE HERE</p>
                        )}
                        {!isCompleted && !isCurrent && (
                           <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1">Pending kitchen action</p>
                        )}
                        {isCompleted && !isCurrent && (
                           <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                             <CheckCircle size={10} /> Completed
                           </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Footprint</p>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-600 space-y-1">
                <p>{order.location}</p>
                <p className="text-gray-400 text-xs">{order.address}</p>
              </div>
            </div>

            <div className="flex gap-4">
              {customerId && (
                <button 
                  onClick={() => setOrder(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all text-xs uppercase tracking-widest"
                >
                  Return to History
                </button>
              )}
              <div className="p-4 bg-[#fcf8f2] rounded-2xl border border-[#5D4037]/10 italic text-xs text-[#5D4037]/60 text-center flex-1">
                 "Traditional food is worth the wait. Every dish tells a story."
              </div>
            </div>
          </motion.div>
        )}

        {customerId && customerOrders.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Utensils size={40} className="text-gray-200" />
             </div>
             <p className="text-gray-400 font-black uppercase tracking-widest mb-6">No kitchen history found</p>
             <button 
               onClick={onBack}
               className="px-10 py-4 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brown-200 hover:scale-105 transition-transform"
             >
               Start Your Journey
             </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
