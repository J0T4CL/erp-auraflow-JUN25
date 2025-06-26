// ============================================
// MÓDULO DE COMPRAS Y PROVEEDORES
// ============================================

export interface PurchaseOrder {
  id: string;
  companyId: string;
  orderNumber: string;
  supplierId: string;
  requestedBy: string;
  approvedBy?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseOrderStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
  taxRate: number;
  total: number;
}

export interface PurchaseReceipt {
  id: string;
  companyId: string;
  purchaseOrderId: string;
  receiptNumber: string;
  supplierId: string;
  items: PurchaseReceiptItem[];
  receivedBy: string;
  receivedDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface PurchaseReceiptItem {
  productId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  companyId: string;
  supplierId: string;
  purchaseOrderIds: string[];
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'check' | 'card';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export type PurchaseOrderStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'partial_received' | 'received' | 'cancelled';