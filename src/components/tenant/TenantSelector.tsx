import React, { useState } from 'react';
import { Building, ChevronDown, Check, Plus, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useTenant } from '../../contexts/TenantContext';
import { useTenantStore } from '../../store/tenantStore';

export const TenantSelector: React.FC = () => {
  const { tenant, switchTenant } = useTenant();
  const { availableTenants } = useTenantStore();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!tenant) return null;

  const handleTenantSwitch = async (tenantId: string) => {
    await switchTenant(tenantId);
    setShowSelector(false);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'free': return 'default';
      case 'starter': return 'primary';
      case 'professional': return 'success';
      case 'enterprise': return 'warning';
      default: return 'default';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'free': return 'Gratuito';
      case 'starter': return 'Inicial';
      case 'professional': return 'Profesional';
      case 'enterprise': return 'Empresarial';
      default: return plan;
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
        >
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {tenant.displayName}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={getPlanBadgeVariant(tenant.plan)} size="sm">
                {getPlanLabel(tenant.plan)}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tenant.subdomain}.auraflow.com
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <Modal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        title="Seleccionar Empresa"
        size="md"
      >
        <div className="space-y-4">
          {/* Current tenant */}
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-primary-900 dark:text-primary-100">
                    {tenant.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(tenant.plan)} size="sm">
                      {getPlanLabel(tenant.plan)}
                    </Badge>
                    <span className="text-xs text-primary-700 dark:text-primary-300">
                      Actual
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Settings}
                  onClick={() => {
                    setShowSelector(false);
                    // Navigate to tenant settings
                  }}
                />
              </div>
            </div>
          </div>

          {/* Other available tenants */}
          {availableTenants.filter(t => t.id !== tenant.id).map((availableTenant) => (
            <div
              key={availableTenant.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors"
              onClick={() => handleTenantSwitch(availableTenant.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {availableTenant.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(availableTenant.plan)} size="sm">
                      {getPlanLabel(availableTenant.plan)}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {availableTenant.subdomain}.auraflow.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Create new tenant */}
          <button
            onClick={() => {
              setShowSelector(false);
              setShowCreateModal(true);
            }}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Crear Nueva Empresa</span>
            </div>
          </button>

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowSelector(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};