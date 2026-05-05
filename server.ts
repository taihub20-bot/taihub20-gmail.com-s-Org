import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tai-hub-super-secret-key-123';
const DB_FILE = path.join(__dirname, 'db.json');

// Types
interface User {
  id: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  role: 'admin' | 'staff' | 'customer';
  name: string;
  permissions: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isTodaysSpecial?: boolean;
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  type: 'sale' | 'refund';
  date: string;
  method: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  address: string;
  location?: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: User[];
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
}

const initialDb: Database = {
  users: [],
  products: [],
  orders: [],
  transactions: []
};

let dbCache: Database | null = null;

async function getDb(): Promise<Database> {
  if (dbCache) return dbCache;
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    dbCache = JSON.parse(data);
    return dbCache!;
  } catch (error) {
    console.log('Database file not found or invalid, initializing new database');
    dbCache = initialDb;
    await saveDb(dbCache);
    return dbCache;
  }
}

async function saveDb(db: Database) {
  dbCache = db;
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cors());

  // Ensure Developer and Staff accounts can be accessed
  const db = await getDb();
  const developerPhone = '6901543900';
  const developerEmail = 'dev@taihub.com';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('936581', salt);

  let devUser = db.users.find(u => u.phone === developerPhone || u.email === developerEmail);
  
  if (!devUser) {
    db.users.push({
      id: uuidv4(),
      email: developerEmail,
      phone: developerPhone,
      address: 'Developer HQ',
      passwordHash,
      role: 'admin',
      name: 'Developer',
      permissions: ['all']
    });
    await saveDb(db);
    console.log(`Developer account created: ${developerPhone} / 936581`);
  } else {
    // Ensure dev user has admin role and current password
    devUser.passwordHash = passwordHash;
    devUser.role = 'admin';
    devUser.phone = developerPhone;
    devUser.email = developerEmail;
    await saveDb(db);
  }

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or phone
    const db = await getDb();
    const user = db.users.find(u => u.email === identifier || u.phone === identifier || u.name === identifier);

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, permissions: user.permissions }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, phone: user.phone, address: user.address, role: user.role, name: user.name, permissions: user.permissions } });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, phone, address } = req.body;
    const db = await getDb();

    if (db.users.find(u => (email && u.email === email) || (phone && u.phone === phone))) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: uuidv4(),
      email: email || `${phone}@taihub.com`,
      phone: phone || '',
      address: address || '',
      passwordHash,
      role: 'customer',
      name,
      permissions: []
    };

    db.users.push(newUser);
    await saveDb(db);

    const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name, permissions: [] }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, phone: newUser.phone, address: newUser.address, role: newUser.role, name: newUser.name, permissions: [] } });
  });

  // Product Management
  app.get('/api/products', async (req, res) => {
    const db = await getDb();
    res.json(db.products);
  });

  app.post('/api/products', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('add_products')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const db = await getDb();
    const newProduct = { ...req.body, id: uuidv4() };
    db.products.push(newProduct);
    await saveDb(db);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('edit_products')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const db = await getDb();
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });

    db.products[index] = { ...db.products[index], ...req.body };
    await saveDb(db);
    res.json(db.products[index]);
  });

  app.delete('/api/products/:id', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') { // Only admin can delete per requirements
      return res.status(403).json({ message: 'Forbidden' });
    }
    const db = await getDb();
    db.products = db.products.filter(p => p.id !== req.params.id);
    await saveDb(db);
    res.status(204).send();
  });

  // Order Management
  app.get('/api/orders', authenticate, async (req: any, res) => {
    const db = await getDb();
    if (req.user.role === 'customer') {
      const userOrders = db.orders.filter(o => o.customerId === req.user.id);
      return res.json(userOrders);
    }
    res.json(db.orders);
  });

  app.post('/api/orders', async (req, res) => {
    const db = await getDb();
    const newOrder: Order = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    await saveDb(db);
    res.status(201).json(newOrder);
  });

  app.get('/api/orders/:id', async (req, res) => {
    const db = await getDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  });

  app.patch('/api/orders/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const db = await getDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Record transaction when delivered
    if (status === 'Delivered') {
      if (!db.transactions) db.transactions = [];
      const hasTransaction = db.transactions.some(t => t.orderId === order.id);
      if (!hasTransaction) {
        db.transactions.push({
          id: uuidv4(),
          orderId: order.id,
          amount: order.total,
          type: 'sale',
          date: new Date().toISOString(),
          method: 'Online / Cash'
        });
      }
    }

    await saveDb(db);
    res.json(order);
  });

  // Staff Management (Admin only)
  app.get('/api/staff', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const db = await getDb();
    res.json(db.users.filter(u => u.role === 'staff'));
  });

  app.post('/api/staff', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { email, password, name, permissions } = req.body;
    const db = await getDb();
    
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newStaff: User = {
      id: uuidv4(),
      email,
      phone: '',
      address: '',
      passwordHash,
      role: 'staff',
      name,
      permissions: permissions || []
    };

    db.users.push(newStaff);
    await saveDb(db);
    res.status(201).json({ id: newStaff.id, email: newStaff.email, name: newStaff.name, role: newStaff.role, permissions: newStaff.permissions });
  });

  // Dashboard Stats
  app.get('/api/stats', authenticate, async (req: any, res) => {
    if (req.user.role === 'customer') return res.status(403).json({ message: 'Forbidden' });
    const db = await getDb();
    const stats = {
      totalOrders: db.orders.length,
      pendingOrders: db.orders.filter(o => o.status === 'Pending').length,
      completedOrders: db.orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: db.transactions?.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0) || 0,
      customerCount: db.users.filter(u => u.role === 'customer').length
    };
    res.json(stats);
  });

  app.get('/api/admin/customers', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const db = await getDb();
    res.json(db.users.filter(u => u.role === 'customer'));
  });

  app.get('/api/admin/transactions', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const db = await getDb();
    res.json(db.transactions || []);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Success: Tai Hub API running on port ${PORT}`);
    console.log(`[SERVER] Health: http://localhost:${PORT}/api/health`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server:', err);
});
