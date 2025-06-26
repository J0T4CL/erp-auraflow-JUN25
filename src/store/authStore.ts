import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Company } from '../types';

interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
}

// Mock user data for demo
const mockUser: User = {
  id: '1',
  email: 'admin@demo.com',
  firstName: 'José Luis',
  lastName: 'Pérez',
  role: 'admin',
  companyId: 'company-1',
  isActive: true,
  createdAt: new Date(),
  permissions: [
    { id: '1', module: 'dashboard', action: 'read' },
    { id: '2', module: 'inventory', action: 'create' },
    { id: '3', module: 'inventory', action: 'read' },
    { id: '4', module: 'inventory', action: 'update' },
    { id: '5', module: 'inventory', action: 'delete' },
    { id: '6', module: 'pos', action: 'create' },
    { id: '7', module: 'pos', action: 'read' },
    { id: '8', module: 'invoicing', action: 'create' },
    { id: '9', module: 'invoicing', action: 'read' },
    { id: '10', module: 'expenses', action: 'create' },
    { id: '11', module: 'expenses', action: 'read' },
    { id: '12', module: 'reports', action: 'read' },
  ],
};

const mockCompany: Company = {
  id: 'company-1',
  name: 'Demo PYME S.A.',
  taxId: '12345678-9',
  plan: 'professional',
  industry: 'retail',
  address: {
    street: 'Av. Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '01000',
    country: 'México',
  },
  settings: {
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    language: 'es',
    taxRate: 16,
    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{####}',
    enableNotifications: true,
  },
  isActive: true,
  createdAt: new Date(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Simular autenticación
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (email === 'admin@demo.com' && password === 'demo123') {
          set({
            user: mockUser,
            company: mockCompany,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
          throw new Error('Credenciales inválidas');
        }
      },

      logout: () => {
        set({
          user: null,
          company: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setCompany: (company: Company) => {
        set({ company });
      },
    }),
    {
      name: 'auraflow-auth',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
