import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, Upload, Download, Edit, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useExpensesStore } from '../store/expensesStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { Expense, ExpenseCategory } from '../types';

const ExpenseForm: React.FC<{
  expense?: Expense;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ expense, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const { categories } = useExpensesStore();
  
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    categoryId: expense?.category.id || '',
    costCenter: expense?.costCenter || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receiptFile: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receiptFile: e.target.files[0] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Descripción del gasto"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Centro de Costo"
          value={formData.costCenter}
          onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
          placeholder="Opcional"
        />
        
        <Input
          label="Fecha"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comprobante
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Formatos soportados: JPG, PNG, PDF (máx. 5MB)
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {expense ? 'Actualizar Gasto' : 'Registrar Gasto'}
        </Button>
      </div>
    </form>
  );
};

const CategoryForm: React.FC<{
  category?: ExpenseCategory;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    budgetLimit: category?.budgetLimit || 0,
    color: category?.color || '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        label="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <Input
        label="Límite de Presupuesto (opcional)"
        type="number"
        step="0.01"
        min="0"
        value={formData.budgetLimit}
        onChange={(e) => setFormData({ ...formData, budgetLimit: parseFloat(e.target.value) || 0 })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {colorOptions.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {category ? 'Actualizar Categoría' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
};

export const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const {
    expenses,
    categories,
    isLoading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getExpensesByCategory,
    getMonthlyExpenses
  } = useExpensesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category.id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const expenseDate = new Date(expense.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = getMonthlyExpenses();
  const expensesByCategory = getExpensesByCategory();

  const handleCreateExpense = async (data: any) => {
    try {
      await createExpense(data);
      setShowExpenseModal(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleUpdateExpense = async (data: any) => {
    if (editingExpense) {
      try {
        await updateExpense(editingExpense.id, data);
        setEditingExpense(null);
        setShowExpenseModal(false);
      } catch (error) {
        console.error('Error updating expense:', error);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await createCategory(data);
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (data: any) => {
    if (editingCategory) {
      try {
        await updateCategory(editingCategory.id, data);
        setEditingCategory(null);
        setShowCategoryModal(false);
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      paid: 'success'
    } as const;
    
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      paid: 'Pagado'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Estado', 'Centro de Costo'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        `"${expense.description}"`,
        expense.category.name,
        expense.amount,
        expense.status,
        expense.costCenter || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gastos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total del Período</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos del Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${monthlyExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expenses.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-auto"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-auto"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToCSV} icon={Download}>
            Exportar
          </Button>
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
            Categorías
          </Button>
          <Button onClick={() => setShowExpenseModal(true)} icon={Plus}>
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Lista de gastos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gastos ({filteredExpenses.length})
          </h3>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
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
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                          {expense.costCenter && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{expense.costCenter}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: expense.category.color }}
                        />
                        <span className="text-gray-900 dark:text-white">{expense.category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${expense.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {expense.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            onClick={() => window.open(expense.receiptUrl, '_blank')}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditExpense(expense)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay gastos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron gastos con ese término' : 'Comienza registrando tu primer gasto'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowExpenseModal(true)} icon={Plus}>
                  Registrar Gasto
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar gasto */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
        size="lg"
      >
        <ExpenseForm
          expense={editingExpense || undefined}
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
          onCancel={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
        />
      </Modal>

      {/* Modal para categorías */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="md"
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      </Modal>
    </div>
  );
};