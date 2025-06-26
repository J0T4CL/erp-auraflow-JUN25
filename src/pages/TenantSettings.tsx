import React, { useState } from 'react';
import { 
  Building, 
  Settings as SettingsIcon, 
  Crown, 
  Users, 
  Shield, 
  Palette,
  Bell,
  CreditCard,
  BarChart3,
  Save
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TenantSelector } from '../components/tenant/TenantSelector';
import { PlanUpgrade } from '../components/tenant/PlanUpgrade';
import { UsageLimits } from '../components/tenant/UsageLimits';
import { useTenant } from '../contexts/TenantContext';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsTab: React.FC<{
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300'
        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const GeneralSettings: React.FC = () => {
  const { tenant, updateTenantSettings } = useTenant();
  const [formData, setFormData] = useState(tenant?.settings || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await updateTenantSettings(formData);
    setIsLoading(false);
  };

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información de la Empresa
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Empresa"
              value={tenant.displayName}
              disabled
            />
            <Input
              label="Subdominio"
              value={`${tenant.subdomain}.auraflow.com`}
              disabled
            />
            <Input
              label="Industria"
              value={tenant.industry}
              disabled
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Actual
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="success">{tenant.plan}</Badge>
                <span className="text-sm text-gray-500">
                  {tenant.status === 'active' ? 'Activo' : tenant.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración Regional
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Lima">Lima (GMT-5)</option>
                <option value="America/Santiago">Santiago (GMT-3)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="PEN">PEN - Sol Peruano</option>
                <option value="CLP">CLP - Peso Chileno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <Input
              label="Formato de Fecha"
              value={formData.dateFormat}
              onChange={(e) => setFormData(prev => ({ ...prev, dateFormat: e.target.value }))}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración Fiscal
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tasa de Impuesto por Defecto (%)"
              type="number"
              step="0.01"
              value={formData.taxSettings?.defaultTaxRate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                taxSettings: {
                  ...prev.taxSettings,
                  defaultTaxRate: parseFloat(e.target.value)
                }
              }))}
            />
            
            <Input
              label="Número de Identificación Fiscal"
              value={formData.taxSettings?.taxNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                taxSettings: {
                  ...prev.taxSettings,
                  taxNumber: e.target.value
                }
              }))}
            />

            <Input
              label="Prefijo de Factura"
              value={formData.taxSettings?.invoicePrefix}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                taxSettings: {
                  ...prev.taxSettings,
                  invoicePrefix: e.target.value
                }
              }))}
            />

            <Input
              label="Formato de Numeración"
              value={formData.taxSettings?.invoiceNumberFormat}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                taxSettings: {
                  ...prev.taxSettings,
                  invoiceNumberFormat: e.target.value
                }
              }))}
              helper="Use {PREFIX}, {YYYY}, {MM}, {####}"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={isLoading} icon={Save}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};

const PlanSettings: React.FC = () => {
  const { tenant, getAvailablePlans } = useTenant();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!tenant) return null;

  const plans = getAvailablePlans();
  const currentPlan = plans.find(p => p.id === tenant.plan);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Plan Actual
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentPlan?.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentPlan?.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">Activo</Badge>
                  <span className="text-sm text-gray-500">
                    Próxima facturación: {tenant.billing.nextBillingDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentPlan?.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                /{currentPlan?.billingCycle === 'monthly' ? 'mes' : 'año'}
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowUpgrade(true)}
              >
                Actualizar Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UsageLimits onUpgrade={() => setShowUpgrade(true)} />

      <PlanUpgrade 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />
    </div>
  );
};

export const TenantSettings: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'plan', label: 'Plan y Facturación', icon: Crown },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'branding', label: 'Marca', icon: Palette },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'plan':
        return <PlanSettings />;
      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sección en Desarrollo
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tenant Selector */}
      <Card>
        <CardContent>
          <TenantSelector />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <SettingsIcon size={20} />
                Configuración
              </h2>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <SettingsTab
                    key={tab.id}
                    id={tab.id}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};