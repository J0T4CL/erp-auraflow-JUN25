import { create } from 'zustand';
import type { Product, Category, Supplier, StockMovement } from '../types';

interface InventoryState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  isLoading: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => void;
  
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  getLowStockProducts: () => Product[];
}

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Electrónicos', description: 'Dispositivos electrónicos', color: '#3B82F6' },
  { id: '2', name: 'Ropa', description: 'Prendas de vestir', color: '#10B981' },
  { id: '3', name: 'Hogar', description: 'Artículos para el hogar', color: '#F59E0B' },
  { id: '4', name: 'Deportes', description: 'Artículos deportivos', color: '#EF4444' },
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    companyId: 'company-1',
    name: 'Proveedor Tech S.A.',
    contactName: 'María González',
    email: 'maria@proveedortech.com',
    phone: '+52 55 1234 5678',
    address: {
      street: 'Calle Tecnología 456',
      city: 'Guadalajara',
      state: 'Jalisco',
      zipCode: '44100',
      country: 'México',
    },
    isActive: true,
    createdAt: new Date(),
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    companyId: 'company-1',
    sku: 'ELEC-001',
    name: 'Smartphone Pro Max',
    description: 'Smartphone de última generación con cámara de 108MP',
    category: mockCategories[0],
    price: 15999,
    cost: 12000,
    stock: 25,
    minStock: 10,
    maxStock: 100,
    unit: 'pieza',
    barcode: '7891234567890',
    isActive: true,
    tags: ['electrónico', 'smartphone', 'premium'],
    suppliers: [mockSuppliers[0]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyId: 'company-1',
    sku: 'ROPA-001',
    name: 'Camiseta Premium',
    description: 'Camiseta 100% algodón, corte regular',
    category: mockCategories[1],
    price: 299,
    cost: 150,
    stock: 5,
    minStock: 20,
    unit: 'pieza',
    isActive: true,
    tags: ['ropa', 'algodón', 'unisex'],
    suppliers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    companyId: 'company-1',
    sku: 'HOG-001',
    name: 'Mesa de Centro',
    description: 'Mesa de centro de madera de roble',
    category: mockCategories[2],
    price: 2499,
    cost: 1800,
    stock: 8,
    minStock: 5,
    unit: 'pieza',
    isActive: true,
    tags: ['mueble', 'madera', 'hogar'],
    suppliers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  categories: [],
  suppliers: [],
  stockMovements: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ products: mockProducts, isLoading: false });
  },

  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: (id, updates) => {
    set(state => ({
      products: state.products.map(product =>
        product.id === id
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      ),
    }));
  },

  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(product => product.id !== id),
    }));
  },

  fetchCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ categories: mockCategories });
  },

  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    set(state => ({ categories: [...state.categories, newCategory] }));
  },

  fetchSuppliers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ suppliers: mockSuppliers });
  },

  addSupplier: (supplier) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set(state => ({ suppliers: [...state.suppliers, newSupplier] }));
  },

  addStockMovement: (movement) => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set(state => ({ stockMovements: [...state.stockMovements, newMovement] }));
  },

  getLowStockProducts: () => {
    const { products } = get();
    return products.filter(product => product.stock <= product.minStock);
  },
}));