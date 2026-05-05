import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TrackOrder from './components/TrackOrder';
import CustomerProfile from './components/CustomerProfile';
import { api } from './services/api';
import { Product, CartItem, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, MessageCircle } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loginType, setLoginType] = useState<'customer' | 'portal'>('customer');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    // Load products
    loadProducts();
  }, []);

  const loadProducts = async (retries = 3) => {
    try {
      const data = await api.getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load products', err);
      if (retries > 0) {
        setTimeout(() => loadProducts(retries - 1), 2000);
      } else {
        setLoading(false);
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleLoginSuccess = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'customer') {
      setCurrentPage('profile');
    } else if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('staff');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  const navigateToLogin = (type: 'customer' | 'portal' = 'customer') => {
    setLoginType(type);
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} topProducts={products.slice(0, 3)} />;
      case 'menu':
        return <Menu products={products} onAddToCart={addToCart} />;
  case 'login':
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigate={setCurrentPage} 
        hideRegister={loginType === 'portal'} 
        isPortal={loginType === 'portal'} 
      />
    );
      case 'register':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentPage} isRegister />;
      case 'admin':
      case 'staff':
        if (!user || user.role === 'customer') {
          navigateToLogin('portal');
          return null;
        }
        return <Dashboard user={user} onProductUpdate={loadProducts} />;
      case 'profile':
        if (!user) {
          navigateToLogin('customer');
          return null;
        }
        return <CustomerProfile user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
      case 'track':
        return <TrackOrder onBack={() => setCurrentPage('home')} />;
      case 'myorders':
        return <TrackOrder onBack={() => setCurrentPage('home')} customerId={user?.id} />;
      default:
        return <Home onNavigate={setCurrentPage} topProducts={products.slice(0, 3)} />;
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#5D4037]">
         <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#FFD700] border-t-white rounded-full animate-spin" />
            <p className="text-[#FFD700] font-black uppercase tracking-widest text-sm">Tai Hub Traditional Kitchen</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(page) => {
          if (page === 'login') navigateToLogin('customer');
          else {
            if (page === 'menu') loadProducts();
            setCurrentPage(page);
          }
        }}
        currentPage={currentPage}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onPlaceOrder={async (details) => {
          const order = await api.createOrder(details);
          setCart([]);
          return order;
        }}
        onNavigate={(page) => {
          if (page === 'login') navigateToLogin('customer');
          else {
            if (page === 'menu') loadProducts();
            setCurrentPage(page);
          }
        }}
        user={user}
      />

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4 mt-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5D4037] flex items-center justify-center text-[#FFD700] font-black text-xl shadow-lg rotate-3 ring-4 ring-[#FFD700]/10">TH</div>
                <div>
                  <h4 className="font-extrabold text-xl text-[#5D4037]">Tai Hub</h4>
                  <p className="text-[10px] text-[#2E7D32] font-black uppercase tracking-[0.2em]">Traditional Kitchen</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-xs text-center md:text-left italic">
                Preserving the ancestral culinary heritage of the Tai Khamyang community with every dish we prepare.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
               <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  <button onClick={() => setCurrentPage('home')} className="hover:text-[#5D4037] transition-colors border-b-2 border-transparent hover:border-[#FFD700]">Home</button>
                  <button onClick={() => setCurrentPage('menu')} className="hover:text-[#5D4037] transition-colors border-b-2 border-transparent hover:border-[#FFD700]">Menu</button>
                  <button onClick={() => setCurrentPage('track')} className="hover:text-[#5D4037] transition-colors border-b-2 border-transparent hover:border-[#FFD700]">Track Order</button>
                  {user?.role === 'customer' && (
                    <button onClick={() => setCurrentPage('myorders')} className="text-[#2E7D32] hover:text-[#1B5E20] transition-colors border-b-2 border-transparent hover:border-[#FFD700]">My Orders</button>
                  )}
               </div>
               
                <div className="pt-8 border-t border-gray-100 w-full flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => navigateToLogin('portal')} 
                      className="text-[10px] bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl hover:bg-[#5D4037] hover:text-[#FFD700] transition-all font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-gray-200 active:scale-95"
                    >
                      <ShieldCheck size={14} />
                      Staff Dashboard
                    </button>
                    <button 
                      onClick={() => navigateToLogin('portal')} 
                      className="text-[10px] bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl hover:bg-[#FFD700] hover:text-[#5D4037] transition-all font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-gray-200 active:scale-95"
                    >
                      <Lock size={14} />
                      System Console
                    </button>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2026 Authentic Thai Flavours</p>
                    <p className="text-[9px] text-gray-300 font-medium mt-1">Ecosystem Infrastructure v2.4.0</p>
                  </div>
                </div>
            </div>
         </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/916901543900" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-3 bg-white text-[#128C7E] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#25D366]/20">
          Chat with us
        </span>
      </a>
    </div>
  );
}
