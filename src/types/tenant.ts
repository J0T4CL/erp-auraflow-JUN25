// ============================================
// TIPOS PARA SISTEMA MULTITENANT
// ============================================

export interface Tenant {
  id: string;
  subdomain: string; // empresa.auraflow.com
  customDomain?: string; // www.empresa.com
  name: string;
  displayName: string;
  industry: IndustryType;
  plan: PlanType;
  status: TenantStatus;
  settings: TenantSettings;
  billing: TenantBilling;
  limits: TenantLimits;
  features: TenantFeatures;
  branding: TenantBranding;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  taxSettings: TaxSettings;
  businessHours: BusinessHours;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxNumber: string;
  taxRegime: string;
  enableElectronicInvoicing: boolean;
  invoicePrefix: string;
  invoiceNumberFormat: string;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  ipWhitelist: string[];
  auditLog: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
}

export interface TenantBilling {
  plan: PlanType;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  paymentMethod?: PaymentMethod;
  billingAddress: Address;
  invoiceEmail: string;
  autoRenewal: boolean;
  trialEndsAt?: Date;
}

export interface TenantLimits {
  maxUsers: number;
  maxProducts: number;
  maxTransactions: number;
  maxStorage: number; // in MB
  maxApiCalls: number; // per month
  maxLocations: number;
  maxIntegrations: number;
}

export interface TenantFeatures {
  inventory: boolean;
  pos: boolean;
  invoicing: boolean;
  expenses: boolean;
  reports: boolean;
  multiLocation: boolean;
  advancedReports: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  dataExport: boolean;
  integrations: string[]; // Lista de integraciones habilitadas
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS?: string;
  loginBackground?: string;
  emailTemplate?: string;
}

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired' | 'cancelled';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type IndustryType = 'retail' | 'restaurant' | 'healthcare' | 'services' | 'manufacturing' | 'education' | 'other';

// Planes disponibles
export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  limits: TenantLimits;
  features: TenantFeatures;
  isPopular?: boolean;
  trialDays: number;
}

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';

// Contexto del tenant actual
export interface TenantContext {
  tenant: Tenant;
  user: User;
  permissions: Permission[];
  features: TenantFeatures;
  limits: TenantLimits;
}

// Eventos del sistema multitenant
export interface TenantEvent {
  id: string;
  tenantId: string;
  type: TenantEventType;
  data: any;
  userId?: string;
  timestamp: Date;
}

export type TenantEventType = 
  | 'tenant_created'
  | 'tenant_updated'
  | 'tenant_suspended'
  | 'tenant_activated'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'user_invited'
  | 'user_removed'
  | 'feature_enabled'
  | 'feature_disabled'
  | 'limit_exceeded'
  | 'payment_failed'
  | 'payment_succeeded';