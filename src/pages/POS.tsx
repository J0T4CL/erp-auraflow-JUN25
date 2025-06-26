import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, CreditCard, DollarSign, Receipt, Search, X, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useInventoryStore } from '../store/inventoryStore';
import { usePOSStore } from '../store/posStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { Product, Customer } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (product: Product) => void;
}> = ({ product, onAddToCart }) => {
  const isLowStock = product.stock <= product.minStock;
  
  return (
    <Card 
      hover 
      className={`cursor-pointer transition-all ${product.stock === 0 ? 'opacity-50' : ''}`}
      onClick={() => product.stock > 0 && onAddToCart(product)}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary-600 dark:text-primary-400">
            ${product.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${isLowStock ? 'text-warning-600' : 'text-gray-500'}`}>
              {product.stock}
            </span>
            {product.stock === 0 && (
              <Badge variant="error" size="sm">Agotado</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CartItemComponent: React.FC<{
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
}> = ({ item, onUpdateQuantity, onRemove, onUpdateDiscount }) => {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ${item.unitPrice.toLocaleString()} c/u
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
          className="w-8 h-8 p-0"
        >
          <Minus size={14} />
        </Button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
          className="w-8 h-8 p-0"
          disabled={item.quantity >= item.product.stock}
        >
          <Plus size={14} />
        </Button>
      </div>
      
      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          ${item.total.toLocaleString()}
        </p>
        {item.discount > 0 && (
          <p className="text-xs text-success-600">
            -${item.discount.toLocaleString()}
          </p>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.product.id)}
        className="text-error-600 hover:text-error-700 w-8 h-8 p-0"
      >
        <X size={14} />
      </Button>
    </div>
  );
};

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPayment: (method: string, amount: number, change?: number) => void;
}> = ({ isOpen, onClose, total, onPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountReceived, setAmountReceived] = useState(total);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const change = paymentMethod === 'cash' ? Math.max(0, amountReceived - total) : 0;
  const canComplete = paymentMethod === 'cash' ? amountReceived >= total : true;

  const handlePayment = async () => {
    if (!canComplete) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    onPayment(paymentMethod, amountReceived, change);
    setIsProcessing(false);
  };

  const quickAmounts = [total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Procesar Pago" size="md">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total a pagar</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString()}
          </p>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'cash', label: 'Efectivo', icon: DollarSign },
              { id: 'card', label: 'Tarjeta', icon: CreditCard },
              { id: 'transfer', label: 'Transferencia', icon: Receipt },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    paymentMethod === method.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Payment Details */}
        {paymentMethod === 'cash' && (
          <div className="space-y-4">
            <Input
              label="Monto Recibido"
              type="number"
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
              className="text-lg font-medium"
            />
            
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((amount, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  onClick={() => setAmountReceived(amount)}
                >
                  ${amount.toLocaleString()}
                </Button>
              ))}
            </div>

            {change > 0 && (
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                <p className="text-sm text-success-700 dark:text-success-300">Cambio a entregar</p>
                <p className="text-2xl font-bold text-success-800 dark:text-success-200">
                  ${change.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!canComplete}
            loading={isProcessing}
            fullWidth
          >
            {isProcessing ? 'Procesando...' : 'Completar Pago'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const POS: React.FC = () => {
  const { t } = useLanguage();
  const { products, fetchProducts } = useInventoryStore();
  const { createSale, customers, fetchCustomers } = usePOSStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [fetchProducts, fetchCustomers]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter((category, index, self) => 
    self.findIndex(c => c.id === category.id) === index
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateCartItemQuantity(product.id, existingItem.quantity + 1);
      }
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const total = (item.unitPrice * quantity) - item.discount;
        return { ...item, quantity, total };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const total = (item.unitPrice * item.quantity) - discount;
        return { ...item, discount, total };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartTax = cartSubtotal * 0.16; // 16% IVA
  const cartTotal = cartSubtotal + cartTax;

  const handlePayment = async (method: string, amountReceived: number, change?: number) => {
    try {
      await createSale({
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxRate: 16,
          total: item.total
        })),
        subtotal: cartSubtotal,
        taxAmount: cartTax,
        discountAmount: cart.reduce((sum, item) => sum + item.discount, 0),
        total: cartTotal,
        paymentMethod: method as any,
        amountReceived,
        change
      });
      
      clearCart();
      setShowPaymentModal(false);
      
      // Show success message or print receipt
      alert('Venta completada exitosamente');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Carrito ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Customer Selection */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCustomerModal(true)}
                fullWidth
              >
                {selectedCustomer ? selectedCustomer.name : 'Seleccionar Cliente'}
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-3" />
                  <p>Carrito vacío</p>
                  <p className="text-sm">Agrega productos para comenzar</p>
                </div>
              ) : (
                cart.map(item => (
                  <CartItemComponent
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemove={removeFromCart}
                    onUpdateDiscount={updateItemDiscount}
                  />
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${cartTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  fullWidth
                  size="lg"
                  icon={CreditCard}
                >
                  Procesar Pago
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={cartTotal}
        onPayment={handlePayment}
      />
    </div>
  );
};