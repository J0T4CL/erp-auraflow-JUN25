import { create } from 'zustand';
import type { DashboardMetrics, Sale, TopProduct, MonthlyRevenue } from '../types';

interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  fetchMetrics: () => Promise<void>;
  updateMetricsFromStores: (data: {
    products: any[];
    sales: any[];
    expenses: any[];
    invoices: any[];
  }) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: null,
  isLoading: false,

  fetchMetrics: async () => {
    set({ isLoading: true });
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Si no hay métricas calculadas, usar datos mock
    if (!get().metrics) {
      const mockTopProducts: TopProduct[] = [
        { id: '1', name: 'Smartphone Pro Max', sales: 45, revenue: 719955 },
        { id: '2', name: 'Mesa de Centro', sales: 12, revenue: 29988 },
        { id: '3', name: 'Camiseta Premium', sales: 89, revenue: 26611 },
      ];

      const mockRecentSales: Sale[] = [
        {
          id: '1',
          companyId: 'company-1',
          invoiceNumber: 'INV-2024-01-0001',
          customerId: 'customer-1',
          items: [],
          subtotal: 15999,
          taxAmount: 2559.84,
          discountAmount: 0,
          total: 18558.84,
          paymentMethod: 'card',
          status: 'completed',
          userId: '1',
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          companyId: 'company-1',
          invoiceNumber: 'INV-2024-01-0002',
          items: [],
          subtotal: 2499,
          taxAmount: 399.84,
          discountAmount: 0,
          total: 2898.84,
          paymentMethod: 'cash',
          status: 'completed',
          userId: '1',
          createdAt: new Date(Date.now() - 172800000),
        },
      ];

      const mockMonthlyRevenue: MonthlyRevenue[] = [
        { month: 'Ene', revenue: 125000, expenses: 85000, profit: 40000 },
        { month: 'Feb', revenue: 135000, expenses: 90000, profit: 45000 },
        { month: 'Mar', revenue: 145000, expenses: 95000, profit: 50000 },
        { month: 'Abr', revenue: 155000, expenses: 100000, profit: 55000 },
        { month: 'May', revenue: 165000, expenses: 105000, profit: 60000 },
        { month: 'Jun', revenue: 175000, expenses: 110000, profit: 65000 },
      ];

      const mockMetrics: DashboardMetrics = {
        salesTotal: 175000,
        salesGrowth: 12.5,
        ordersCount: 342,
        ordersGrowth: 8.3,
        avgOrderValue: 511.63,
        avgOrderGrowth: 4.1,
        lowStockProducts: 3,
        topProducts: mockTopProducts,
        recentSales: mockRecentSales,
        monthlyRevenue: mockMonthlyRevenue,
      };

      set({ metrics: mockMetrics, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateMetricsFromStores: (data) => {
    const { products, sales, expenses, invoices } = data;
    
    // Calcular métricas reales basadas en los datos de los stores
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Ventas del mes actual
    const monthlySales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    const salesTotal = monthlySales.reduce((sum: number, sale: any) => sum + sale.total, 0);
    const ordersCount = monthlySales.length;
    const avgOrderValue = ordersCount > 0 ? salesTotal / ordersCount : 0;
    
    // Productos con stock bajo
    const lowStockProducts = products.filter((product: any) => 
      product.stock <= product.minStock
    ).length;
    
    // Top productos (simulado basado en productos existentes)
    const topProducts: TopProduct[] = products.slice(0, 3).map((product: any, index: number) => ({
      id: product.id,
      name: product.name,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: product.price * (Math.floor(Math.random() * 50) + 10)
    }));
    
    // Ventas recientes
    const recentSales = sales.slice(0, 5);
    
    // Ingresos mensuales (últimos 6 meses)
    const monthlyRevenue: MonthlyRevenue[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      
      const monthSales = sales.filter((sale: any) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.getMonth() === date.getMonth() && 
               saleDate.getFullYear() === date.getFullYear();
      });
      
      const monthExpenses = expenses.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const expenseAmount = monthExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      
      monthlyRevenue.push({
        month: monthName,
        revenue,
        expenses: expenseAmount,
        profit: revenue - expenseAmount
      });
    }
    
    const updatedMetrics: DashboardMetrics = {
      salesTotal,
      salesGrowth: 12.5, // Simulado
      ordersCount,
      ordersGrowth: 8.3, // Simulado
      avgOrderValue,
      avgOrderGrowth: 4.1, // Simulado
      lowStockProducts,
      topProducts,
      recentSales,
      monthlyRevenue,
    };
    
    set({ metrics: updatedMetrics });
  },
}));