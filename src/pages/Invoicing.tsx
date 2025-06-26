import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Send, Download, Eye, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useInvoicingStore } from '../store/invoicingStore';
import { usePOSStore } from '../store/posStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { Invoice, Customer, InvoiceItem } from '../types';

const InvoiceForm: React.FC<{
  invoice?: Invoice;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ invoice, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const { customers } = usePOSStore();
  
  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || '',
    issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: invoice?.notes || '',
    items: invoice?.items || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 16, total: 0 }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for the item
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const item = newItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const tax = subtotal * (item.taxRate / 100);
      newItems[index].total = subtotal + tax;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 16, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const total = subtotal + taxAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cliente
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Seleccionar cliente</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de Emisión"
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            required
          />
          <Input
            label="Fecha de Vencimiento"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Conceptos</h4>
          <Button type="button" onClick={addItem} size="sm" icon={Plus}>
            Agregar Concepto
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Descripción"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Descripción del producto/servicio"
                    required
                  />
                </div>
                <Input
                  label="Cantidad"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  required
                />
                <Input
                  label="Precio Unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="IVA (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-error-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="font-medium">${item.total.toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA:</span>
              <span>${taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
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
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {invoice ? 'Actualizar Factura' : 'Crear Factura'}
        </Button>
      </div>
    </form>
  );
};

export const Invoicing: React.FC = () => {
  const { t } = useLanguage();
  const {
    invoices,
    isLoading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    generatePDF
  } = useInvoicingStore();
  const { customers, fetchCustomers } = usePOSStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [fetchInvoices, fetchCustomers]);

  const filteredInvoices = invoices.filter(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (data: any) => {
    try {
      await createInvoice(data);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleUpdateInvoice = async (data: any) => {
    if (editingInvoice) {
      try {
        await updateInvoice(editingInvoice.id, data);
        setEditingInvoice(null);
        setShowModal(false);
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      try {
        await deleteInvoice(id);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      await sendInvoice(id);
      alert('Factura enviada exitosamente');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error al enviar la factura');
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      await generatePDF(id);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'default',
      sent: 'warning',
      approved: 'success',
      cancelled: 'error'
    } as const;
    
    const labels = {
      draft: 'Borrador',
      sent: 'Enviada',
      approved: 'Aprobada',
      cancelled: 'Cancelada'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      partial: 'warning',
      paid: 'success',
      overdue: 'error'
    } as const;
    
    const labels = {
      pending: 'Pendiente',
      partial: 'Parcial',
      paid: 'Pagada',
      overdue: 'Vencida'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
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
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar facturas..."
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
            <option value="sent">Enviada</option>
            <option value="approved">Aprobada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Nueva Factura
        </Button>
      </div>

      {/* Lista de facturas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Facturas ({filteredInvoices.length})
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
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => {
                  const customer = customers.find(c => c.id === invoice.customerId);
                  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'paid';
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {invoice.items.length} concepto{invoice.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">{customer?.name || 'Cliente no encontrado'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${isOverdue ? 'text-error-600 dark:text-error-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${invoice.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(isOverdue ? 'overdue' : invoice.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            onClick={() => handleDownloadPDF(invoice.id)}
                          />
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Send}
                              onClick={() => handleSendInvoice(invoice.id)}
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditInvoice(invoice)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay facturas
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron facturas con ese término' : 'Comienza creando tu primera factura'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                  Crear Factura
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar factura */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInvoice(null);
        }}
        title={editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
        size="xl"
      >
        <InvoiceForm
          invoice={editingInvoice || undefined}
          onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
          onCancel={() => {
            setShowModal(false);
            setEditingInvoice(null);
          }}
        />
      </Modal>
    </div>
  );
};