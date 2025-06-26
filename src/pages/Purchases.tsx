import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ShoppingCart, Truck, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { usePurchasesStore } from '../store/purchasesStore';
import { useInventoryStore } from '../store/inventoryStore';
import type { PurchaseOrder, PurchaseOrderItem } from '../types/purchases';

const PurchaseOrderForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { suppliers } = useInventoryStore();
  const { products } = useInventoryStore();
  
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0, taxRate: 16 }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0, taxRate: 16 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const total = formData.items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);
    return sum + subtotal + tax;
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proveedor
          </label>
          <select
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Fecha de Entrega Esperada"
          type="date"
          value={formData.expectedDeliveryDate}
          onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
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
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Productos</h4>
          <Button type="button" onClick={addItem} size="sm" icon={Plus}>
            Agregar Producto
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Producto
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
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
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  required
                />
                
                <Input
                  label="Precio Unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
                
                <div className="flex items-end">
                  <Input
                    label="IVA (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={item.taxRate}
                    onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="ml-2 text-error-600"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Total */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Total: ${total.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Input
        label="Notas"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Notas adicionales..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Crear Orden de Compra
        </Button>
      </div>
    </form>
  );
};

export const Purchases: React.FC = () => {
  const {
    purchaseOrders,
    isLoading,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    approvePurchaseOrder,
    getPendingOrders,
    getOverdueOrders
  } = usePurchasesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingOrders = getPendingOrders();
  const overdueOrders = getOverdueOrders();

  const handleCreateOrder = async (data: any) => {
    try {
      await createPurchaseOrder(data);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'default',
      pending_approval: 'warning',
      approved: 'primary',
      sent: 'primary',
      partial_received: 'warning',
      received: 'success',
      cancelled: 'error'
    } as const;
    
    const labels = {
      draft: 'Borrador',
      pending_approval: 'Pendiente Aprobación',
      approved: 'Aprobada',
      sent: 'Enviada',
      partial_received: 'Parcialmente Recibida',
      received: 'Recibida',
      cancelled: 'Cancelada'
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Órdenes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingOrders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Órdenes Vencidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueOrders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total del Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${purchaseOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entregas a Tiempo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  85%
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-success-600 dark:text-success-400" />
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
              placeholder="Buscar órdenes de compra..."
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
            <option value="draft">Borrador</option>
            <option value="pending_approval">Pendiente Aprobación</option>
            <option value="approved">Aprobada</option>
            <option value="sent">Enviada</option>
            <option value="received">Recibida</option>
          </select>
        </div>
        
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nueva Orden de Compra
        </Button>
      </div>

      {/* Lista de órdenes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Órdenes de Compra ({filteredOrders.length})
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
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Esperada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
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
                          <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">Proveedor #{order.supplierId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${order.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending_approval' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => approvePurchaseOrder(order.id)}
                          >
                            Aprobar
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
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay órdenes de compra
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron órdenes con ese término' : 'Comienza creando tu primera orden de compra'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                  Crear Orden de Compra
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
        title="Nueva Orden de Compra"
        size="xl"
      >
        <PurchaseOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};