import { useTenant } from '../contexts/TenantContext';
import type { TenantFeatures } from '../types/tenant';

export const useTenantFeatures = () => {
  const { tenant, checkFeatureAccess } = useTenant();

  const hasFeature = (feature: keyof TenantFeatures): boolean => {
    return checkFeatureAccess(feature);
  };

  const getFeatureList = (): Array<{ key: keyof TenantFeatures; enabled: boolean; label: string }> => {
    if (!tenant) return [];

    return [
      { key: 'inventory', enabled: tenant.features.inventory, label: 'Gestión de Inventario' },
      { key: 'pos', enabled: tenant.features.pos, label: 'Punto de Venta' },
      { key: 'invoicing', enabled: tenant.features.invoicing, label: 'Facturación Electrónica' },
      { key: 'expenses', enabled: tenant.features.expenses, label: 'Control de Gastos' },
      { key: 'reports', enabled: tenant.features.reports, label: 'Reportes Básicos' },
      { key: 'multiLocation', enabled: tenant.features.multiLocation, label: 'Multi-sucursal' },
      { key: 'advancedReports', enabled: tenant.features.advancedReports, label: 'Reportes Avanzados' },
      { key: 'apiAccess', enabled: tenant.features.apiAccess, label: 'Acceso API' },
      { key: 'customBranding', enabled: tenant.features.customBranding, label: 'Marca Personalizada' },
      { key: 'prioritySupport', enabled: tenant.features.prioritySupport, label: 'Soporte Prioritario' },
      { key: 'dataExport', enabled: tenant.features.dataExport, label: 'Exportación de Datos' },
    ];
  };

  const requiresUpgrade = (feature: keyof TenantFeatures): boolean => {
    return !hasFeature(feature);
  };

  return {
    hasFeature,
    getFeatureList,
    requiresUpgrade,
    features: tenant?.features,
  };
};