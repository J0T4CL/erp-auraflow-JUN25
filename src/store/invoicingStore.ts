import { create } from 'zustand';
import type { Invoice, InvoiceItem } from '../types';

interface InvoicingState {
  invoices: Invoice[];
  isLoading: boolean;
  
  // Actions
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoiceData: {
    customerId: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    notes?: string;
  }) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  sendInvoice: (id: string) => Promise<void>;
  generatePDF: (id: string) => Promise<void>;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    companyId: 'company-1',
    invoiceNumber: 'INV-2024-001',
    customerId: '2',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      {
        description: 'Consultoría en desarrollo de software',
        quantity: 40,
        unitPrice: 800,
        taxRate: 16,
        total: 37120
      }
    ],
    subtotal: 32000,
    taxAmount: 5120,
    total: 37120,
    status: 'sent',
    paymentStatus: 'pending',
    notes: 'Pago a 30 días',
    createdAt: new Date(),
  },
  {
    id: '2',
    companyId: 'company-1',
    invoiceNumber: 'INV-2024-002',
    customerId: '1',
    issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    items: [
      {
        description: 'Licencia de software anual',
        quantity: 1,
        unitPrice: 12000,
        taxRate: 16,
        total: 13920
      }
    ],
    subtotal: 12000,
    taxAmount: 1920,
    total: 13920,
    status: 'approved',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const useInvoicingStore = create<InvoicingState>((set, get) => ({
  invoices: [],
  isLoading: false,

  fetchInvoices: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ invoices: mockInvoices, isLoading: false });
  },

  createInvoice: async (invoiceData) => {
    set({ isLoading: true });
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      companyId: 'company-1',
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(get().invoices.length + 1).padStart(3, '0')}`,
      customerId: invoiceData.customerId,
      issueDate: new Date(invoiceData.issueDate),
      dueDate: new Date(invoiceData.dueDate),
      items: invoiceData.items.map(item => ({
        ...item,
        total: (item.quantity * item.unitPrice) * (1 + item.taxRate / 100)
      })),
      subtotal,
      taxAmount,
      total,
      status: 'draft',
      paymentStatus: 'pending',
      notes: invoiceData.notes,
      createdAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      invoices: [newInvoice, ...state.invoices],
      isLoading: false
    }));
  },

  updateInvoice: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      invoices: state.invoices.map(invoice =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      ),
      isLoading: false
    }));
  },

  deleteInvoice: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      invoices: state.invoices.filter(invoice => invoice.id !== id),
      isLoading: false
    }));
  },

  sendInvoice: async (id) => {
    await get().updateInvoice(id, { status: 'sent' });
  },

  generatePDF: async (id) => {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const invoice = get().invoices.find(inv => inv.id === id);
    if (invoice) {
      // Create a simple PDF content simulation
      const pdfContent = `Factura: ${invoice.invoiceNumber}\nTotal: $${invoice.total.toLocaleString()}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },
}));