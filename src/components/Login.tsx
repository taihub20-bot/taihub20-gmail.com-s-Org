import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowRight, ShieldCheck, Phone, MapPin, Mail } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigate: (page: string) => void;
  isRegister?: boolean;
  hideRegister?: boolean;
  isPortal?: boolean;
}

export default function Login({ 
  onLoginSuccess, 
  onNavigate, 
  isRegister = false, 
  hideRegister = false,
  isPortal = false 
}: LoginProps) {
  const [identifier, setIdentifier] = useState(''); // email or phone for login
  const [email, setEmail] = useState(''); // for registration
  const [phone, setPhone] = useState(''); // for registration
  const [address, setAddress] = useState(''); // for registration
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        if (!phone || !name || !address) {
          throw new Error('Please fill all mandatory fields');
        }
        const data = await api.register({ email, phone, address, password, name });
        onLoginSuccess(data.token, data.user);
      } else {
        const data = await api.login({ identifier, password });
        onLoginSuccess(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 flex justify-center items-center min-h-screen bg-[#fcf8f2] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD700]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5D4037]/5 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[50px] shadow-[0_32px_64px_-16px_rgba(93,64,55,0.15)] overflow-hidden border border-white relative z-10"
      >
        <div className="p-12 bg-[#5D4037] text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full blur-[100px] opacity-20 translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2E7D32] rounded-full blur-[80px] opacity-10 -translate-x-10 translate-y-10" />
            
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl rotate-3 ring-8 ring-white/5">
              <ShieldCheck size={40} className="text-[#FFD700]" />
            </div>
            
            <h2 className="text-4xl font-black text-[#FFD700] tracking-tighter leading-none">
              {isPortal ? 'SECURE PORTAL' : (isRegister ? 'JOIN THE HUB' : 'WELCOME BACK')}
            </h2>
            <p className="text-gray-300 text-sm font-bold uppercase tracking-[0.2em] opacity-80">
              {isPortal ? 'Authorized Personnel Only' : (isRegister ? 'Start your culinary journey' : 'Access your member dashboard')}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black text-center border border-red-100 flex items-center gap-3 justify-center"
            >
               <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
               {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {!isRegister ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name or Phone Number</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    required
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter Name or Phone"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      required
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Landmark, City"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {isPortal ? 'System Credentials' : 'Access Pass'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold text-gray-700 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-[24px] font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-0 ${
              isPortal ? 'bg-[#5D4037] text-[#FFD700] hover:bg-[#3E2723]' : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
            }`}
          >
            {loading ? 'Verifying...' : (
              <>
                {isPortal ? 'AUTHORIZE ACCESS' : (isRegister ? 'CREATE ACCOUNT' : 'SECURE LOGIN')}
                <ArrowRight size={24} strokeWidth={3} />
              </>
            )}
          </button>

          <div className="text-center space-y-6 pt-4">
             {!hideRegister && (
               <button
                  type="button"
                  onClick={() => onNavigate(isRegister ? 'login' : 'register')}
                  className="text-sm font-black text-[#5D4037] hover:text-[#2E7D32] transition-colors uppercase tracking-widest border-b-2 border-transparent hover:border-[#FFD700] pb-1"
               >
                  {isRegister ? 'Already have an account? Sign In' : "New here? Register to order"}
               </button>
             )}
             <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.3em] leading-relaxed">
                  Secure Access System v2.0
                </p>
                <div className="w-12 h-1 bg-[#fcf8f2] rounded-full" />
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
