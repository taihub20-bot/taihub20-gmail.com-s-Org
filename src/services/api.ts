import { Product, Order, User } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  register: async (details: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  createProduct: async (product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return res.json();
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return res.json();
  },

  deleteProduct: async (id: string) => {
    await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
    return res.json();
  },

  createOrder: async (order: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return res.json();
  },

  updateOrderStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Staff
  getStaff: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/staff`, { headers: getHeaders() });
    return res.json();
  },

  addStaff: async (staff: any) => {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(staff),
    });
    return res.json();
  },

  // Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
    return res.json();
  },

  getAdminCustomers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/customers`, { headers: getHeaders() });
    return res.json();
  },

  getAdminTransactions: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/transactions`, { headers: getHeaders() });
    return res.json();
  }
};
