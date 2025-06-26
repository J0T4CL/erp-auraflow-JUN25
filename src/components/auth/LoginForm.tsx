import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../contexts/LanguageContext';

export const LoginForm: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidCredentials'));
    }
  };

  const handlePortalAccess = () => {
    // Abrir el portal en una nueva pestaña
    window.open('/portal', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AuraFlow</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">ERP Cloud para PYMEs</p>
        </div>

        {/* Login Form */}
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              {t('auth.login')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-1">
              {t('auth.loginTitle')}
            </p>
          </div>

          {error && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <p className="text-error-700 dark:text-error-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="tu@empresa.com"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
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
              {t('auth.login')}
            </Button>
          </form>

          {/* Portal Access Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handlePortalAccess}
              icon={ExternalLink}
              size="lg"
            >
              Acceder al Portal de Clientes y Colaboradores
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Portal independiente para clientes y colaboradores
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('auth.needHelp')}{' '}
            <a
              href="https://auraslt.com/contact/"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              {t('auth.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};