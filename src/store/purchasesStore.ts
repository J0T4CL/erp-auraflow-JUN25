import { create } from 'zustand';
import type { PurchaseOrder, PurchaseReceipt, SupplierPayment, PurchaseOrderItem } from '../types/purchases';
import type { Supplier } from '../types';

interface PurchasesState {
  purchaseOrders: PurchaseOrder[];
  receipts: PurchaseReceipt[];
  payments: SupplierPayment[];
  isLoading: boolean;
  
  // Purchase Orders
  fetchPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (orderData: {
    supplierId: string;
    items: Omit<PurchaseOrderItem, 'receivedQuantity'>[];
    expectedDeliveryDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  }) => Promise<void>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  approvePurchaseOrder: (id: string) => Promise<void>;
  
  // Receipts
  createReceipt: (receiptData: {
    purchaseOrderId: string;
    items: Array<{
      productId: string;
      receivedQuantity: number;
      condition: 'good' | 'damaged' | 'defective';
      notes?: string;
    }>;
    notes?: string;
  }) => Promise<void>;
  
  // Payments
  createPayment: (paymentData: {
    supplierId: string;
    purchaseOrderIds: string[];
    amount: number;
    paymentMethod: 'cash' | 'transfer' | 'check' | 'card';
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  
  // Analytics
  getPendingOrders: () => PurchaseOrder[];
  getOverdueOrders: () => PurchaseOrder[];
  getSupplierPerformance: (supplierId: string) => {
    totalOrders: number;
    onTimeDeliveries: number;
    averageDeliveryTime: number;
    qualityScore: number;
  };
}

// Mock data
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    companyId: 'company-1',
    orderNumber: 'PO-2024-001',
    supplierId: '1',
    requestedBy: '1',
    items: [
      {
        productId: '1',
        description: 'Smartphone Pro Max',
        quantity: 50,
        unitPrice: 12000,
        receivedQuantity: 0,
        taxRate: 16,
        total: 696000
      }
    ],
    subtotal: 600000,
    taxAmount: 96000,
    total: 696000,
    status: 'approved',
    priority: 'high',
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: 'Entrega urgente para temporada navideña',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const usePurchasesStore = create<PurchasesState>((set, get) => ({
  purchaseOrders: [],
  receipts: [],
  payments: [],
  isLoading: false,

  fetchPurchaseOrders: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ purchaseOrders: mockPurchaseOrders, isLoading: false });
  },

  createPurchaseOrder: async (orderData) => {
    set({ isLoading: true });
    
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    
    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      companyId: 'company-1',
      orderNumber: `PO-${new Date().getFullYear()}-${String(get().purchaseOrders.length + 1).padStart(3, '0')}`,
      supplierId: orderData.supplierId,
      requestedBy: '1',
      items: orderData.items.map(item => ({ ...item, receivedQuantity: 0 })),
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      status: 'draft',
      priority: orderData.priority,
      expectedDeliveryDate: orderData.expectedDeliveryDate,
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      purchaseOrders: [newOrder, ...state.purchaseOrders],
      isLoading: false
    }));
  },

  updatePurchaseOrder: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      purchaseOrders: state.purchaseOrders.map(order =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date() } : order
      ),
      isLoading: false
    }));
  },

  approvePurchaseOrder: async (id) => {
    await get().updatePurchaseOrder(id, { 
      status: 'approved',
      approvedBy: '1'
    });
  },

  createReceipt: async (receiptData) => {
    set({ isLoading: true });
    
    const newReceipt: PurchaseReceipt = {
      id: Date.now().toString(),
      companyId: 'company-1',
      purchaseOrderId: receiptData.purchaseOrderId,
      receiptNumber: `REC-${new Date().getFullYear()}-${String(get().receipts.length + 1).padStart(3, '0')}`,
      supplierId: '1',
      items: receiptData.items.map(item => ({
        ...item,
        orderedQuantity: 0, // This would be fetched from the PO
        unitPrice: 0 // This would be fetched from the PO
      })),
      receivedBy: '1',
      receivedDate: new Date(),
      notes: receiptData.notes,
      createdAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      receipts: [newReceipt, ...state.receipts],
      isLoading: false
    }));
  },

  createPayment: async (paymentData) => {
    set({ isLoading: true });
    
    const newPayment: SupplierPayment = {
      id: Date.now().toString(),
      companyId: 'company-1',
      supplierId: paymentData.supplierId,
      purchaseOrderIds: paymentData.purchaseOrderIds,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: new Date(),
      reference: paymentData.reference,
      notes: paymentData.notes,
      createdAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      payments: [newPayment, ...state.payments],
      isLoading: false
    }));
  },

  getPendingOrders: () => {
    return get().purchaseOrders.filter(order => 
      ['draft', 'pending_approval', 'approved', 'sent'].includes(order.status)
    );
  },

  getOverdueOrders: () => {
    const now = new Date();
    return get().purchaseOrders.filter(order => 
      order.expectedDeliveryDate < now && 
      !['received', 'cancelled'].includes(order.status)
    );
  },

  getSupplierPerformance: (supplierId: string) => {
    const orders = get().purchaseOrders.filter(order => order.supplierId === supplierId);
    const completedOrders = orders.filter(order => order.status === 'received');
    const onTimeOrders = completedOrders.filter(order => 
      order.actualDeliveryDate && order.actualDeliveryDate <= order.expectedDeliveryDate
    );
    
    return {
      totalOrders: orders.length,
      onTimeDeliveries: onTimeOrders.length,
      averageDeliveryTime: 5, // Mock calculation
      qualityScore: 85 // Mock score
    };
  },
}));