import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant, Plan, TenantEvent, PlanType } from '../types/tenant';

interface TenantState {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  plans: Plan[];
  events: TenantEvent[];
  isLoading: boolean;
  
  // Actions
  fetchTenant: (tenantId: string) => Promise<void>;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Promise<void>;
  createTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>;
  deleteTenant: (tenantId: string) => Promise<void>;
  
  // Plan management
  getAvailablePlans: () => Plan[];
  upgradePlan: (tenantId: string, planId: PlanType) => Promise<void>;
  
  // Feature management
  enableFeature: (tenantId: string, feature: keyof Tenant['features']) => Promise<void>;
  disableFeature: (tenantId: string, feature: keyof Tenant['features']) => Promise<void>;
  
  // Usage tracking
  trackUsage: (tenantId: string, metric: keyof Tenant['limits'], amount: number) => Promise<void>;
  getUsageStats: (tenantId: string) => Promise<Record<string, number>>;
  
  // Events
  addEvent: (event: Omit<TenantEvent, 'id' | 'timestamp'>) => void;
  getEvents: (tenantId: string) => TenantEvent[];
}

// Mock plans data
const mockPlans: Plan[] = [
  {
    id: 'free',
    name: 'Plan Gratuito',
    description: 'Perfecto para empezar',
    price: 0,
    currency: 'MXN',
    billingCycle: 'monthly',
    trialDays: 0,
    limits: {
      maxUsers: 2,
      maxProducts: 100,
      maxTransactions: 50,
      maxStorage: 100,
      maxApiCalls: 1000,
      maxLocations: 1,
      maxIntegrations: 0
    },
    features: {
      inventory: true,
      pos: true,
      invoicing: false,
      expenses: false,
      reports: false,
      multiLocation: false,
      advancedReports: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      dataExport: false,
      integrations: []
    }
  },
  {
    id: 'starter',
    name: 'Plan Inicial',
    description: 'Para pequeños negocios',
    price: 299,
    currency: 'MXN',
    billingCycle: 'monthly',
    trialDays: 14,
    limits: {
      maxUsers: 5,
      maxProducts: 1000,
      maxTransactions: 500,
      maxStorage: 1000,
      maxApiCalls: 10000,
      maxLocations: 2,
      maxIntegrations: 3
    },
    features: {
      inventory: true,
      pos: true,
      invoicing: true,
      expenses: true,
      reports: true,
      multiLocation: false,
      advancedReports: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      dataExport: true,
      integrations: ['stripe', 'whatsapp']
    }
  },
  {
    id: 'professional',
    name: 'Plan Profesional',
    description: 'Para empresas en crecimiento',
    price: 599,
    currency: 'MXN',
    billingCycle: 'monthly',
    trialDays: 30,
    isPopular: true,
    limits: {
      maxUsers: 25,
      maxProducts: 10000,
      maxTransactions: 5000,
      maxStorage: 10000,
      maxApiCalls: 100000,
      maxLocations: 10,
      maxIntegrations: 10
    },
    features: {
      inventory: true,
      pos: true,
      invoicing: true,
      expenses: true,
      reports: true,
      multiLocation: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: false,
      dataExport: true,
      integrations: ['stripe', 'whatsapp', 'mailchimp', 'google-analytics']
    }
  },
  {
    id: 'enterprise',
    name: 'Plan Empresarial',
    description: 'Para grandes organizaciones',
    price: 1299,
    currency: 'MXN',
    billingCycle: 'monthly',
    trialDays: 30,
    limits: {
      maxUsers: 100,
      maxProducts: 100000,
      maxTransactions: 50000,
      maxStorage: 100000,
      maxApiCalls: 1000000,
      maxLocations: 50,
      maxIntegrations: -1 // Unlimited
    },
    features: {
      inventory: true,
      pos: true,
      invoicing: true,
      expenses: true,
      reports: true,
      multiLocation: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      dataExport: true,
      integrations: ['all']
    }
  }
];

