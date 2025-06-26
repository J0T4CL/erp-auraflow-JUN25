// ============================================
// TIPOS PARA PORTAL WEB/APP
// ============================================

export interface PortalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  type: 'customer' | 'employee';
  companyId: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  
  // Específico para clientes
  customerId?: string;
  customerData?: {
    totalPurchases: number;
    loyaltyPoints: number;
    preferredPaymentMethod?: string;
    shippingAddress?: Address;
  };
  
  // Específico para empleados
  employeeId?: string;
  employeeData?: {
    department: string;
    position: string;
    manager?: string;
    permissions: PortalPermission[];
  };
}

export interface PortalPermission {
  module: PortalModule;
  actions: PortalAction[];
}

export type PortalModule = 'profile' | 'orders' | 'invoices' | 'payments' | 'attendance' | 'payroll' | 'leaves' | 'documents';
export type PortalAction = 'view' | 'create' | 'update' | 'download';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: Date;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  status: InvoiceStatus;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  downloadUrl?: string;
}

export interface CustomerPayment {
  id: string;
  date: Date;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  invoiceId?: string;
}

export interface EmployeeAttendance {
  id: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours: number;
  status: AttendanceStatus;
  location?: string;
}

export interface EmployeePayslip {
  id: string;
  period: string;
  issueDate: Date;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  taxes: number;
  netPay: number;
  downloadUrl?: string;
}

export interface EmployeeLeave {
  id: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  comments?: string;
  createdAt: Date;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: Date;
  downloadUrl: string;
  expirationDate?: Date;
}

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type DocumentType = 'contract' | 'id' | 'certificate' | 'policy' | 'other';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}