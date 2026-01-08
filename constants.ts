import { Account, Transaction, Goal, Category, CreditCard } from './types';

// Helper to format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Helper for dates
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
};

// DATA RESET - STARTING FRESH
export const MOCK_ACCOUNTS: Account[] = [];
export const MOCK_CARDS: CreditCard[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_GOALS: Goal[] = [];

export const CATEGORIES: Category[] = [
  { id: 'salario', name: 'Salário', color: '#10b981', type: 'INCOME' },
  { id: 'freela', name: 'Renda Extra', color: '#34d399', type: 'INCOME' },
  { id: 'invest', name: 'Investimentos', color: '#6ee7b7', type: 'INCOME' },
  { id: 'moradia', name: 'Moradia', color: '#f43f5e', type: 'EXPENSE' },
  { id: 'mercado', name: 'Mercado', color: '#fb7185', type: 'EXPENSE' },
  { id: 'lazer', name: 'Lazer', color: '#fda4af', type: 'EXPENSE' },
  { id: 'saude', name: 'Saúde', color: '#e11d48', type: 'EXPENSE' },
  { id: 'transporte', name: 'Transporte', color: '#be123c', type: 'EXPENSE' },
  { id: 'educacao', name: 'Educação', color: '#8b5cf6', type: 'EXPENSE' },
  { id: 'cartao', name: 'Pagamento de Cartão', color: '#64748b', type: 'EXPENSE' },
  { id: 'outros', name: 'Outros', color: '#94a3b8', type: 'EXPENSE' },
];