// Mock tenant data
const mockTenant: Tenant = {
  id: 'tenant-demo',
  subdomain: 'demo',
  name: 'demo-pyme',
  displayName: 'Demo PYME S.A.',
  industry: 'retail',
  plan: 'professional',
  status: 'active',
  settings: {
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-MX',
    taxSettings: {
      defaultTaxRate: 16,
      taxNumber: 'RFC123456789',
      taxRegime: 'General',
      enableElectronicInvoicing: true,
      invoicePrefix: 'INV',
      invoiceNumberFormat: '{PREFIX}-{YYYY}-{MM}-{####}'
    },
    businessHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
      sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      lowStockAlerts: true,
      paymentReminders: true,
      systemUpdates: true
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expirationDays: 90
      },
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: [],
      auditLog: true
    }
  },
  billing: {
    plan: 'professional',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    billingAddress: {
      street: 'Av. Principal 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01000',
      country: 'México'
    },
    invoiceEmail: 'billing@demo.com',
    autoRenewal: true
  },
  limits: mockPlans.find(p => p.id === 'professional')!.limits,
  features: mockPlans.find(p => p.id === 'professional')!.features,
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#10B981',
    fontFamily: 'Inter'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      availableTenants: [],
      plans: mockPlans,
      events: [],
      isLoading: false,

      fetchTenant: async (tenantId: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, this would fetch from API
        set({ 
          currentTenant: mockTenant,
          isLoading: false 
        });
      },

      updateTenant: async (tenantId: string, updates: Partial<Tenant>) => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        set(state => ({
          currentTenant: state.currentTenant ? {
            ...state.currentTenant,
            ...updates,
            updatedAt: new Date()
          } : null,
          isLoading: false
        }));

        // Add event
        get().addEvent({
          tenantId,
          type: 'tenant_updated',
          data: updates
        });
      },

      createTenant: async (tenantData) => {
        const newTenant: Tenant = {
          ...tenantData,
          id: `tenant-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set(state => ({
          availableTenants: [...state.availableTenants, newTenant]
        }));

        get().addEvent({
          tenantId: newTenant.id,
          type: 'tenant_created',
          data: newTenant
        });

        return newTenant;
      },

      deleteTenant: async (tenantId: string) => {
        set(state => ({
          availableTenants: state.availableTenants.filter(t => t.id !== tenantId),
          currentTenant: state.currentTenant?.id === tenantId ? null : state.currentTenant
        }));
      },

      getAvailablePlans: () => {
        return get().plans;
      },

      upgradePlan: async (tenantId: string, planId: PlanType) => {
        const plan = get().plans.find(p => p.id === planId);
        if (!plan) throw new Error('Plan not found');

        await get().updateTenant(tenantId, {
          plan: planId,
          limits: plan.limits,
          features: plan.features
        });

        get().addEvent({
          tenantId,
          type: 'plan_upgraded',
          data: { newPlan: planId, previousPlan: get().currentTenant?.plan }
        });
      },

      enableFeature: async (tenantId: string, feature: keyof Tenant['features']) => {
        const currentTenant = get().currentTenant;
        if (!currentTenant) return;

        await get().updateTenant(tenantId, {
          features: {
            ...currentTenant.features,
            [feature]: true
          }
        });

        get().addEvent({
          tenantId,
          type: 'feature_enabled',
          data: { feature }
        });
      },

      disableFeature: async (tenantId: string, feature: keyof Tenant['features']) => {
        const currentTenant = get().currentTenant;
        if (!currentTenant) return;

        await get().updateTenant(tenantId, {
          features: {
            ...currentTenant.features,
            [feature]: false
          }
        });

        get().addEvent({
          tenantId,
          type: 'feature_disabled',
          data: { feature }
        });
      },

      trackUsage: async (tenantId: string, metric: keyof Tenant['limits'], amount: number) => {
        // In a real app, this would track usage in a separate service
        console.log(`Tracking usage for ${tenantId}: ${metric} = ${amount}`);
      },

      getUsageStats: async (tenantId: string) => {
        // Mock usage stats
        return {
          users: 8,
          products: 245,
          transactions: 1250,
          storage: 2500,
          apiCalls: 15000,
          locations: 2,
          integrations: 3
        };
      },

      addEvent: (event: Omit<TenantEvent, 'id' | 'timestamp'>) => {
        const newEvent: TenantEvent = {
          ...event,
          id: `event-${Date.now()}`,
          timestamp: new Date()
        };

        set(state => ({
          events: [newEvent, ...state.events.slice(0, 99)] // Keep last 100 events
        }));
      },

      getEvents: (tenantId: string) => {
        return get().events.filter(event => event.tenantId === tenantId);
      }
    }),
    {
      name: 'auraflow-tenant',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        availableTenants: state.availableTenants
      })
    }
  )
);