import { useTenant } from '../contexts/TenantContext';
import type { TenantLimits } from '../types/tenant';

export const useTenantLimits = () => {
  const { tenant, checkLimitUsage, getRemainingLimit } = useTenant();

  const canPerformAction = (limit: keyof TenantLimits, currentUsage: number): boolean => {
    return checkLimitUsage(limit, currentUsage);
  };

  const getUsagePercentage = (limit: keyof TenantLimits, currentUsage: number): number => {
    if (!tenant) return 0;
    const limitValue = tenant.limits[limit];
    return Math.min((currentUsage / limitValue) * 100, 100);
  };

  const isNearLimit = (limit: keyof TenantLimits, currentUsage: number, threshold = 80): boolean => {
    return getUsagePercentage(limit, currentUsage) >= threshold;
  };

  const isAtLimit = (limit: keyof TenantLimits, currentUsage: number): boolean => {
    return !canPerformAction(limit, currentUsage);
  };

  const getLimitInfo = (limit: keyof TenantLimits, currentUsage: number) => {
    if (!tenant) return null;

    const limitValue = tenant.limits[limit];
    const percentage = getUsagePercentage(limit, currentUsage);
    const remaining = getRemainingLimit(limit, currentUsage);

    return {
      current: currentUsage,
      max: limitValue,
      remaining,
      percentage,
      isNearLimit: isNearLimit(limit, currentUsage),
      isAtLimit: isAtLimit(limit, currentUsage),
      canPerform: canPerformAction(limit, currentUsage)
    };
  };

  return {
    canPerformAction,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
    getLimitInfo,
    getRemainingLimit,
    limits: tenant?.limits,
  };
};