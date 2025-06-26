import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Archive, Tag, DollarSign, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import type { Product } from '../../types';

interface BulkActionsProps {
  selectedProducts: Product[];
  onUpdateProducts: (updates: Partial<Product>) => void;
  onDeleteProducts: () => void;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedProducts,
  onUpdateProducts,
  onDeleteProducts,
  onClearSelection,
}) => {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'price' | 'stock' | 'category' | 'status'>('price');
  const [bulkValue, setBulkValue] = useState('');
  const [priceAdjustment, setPriceAdjustment] = useState<'fixed' | 'percentage'>('fixed');

  if (selectedProducts.length === 0) return null;

  const handleBulkUpdate = () => {
    let updates: Partial<Product> = {};

    switch (bulkAction) {
      case 'price':
        if (priceAdjustment === 'fixed') {
          updates.price = parseFloat(bulkValue) || 0;
        } else {
          const percentage = parseFloat(bulkValue) || 0;
          // Este sería manejado de manera especial en el store
          updates.price = percentage; // Placeholder
        }
        break;
      case 'stock':
        updates.stock = parseInt(bulkValue) || 0;
        break;
      case 'status':
        updates.isActive = bulkValue === 'active';
        break;
    }

    onUpdateProducts(updates);
    setShowBulkModal(false);
    setBulkValue('');
  };

  const totalValue = selectedProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return (
    <>
      <Card className="border-primary-200 bg-primary-50">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-primary-900">
                {selectedProducts.length} productos seleccionados
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-primary-700">
              <span>
                Valor total: <strong>${totalValue.toLocaleString()}</strong>
              </span>
              <span>
                Stock total: <strong>{selectedProducts.reduce((sum, p) => sum + p.stock, 0)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              icon={Edit}
            >
              Editar Masivo
            </Button>
            
            <Button
              variant="error"
              size="sm"
              onClick={onDeleteProducts}
              icon={Trash2}
            >
              Eliminar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Edición Masiva"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Aplicar cambios a {selectedProducts.length} productos seleccionados
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setBulkAction('price')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  bulkAction === 'price'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5 mb-1" />
                <div className="font-medium">Precios</div>
                <div className="text-xs text-gray-500">Actualizar precios</div>
              </button>
              
              <button
                onClick={() => setBulkAction('stock')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  bulkAction === 'stock'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="w-5 h-5 mb-1" />
                <div className="font-medium">Stock</div>
                <div className="text-xs text-gray-500">Ajustar inventario</div>
              </button>
              
              <button
                onClick={() => setBulkAction('status')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  bulkAction === 'status'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Archive className="w-5 h-5 mb-1" />
                <div className="font-medium">Estado</div>
                <div className="text-xs text-gray-500">Activar/Desactivar</div>
              </button>
              
              <button
                onClick={() => setBulkAction('category')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  bulkAction === 'category'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Tag className="w-5 h-5 mb-1" />
                <div className="font-medium">Categoría</div>
                <div className="text-xs text-gray-500">Cambiar categoría</div>
              </button>
            </div>
          </div>

          {bulkAction === 'price' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setPriceAdjustment('fixed')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    priceAdjustment === 'fixed'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Precio Fijo
                </button>
                <button
                  onClick={() => setPriceAdjustment('percentage')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    priceAdjustment === 'percentage'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Porcentaje
                </button>
              </div>
              
              <Input
                label={priceAdjustment === 'fixed' ? 'Nuevo Precio' : 'Porcentaje de Ajuste'}
                type="number"
                step={priceAdjustment === 'fixed' ? '0.01' : '1'}
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={priceAdjustment === 'fixed' ? '0.00' : '10 (para +10%)'}
              />
            </div>
          )}

          {bulkAction === 'stock' && (
            <Input
              label="Nuevo Stock"
              type="number"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="0"
            />
          )}

          {bulkAction === 'status' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkValue('active')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    bulkValue === 'active'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setBulkValue('inactive')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    bulkValue === 'inactive'
                      ? 'bg-error-100 text-error-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Inactivo
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowBulkModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={!bulkValue && bulkAction !== 'status'}
            >
              Aplicar Cambios
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};