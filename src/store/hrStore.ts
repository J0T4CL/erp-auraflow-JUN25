import { create } from 'zustand';
import type { Employee, Attendance, Payroll, LeaveRequest, Performance } from '../types/hr';

interface HRState {
  employees: Employee[];
  attendance: Attendance[];
  payrolls: Payroll[];
  leaveRequests: LeaveRequest[];
  performances: Performance[];
  isLoading: boolean;
  
  // Employees
  fetchEmployees: () => Promise<void>;
  createEmployee: (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  
  // Attendance
  clockIn: (employeeId: string, location?: string) => Promise<void>;
  clockOut: (employeeId: string) => Promise<void>;
  getAttendanceByEmployee: (employeeId: string, month: number, year: number) => Attendance[];
  
  // Payroll
  calculatePayroll: (employeeId: string, payPeriod: { startDate: Date; endDate: Date }) => Promise<void>;
  approvePayroll: (id: string) => Promise<void>;
  
  // Leave Management
  createLeaveRequest: (requestData: Omit<LeaveRequest, 'id' | 'createdAt'>) => Promise<void>;
  approveLeaveRequest: (id: string, comments?: string) => Promise<void>;
  rejectLeaveRequest: (id: string, comments: string) => Promise<void>;
  
  // Performance
  createPerformanceReview: (reviewData: Omit<Performance, 'id' | 'createdAt'>) => Promise<void>;
  
  // Analytics
  getAttendanceStats: () => {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    companyId: 'company-1',
    employeeNumber: 'EMP-001',
    firstName: 'José Luis',
    lastName: 'Pérez',
    email: 'jose.perez@empresa.com',
    phone: '+52 55 1234 5678',
    address: {
      street: 'Calle Principal 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01000',
      country: 'México'
    },
    dateOfBirth: new Date('1985-05-15'),
    hireDate: new Date('2020-01-15'),
    position: 'Gerente de Ventas',
    department: 'Ventas',
    salary: 25000,
    salaryType: 'monthly',
    workSchedule: {
      type: 'fixed',
      hoursPerWeek: 40,
      workDays: [
        { day: 'monday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
        { day: 'tuesday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
        { day: 'wednesday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
        { day: 'thursday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
        { day: 'friday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
      ]
    },
    bankAccount: {
      bankName: 'Banco Nacional',
      accountNumber: '1234567890',
      accountType: 'checking'
    },
    emergencyContact: {
      name: 'María Pérez',
      relationship: 'Esposa',
      phone: '+52 55 9876 5432',
      email: 'maria@email.com'
    },
    documents: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useHRStore = create<HRState>((set, get) => ({
  employees: [],
  attendance: [],
  payrolls: [],
  leaveRequests: [],
  performances: [],
  isLoading: false,

  fetchEmployees: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ employees: mockEmployees, isLoading: false });
  },

  createEmployee: async (employeeData) => {
    set({ isLoading: true });
    
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      employeeNumber: `EMP-${String(get().employees.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      employees: [newEmployee, ...state.employees],
      isLoading: false
    }));
  },

  updateEmployee: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      employees: state.employees.map(employee =>
        employee.id === id ? { ...employee, ...updates, updatedAt: new Date() } : employee
      ),
      isLoading: false
    }));
  },

  clockIn: async (employeeId, location) => {
    const newAttendance: Attendance = {
      id: Date.now().toString(),
      companyId: 'company-1',
      employeeId,
      date: new Date(),
      clockIn: new Date(),
      totalHours: 0,
      overtimeHours: 0,
      status: 'present',
      location,
      createdAt: new Date(),
    };
    
    set(state => ({
      attendance: [newAttendance, ...state.attendance]
    }));
  },

  clockOut: async (employeeId) => {
    const now = new Date();
    
    set(state => ({
      attendance: state.attendance.map(record => {
        if (record.employeeId === employeeId && 
            record.date.toDateString() === now.toDateString() && 
            !record.clockOut) {
          const totalHours = record.clockIn ? 
            (now.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60) : 0;
          const overtimeHours = Math.max(0, totalHours - 8);
          
          return {
            ...record,
            clockOut: now,
            totalHours,
            overtimeHours
          };
        }
        return record;
      })
    }));
  },

  getAttendanceByEmployee: (employeeId, month, year) => {
    return get().attendance.filter(record => 
      record.employeeId === employeeId &&
      record.date.getMonth() === month &&
      record.date.getFullYear() === year
    );
  },

  calculatePayroll: async (employeeId, payPeriod) => {
    set({ isLoading: true });
    
    const employee = get().employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    // Mock payroll calculation
    const baseSalary = employee.salary;
    const overtimePay = 2500; // Mock calculation
    const grossPay = baseSalary + overtimePay;
    const taxes = grossPay * 0.15; // Mock tax calculation
    const netPay = grossPay - taxes;
    
    const newPayroll: Payroll = {
      id: Date.now().toString(),
      companyId: 'company-1',
      employeeId,
      payPeriod: {
        startDate: payPeriod.startDate,
        endDate: payPeriod.endDate,
        payDate: new Date(payPeriod.endDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      baseSalary,
      overtimePay,
      bonuses: [],
      deductions: [],
      grossPay,
      netPay,
      taxes: [
        { type: 'income_tax', amount: taxes, rate: 15 }
      ],
      status: 'calculated',
      payDate: new Date(),
      createdAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      payrolls: [newPayroll, ...state.payrolls],
      isLoading: false
    }));
  },

  approvePayroll: async (id) => {
    set(state => ({
      payrolls: state.payrolls.map(payroll =>
        payroll.id === id ? { ...payroll, status: 'approved' } : payroll
      )
    }));
  },

  createLeaveRequest: async (requestData) => {
    const newRequest: LeaveRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set(state => ({
      leaveRequests: [newRequest, ...state.leaveRequests]
    }));
  },

  approveLeaveRequest: async (id, comments) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(request =>
        request.id === id 
          ? { 
              ...request, 
              status: 'approved', 
              approvedBy: '1',
              approvedDate: new Date(),
              comments 
            }
          : request
      )
    }));
  },

  rejectLeaveRequest: async (id, comments) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(request =>
        request.id === id 
          ? { 
              ...request, 
              status: 'rejected', 
              approvedBy: '1',
              approvedDate: new Date(),
              comments 
            }
          : request
      )
    }));
  },

  createPerformanceReview: async (reviewData) => {
    const newReview: Performance = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set(state => ({
      performances: [newReview, ...state.performances]
    }));
  },

  getAttendanceStats: () => {
    const { employees, attendance } = get();
    const today = new Date().toDateString();
    const todayAttendance = attendance.filter(record => 
      record.date.toDateString() === today
    );
    
    return {
      totalEmployees: employees.length,
      presentToday: todayAttendance.filter(record => record.status === 'present').length,
      absentToday: todayAttendance.filter(record => record.status === 'absent').length,
      lateToday: todayAttendance.filter(record => record.status === 'late').length,
    };
  },
}));