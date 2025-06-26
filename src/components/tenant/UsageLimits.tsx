import React from 'react';
import { AlertTriangle, Users, Package, CreditCard, Database, Zap, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTenant } from '../../contexts/TenantContext';

interface UsageLimitsProps {
  onUpgrade?: () => void;
}

export const UsageLimits: React.FC<UsageLimitsProps> = ({ onUpgrade }) => {
  const { tenant, checkLimitUsage, getRemainingLimit } = useTenant();

  if (!tenant) return null;

  // Mock current usage data
  const currentUsage = {
    maxUsers: 8,
    maxProducts: 245,
    maxTransactions: 1250,
    maxStorage: 2500,
    maxApiCalls: 15000,
    maxLocations: 2,
    maxIntegrations: 3
  };

  const limits = [
    {
      key: 'maxUsers' as keyof typeof currentUsage,
      label: 'Usuarios',
      icon: Users,
      current: currentUsage.maxUsers,
      max: tenant.limits.maxUsers,
      unit: 'usuarios'
    },
    {
      key: 'maxProducts' as keyof typeof currentUsage,
      label: 'Productos',
      icon: Package,
      current: currentUsage.maxProducts,
      max: tenant.limits.maxProducts,
      unit: 'productos'
    },
    {
      key: 'maxTransactions' as keyof typeof currentUsage,
      label: 'Transacciones',
      icon: CreditCard,
      current: currentUsage.maxTransactions,
      max: tenant.limits.maxTransactions,
      unit: 'transacciones/mes'
    },
    {
      key: 'maxStorage' as keyof typeof currentUsage,
      label: 'Almacenamiento',
      icon: Database,
      current: currentUsage.maxStorage,
      max: tenant.limits.maxStorage,
      unit: 'MB'
    },
    {
      key: 'maxApiCalls' as keyof typeof currentUsage,
      label: 'Llamadas API',
      icon: Zap,
      current: currentUsage.maxApiCalls,
      max: tenant.limits.maxApiCalls,
      unit: 'llamadas/mes'
    },
    {
      key: 'maxLocations' as keyof typeof currentUsage,
      label: 'Ubicaciones',
      icon: MapPin,
      current: currentUsage.maxLocations,
      max: tenant.limits.maxLocations,
      unit: 'ubicaciones'
    }
  ];

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { variant: 'error' as const, label: 'Crítico' };
    if (percentage >= 75) return { variant: 'warning' as const, label: 'Alto' };
    if (percentage >= 50) return { variant: 'primary' as const, label: 'Medio' };
    return { variant: 'success' as const, label: 'Bajo' };
  };

  const criticalLimits = limits.filter(limit => getUsagePercentage(limit.current, limit.max) >= 90);

  return (
    <div className="space-y-6">
      {/* Critical alerts */}
      {criticalLimits.length > 0 && (
        <Card className="border-l-4 border-l-error-500 bg-error-50 dark:bg-error-900/20">
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-800 dark:text-error-200">
                Límites críticos alcanzados
              </p>
              <p className="text-sm text-error-700 dark:text-error-300">
                {criticalLimits.length} límite{criticalLimits.length > 1 ? 's' : ''} cerca del máximo. 
                Considera actualizar tu plan.
              </p>
            </div>
            {onUpgrade && (
              <Button variant="error" size="sm" onClick={onUpgrade}>
                Actualizar Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Uso de Recursos - Plan {tenant.plan}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limits.map((limit) => {
              const percentage = getUsagePercentage(limit.current, limit.max);
              const status = getUsageStatus(percentage);
              const Icon = limit.icon;
              
              return (
                <div key={limit.key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {limit.label}
                      </span>
                    </div>
                    <Badge variant={status.variant} size="sm">
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {limit.current.toLocaleString()} / {limit.max.toLocaleString()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= 90 
                            ? 'bg-error-500' 
                            : percentage >= 75 
                            ? 'bg-warning-500' 
                            : 'bg-success-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRemainingLimit(limit.key, limit.current).toLocaleString()} {limit.unit} restantes
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comparación de Planes
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ¿Necesitas más recursos?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Actualiza tu plan para obtener más usuarios, productos y funcionalidades avanzadas
            </p>
            {onUpgrade && (
              <Button onClick={onUpgrade}>
                Ver Planes Disponibles
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};