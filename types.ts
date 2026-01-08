export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'RECONCILED';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH' | 'TRANSFER' | 'OTHER';

export type Owner = 'USER1' | 'USER2' | 'JOINT';

export interface UserProfile {
  mode: 'SINGLE' | 'COUPLE';
  user1Name: string;
  user2Name: string; // Optional if single, but good to keep structure
  setupComplete: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  owner: Owner;
  balanceConfirmed: number;
  balanceProjected: number;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  owner: Owner;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  brand: string; // Visa, Mastercard
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  account: string; // Account ID or Card ID (Optional if cash/pix without account)
  paymentMethod: PaymentMethod;
  owner: Owner;
  status: TransactionStatus;
  costCenter?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  owner: Owner;
  type: 'SAVING' | 'SPENDING_LIMIT';
}

export type ViewMode = 'USER1' | 'USER2' | 'JOINT';

export interface DashboardContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  
  // Data Access
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  cards: CreditCard[];

  // Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  addCard: (c: Omit<CreditCard, 'id'>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (msg: string, type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO') => void;
  removeNotification: (id: string) => void;
}