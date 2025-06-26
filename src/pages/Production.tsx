import React, { useState, useEffect } from 'react';
import { Plus, Search, Factory, Clock, CheckCircle, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useProductionStore } from '../store/productionStore';
import { useInventoryStore } from '../store/inventoryStore';
import type { ProductionOrder } from '../types/production';

const ProductionOrderForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { products } = useInventoryStore();
  const { workStations } = useProductionStore();
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: [''],
    workStations: [''],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      plannedStartDate: new Date(formData.plannedStartDate),
      plannedEndDate: new Date(formData.plannedEndDate),
      assignedTo: formData.assignedTo.filter(id => id),
      workStations: formData.workStations.filter(id => id)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Producto
          </label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Seleccionar producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Cantidad"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioridad
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estación de Trabajo
          </label>
          <select
            value={formData.workStations[0]}
            onChange={(e) => setFormData({ ...formData, workStations: [e.target.value] })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Seleccionar estación</option>
            {workStations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Inicio Planificada"
          type="date"
          value={formData.plannedStartDate}
          onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
          required
        />
        <Input
          label="Fecha de Fin Planificada"
          type="date"
          value={formData.plannedEndDate}
          onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Crear Orden de Producción
        </Button>
      </div>
    </form>
  );
};

export const Production: React.FC = () => {
  const {
    productionOrders,
    workStations,
    isLoading,
    fetchProductionOrders,
    createProductionOrder,
    updateProductionOrder,
    startProduction,
    completeProduction,
    fetchWorkStations,
    getProductionEfficiency,
    getQualityMetrics
  } = useProductionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProductionOrders();
    fetchWorkStations();
  }, [fetchProductionOrders, fetchWorkStations]);

  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const efficiency = getProductionEfficiency();
  const qualityMetrics = getQualityMetrics();
  const activeOrders = productionOrders.filter(order => 
    ['planned', 'released', 'in_progress'].includes(order.status)
  );

  const handleCreateOrder = async (data: any) => {
    try {
      await createProductionOrder(data);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating production order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      planned: 'default',
      released: 'primary',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
      on_hold: 'warning'
    } as const;
    
    const labels = {
      planned: 'Planificada',
      released: 'Liberada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      on_hold: 'En Espera'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error'
    } as const;
    
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'default'} size="sm">
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Órdenes Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeOrders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eficiencia</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {efficiency.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calidad</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {qualityMetrics.passRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estaciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workStations.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar órdenes de producción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="planned">Planificada</option>
            <option value="released">Liberada</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nueva Orden de Producción
        </Button>
      </div>

      {/* Lista de órdenes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Órdenes de Producción ({filteredOrders.length})
          </h3>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                          <Factory className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.operations.length} operaciones
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">Producto #{order.productId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Inicio: {new Date(order.plannedStartDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fin: {new Date(order.plannedEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'planned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startProduction(order.id)}
                          >
                            Iniciar
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => completeProduction(order.id)}
                            className="text-success-600"
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Factory className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay órdenes de producción
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron órdenes con ese término' : 'Comienza creando tu primera orden de producción'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                  Crear Orden de Producción
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear orden */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Orden de Producción"
        size="lg"
      >
        <ProductionOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};