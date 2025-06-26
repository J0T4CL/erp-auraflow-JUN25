import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  CreditCard, 
  Plug,
  Save,
  Moon,
  Sun,
  Monitor,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettingsStore } from '../store/settingsStore';

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
  const { t } = useLanguage();
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState(settings);

  const handleSave = async () => {
    await updateSettings(formData);
  };

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.companyInfo')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('settings.companyName')}
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
            <Input
              label={t('settings.taxId')}
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
            />
            <Input
              label={t('common.phone')}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label={t('settings.website')}
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              {t('settings.address')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t('settings.street')}
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                />
              </div>
              <Input
                label={t('settings.city')}
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
              />
              <Input
                label={t('settings.state')}
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
              />
              <Input
                label={t('settings.zipCode')}
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address.zipCode', e.target.value)}
              />
              <Input
                label={t('settings.country')}
                value={formData.address.country}
                onChange={(e) => handleChange('address.country', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.businessSettings')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.currency')}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
                <option value="BRL">BRL - Real Brasileño</option>
              </select>
            </div>
            <Input
              label={t('settings.taxRate')}
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
            />
            <Input
              label={t('settings.invoiceFormat')}
              value={formData.invoiceFormat}
              onChange={(e) => handleChange('invoiceFormat', e.target.value)}
              helper="Use {YYYY} para año, {MM} para mes, {####} para número"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.fiscalYear')}
              </label>
              <select
                value={formData.fiscalYear}
                onChange={(e) => handleChange('fiscalYear', e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="calendar">Año Calendario (Enero - Diciembre)</option>
                <option value="fiscal">Año Fiscal (Abril - Marzo)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={isLoading} icon={Save}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

const AppearanceSettings: React.FC = () => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: t('settings.lightTheme'), icon: Sun },
    { value: 'dark', label: t('settings.darkTheme'), icon: Moon },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.theme')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as 'light' | 'dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`} />
                    <span className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LanguageSettings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const languageOptions = [
    { value: 'es', label: t('settings.spanish'), flag: '🇪🇸' },
    { value: 'en', label: t('settings.english'), flag: '🇺🇸' },
    { value: 'pt', label: t('settings.portuguese'), flag: '🇧🇷' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.selectLanguage')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {languageOptions.map((option) => {
              const isSelected = language === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setLanguage(option.value as 'es' | 'en' | 'pt')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.flag}</span>
                    <span className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [notifications, setNotifications] = useState(settings.notifications);

  const handleToggle = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
  };

  const handleSave = async () => {
    await updateSettings({ notifications });
  };

  const notificationOptions = [
    { key: 'emailNotifications', label: t('settings.emailNotifications') },
    { key: 'pushNotifications', label: t('settings.pushNotifications') },
    { key: 'lowStockAlerts', label: t('settings.lowStockAlerts') },
    { key: 'salesReports', label: t('settings.salesReports') },
    { key: 'systemUpdates', label: t('settings.systemUpdates') },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.notifications')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                <button
                  onClick={() => handleToggle(option.key as keyof typeof notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[option.key as keyof typeof notifications]
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[option.key as keyof typeof notifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={isLoading} icon={Save}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  const { t } = useLanguage();
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [security, setSecurity] = useState(settings.security);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSecuritySave = async () => {
    await updateSettings({ security });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert(t('settings.passwordChanged'));
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.changePassword')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <Input
              label={t('settings.currentPassword')}
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              label={t('settings.newPassword')}
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <Input
              label={t('settings.confirmPassword')}
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <Button 
              onClick={handlePasswordChange}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {t('settings.changePassword')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.security')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('settings.twoFactorAuth')}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
              <button
                onClick={() => setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  security.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="max-w-md">
              <Input
                label={t('settings.sessionTimeout')}
                type="number"
                min="5"
                max="480"
                value={security.sessionTimeout}
                onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                helper="Tiempo en minutos antes de cerrar sesión automáticamente"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSecuritySave} loading={isLoading} icon={Save}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

const BillingSettings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.currentPlan')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Profesional</h4>
              <p className="text-gray-600 dark:text-gray-400">Acceso completo a todas las funcionalidades</p>
            </div>
            <Badge variant="success">Activo</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">$99</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">por mes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">15 Dic</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.nextBilling')}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">•••• 4242</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.paymentMethod')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.billingHistory')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-11-15', amount: '$99.00', status: 'Pagado' },
              { date: '2024-10-15', amount: '$99.00', status: 'Pagado' },
              { date: '2024-09-15', amount: '$99.00', status: 'Pagado' },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{invoice.date}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Factura mensual</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">{invoice.amount}</div>
                  <Badge variant="success" size="sm">{invoice.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationsSettings: React.FC = () => {
  const { t } = useLanguage();

  const integrations = [
    {
      name: 'Stripe',
      description: 'Procesamiento de pagos',
      status: 'connected',
      icon: '💳'
    },
    {
      name: 'WhatsApp Business',
      description: 'Notificaciones y comunicación',
      status: 'available',
      icon: '💬'
    },
    {
      name: 'Google Analytics',
      description: 'Análisis y métricas',
      status: 'available',
      icon: '📊'
    },
    {
      name: 'Mailchimp',
      description: 'Email marketing',
      status: 'available',
      icon: '📧'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.integrations')}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.status === 'connected' ? (
                    <>
                      <Badge variant="success">Conectado</Badge>
                      <Button variant="secondary" size="sm">Configurar</Button>
                    </>
                  ) : (
                    <Button variant="primary" size="sm">Conectar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Building },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'billing', label: t('settings.billing'), icon: CreditCard },
    { id: 'integrations', label: t('settings.integrations'), icon: Plug },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <SettingsIcon size={20} />
              {t('settings.title')}
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
  );
};