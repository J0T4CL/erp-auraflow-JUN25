// ============================================
// TIPOS CENTRALES PARA AURAFLOW ERP
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: Permission[];
}

export interface Company {
  id: string;
  name: string;
  taxId: string;
  plan: PlanType;
  industry: IndustryType;
  address: Address;
  logoUrl?: string;
  settings: CompanySettings;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CompanySettings {
  currency: string;
  timezone: string;
  language: string;
  taxRate: number;
  invoiceNumberFormat: string;
  enableNotifications: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'accountant' | 'viewer';
export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';
export type IndustryType = 'retail' | 'restaurant' | 'healthcare' | 'services' | 'manufacturing' | 'other';

export interface Permission {
  id: string;
  module: ModuleType;
  action: ActionType;
  resource?: string;
}

export type ModuleType = 'dashboard' | 'inventory' | 'pos' | 'invoicing' | 'expenses' | 'reports' | 'users' | 'settings';
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve';

// ============================================
// MÓDULO DE INVENTARIO
// ============================================

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description?: string;
  category: Category;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  tags: string[];
  suppliers: Supplier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  userId: string;
  createdAt: Date;
}

// ============================================
// MÓDULO POS (PUNTO DE VENTA)
// ============================================

export interface Sale {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  userId: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  isActive: boolean;
  totalPurchases: number;
  lastPurchase?: Date;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'other';
export type SaleStatus = 'completed' | 'pending' | 'cancelled' | 'refunded';

// ============================================
// MÓDULO DE FACTURACIÓN
// ============================================

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  electronicSignature?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  notes?: string;
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

// ============================================
// MÓDULO DE GASTOS Y COSTOS
// ============================================

export interface Expense {
  id: string;
  companyId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  costCenter?: string;
  supplierId?: string;
  receiptUrl?: string;
  approvedBy?: string;
  status: ExpenseStatus;
  date: Date;
  userId: string;
  createdAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  budgetLimit?: number;
  color: string;
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';

// ============================================
// REPORTES Y ANALYTICS
// ============================================

export interface DashboardMetrics {
  salesTotal: number;
  salesGrowth: number;
  ordersCount: number;
  ordersGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  lowStockProducts: number;
  topProducts: TopProduct[];
  recentSales: Sale[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// ============================================
// NOTIFICACIONES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';