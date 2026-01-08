import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Plus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinanceContext } from '../App';
import { formatCurrency } from '../constants';
import { Owner } from '../types';

export const Dashboard: React.FC = () => {
  const { viewMode, transactions, accounts, addAccount, userProfile } = useFinanceContext();
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', bank: '', balanceConfirmed: 0, balanceProjected: 0, owner: 'JOINT' as Owner, type: 'CHECKING' as any });

  // Filter transactions based on viewMode
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (viewMode === 'JOINT') return true; 
      if (viewMode === 'USER1') return t.owner === 'USER1' || t.owner === 'JOINT';
      if (viewMode === 'USER2') return t.owner === 'USER2' || t.owner === 'JOINT';
      return true;
    });
  }, [viewMode, transactions]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
        if (viewMode === 'JOINT') return true;
        if (viewMode === 'USER1') return a.owner === 'USER1' || a.owner === 'JOINT';
        if (viewMode === 'USER2') return a.owner === 'USER2' || a.owner === 'JOINT';
        return true;
    });
  }, [viewMode, accounts]);

  // Calculations
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME' && t.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const projectedIncome = filteredTransactions
    .filter(t => t.type === 'INCOME' && t.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = filteredAccounts.reduce((acc, curr) => acc + curr.balanceConfirmed, 0);
  const netResult = totalIncome - totalExpense;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const data: any[] = [];
    const days = [5, 10, 15, 20, 25, 30];
    let runningBalance = totalBalance - (totalIncome - totalExpense); 

    days.forEach(day => {
        // Mocking curve logic for display based on real values
        if(transactions.length > 0) {
             const dayTrans = filteredTransactions.filter(t => parseInt(t.date.split('-')[2]) <= day);
             const dayBalance = dayTrans.reduce((acc, t) => {
                 return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
             }, 0);
             data.push({ day: `Dia ${day}`, balance: Math.max(0, dayBalance) });
        } else {
            data.push({ day: `Dia ${day}`, balance: 0 });
        }
    });
    return data;
  }, [totalBalance, totalIncome, totalExpense, transactions]);


  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount(newAccount);
    setIsAddAccountModalOpen(false);
    setNewAccount({ name: '', bank: '', balanceConfirmed: 0, balanceProjected: 0, owner: 'JOINT', type: 'CHECKING' });
  };

  const KPICard = ({ title, value, subValue, icon: Icon, type }: any) => {
    const colorClass = 
      type === 'success' ? 'text-emerald-600 bg-emerald-50' : 
      type === 'danger' ? 'text-rose-600 bg-rose-50' : 
      'text-indigo-600 bg-indigo-50';

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          {subValue && (
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
              {subValue}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(value)}</h3>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Receita Recebida" 
          value={totalIncome} 
          subValue={`+ ${formatCurrency(projectedIncome)} Previsto`}
          icon={TrendingUp} 
          type="success" 
        />
        <KPICard 
          title="Despesas Totais" 
          value={totalExpense} 
          icon={TrendingDown} 
          type="danger" 
        />
        <KPICard 
          title="Resultado Líquido" 
          value={netResult} 
          icon={DollarSign} 
          type={netResult >= 0 ? 'success' : 'danger'} 
        />
        <KPICard 
          title="Saldo Atual" 
          value={totalBalance} 
          icon={Wallet} 
          type="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa (Este Mês)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Minhas Contas</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px]">
            {filteredAccounts.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                    Nenhuma conta cadastrada.
                </div>
            ) : (
                filteredAccounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                        <CreditCard className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">{account.name}</p>
                        <p className="text-xs text-slate-500">{account.bank}</p>
                    </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(account.balanceConfirmed)}</p>
                    </div>
                </div>
                ))
            )}
          </div>
          <button 
            onClick={() => setIsAddAccountModalOpen(true)}
            className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Conta
          </button>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Nova Conta Bancária</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Conta</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="Ex: Nubank Reserva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newAccount.bank}
                  onChange={e => setNewAccount({...newAccount, bank: e.target.value})}
                  placeholder="Ex: Nubank"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Atual (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAccount.balanceConfirmed || ''}
                    onChange={e => setNewAccount({...newAccount, balanceConfirmed: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dono</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAccount.owner}
                    onChange={e => setNewAccount({...newAccount, owner: e.target.value as any})}
                  >
                    <option value="JOINT">Casal</option>
                    <option value="USER1">{userProfile.user1Name}</option>
                    {userProfile.mode === 'COUPLE' && <option value="USER2">{userProfile.user2Name}</option>}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-4">
                Criar Conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};