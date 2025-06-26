// ============================================
// MÓDULO DE RECURSOS HUMANOS
// ============================================

export interface Employee {
  id: string;
  companyId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: Date;
  hireDate: Date;
  terminationDate?: Date;
  position: string;
  department: string;
  manager?: string;
  salary: number;
  salaryType: 'hourly' | 'monthly' | 'annual';
  workSchedule: WorkSchedule;
  bankAccount: EmployeeBankAccount;
  emergencyContact: EmergencyContact;
  documents: EmployeeDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  type: 'fixed' | 'flexible' | 'shift';
  hoursPerWeek: number;
  workDays: WorkDay[];
}

export interface WorkDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  breakDuration: number; // minutes
}

export interface EmployeeBankAccount {
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmployeeDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  expirationDate?: Date;
  uploadedAt: Date;
}

export interface Attendance {
  id: string;
  companyId: string;
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  createdAt: Date;
}

export interface Payroll {
  id: string;
  companyId: string;
  employeeId: string;
  payPeriod: PayPeriod;
  baseSalary: number;
  overtimePay: number;
  bonuses: PayrollItem[];
  deductions: PayrollItem[];
  grossPay: number;
  netPay: number;
  taxes: TaxDeduction[];
  status: PayrollStatus;
  payDate: Date;
  createdAt: Date;
}

export interface PayrollItem {
  description: string;
  amount: number;
  type: 'bonus' | 'commission' | 'allowance' | 'deduction';
}

export interface TaxDeduction {
  type: 'income_tax' | 'social_security' | 'health_insurance' | 'pension';
  amount: number;
  rate: number;
}

export interface PayPeriod {
  startDate: Date;
  endDate: Date;
  payDate: Date;
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedDate?: Date;
  comments?: string;
  createdAt: Date;
}

export interface Performance {
  id: string;
  companyId: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  goals: PerformanceGoal[];
  overallRating: number; // 1-5
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: Date;
}

export interface PerformanceGoal {
  description: string;
  target: string;
  achievement: string;
  rating: number; // 1-5
  weight: number; // percentage
}

export type DocumentType = 'id' | 'contract' | 'resume' | 'certificate' | 'medical' | 'other';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'sick_leave';
export type PayrollStatus = 'draft' | 'calculated' | 'approved' | 'paid';
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';