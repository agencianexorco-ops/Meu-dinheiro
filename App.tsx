import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { CashFlow } from './components/CashFlow';
import { Planning } from './components/Planning';
import { Goals } from './components/Goals';
import { CreditCards } from './components/CreditCards';
import { Login } from './components/Login';
import { DashboardContextType, ViewMode, Transaction, Account, Goal, CreditCard, UserProfile, Notification } from './types';
import { MOCK_TRANSACTIONS, MOCK_ACCOUNTS, MOCK_GOALS, MOCK_CARDS } from './constants';

// Context Definition
const FinanceContext = createContext<DashboardContextType | undefined>(undefined);

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
};

const App: React.FC = () => {
  // --- STATE ---
  const [userProfile, setUserProfile] = useState<UserProfile>({
    mode: 'COUPLE',
    user1Name: '',
    user2Name: '',
    setupComplete: false
  });

  const [viewMode, setViewMode] = useState<ViewMode>('JOINT');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [cards, setCards] = useState<CreditCard[]>(MOCK_CARDS);

  // --- LOGIC ---

  // Check for due dates on load and periodically
  useEffect(() => {
    if (!userProfile.setupComplete) return;

    const checkDueDates = () => {
      const today = new Date();
      const next3Days = new Date();
      next3Days.setDate(today.getDate() + 3);

      const pendingBills = transactions.filter(t => 
        t.status === 'PENDING' && 
        t.type === 'EXPENSE' &&
        new Date(t.date) <= next3Days &&
        new Date(t.date) >= today
      );

      pendingBills.forEach(bill => {
        addNotification(`A conta "${bill.description}" vence em breve!`, 'WARNING');
      });
    };

    checkDueDates();
  }, [transactions, userProfile.setupComplete]);

  // Actions
  const addNotification = (message: string, type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification('Lançamento adicionado com sucesso!', 'SUCCESS');
  };

  const updateTransaction = (updatedT: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
    addNotification('Lançamento atualizado!', 'SUCCESS');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addNotification('Lançamento removido.', 'INFO');
  };

  const addAccount = (a: Omit<Account, 'id'>) => {
    const newAccount = { ...a, id: Math.random().toString(36).substr(2, 9) };
    setAccounts(prev => [...prev, newAccount]);
    addNotification(`Conta ${a.name} criada!`, 'SUCCESS');
  };

  const addGoal = (g: Omit<Goal, 'id'>) => {
    const newGoal = { ...g, id: Math.random().toString(36).substr(2, 9) };
    setGoals(prev => [...prev, newGoal]);
    addNotification('Nova meta definida!', 'SUCCESS');
  };

  const addCard = (c: Omit<CreditCard, 'id'>) => {
      const newCard = { ...c, id: Math.random().toString(36).substr(2, 9) };
      setCards(prev => [...prev, newCard]);
      addNotification('Cartão de crédito adicionado!', 'SUCCESS');
  };

  const value = {
    userProfile,
    updateUserProfile,
    viewMode,
    setViewMode,
    dateRange,
    setDateRange,
    transactions,
    accounts,
    goals,
    cards,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    addGoal,
    addCard,
    notifications,
    addNotification,
    removeNotification
  };

  if (!userProfile.setupComplete) {
    return (
      <FinanceContext.Provider value={value}>
        <Login />
      </FinanceContext.Provider>
    );
  }

  return (
    <FinanceContext.Provider value={value}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="cashflow" element={<CashFlow />} />
            <Route path="planning" element={<Planning />} />
            <Route path="goals" element={<Goals />} />
            <Route path="cards" element={<CreditCards />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </FinanceContext.Provider>
  );
};

export default App;
