import React, { useState } from 'react';
import { Crown, Check, Zap, Star, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useTenant } from '../../contexts/TenantContext';
import type { Plan } from '../../types/tenant';

interface PlanUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanUpgrade: React.FC<PlanUpgradeProps> = ({ isOpen, onClose }) => {
  const { tenant, getAvailablePlans, canUpgrade } = useTenant();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const plans = getAvailablePlans();
  const currentPlanIndex = plans.findIndex(p => p.id === tenant?.plan);

  const handleUpgrade = async () => {
    if (!selectedPlan || !tenant) return;
    
    setIsUpgrading(true);
    // Simulate upgrade process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUpgrading(false);
    onClose();
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'starter': return <Star className="w-6 h-6" />;
      case 'professional': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Crown className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getFeatureList = (plan: Plan) => {
    const features = [];
    
    if (plan.features.inventory) features.push('Gestión de Inventario');
    if (plan.features.pos) features.push('Punto de Venta');
    if (plan.features.invoicing) features.push('Facturación Electrónica');
    if (plan.features.expenses) features.push('Control de Gastos');
    if (plan.features.reports) features.push('Reportes Básicos');
    if (plan.features.advancedReports) features.push('Reportes Avanzados');
    if (plan.features.multiLocation) features.push('Multi-sucursal');
    if (plan.features.apiAccess) features.push('Acceso API');
    if (plan.features.customBranding) features.push('Marca Personalizada');
    if (plan.features.prioritySupport) features.push('Soporte Prioritario');
    
    return features;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar Plan"
      size="xl"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Elige el plan perfecto para tu negocio
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Actualiza tu plan para acceder a más funcionalidades y aumentar tus límites
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => {
            const isCurrent = plan.id === tenant?.plan;
            const isUpgrade = index > currentPlanIndex;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  isCurrent 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : isSelected
                    ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                } ${!isCurrent && isUpgrade ? 'cursor-pointer' : ''}`}
                onClick={() => !isCurrent && isUpgrade && setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="warning" className="px-3 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3 ${
                    isCurrent 
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h4>
                  
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      /{plan.billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  
                  {isCurrent && (
                    <Badge variant="primary" size="sm" className="mt-2">
                      Plan Actual
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Límites:</strong>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>👥 {plan.limits.maxUsers} usuarios</div>
                      <div>📦 {plan.limits.maxProducts.toLocaleString()} productos</div>
                      <div>💳 {plan.limits.maxTransactions.toLocaleString()} transacciones/mes</div>
                      <div>💾 {plan.limits.maxStorage} MB almacenamiento</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Características:</strong>
                    </div>
                    <div className="space-y-1">
                      {getFeatureList(plan).slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Check className="w-3 h-3 text-success-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {getFeatureList(plan).length > 4 && (
                        <div className="text-xs text-gray-500">
                          +{getFeatureList(plan).length - 4} más...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isCurrent && isUpgrade && (
                    <div className="mt-4">
                      <Button
                        variant={isSelected ? "success" : "secondary"}
                        size="sm"
                        fullWidth
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {isSelected ? 'Seleccionado' : 'Seleccionar'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedPlan && (
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-success-600 dark:text-success-400" />
              <div>
                <p className="font-medium text-success-800 dark:text-success-200">
                  Plan seleccionado: {plans.find(p => p.id === selectedPlan)?.name}
                </p>
                <p className="text-sm text-success-700 dark:text-success-300">
                  Tu facturación comenzará inmediatamente después de la actualización
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!selectedPlan}
            loading={isUpgrading}
            icon={ArrowRight}
          >
            {isUpgrading ? 'Actualizando...' : 'Actualizar Plan'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};