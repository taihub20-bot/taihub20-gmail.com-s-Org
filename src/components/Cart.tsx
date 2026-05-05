import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBasket, MapPin, Phone, User as UserIcon, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { CartItem, Product, User } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: (details: any) => Promise<any>;
  onNavigate: (page: string) => void;
  user: User | null;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onPlaceOrder, onNavigate, user }: CartProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [lastOrderId, setLastOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        phone: (user as any).phone || '',
        address: (user as any).address || '',
      }));
    }
  }, [user]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Check if user is logged in to attach customerId
    const storedUser = localStorage.getItem('user');
    const customerId = storedUser ? JSON.parse(storedUser).id : undefined;

    const orderDetails = {
      customerId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      location: formData.location,
      items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      total: total
    };

    try {
      const order = await onPlaceOrder(orderDetails);
      setLastOrderId(order.id);
      
      // WhatsApp Integration
      const itemDetails = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
      const halfTotal = total / 2;
      const text = `*New Order: ${order.id}*\n*Items:* ${itemDetails}\n*Total:* ₹${total}\n*Pay 50% for Confirmation (Half Payment):* ₹${halfTotal}\n*UPI ID:* taihub20@okhdfcbank\n*Delivery to:* ${formData.address}\n\n_Please send the payment screenshot for faster confirmation._`;
      const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      
      setStep('success');
      window.open(whatsappUrl, '_blank');
      setFormData({ name: '', phone: '', address: '', location: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 m-auto h-fit w-full max-w-sm bg-white z-[101] rounded-[40px] shadow-2xl p-10 text-center space-y-6">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                  <CheckCircle size={50} className="text-green-600" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-[#5D4037]">Delicious!</h2>
                 <p className="text-gray-400 font-bold">Your order is being prepared.</p>
               </div>
               <div className="bg-[#fcf8f2] p-6 rounded-3xl border-2 border-dashed border-[#5D4037]/10 flex flex-col items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tracking Code</p>
                    <p className="text-4xl font-black text-[#5D4037]">{lastOrderId}</p>
                  </div>
                  
                  <div className="w-full h-px bg-[#5D4037]/10 my-2" />
                  
                  <div className="space-y-4 w-full">
                     <p className="text-[11px] font-black text-[#2E7D32] uppercase tracking-[0.15em]">Pay 50% (₹{total / 2}) to Confirm</p>
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
                        <img 
                          src="/payment_qr.jpg" 
                          alt="Payment QR" 
                          className="w-48 h-48 object-contain rounded-lg shadow-inner"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Scan+to+Pay';
                          }}
                        />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">UPI ID</p>
                          <p className="text-xs font-black text-[#5D4037]">taihub20@okhdfcbank</p>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                       <button 
                        onClick={() => {
                          const halfTotal = total / 2;
                          const itemDetails = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                          const text = `*Payment Confirmation*\n*Order ID:* ${lastOrderId}\n*Total:* ₹${total}\n*Paid 50%:* ₹${halfTotal}\n\n_I have made the payment. Please confirm my order._`;
                          window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="py-3 px-4 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 font-bold"
                       >
                         <Phone size={14} />
                         Send Receipt
                       </button>
                       <p className="text-[9px] text-gray-400 font-medium italic text-center">Your order will be accepted after verification.</p>
                     </div>
                  </div>
               </div>
               <button 
                onClick={() => {
                  onClose();
                  setTimeout(() => setStep('cart'), 500);
                }} 
                className="w-full py-4 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-all shadow-xl shadow-brown-100"
               >
                 Back to Kitchen
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center bg-[#5D4037] text-[#FFD700]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBasket size={24} className="md:w-7 md:h-7" />
                {step === 'cart' ? 'Your Cart' : 'Checkout Details'}
              </h2>
              <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full active:scale-90">
                <X size={24} className="md:w-7 md:h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {step === 'cart' ? (
                items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <ShoppingBasket size={64} strokeWidth={1} />
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <button 
                      onClick={onClose}
                      className="text-[#2E7D32] font-bold underline"
                    >
                      Browse our menu
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-gray-800 leading-tight">{item.name}</h4>
                            <p className="text-[#2E7D32] font-bold mt-1">₹{item.price}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-4 bg-white border-2 border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
                              <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1.5 text-gray-400 hover:text-[#5D4037] active:scale-90">
                                <Minus size={18} strokeWidth={3} />
                              </button>
                              <span className="text-base font-black w-6 text-center text-[#5D4037]">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1.5 text-gray-400 hover:text-[#5D4037] active:scale-90">
                                <Plus size={18} strokeWidth={3} />
                              </button>
                            </div>
                            <button onClick={() => onRemove(item.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors active:scale-90">
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name *</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Contact number"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                          required
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street, House No, Area"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Specific Location (optional)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Landmark, Neighborhood"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-2xl font-black text-[#5D4037]">₹{total}</span>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Authenticity starts with you</p>
                     <p className="text-xs text-amber-600 font-medium leading-relaxed">Please login to place your order and track delivery status.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        onClose();
                        onNavigate('login');
                      }}
                      className="w-full py-4.5 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-all shadow-xl shadow-brown-100 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <UserIcon size={18} />
                      Login to Place Order
                    </button>
                    <button 
                      onClick={() => {
                        const itemDetails = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                        const text = `*Inquiry regarding order:*\n*Items:* ${itemDetails}\n*Total:* ₹${total}\n\nCan you help me place this order?`;
                        window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="w-full py-3.5 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-[#128C7E]"
                    >
                      <Phone size={14} />
                      Chat & Order manually
                    </button>
                  </div>
                </div>
              ) : step === 'cart' ? (
                <button
                  disabled={items.length === 0}
                  onClick={() => setStep('checkout')}
                  className="w-full py-4 bg-[#5D4037] text-[#FFD700] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3E2723] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#2E7D32] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1B5E20] transition-all shadow-lg text-lg uppercase tracking-wider"
                  >
                    {loading ? 'Processing...' : (
                      <>
                        Place Order 
                        <Send size={18} />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full py-2 text-gray-500 text-sm font-semibold hover:text-[#5D4037]"
                  >
                    Back to Selection
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
