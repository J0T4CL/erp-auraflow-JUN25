import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTenantFeatures } from '../../hooks/useTenantFeatures';
import type { TenantFeatures } from '../../types/tenant';

interface FeatureGateProps {
  feature: keyof TenantFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
  onUpgrade
}) => {
  const { hasFeature, requiresUpgrade } = useTenantFeatures();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getFeatureLabel = (feature: keyof TenantFeatures): string => {
    const labels = {
      inventory: 'Gestión de Inventario',
      pos: 'Punto de Venta',
      invoicing: 'Facturación Electrónica',
      expenses: 'Control de Gastos',
      reports: 'Reportes Básicos',
      multiLocation: 'Multi-sucursal',
      advancedReports: 'Reportes Avanzados',
      apiAccess: 'Acceso API',
      customBranding: 'Marca Personalizada',
      prioritySupport: 'Soporte Prioritario',
      dataExport: 'Exportación de Datos',
      integrations: 'Integraciones'
    };
    return labels[feature] || feature;
  };

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Funcionalidad Premium
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          <strong>{getFeatureLabel(feature)}</strong> no está disponible en tu plan actual
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="warning" className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Requiere actualización
          </Badge>
        </div>

        {showUpgrade && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actualiza tu plan para acceder a esta funcionalidad y muchas más
            </p>
            <Button 
              onClick={onUpgrade}
              icon={ArrowRight}
              className="mx-auto"
            >
              Ver Planes Disponibles
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};