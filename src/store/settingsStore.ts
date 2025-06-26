import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanySettings {
  // Company Information
  companyName: string;
  taxId: string;
  industry: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Business Settings
  currency: string;
  timezone: string;
  taxRate: number;
  invoiceFormat: string;
  fiscalYear: string;

  // Notification Settings
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    lowStockAlerts: boolean;
    salesReports: boolean;
    systemUpdates: boolean;
  };

  // Security Settings
  security: {
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

interface SettingsState {
  settings: CompanySettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<CompanySettings>) => Promise<void>;
  resetSettings: () => void;
}

const defaultSettings: CompanySettings = {
  companyName: 'Demo PYME S.A.',
  taxId: '12345678-9',
  industry: 'retail',
  phone: '+52 55 1234 5678',
  website: 'https://demo.com',
  address: {
    street: 'Av. Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '01000',
    country: 'México'
  },
  currency: 'MXN',
  timezone: 'America/Mexico_City',
  taxRate: 16,
  invoiceFormat: 'INV-{YYYY}-{MM}-{####}',
  fiscalYear: 'calendar',
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    salesReports: true,
    systemUpdates: true
  },
  security: {
    sessionTimeout: 30,
    twoFactorAuth: false
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      updateSettings: async (updates: Partial<CompanySettings>) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          settings: { ...state.settings, ...updates },
          isLoading: false
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      }
    }),
    {
      name: 'auraflow-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);