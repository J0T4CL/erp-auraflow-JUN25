import { create } from 'zustand';
import type { Expense, ExpenseCategory } from '../types';

interface ExpensesState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  isLoading: boolean;
  
  // Actions
  fetchExpenses: () => Promise<void>;
  createExpense: (expenseData: {
    description: string;
    amount: number;
    categoryId: string;
    costCenter?: string;
    date: string;
    receiptFile?: File | null;
  }) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: Omit<ExpenseCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ExpenseCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Computed
  getExpensesByCategory: () => Array<{ category: ExpenseCategory; total: number; count: number }>;
  getMonthlyExpenses: () => number;
}

// Mock data
const mockCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Oficina',
    description: 'Gastos de oficina y suministros',
    budgetLimit: 10000,
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Transporte',
    description: 'Gastos de transporte y combustible',
    budgetLimit: 5000,
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Gastos de marketing y publicidad',
    budgetLimit: 15000,
    color: '#F59E0B'
  },
  {
    id: '4',
    name: 'Tecnología',
    description: 'Software, hardware y servicios tecnológicos',
    budgetLimit: 20000,
    color: '#8B5CF6'
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    companyId: 'company-1',
    description: 'Compra de material de oficina',
    amount: 2500,
    category: mockCategories[0],
    costCenter: 'Administración',
    status: 'approved',
    date: new Date(),
    userId: '1',
    createdAt: new Date(),
  },
  {
    id: '2',
    companyId: 'company-1',
    description: 'Combustible vehículo empresa',
    amount: 1200,
    category: mockCategories[1],
    status: 'pending',
    date: new Date(Date.now() - 86400000),
    userId: '1',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    companyId: 'company-1',
    description: 'Campaña publicitaria Facebook',
    amount: 5000,
    category: mockCategories[2],
    costCenter: 'Marketing',
    status: 'paid',
    date: new Date(Date.now() - 172800000),
    userId: '1',
    createdAt: new Date(Date.now() - 172800000),
  },
];

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  categories: [],
  isLoading: false,

  fetchExpenses: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ expenses: mockExpenses, isLoading: false });
  },

  createExpense: async (expenseData) => {
    set({ isLoading: true });
    
    const category = get().categories.find(c => c.id === expenseData.categoryId);
    if (!category) throw new Error('Category not found');
    
    // Simulate file upload
    let receiptUrl: string | undefined;
    if (expenseData.receiptFile) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      receiptUrl = `https://example.com/receipts/${Date.now()}.pdf`;
    }
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      companyId: 'company-1',
      description: expenseData.description,
      amount: expenseData.amount,
      category,
      costCenter: expenseData.costCenter,
      receiptUrl,
      status: 'pending',
      date: new Date(expenseData.date),
      userId: '1',
      createdAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      expenses: [newExpense, ...state.expenses],
      isLoading: false
    }));
  },

  updateExpense: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      expenses: state.expenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      ),
      isLoading: false
    }));
  },

  deleteExpense: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      expenses: state.expenses.filter(expense => expense.id !== id),
      isLoading: false
    }));
  },

  fetchCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ categories: mockCategories });
  },

  createCategory: async (categoryData) => {
    const newCategory: ExpenseCategory = {
      ...categoryData,
      id: Date.now().toString(),
    };
    
    set(state => ({
      categories: [...state.categories, newCategory]
    }));
  },

  updateCategory: async (id, updates) => {
    set(state => ({
      categories: state.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    }));
  },

  deleteCategory: async (id) => {
    set(state => ({
      categories: state.categories.filter(category => category.id !== id)
    }));
  },

  getExpensesByCategory: () => {
    const { expenses, categories } = get();
    
    return categories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category.id === category.id);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        category,
        total,
        count: categoryExpenses.length
      };
    });
  },

  getMonthlyExpenses: () => {
    const { expenses } = get();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  },
}));