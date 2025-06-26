import React, { useEffect, useState } from 'react';
import { Package, FileText, CreditCard, User, Download, Eye, MapPin, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { usePortalStore } from '../../store/portalStore';
import type { CustomerOrder, CustomerInvoice } from '../../types/portal';

const OrderDetailsModal: React.FC<{
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      confirmed: 'primary',
      processing: 'primary',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error'
    } as const;
    
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Pedido" size="lg">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pedido {order.orderNumber}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Realizado el {order.date.toLocaleDateString()}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Número de seguimiento: {order.trackingNumber}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Entrega estimada: {order.estimatedDelivery.toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Productos</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cantidad: {item.quantity} × ${item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${item.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos:</span>
              <span>${order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span>${order.shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Dirección de Envío</h4>
          <div className="text-gray-600 dark:text-gray-400">
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const PaymentModal: React.FC<{
  invoice: CustomerInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ invoice, isOpen, onClose }) => {
  const { createCustomerPayment, isLoading } = usePortalStore();
  const [paymentData, setPaymentData] = useState({
    amount: invoice?.remainingAmount || 0,
    method: 'card' as const,
    reference: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      await createCustomerPayment({
        ...paymentData,
        invoiceId: invoice.id
      });
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Realizar Pago" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Factura {invoice.invoiceNumber}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Monto total:</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagado:</span>
              <span>${invoice.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Pendiente:</span>
              <span>${invoice.remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Input
          label="Monto a pagar"
          type="number"
          step="0.01"
          value={paymentData.amount}
          onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Método de pago
          </label>
          <select
            value={paymentData.method}
            onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="card">Tarjeta de crédito/débito</option>
            <option value="transfer">Transferencia bancaria</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        <Input
          label="Referencia (opcional)"
          value={paymentData.reference}
          onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
          placeholder="Número de referencia"
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} fullWidth>
            Procesar Pago
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    customerOrders,
    customerInvoices,
    customerPayments,
    fetchCustomerOrders,
    fetchCustomerInvoices,
    fetchCustomerPayments,
    isLoading
  } = usePortalStore();

  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchCustomerOrders();
    fetchCustomerInvoices();
    fetchCustomerPayments();
  }, [fetchCustomerOrders, fetchCustomerInvoices, fetchCustomerPayments]);

  const handleViewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handlePayInvoice = (invoice: CustomerInvoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      confirmed: 'primary',
      processing: 'primary',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {status}
      </Badge>
    );
  };

  const getInvoiceStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      sent: 'primary',
      paid: 'success',
      overdue: 'error',
      cancelled: 'error'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {currentUser?.firstName}!
        </h1>
        <p className="opacity-90">
          Aquí puedes consultar tus pedidos, facturas y realizar pagos de forma segura.
        </p>
        {currentUser?.customerData && (
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm opacity-90">Puntos de lealtad</p>
              <p className="text-xl font-bold">{currentUser.customerData.loyaltyPoints}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm opacity-90">Total compras</p>
              <p className="text-xl font-bold">${currentUser.customerData.totalPurchases.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pedidos Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customerOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customerInvoices.filter(i => i.status !== 'paid').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos Realizados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customerPayments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pedidos Recientes
          </h3>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {customerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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
                      <span className="text-gray-900 dark:text-white">
                        {order.date.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getOrderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${order.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewOrder(order)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customerOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes pedidos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tus pedidos aparecerán aquí una vez que realices una compra
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invoices */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Facturas Pendientes
          </h3>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Factura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Monto
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
                {customerInvoices.filter(invoice => invoice.status !== 'paid').map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {invoice.date.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {invoice.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${invoice.remainingAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          de ${invoice.amount.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getInvoiceStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.downloadUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          />
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CreditCard}
                          onClick={() => handlePayInvoice(invoice)}
                        >
                          Pagar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customerInvoices.filter(invoice => invoice.status !== 'paid').length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes facturas pendientes
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                ¡Excelente! Todas tus facturas están al día
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
      />

      <PaymentModal
        invoice={selectedInvoice}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};