import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  PortalUser, 
  CustomerOrder, 
  CustomerInvoice, 
  CustomerPayment,
  EmployeeAttendance,
  EmployeePayslip,
  EmployeeLeave,
  EmployeeDocument,
  PortalNotification
} from '../types/portal';

interface PortalState {
  // Auth
  currentUser: PortalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Customer Data
  customerOrders: CustomerOrder[];
  customerInvoices: CustomerInvoice[];
  customerPayments: CustomerPayment[];
  
  // Employee Data
  employeeAttendance: EmployeeAttendance[];
  employeePayslips: EmployeePayslip[];
  employeeLeaves: EmployeeLeave[];
  employeeDocuments: EmployeeDocument[];
  
  // Notifications
  notifications: PortalNotification[];
  
  // Actions
  login: (email: string, password: string, userType: 'customer' | 'employee') => Promise<void>;
  logout: () => void;
  
  // Customer Actions
  fetchCustomerOrders: () => Promise<void>;
  fetchCustomerInvoices: () => Promise<void>;
  fetchCustomerPayments: () => Promise<void>;
  createCustomerPayment: (paymentData: any) => Promise<void>;
  
  // Employee Actions
  fetchEmployeeAttendance: () => Promise<void>;
  clockIn: (location?: string) => Promise<void>;
  clockOut: () => Promise<void>;
  fetchEmployeePayslips: () => Promise<void>;
  fetchEmployeeLeaves: () => Promise<void>;
  createLeaveRequest: (leaveData: any) => Promise<void>;
  fetchEmployeeDocuments: () => Promise<void>;
  
