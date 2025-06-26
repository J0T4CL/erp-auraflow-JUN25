import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  ShoppingBag,
  UserCheck,
  Factory,
  Target,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTenantFeatures } from '../../hooks/useTenantFeatures';
import { TenantSelector } from '../tenant/TenantSelector';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  feature?: keyof import('../../types/tenant').TenantFeatures;
  permissions?: string[];
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, company } = useAuthStore();
  const { t } = useLanguage();
  const { hasFeature } = useTenantFeatures();

  const navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'inventory',
      label: t('nav.inventory'),
      icon: Package,
      path: '/inventory',
      feature: 'inventory',
      permissions: ['inventory:read'],
    },
    {
      id: 'pos',
      label: t('nav.pos'),
      icon: ShoppingCart,
      path: '/pos',
      feature: 'pos',
      permissions: ['pos:read'],
    },
    {
      id: 'invoicing',
      label: t('nav.invoicing'),
      icon: FileText,
      path: '/invoicing',
      feature: 'invoicing',
      permissions: ['invoicing:read'],
    },
    {
      id: 'expenses',
      label: t('nav.expenses'),
      icon: Receipt,
      path: '/expenses',
      feature: 'expenses',
      permissions: ['expenses:read'],
    },
    {
      id: 'purchases',
      label: 'Compras',
      icon: ShoppingBag,
      path: '/purchases',
      permissions: ['purchases:read'],
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Target,
      path: '/crm',
      permissions: ['crm:read'],
    },
    {
      id: 'hr',
      label: 'Recursos Humanos',
      icon: UserCheck,
      path: '/hr',
      permissions: ['hr:read'],
    },
    {
      id: 'production',
      label: 'Producción',
      icon: Factory,
      path: '/production',
      permissions: ['production:read'],
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      path: '/reports',
      feature: 'reports',
      permissions: ['reports:read'],
    },
    {
      id: 'users',
      label: t('nav.users'),
      icon: Users,
      path: '/users',
      permissions: ['users:read'],
    },
    {
      id: 'tenant-settings',
      label: 'Empresa',
      icon: Building,
      path: '/tenant-settings',
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings,
      path: '/settings',
    },
  ];

  const hasPermission = (permissions?: string[]) => {
    if (!permissions || !user) return true;
    return permissions.some(permission => 
      user.permissions.some(p => `${p.module}:${p.action}` === permission)
    );
  };

  const filteredItems = navigationItems.filter(item => {
    // Check permissions
    if (!hasPermission(item.permissions)) return false;
    
    // Check feature access for tenant-specific features
    if (item.feature && !hasFeature(item.feature)) return false;
    
    return true;
  });

  const handleItemClick = (path: string) => {
    onNavigate(path);
    onClose(); // Close mobile sidebar
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 h-full z-50',
          // Mobile styles
          'fixed lg:relative inset-y-0 left-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop styles
          isCollapsed ? 'lg:w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
                  AuraFlow
                </h1>
                {company && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {company.name}
                  </p>
                )}
              </div>
            )}
            
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <X size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Tenant Selector */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <TenantSelector />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            const isFeatureDisabled = item.feature && !hasFeature(item.feature);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.path)}
                disabled={isFeatureDisabled}
                className={clsx(
                  'w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : isFeatureDisabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                  isCollapsed ? 'justify-center' : 'justify-start gap-3'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">
                    {item.label}
                    {isFeatureDisabled && (
                      <span className="ml-2 text-xs text-gray-400">
                        (Premium)
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && user && (
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};