import React from 'react';
import { AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTenantLimits } from '../../hooks/useTenantLimits';
import type { TenantLimits } from '../../types/tenant';

interface LimitGateProps {
  limit: keyof TenantLimits;
  currentUsage: number;
  children: React.ReactNode;
  action?: string;
  onUpgrade?: () => void;
}

export const LimitGate: React.FC<LimitGateProps> = ({
  limit,
  currentUsage,
  children,
  action = 'realizar esta acción',
  onUpgrade
}) => {
  const { canPerformAction, getLimitInfo } = useTenantLimits();

  const limitInfo = getLimitInfo(limit, currentUsage);
  
  if (!limitInfo || limitInfo.canPerform) {
    return <>{children}</>;
  }

  const getLimitLabel = (limit: keyof TenantLimits): string => {
    const labels = {
      maxUsers: 'usuarios',
      maxProducts: 'productos',
      maxTransactions: 'transacciones',
      maxStorage: 'almacenamiento',
      maxApiCalls: 'llamadas API',
      maxLocations: 'ubicaciones',
      maxIntegrations: 'integraciones'
    };
    return labels[limit] || limit;
  };

  return (
    <Card className="border-l-4 border-l-warning-500 bg-warning-50 dark:bg-warning-900/20">
      <CardContent className="py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-warning-800 dark:text-warning-200 mb-2">
              Límite Alcanzado
            </h3>
            
            <p className="text-warning-700 dark:text-warning-300 mb-4">
              Has alcanzado el límite de <strong>{getLimitLabel(limit)}</strong> para tu plan actual.
              No puedes {action} hasta que actualices tu plan o liberes espacio.
            </p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="warning">
                  {limitInfo.current} / {limitInfo.max} {getLimitLabel(limit)}
                </Badge>
                <span className="text-sm text-warning-600 dark:text-warning-400">
                  ({limitInfo.percentage.toFixed(1)}% usado)
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {onUpgrade && (
                <Button 
                  onClick={onUpgrade}
                  icon={TrendingUp}
                  size="sm"
                >
                  Actualizar Plan
                </Button>
              )}
              
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Navigate to management page for this resource
                  console.log(`Navigate to ${limit} management`);
                }}
              >
                Gestionar {getLimitLabel(limit)}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};