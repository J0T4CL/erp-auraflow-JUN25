import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Tenant, TenantContext as ITenantContext, Plan } from '../types/tenant';
import type { User } from '../types';
import { useTenantStore } from '../store/tenantStore';
import { useAuthStore } from '../store/authStore';

interface TenantContextType {
  tenant: Tenant | null;
  context: ITenantContext | null;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
  checkFeatureAccess: (feature: keyof Tenant['features']) => boolean;
  checkLimitUsage: (limit: keyof Tenant['limits'], currentUsage: number) => boolean;
  getRemainingLimit: (limit: keyof Tenant['limits'], currentUsage: number) => number;
  canUpgrade: () => boolean;
  getAvailablePlans: () => Plan[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { 
    currentTenant, 
    isLoading, 
    fetchTenant, 
    updateTenant,
    getAvailablePlans: getPlans
  } = useTenantStore();
  
  const [context, setContext] = useState<ITenantContext | null>(null);

  useEffect(() => {
    if (user && user.companyId) {
      fetchTenant(user.companyId);
    }
  }, [user, fetchTenant]);

  useEffect(() => {
    if (currentTenant && user) {
      setContext({
        tenant: currentTenant,
        user,
        permissions: user.permissions,
        features: currentTenant.features,
        limits: currentTenant.limits
      });
    }
  }, [currentTenant, user]);

  const switchTenant = async (tenantId: string) => {
    await fetchTenant(tenantId);
  };

  const updateTenantSettings = async (settings: Partial<Tenant['settings']>) => {
    if (currentTenant) {
      await updateTenant(currentTenant.id, { 
        settings: { ...currentTenant.settings, ...settings } 
      });
    }
  };

  const checkFeatureAccess = (feature: keyof Tenant['features']): boolean => {
    if (!currentTenant) return false;
    return currentTenant.features[feature] === true;
  };

  const checkLimitUsage = (limit: keyof Tenant['limits'], currentUsage: number): boolean => {
    if (!currentTenant) return false;
    const limitValue = currentTenant.limits[limit];
    return currentUsage < limitValue;
  };

  const getRemainingLimit = (limit: keyof Tenant['limits'], currentUsage: number): number => {
    if (!currentTenant) return 0;
    const limitValue = currentTenant.limits[limit];
    return Math.max(0, limitValue - currentUsage);
  };

  const canUpgrade = (): boolean => {
    if (!currentTenant) return false;
    const availablePlans = getPlans();
    const currentPlanIndex = availablePlans.findIndex(p => p.id === currentTenant.plan);
    return currentPlanIndex < availablePlans.length - 1;
  };

  const getAvailablePlans = (): Plan[] => {
    return getPlans();
  };

  return (
    <TenantContext.Provider
      value={{
        tenant: currentTenant,
        context,
        isLoading,
        switchTenant,
        updateTenantSettings,
        checkFeatureAccess,
        checkLimitUsage,
        getRemainingLimit,
        canUpgrade,
        getAvailablePlans,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};