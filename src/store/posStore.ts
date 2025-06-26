import { create } from 'zustand';
import type { Sale, Customer, SaleItem } from '../types';

interface POSState {
  sales: Sale[];
  customers: Customer[];
  isLoading: boolean;
  
  // Actions
  fetchSales: () => Promise<void>;
  createSale: (saleData: {
    customerId?: string;
    items: Omit<SaleItem, 'total'>[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    amountReceived?: number;
    change?: number;
  }) => Promise<void>;
  
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'lastPurchase'>) => Promise<void>;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    companyId: 'company-1',
    name: 'Cliente General',
    email: 'general@cliente.com',
    phone: '+52 55 1234 5678',
    isActive: true,
    totalPurchases: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    companyId: 'company-1',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+52 55 9876 5432',
    isActive: true,
    totalPurchases: 15420,
    lastPurchase: new Date(Date.now() - 86400000),
    createdAt: new Date(),
  },
];

const mockSales: Sale[] = [
  {
    id: '1',
    companyId: 'company-1',
    invoiceNumber: 'POS-2024-001',
    customerId: '2',
    items: [
      {
        productId: '1',
        quantity: 1,
        unitPrice: 15999,
        discount: 0,
        taxRate: 16,
        total: 18558.84
      }
    ],
    subtotal: 15999,
    taxAmount: 2559.84,
    discountAmount: 0,
    total: 18558.84,
    paymentMethod: 'card',
    status: 'completed',
    userId: '1',
    createdAt: new Date(),
  },
];

export const usePOSStore = create<POSState>((set, get) => ({
  sales: [],
  customers: [],
  isLoading: false,

  fetchSales: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ sales: mockSales, isLoading: false });
  },

  createSale: async (saleData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSale: Sale = {
      id: Date.now().toString(),
      companyId: 'company-1',
      invoiceNumber: `POS-${new Date().getFullYear()}-${String(get().sales.length + 1).padStart(3, '0')}`,
      customerId: saleData.customerId,
      items: saleData.items.map(item => ({
        ...item,
        total: (item.quantity * item.unitPrice) * (1 + item.taxRate / 100) - (item.discount || 0)
      })),
      subtotal: saleData.subtotal,
      taxAmount: saleData.taxAmount,
      discountAmount: saleData.discountAmount,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod as any,
      status: 'completed',
      userId: '1',
      createdAt: new Date(),
    };
    
    set(state => ({
      sales: [newSale, ...state.sales],
      isLoading: false
    }));
  },

  fetchCustomers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ customers: mockCustomers });
  },

  addCustomer: async (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalPurchases: 0,
      createdAt: new Date(),
    };
    
    set(state => ({
      customers: [...state.customers, newCustomer]
    }));
  },
}));