import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Package, Users, Plus, Edit, Trash2, CheckCircle, 
  Clock, Truck, ChefHat, Search, Filter, Shield, Lock, AlertCircle,
  MapPin, Phone, Utensils, MessageCircle, DollarSign, User as UserIcon,
  LogOut, Camera, Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Product, User, OrderStatus } from '../types';

interface DashboardProps {
  user: User;
  onProductUpdate?: () => void;
}

export default function Dashboard({ user, onProductUpdate }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState<'stats' | 'orders' | 'products' | 'staff' | 'customers' | 'transactions'>(isAdmin ? 'stats' : 'orders');
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0, customerCount: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'Traditional',
    isTodaysSpecial: false,
    isBestSeller: false
  });
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [] as string[]
  });

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addStaff({
        ...staffFormData
      });
      setShowStaffForm(false);
      setStaffFormData({ name: '', email: '', password: '', permissions: [] });
      fetchData();
    } catch (err) {
      alert('Failed to save staff member');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          ...productFormData,
          price: Number(productFormData.price)
        });
      } else {
        await api.createProduct({
          ...productFormData,
          price: Number(productFormData.price),
          isAvailable: true
        });
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ 
        name: '', 
        price: '', 
        description: '', 
        image: '', 
        category: 'Traditional',
        isTodaysSpecial: false,
        isBestSeller: false
      });
      fetchData();
      if (onProductUpdate) onProductUpdate();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductFormData({ ...productFormData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendWhatsAppStatus = (order: Order) => {
    const itemsList = order.items.map(item => `- ${item.name} x${item.quantity}`).join('\n');
    const text = `*Tai Hub - ORDER UPDATE*\n\nHello *${order.customerName}*,\n\nYour order *#${order.id.slice(0, 8).toUpperCase()}* is now: *${order.status.toUpperCase()}*\n\n*Items:*\n${itemsList}\n\n*Total:* ₹${order.total}\n\n----------------\nThank you for choosing Tai Hub Traditional Kitchen!\n_Click to reply or ask for help_`;
    window.open(`https://wa.me/91${order.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const canModifyProducts = isAdmin || user.permissions.includes('edit_products') || user.permissions.includes('add_products');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [s, o, p] = await Promise.all([
        isAdmin || user.permissions.includes('view_stats') ? api.getStats() : Promise.resolve(null),
        api.getOrders(),
        api.getProducts()
      ]);
      if (s) setStats(s);
      const ordersData = Array.isArray(o) ? o : [];
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProducts(Array.isArray(p) ? p : []);
      
      if (isAdmin) {
        const [staffData, customerData, transactionData] = await Promise.all([
          api.getStaff(),
          api.getAdminCustomers(),
          api.getAdminTransactions()
        ]);
        setStaff(Array.isArray(staffData) ? staffData : []);
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setTransactions(Array.isArray(transactionData) ? transactionData : []);
      }
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      fetchData();
      if (onProductUpdate) onProductUpdate();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(search.toLowerCase()) || 
    o.id.includes(search)
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[#FFD700] border-t-[#5D4037] rounded-full animate-spin" />
      <p className="font-bold text-[#5D4037]">Authenticating Tai Hub Portal...</p>
    </div>
  );

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full">
      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowProductForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-[80px] opacity-10 translate-x-10 -translate-y-10" />
               <h3 className="text-3xl font-black text-[#5D4037] mb-6 flex items-center gap-3">
                 <ChefHat size={32} className="text-[#FFD700]" />
                 {editingProduct ? 'Update Dish' : 'New Creation'}
               </h3>
               
               <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dish Name</label>
                      <input 
                        type="text" required 
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold"
                        value={productFormData.name}
                        onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <input 
                        type="number" required 
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold"
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Photo (Upload Image)</label>
                    <div className="relative group">
                      <div 
                        className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden relative ${
                          productFormData.image ? 'border-transparent' : 'border-gray-200 bg-gray-50 hover:border-[#FFD700] hover:bg-[#FFD700]/5'
                        }`}
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        {productFormData.image ? (
                          <>
                            <img src={productFormData.image} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                               <Camera size={24} />
                               <span className="text-[10px] font-black uppercase tracking-widest mt-2">Change Photo</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                              <Camera size={24} />
                            </div>
                            <div className="text-center">
                               <p className="text-xs font-black text-[#5D4037] uppercase tracking-widest">Select Image File</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">PNG, JPG up to 2MB</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input 
                        id="product-image-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      required rows={3}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold resize-none"
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setProductFormData({...productFormData, isTodaysSpecial: !productFormData.isTodaysSpecial})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        productFormData.isTodaysSpecial 
                        ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]' 
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      Today's Special
                    </button>
                    <button 
                      type="button"
                      onClick={() => setProductFormData({...productFormData, isBestSeller: !productFormData.isBestSeller})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        productFormData.isBestSeller 
                        ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#B8860B]' 
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      Best Seller
                    </button>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                      type="button" onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="flex-1 py-4.5 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                      type="submit"
                      className="flex-[2] py-4.5 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                     >
                       {editingProduct ? 'Save Changes' : 'Add to Menu'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Staff Form Modal */}
      <AnimatePresence>
        {showStaffForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowStaffForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-[80px] opacity-10 translate-x-10 -translate-y-10" />
               <h3 className="text-3xl font-black text-[#5D4037] mb-6 flex items-center gap-3">
                 <Users size={32} className="text-[#FFD700]" />
                 Recruit Staff
               </h3>
               
               <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold"
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Staff Email (Login ID)</label>
                    <input 
                      type="email" required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Pass</label>
                    <input 
                      type="password" required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] outline-none font-bold"
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Permissions</label>
                    <div className="flex flex-wrap gap-2">
                      {['manage_orders', 'edit_products', 'view_stats'].map(perm => (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => {
                            const newPerms = staffFormData.permissions.includes(perm)
                              ? staffFormData.permissions.filter(p => p !== perm)
                              : [...staffFormData.permissions, perm];
                            setStaffFormData({...staffFormData, permissions: newPerms});
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            staffFormData.permissions.includes(perm)
                            ? 'bg-[#5D4037] text-[#FFD700]'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {perm.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                      type="button" onClick={() => setShowStaffForm(false)}
                      className="flex-1 py-4.5 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                      type="submit"
                      className="flex-[2] py-4.5 bg-[#5D4037] text-[#FFD700] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                     >
                       Confirm Staff
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="p-4 bg-[#5D4037] text-[#FFD700] rounded-2xl mb-4 shadow-lg">
             <p className="text-xs font-bold uppercase opacity-60 mb-1 tracking-widest">Logged in as</p>
             <h4 className="font-black text-lg">{user.name}</h4>
             <span className="inline-block mt-2 px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-black uppercase">
               {user.role}
             </span>
          </div>

          {[
            ...(isAdmin || user.permissions.includes('view_stats') ? [{ id: 'stats', label: 'Overview', icon: <BarChart3 size={20} className="md:w-[18px] md:h-[18px]" /> }] : []),
            { id: 'orders', label: 'Order Feed', icon: <Package size={20} className="md:w-[18px] md:h-[18px]" /> },
            ...(isAdmin || user.permissions.includes('edit_products') ? [{ id: 'products', label: 'Menu List', icon: <Utensils size={20} className="md:w-[18px] md:h-[18px]" /> }] : []),
            ...(isAdmin ? [
              { id: 'staff', label: 'Employees', icon: <Users size={20} className="md:w-[18px] md:h-[18px]" /> },
              { id: 'customers', label: 'Customers', icon: <UserIcon size={20} className="md:w-[18px] md:h-[18px]" /> },
              { id: 'transactions', label: 'Finance', icon: <DollarSign size={20} className="md:w-[18px] md:h-[18px]" /> }
            ] : [])
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
                tab === item.id ? 'bg-[#FFD700] text-[#3E2723] shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} className="md:w-[18px] md:h-[18px]" />
              Logout Session
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center justify-between shadow-sm border border-red-100">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
                  <span className="text-sm">Connection Issue: {error}</span>
               </div>
               <button 
                 onClick={() => { setLoading(true); fetchData(); }}
                 className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-[#5D4037] text-white rounded-xl hover:bg-[#3E2723]"
               >
                 Retry Connection
               </button>
            </div>
          )}
          {tab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Sales', val: stats.totalOrders || 0, color: 'bg-blue-50 text-blue-600', sub: 'Orders' },
                  { label: 'Total Revenue', val: stats.totalRevenue !== undefined ? `₹${stats.totalRevenue}` : '₹0', color: 'bg-emerald-50 text-emerald-600', sub: 'Sales' },
                  { label: 'Active Tasks', val: stats.pendingOrders || 0, color: 'bg-amber-50 text-amber-600', sub: 'Kitchen' },
                  { label: 'Users Count', val: stats.customerCount || 0, color: 'bg-indigo-50 text-indigo-600', sub: 'Customers' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{stat.label}</span>
                    <div className="flex items-end gap-3">
                      <span className="text-[17px] leading-[35px] font-black text-[#5D4037]">{stat.val ?? 0}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg mb-1 leading-none ${stat.color}`}>{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recent Transactions Preview for Admin */}
              {isAdmin && (
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                   <h3 className="text-xl font-black text-[#5D4037] mb-6 flex items-center gap-2">
                     <DollarSign size={20} className="text-[#FFD700]" />
                     Recent Ledger Entries
                   </h3>
                   <div className="space-y-3">
                      {transactions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2E7D32]">
                                 <Plus size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-gray-800">{t.orderId}</p>
                                 <p className="text-[10px] text-gray-400 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <span className="font-black text-[#2E7D32]">₹{t.amount}</span>
                        </div>
                      ))}
                      {transactions.length === 0 && <p className="text-center py-10 text-gray-400 font-bold uppercase text-[10px] tracking-widest">No transactions recorded yet</p>}
                   </div>
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                <h3 className="text-xl font-black text-[#5D4037]">Live Order Feed</h3>
                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                    type="text" 
                    placeholder="Search by name or ID..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-[#FFD700]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
              </div>

              <div className="space-y-4">
                 {filteredOrders.map(order => (
                   <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Order ID: {order.id.slice(0,8)}</p>
                          <h4 className="font-black text-gray-800">{order.customerName}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="p-4 grid md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <div className="flex items-start gap-3">
                               <MapPin size={16} className="text-[#5D4037] shrink-0 mt-1" />
                               <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                                  <p className="text-sm font-medium">{order.address}</p>
                                  {order.location && <p className="text-xs text-[#2E7D32] font-semibold mt-1 italic">📍 {order.location}</p>}
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <Phone size={16} className="text-[#5D4037] shrink-0 mt-1" />
                               <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase">Contact</p>
                                  <a href={`tel:${order.phone}`} className="text-sm font-bold text-blue-600 underline">0{order.phone}</a>
                               </div>
                            </div>
                         </div>
                         
                         <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Order Items</p>
                            <div className="space-y-4">
                               {order.items.map((item, i) => {
                                 const product = products.find(p => p.id === item.productId);
                                 return (
                                   <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                         {product?.image ? (
                                           <img src={product.image} className="w-full h-full object-cover" alt={item.name} />
                                         ) : (
                                           <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                              <Utensils size={20} />
                                           </div>
                                         )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <p className="text-sm font-black text-[#5D4037] truncate">{item.name}</p>
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity} • ₹{item.price}/ea</p>
                                      </div>
                                      <span className="font-black text-[#2E7D32] text-sm">₹{item.price * item.quantity}</span>
                                   </div>
                                 );
                               })}
                               <div className="mt-2 pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                                  <span className="font-black text-[#2E7D32] text-xs uppercase tracking-widest">Grand Total</span>
                                  <span className="font-black text-xl text-[#2E7D32]">₹{order.total}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                       <div className="px-4 py-3 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-4">
                         <div className="flex flex-wrap gap-2 flex-1">
                           <p className="w-full text-[10px] font-black text-gray-400 uppercase mb-1">Status Control:</p>
                           {(['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map(s => (
                             <button
                               key={s}
                               onClick={() => handleUpdateStatus(order.id, s)}
                               disabled={order.status === s}
                               className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                 order.status === s 
                                 ? 'bg-[#5D4037] text-white' 
                                 : 'bg-white text-[#5D4037] border-2 border-gray-100 hover:border-[#FFD700] active:scale-95'
                               }`}
                             >
                               {s}
                             </button>
                           ))}
                         </div>
                         <button 
                          onClick={() => sendWhatsAppStatus(order)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white rounded-xl font-black text-xs hover:bg-[#128C7E] shadow-lg active:scale-95 transition-all"
                         >
                            <MessageCircle size={16} />
                            UPDATE VIA WHATSAPP
                         </button>
                      </div>
                   </div>
                 ))}
                 {filteredOrders.length === 0 && (
                   <div className="p-20 text-center text-gray-400">
                     <Package size={48} className="mx-auto mb-4 opacity-20" />
                     <p className="font-bold uppercase tracking-widest text-sm">No orders found matching your search</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-[#5D4037]">Menu Manager</h3>
                    <p className="text-sm text-gray-400">Total {products.length} items active</p>
                  </div>
                  {canModifyProducts && (
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setProductFormData({ name: '', price: '', description: '', image: '', category: 'Traditional' });
                        setShowProductForm(true);
                      }}
                      className="px-6 py-3 bg-[#2E7D32] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#1B5E20] shadow-lg shadow-green-200"
                    >
                      <Plus size={20} />
                      Add Item
                    </button>
                  )}
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                       <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                             <span className="text-white font-black text-xl">₹{product.price}</span>
                          </div>
                       </div>
                       <h4 className="font-bold text-gray-800 mb-1">{product.name}</h4>
                       <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
                       <div className="flex gap-2">
                         {canModifyProducts && (
                           <button 
                             onClick={() => {
                               setEditingProduct(product);
                               setProductFormData({
                                 name: product.name,
                                 price: product.price.toString(),
                                 description: product.description,
                                 image: product.image,
                                 category: product.category || 'Traditional',
                                 isTodaysSpecial: product.isTodaysSpecial || false,
                                 isBestSeller: product.isBestSeller || false
                               });
                               setShowProductForm(true);
                             }}
                             className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200"
                           >
                             <Edit size={14} /> Edit
                           </button>
                         )}
                         {isAdmin && (
                           <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                           >
                             <Trash2 size={16} />
                           </button>
                         )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {tab === 'staff' && isAdmin && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-[#5D4037]">Staff Members</h3>
                  <button 
                    onClick={() => setShowStaffForm(true)}
                    className="px-6 py-3 bg-[#5D4037] text-[#FFD700] rounded-xl font-bold flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Staff
                  </button>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-[#5D4037] text-[#FFD700]">
                         <tr>
                           <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Member</th>
                           <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Email</th>
                           <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Permissions</th>
                           <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {staff.map(s => (
                           <tr key={s.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 font-bold text-gray-800">{s.name}</td>
                             <td className="px-6 py-4 text-sm text-gray-500 font-medium">{s.email}</td>
                             <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                   {s.permissions.map(p => (
                                     <span key={p} className="px-2 py-0.5 bg-green-50 text-[#2E7D32] text-[10px] font-black uppercase rounded-full">
                                       {p.replace('_', ' ')}
                                     </span>
                                   ))}
                                   {s.permissions.length === 0 && <span className="text-xs text-gray-300 italic">None</span>}
                                </div>
                             </td>
                             <td className="px-6 py-4">
                               <button className="text-red-500 hover:text-red-700">
                                 <Trash2 size={18} />
                               </button>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>
          )}

          {tab === 'customers' && isAdmin && (
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-[#5D4037]">Customer Directory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {customers.map(c => (
                     <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#5D4037]">
                              <UserIcon size={24} />
                           </div>
                           <div>
                              <h4 className="font-black text-gray-800">{c.name}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.phone}</p>
                           </div>
                        </div>
                        <div className="space-y-2 border-t pt-4">
                           <p className="text-xs text-gray-500 flex items-center gap-2"><MapPin size={12} /> {c.address || 'No address set'}</p>
                           <p className="text-xs text-gray-500 flex items-center gap-2">📧 {c.email}</p>
                        </div>
                     </div>
                   ))}
                </div>
            </div>
          )}

          {tab === 'transactions' && isAdmin && (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-3xl font-black text-[#5D4037] tracking-tighter">FINANCE RECORD</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                         <span className="text-[8px] font-black uppercase tracking-widest">LIVE</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Real-time Transaction Monitoring</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Today's Revenue</p>
                       <p className="text-xl font-black text-[#2E7D32]">₹{transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((acc, t) => acc + t.amount, 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#5D4037] p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-[80px] opacity-20 -translate-y-10 translate-x-10" />
                    <DollarSign className="text-[#FFD700] mb-4 opacity-50" size={32} />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Lifetime Collection</p>
                    <h4 className="text-4xl font-black text-[#FFD700]">₹{stats.totalRevenue}</h4>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sales Velocity</p>
                        <h4 className="text-2xl font-black text-gray-800">{transactions.length} Units</h4>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full w-[65%]" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest leading-none">+12% from last week</p>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AOV (Average Order)</p>
                        <h4 className="text-2xl font-black text-gray-800">₹{transactions.length > 0 ? Math.round(stats.totalRevenue / transactions.length) : 0}</h4>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-amber-600 h-full w-[45%]" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest leading-none">Consistent High Margin</p>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-[0_32px_64px_-16px_rgba(93,64,55,0.05)]">
                   <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                     <h4 className="text-lg font-black text-[#5D4037] flex items-center gap-2">
                        <BarChart3 size={20} className="text-[#FFD700]" />
                        Transaction Ledger
                        {loading && <div className="w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />}
                     </h4>
                     <div className="flex items-center gap-4">
                       <button 
                        onClick={() => fetchData()}
                        className="text-[10px] font-black text-[#2E7D32] uppercase tracking-widest hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
                       >
                        Refresh Now
                       </button>
                       <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#5D4037] transition-colors">Export CSV</button>
                     </div>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                           <tr>
                              <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400">Time & Date</th>
                              <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400">Order ID</th>
                              <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400">Ref Code</th>
                              <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400">Platform</th>
                              <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400 text-right">Settlement</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {transactions.map(t => (
                             <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                   <p className="text-xs font-black text-gray-800">{new Date(t.date).toLocaleDateString()}</p>
                                   <p className="text-[10px] text-gray-400 font-bold">{new Date(t.date).toLocaleTimeString()}</p>
                                </td>
                                <td className="px-8 py-5 font-black text-[#5D4037] text-sm">{t.orderId}</td>
                                <td className="px-8 py-5 text-[10px] font-mono text-gray-400 group-hover:text-[#FFD700] transition-colors">#{t.id.slice(0,8).toUpperCase()}</td>
                                <td className="px-8 py-5">
                                  <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.method}</span>
                                </td>
                                <td className="px-8 py-5 text-right font-black text-[#2E7D32] text-lg">+₹{t.amount}</td>
                             </tr>
                           ))}
                           {transactions.length === 0 && (
                             <tr>
                               <td colSpan={5} className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center gap-4 opacity-20">
                                   <DollarSign size={48} />
                                   <p className="font-black uppercase tracking-widest text-xs">No transactions recorded yet</p>
                                 </div>
                               </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                   </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
