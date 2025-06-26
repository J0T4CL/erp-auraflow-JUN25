import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, Edit, Trash2, Upload, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImportModal } from '../components/inventory/ImportModal';
import { BulkActions } from '../components/inventory/BulkActions';
import { useInventoryStore } from '../store/inventoryStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { Product } from '../types';

const ProductForm: React.FC<{
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ product, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || 'pieza',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('inventory.sku')}
          value={formData.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
          required
        />
        <Input
          label={t('inventory.productName')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <Input
        label={t('common.description')}
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('common.price')}
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          required
        />
        <Input
          label={t('inventory.cost')}
          type="number"
          step="0.01"
          min="0"
          value={formData.cost}
          onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label={t('inventory.stock')}
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
        />
        <Input
          label={t('inventory.minStock')}
          type="number"
          min="0"
          value={formData.minStock}
          onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
        />
        <Input
          label={t('inventory.unit')}
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth className="sm:w-auto">
          {t('common.cancel')}
        </Button>
        <Button type="submit" fullWidth className="sm:w-auto">
          {product ? t('inventory.updateProduct') : t('inventory.createProduct')}
        </Button>
      </div>
    </form>
  );
};

export const Inventory: React.FC = () => {
  const { t } = useLanguage();
  const {
    products,
    categories,
    isLoading,
    fetchProducts,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
  } = useInventoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = getLowStockProducts();

  const handleCreateProduct = (data: any) => {
    addProduct({
      ...data,
      companyId: 'company-1',
      category: categories[0] || { id: '1', name: 'General', color: '#3B82F6' },
      isActive: true,
      tags: [],
      suppliers: [],
    });
    setShowModal(false);
  };

  const handleUpdateProduct = (data: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      setShowModal(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(t('inventory.confirmDelete'))) {
      deleteProduct(id);
    }
  };

  const handleSelectProduct = (product: Product, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, product]);
    } else {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProducts(filteredProducts);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkUpdate = (updates: Partial<Product>) => {
    selectedProducts.forEach(product => {
      updateProduct(product.id, updates);
    });
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    if (confirm(t('inventory.confirmBulkDelete', { count: selectedProducts.length }))) {
      selectedProducts.forEach(product => {
        deleteProduct(product.id);
      });
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU', t('common.name'), t('common.description'), t('common.price'), t('inventory.cost'), t('inventory.stock'), t('inventory.minStock'), t('inventory.unit'), t('common.status')];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        product.sku,
        `"${product.name}"`,
        `"${product.description || ''}"`,
        product.price,
        product.cost,
        product.stock,
        product.minStock,
        product.unit,
        product.isActive ? t('common.active') : t('common.inactive')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-l-4 border-l-warning-500 bg-warning-50 dark:bg-warning-900/20">
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-warning-800 dark:text-warning-200 text-sm sm:text-base">
                {t('inventory.lowStockAlert', { count: lowStockProducts.length })}
              </p>
              <p className="text-xs sm:text-sm text-warning-700 dark:text-warning-300">
                {t('inventory.reviewInventory')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones masivas */}
      {selectedProducts.length > 0 && (
        <BulkActions
          selectedProducts={selectedProducts}
          onUpdateProducts={handleBulkUpdate}
          onDeleteProducts={handleBulkDelete}
          onClearSelection={() => {
            setSelectedProducts([]);
            setSelectAll(false);
          }}
        />
      )}

      {/* Header con acciones */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('common.search') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <Button variant="secondary" icon={Filter} size="sm" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">{t('common.filter')}</span>
            </Button>
            <Button variant="secondary" onClick={exportToCSV} icon={Download} size="sm" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">{t('common.export')}</span>
            </Button>
            <Button variant="secondary" onClick={() => setShowImportModal(true)} icon={Upload} size="sm" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">{t('common.import')}</span>
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)} icon={Plus} className="w-full sm:w-auto">
            {t('inventory.newProduct')}
          </Button>
        </div>
      </div>

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {t('inventory.title')} ({filteredProducts.length})
          </h3>
        </CardHeader>
        <CardContent padding="none">
          {/* Mobile view */}
          <div className="block sm:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('inventory.noProducts')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  {searchTerm ? t('inventory.noProductsFound') : t('inventory.startAdding')}
                </p>
                {!searchTerm && (
                  <div className="space-y-3">
                    <Button onClick={() => setShowModal(true)} icon={Plus} fullWidth>
                      {t('inventory.addProduct')}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowImportModal(true)} icon={Upload} fullWidth>
                      {t('inventory.importProducts')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= product.minStock;
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  
                  return (
                    <div key={product.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectProduct(product, e.target.checked)}
                          className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {product.name}
                            </h4>
                            <Badge
                              variant={product.isActive ? 'success' : 'error'}
                              size="sm"
                            >
                              {product.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">SKU: </span>
                              <span className="font-mono text-gray-900 dark:text-white">{product.sku}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Precio: </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ${product.price.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Stock: </span>
                              <span className={`font-medium ${isLowStock ? 'text-error-600 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>
                                {product.stock}
                              </span>
                              {isLowStock && <AlertTriangle className="inline w-3 h-3 ml-1 text-warning-500" />}
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Mín: </span>
                              <span className="text-gray-900 dark:text-white">{product.minStock}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Edit}
                              onClick={() => handleEditProduct(product)}
                              className="flex-1"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('inventory.sku')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('inventory.stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= product.minStock;
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectProduct(product, e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isLowStock ? 'text-error-600 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>
                            {product.stock}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {product.minStock} mín</span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${product.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={product.isActive ? 'success' : 'error'}
                          size="sm"
                        >
                          {product.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditProduct(product)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('inventory.noProducts')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? t('inventory.noProductsFound') : t('inventory.startAdding')}
                </p>
                {!searchTerm && (
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => setShowModal(true)} icon={Plus}>
                      {t('inventory.addProduct')}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowImportModal(true)} icon={Upload}>
                      {t('inventory.importProducts')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear/editar producto */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? t('inventory.editProduct') : t('inventory.newProduct')}
        size="lg"
      >
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Modal de importación */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};