  // Notifications
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  
  // Profile
  updateProfile: (updates: Partial<PortalUser>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Mock data
const mockCustomerUser: PortalUser = {
  id: 'customer-1',
  email: 'cliente@demo.com',
  firstName: 'María',
  lastName: 'González',
  type: 'customer',
  companyId: 'company-1',
  isActive: true,
  customerId: '2',
  customerData: {
    totalPurchases: 15420,
    loyaltyPoints: 1542,
    preferredPaymentMethod: 'card',
    shippingAddress: {
      street: 'Av. Reforma 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      country: 'México'
    }
  },
  createdAt: new Date()
};

const mockEmployeeUser: PortalUser = {
  id: 'employee-1',
  email: 'colaborador@demo.com',
  firstName: 'Carlos',
  lastName: 'Rodríguez',
  type: 'employee',
  companyId: 'company-1',
  isActive: true,
  employeeId: '1',
  employeeData: {
    department: 'Ventas',
    position: 'Ejecutivo de Ventas',
    manager: 'José Luis Pérez',
    permissions: [
      { module: 'profile', actions: ['view', 'update'] },
      { module: 'attendance', actions: ['view', 'create'] },
      { module: 'payroll', actions: ['view', 'download'] },
      { module: 'leaves', actions: ['view', 'create'] },
      { module: 'documents', actions: ['view', 'download'] }
    ]
  },
  createdAt: new Date()
};

const mockCustomerOrders: CustomerOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: new Date(),
    status: 'shipped',
    items: [
      {
        productId: '1',
        productName: 'Smartphone Pro Max',
        quantity: 1,
        unitPrice: 15999,
        total: 15999
      }
    ],
    subtotal: 15999,
    tax: 2559.84,
    shipping: 200,
    total: 18758.84,
    shippingAddress: mockCustomerUser.customerData!.shippingAddress!,
    trackingNumber: 'TRK123456789',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  }
];

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      customerOrders: [],
      customerInvoices: [],
      customerPayments: [],
      employeeAttendance: [],
      employeePayslips: [],
      employeeLeaves: [],
      employeeDocuments: [],
      notifications: [],

      login: async (email: string, password: string, userType: 'customer' | 'employee') => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication
        if (userType === 'customer' && email === 'cliente@demo.com' && password === 'demo123') {
          set({
            currentUser: mockCustomerUser,
            isAuthenticated: true,
            isLoading: false
          });
        } else if (userType === 'employee' && email === 'colaborador@demo.com' && password === 'demo123') {
          set({
            currentUser: mockEmployeeUser,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
          throw new Error('Credenciales inválidas');
        }
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          customerOrders: [],
          customerInvoices: [],
          customerPayments: [],
          employeeAttendance: [],
          employeePayslips: [],
          employeeLeaves: [],
          employeeDocuments: [],
          notifications: []
        });
      },

      fetchCustomerOrders: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ customerOrders: mockCustomerOrders, isLoading: false });
      },

      fetchCustomerInvoices: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ 
          customerInvoices: [
            {
              id: '1',
              invoiceNumber: 'INV-2024-001',
              date: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: 'sent',
              amount: 18758.84,
              paidAmount: 0,
              remainingAmount: 18758.84
            }
          ], 
          isLoading: false 
        });
      },

      fetchCustomerPayments: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ customerPayments: [], isLoading: false });
      },

      createCustomerPayment: async (paymentData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newPayment = {
          id: Date.now().toString(),
          date: new Date(),
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference || `PAY-${Date.now()}`,
          status: 'completed' as const,
          invoiceId: paymentData.invoiceId
        };
        
        set(state => ({
          customerPayments: [newPayment, ...state.customerPayments],
          isLoading: false
        }));
      },

      fetchEmployeeAttendance: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockAttendance: EmployeeAttendance[] = [
          {
            id: '1',
            date: new Date(),
            clockIn: new Date(new Date().setHours(9, 0, 0, 0)),
            clockOut: new Date(new Date().setHours(18, 0, 0, 0)),
            totalHours: 8,
            status: 'present'
          }
        ];
        
        set({ employeeAttendance: mockAttendance, isLoading: false });
      },

      clockIn: async (location) => {
        const newAttendance: EmployeeAttendance = {
          id: Date.now().toString(),
          date: new Date(),
          clockIn: new Date(),
          totalHours: 0,
          status: 'present',
          location
        };
        
        set(state => ({
          employeeAttendance: [newAttendance, ...state.employeeAttendance]
        }));
      },

      clockOut: async () => {
        const now = new Date();
        
        set(state => ({
          employeeAttendance: state.employeeAttendance.map(record => {
            if (record.date.toDateString() === now.toDateString() && !record.clockOut) {
              const totalHours = record.clockIn ? 
                (now.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60) : 0;
              
              return {
                ...record,
                clockOut: now,
                totalHours
              };
            }
            return record;
          })
        }));
      },

      fetchEmployeePayslips: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockPayslips: EmployeePayslip[] = [
          {
            id: '1',
            period: 'Noviembre 2024',
            issueDate: new Date(),
            baseSalary: 25000,
            overtime: 2500,
            bonuses: 1000,
            deductions: 500,
            grossPay: 28000,
            taxes: 4200,
            netPay: 23800
          }
        ];
        
        set({ employeePayslips: mockPayslips, isLoading: false });
      },

      fetchEmployeeLeaves: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ employeeLeaves: [], isLoading: false });
      },

      createLeaveRequest: async (leaveData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newLeave: EmployeeLeave = {
          id: Date.now().toString(),
          type: leaveData.type,
          startDate: new Date(leaveData.startDate),
          endDate: new Date(leaveData.endDate),
          days: leaveData.days,
          reason: leaveData.reason,
          status: 'pending',
          createdAt: new Date()
        };
        
        set(state => ({
          employeeLeaves: [newLeave, ...state.employeeLeaves],
          isLoading: false
        }));
      },

      fetchEmployeeDocuments: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockDocuments: EmployeeDocument[] = [
          {
            id: '1',
            name: 'Contrato de Trabajo',
            type: 'contract',
            uploadDate: new Date(),
            downloadUrl: '#'
          }
        ];
        
        set({ employeeDocuments: mockDocuments, isLoading: false });
      },

      fetchNotifications: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockNotifications: PortalNotification[] = [
          {
            id: '1',
            userId: get().currentUser?.id || '',
            title: 'Nuevo recibo de nómina',
            message: 'Tu recibo de nómina de noviembre ya está disponible',
            type: 'info',
            isRead: false,
            createdAt: new Date()
          }
        ];
        
        set({ notifications: mockNotifications, isLoading: false });
      },

      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        }));
      },

      updateProfile: async (updates) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
          isLoading: false
        }));
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ isLoading: false });
      }
    }),
    {
      name: 'auraflow-portal',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);