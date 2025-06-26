import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TenantProvider } from './contexts/TenantContext';
import { LoginForm } from './components/auth/LoginForm';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { Invoicing } from './pages/Invoicing';
import { Expenses } from './pages/Expenses';
import { Purchases } from './pages/Purchases';
import { CRM } from './pages/CRM';
import { HR } from './pages/HR';
import { Production } from './pages/Production';
import { Settings } from './pages/Settings';
import { TenantSettings } from './pages/TenantSettings';
import { Portal } from './pages/Portal';
import { FeatureGate } from './components/common/FeatureGate';

// Placeholder components para las demás páginas
const Reports = () => (
  <FeatureGate feature="reports">
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reportes Avanzados</h2>
      <p className="text-gray-600 dark:text-gray-400">Módulo en desarrollo - Analytics y reportes personalizados</p>
    </div>
  </FeatureGate>
);

const Users = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gestión de Usuarios</h2>
    <p className="text-gray-600 dark:text-gray-400">Módulo en desarrollo - Administración de usuarios y permisos</p>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/inventory': 'Inventario',
      '/pos': 'Punto de Venta',
      '/invoicing': 'Facturación',
      '/expenses': 'Gastos',
      '/purchases': 'Compras',
      '/crm': 'CRM',
      '/hr': 'Recursos Humanos',
      '/production': 'Producción',
      '/reports': 'Reportes',
      '/users': 'Usuarios',
      '/settings': 'Configuración',
      '/tenant-settings': 'Configuración de Empresa',
    };
    return titles[path] || 'AuraFlow';
  };

  const getBreadcrumbs = (path: string) => {
    const breadcrumbs: Record<string, Array<{ label: string; path?: string }>> = {
      '/dashboard': [{ label: 'Inicio' }],
      '/inventory': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Inventario' }],
      '/pos': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Punto de Venta' }],
      '/invoicing': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Facturación' }],
      '/expenses': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Gastos' }],
      '/purchases': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Compras' }],
      '/crm': [{ label: 'Inicio', path: '/dashboard' }, { label: 'CRM' }],
      '/hr': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Recursos Humanos' }],
      '/production': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Producción' }],
      '/reports': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Reportes' }],
      '/users': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Usuarios' }],
      '/settings': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Configuración' }],
      '/tenant-settings': [{ label: 'Inicio', path: '/dashboard' }, { label: 'Configuración de Empresa' }],
    };
    return breadcrumbs[path] || [];
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/inventory':
        return (
          <FeatureGate feature="inventory">
            <Inventory />
          </FeatureGate>
        );
      case '/pos':
        return (
          <FeatureGate feature="pos">
            <POS />
          </FeatureGate>
        );
      case '/invoicing':
        return (
          <FeatureGate feature="invoicing">
            <Invoicing />
          </FeatureGate>
        );
      case '/expenses':
        return (
          <FeatureGate feature="expenses">
            <Expenses />
          </FeatureGate>
        );
      case '/purchases':
        return <Purchases />;
      case '/crm':
        return <CRM />;
      case '/hr':
        return <HR />;
      case '/production':
        return <Production />;
      case '/reports':
        return <Reports />;
      case '/users':
        return <Users />;
      case '/settings':
        return <Settings />;
      case '/tenant-settings':
        return <TenantSettings />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Portal Route - Accessible without main ERP authentication */}
            <Route path="/portal" element={<Portal />} />
            
            {/* Main ERP Routes */}
            <Route path="/*" element={
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {!isAuthenticated ? (
                  <LoginForm />
                ) : (
                  <TenantProvider>
                    <Layout
                      title={getPageTitle(currentPath)}
                      breadcrumbs={getBreadcrumbs(currentPath)}
                      currentPath={currentPath}
                      onNavigate={handleNavigate}
                    >
                      {renderCurrentPage()}
                    </Layout>
                  </TenantProvider>
                )}
              </div>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;