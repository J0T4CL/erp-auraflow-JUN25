import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDashboardStore } from '../store/dashboardStore';
import { useInventoryStore } from '../store/inventoryStore';
import { usePOSStore } from '../store/posStore';
import { useExpensesStore } from '../store/expensesStore';
import { useInvoicingStore } from '../store/invoicingStore';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
}> = ({ title, value, change, icon: Icon, prefix = '', suffix = '', onClick }) => {
  const { t } = useLanguage();
  const isPositive = change >= 0;
  
  return (
    <Card 
      hover={!!onClick} 
      className={`p-4 sm:p-6 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success-600 mr-1 flex-shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-error-600 mr-1 flex-shrink-0" />
            )}
            <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-success-600' : 'text-error-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 truncate">
              {t('dashboard.vsLastMonth')}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { metrics, isLoading, fetchMetrics, updateMetricsFromStores } = useDashboardStore();
  const { products, getLowStockProducts } = useInventoryStore();
  const { sales } = usePOSStore();
  const { expenses } = useExpensesStore();
  const { invoices } = useInvoicingStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Actualizar métricas cuando cambien los datos de otros stores
  useEffect(() => {
    if (products.length > 0 || sales.length > 0 || expenses.length > 0 || invoices.length > 0) {
      updateMetricsFromStores({ products, sales, expenses, invoices });
    }
  }, [products, sales, expenses, invoices, updateMetricsFromStores]);

  const lowStockProducts = getLowStockProducts();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse">
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title={t('dashboard.salesMonth')}
          value={metrics.salesTotal}
          change={metrics.salesGrowth}
          icon={DollarSign}
          prefix="$"
        />
        <MetricCard
          title={t('dashboard.orders')}
          value={metrics.ordersCount}
          change={metrics.ordersGrowth}
          icon={ShoppingCart}
        />
        <MetricCard
          title={t('dashboard.avgTicket')}
          value={metrics.avgOrderValue.toFixed(2)}
          change={metrics.avgOrderGrowth}
          icon={TrendingUp}
          prefix="$"
        />
        <MetricCard
          title={t('dashboard.lowStock')}
          value={lowStockProducts.length}
          change={0}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de ingresos mensuales */}
        <Card>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.monthlyRevenue')}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Ingresos"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    name="Gastos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.topProducts')}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {metrics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 dark:text-primary-300 font-bold text-xs sm:text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {product.sales} {t('dashboard.sales')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Ventas recientes */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentSales')}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {metrics.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {sale.invoiceNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      ${sale.total.toLocaleString()}
                    </p>
                    <Badge
                      variant={sale.status === 'completed' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {sale.status === 'completed' ? t('dashboard.completed') : t('dashboard.pending')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de stock */}
        <Card>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.stockAlerts')}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-4 sm:py-6">
                  <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('dashboard.noLowStock')}
                  </p>
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Stock: {product.stock} / Mín: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {lowStockProducts.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    Ver todos ({lowStockProducts.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};