import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { usePortalStore } from '../../store/portalStore';

export const PortalLogin: React.FC = () => {
  const [userType, setUserType] = useState<'customer' | 'employee'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading } = usePortalStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, userType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };

  const handleUserTypeChange = (type: 'customer' | 'employee') => {
    setUserType(type);
    setError('');
    // Set demo credentials
    if (type === 'customer') {
      setEmail('cliente@demo.com');
      setPassword('demo123');
    } else {
      setEmail('colaborador@demo.com');
      setPassword('demo123');
    }
  };

  const handleBackToERP = () => {
    window.close(); // Si se abrió en nueva pestaña
    // O redirigir al ERP principal
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back to ERP Button 
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToERP}
            icon={ArrowLeft}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Volver al ERP
          </Button>
        </div>
      */}
        {/* Logo and Title */}
<div className="text-center">
  <div className="rounded-2xl flex items-center justify-center mx-auto mb-4">
    <img src="/Logo_aura.png" alt="Logo AuraFlow" className="w-40 h-40 object-contain" />
  </div>
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal AuraFlow</h1>
  <p className="text-gray-600 dark:text-gray-400 mt-2">Acceso para clientes y colaboradores</p>
</div>


        {/* User Type Selection */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => handleUserTypeChange('customer')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              userType === 'customer'
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User size={16} />
            Cliente
          </button>
          <button
            onClick={() => handleUserTypeChange('employee')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              userType === 'employee'
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users size={16} />
            Colaborador
          </button>
        </div>

        {/* Login Form */}
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-1">
              {userType === 'customer' ? 'Acceso para clientes' : 'Acceso para colaboradores'}
            </p>
          </div>

          {error && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <p className="text-error-700 dark:text-error-400 text-sm">{error}</p>
            </div>
          )}

          {/* Demo Credentials Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              <strong>Demo:</strong> {userType === 'customer' ? 'cliente@demo.com' : 'colaborador@demo.com'} / demo123
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="tu@email.com"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Iniciar Sesión
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            ¿Necesitas ayuda?{' '}
            <a
              href="https://auraslt.com/contact/"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};