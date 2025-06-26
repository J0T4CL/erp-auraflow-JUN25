// ============================================
// MÓDULO DE CONTABILIDAD Y FINANZAS
// ============================================

export interface ChartOfAccounts {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  level: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  sourceModule: 'manual' | 'sales' | 'purchases' | 'inventory' | 'payroll' | 'expenses';
  sourceId?: string;
  debits: JournalEntryLine[];
  credits: JournalEntryLine[];
  totalAmount: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
}

export interface JournalEntryLine {
  accountId: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  reference?: string;
}

export interface BankAccount {
  id: string;
  companyId: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  currency: string;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BankTransaction {
  id: string;
  companyId: string;
  bankAccountId: string;
  transactionDate: Date;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  isReconciled: boolean;
  reconciledDate?: Date;
  category?: string;
  createdAt: Date;
}

export interface TaxDeclaration {
  id: string;
  companyId: string;
  period: string; // YYYY-MM
  taxType: 'vat' | 'income' | 'payroll';
  totalSales: number;
  totalPurchases: number;
  taxableAmount: number;
  taxAmount: number;
  status: 'draft' | 'filed' | 'paid';
  dueDate: Date;
  filedDate?: Date;
  paidDate?: Date;
  createdAt: Date;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';