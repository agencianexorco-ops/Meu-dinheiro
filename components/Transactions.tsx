import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, ArrowDownLeft, ArrowUpRight, AlertCircle, CreditCard as CardIcon } from 'lucide-react';
import { useFinanceContext } from '../App';
import { CATEGORIES, formatCurrency, formatDate } from '../constants';
import { Transaction, Owner, PaymentMethod } from '../types';

export const Transactions: React.FC = () => {
  const { viewMode, transactions, addTransaction, updateTransaction, deleteTransaction, accounts, cards, userProfile, addAccount, addCard } = useFinanceContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Omit<Transaction, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'EXPENSE',
    category: 'outros',
    account: '',
    paymentMethod: 'PIX',
    owner: 'JOINT',
    status: 'CONFIRMED',
  };

  const [formData, setFormData] = useState(initialFormState);
  // Separate state for currency input display
  const [amountDisplay, setAmountDisplay] = useState('');

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      // 1. View Mode Filter
      let viewMatch = false;
      if (viewMode === 'JOINT') viewMatch = true;
      else if (viewMode === 'USER1') viewMatch = (t.owner === 'USER1' || t.owner === 'JOINT');
      else if (viewMode === 'USER2') viewMatch = (t.owner === 'USER2' || t.owner === 'JOINT');

      // 2. Search Filter
      const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 3. Status Filter
      const statusMatch = statusFilter === 'ALL' || t.status === statusFilter;

      return viewMatch && searchMatch && statusMatch;
    });
  }, [viewMode, searchTerm, statusFilter, transactions]);

  const getCategoryColor = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : '#94a3b8';
  };

  const getCategoryName = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData(transaction);
      setAmountDisplay(formatCurrency(transaction.amount).replace('R$', '').trim());
    } else {
      setEditingId(null);
      setFormData(initialFormState);
      setAmountDisplay('');
    }
    setIsModalOpen(true);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove everything that isn't a digit
      const rawValue = e.target.value.replace(/\D/g, '');
      const numberValue = Number(rawValue) / 100;

      setFormData({ ...formData, amount: numberValue });
      
      // Format for display
      const formatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      }).format(numberValue);
      
      setAmountDisplay(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Require Card selection for Credit Cards
    if (formData.paymentMethod === 'CREDIT_CARD' && !formData.account) {
        alert('Para pagamentos em Cartão de Crédito, é necessário selecionar um cartão.');
        return;
    }

    if (editingId) {
      updateTransaction({ ...formData, id: editingId });
    } else {
      addTransaction(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
        deleteTransaction(id);
    }
  };

  const isCardPayment = formData.paymentMethod === 'CREDIT_CARD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Lançamentos</h2>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar lançamentos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
            <select 
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">Todos Status</option>
                <option value="CONFIRMED">Confirmados</option>
                <option value="PENDING">Pendentes</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Método</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resp.</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-900 font-medium">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${transaction.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {transaction.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        {transaction.description}
                    </div>
                  </td>
                   <td className="py-4 px-6 text-sm text-slate-500">
                    {transaction.paymentMethod === 'CREDIT_CARD' ? 'Cartão Crédito' : 
                     transaction.paymentMethod === 'DEBIT_CARD' ? 'Débito' :
                     transaction.paymentMethod === 'PIX' ? 'Pix' : 
                     transaction.paymentMethod === 'CASH' ? 'Dinheiro' : 'Outro'}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                        {getCategoryName(transaction.category)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {transaction.owner === 'USER1' ? userProfile.user1Name : transaction.owner === 'USER2' ? userProfile.user2Name : 'Consolidado'}
                  </td>
                  <td className={`py-4 px-6 text-sm text-right font-semibold ${transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {transaction.type === 'EXPENSE' ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {transaction.status === 'CONFIRMED' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(transaction)} className="text-slate-400 hover:text-indigo-600">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(transaction.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
            <div className="p-12 text-center text-slate-500">
                Nenhum lançamento encontrado. Clique em "Novo Lançamento" para começar.
            </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type Selection */}
                        <div className="col-span-2 flex gap-4 justify-center">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                                className={`flex-1 py-2 rounded-lg font-medium border ${formData.type === 'EXPENSE' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-200 text-slate-600'}`}
                            >
                                Saída (Despesa)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'INCOME'})}
                                className={`flex-1 py-2 rounded-lg font-medium border ${formData.type === 'INCOME' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
                            >
                                Entrada (Receita)
                            </button>
                        </div>

                        {/* Amount - Smart Mask */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={amountDisplay}
                                    onChange={handleCurrencyChange}
                                    placeholder="0,00"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                                />
                            </div>
                        </div>

                         {/* Date */}
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <input 
                                type="text"
                                required
                                placeholder="Ex: Compras Supermercado"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {CATEGORIES.filter(c => c.type === formData.type).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Owner */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                            <select
                                value={formData.owner}
                                onChange={(e) => setFormData({...formData, owner: e.target.value as Owner})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="JOINT">Consolidado / Casal</option>
                                <option value="USER1">{userProfile.user1Name}</option>
                                {userProfile.mode === 'COUPLE' && (
                                    <option value="USER2">{userProfile.user2Name}</option>
                                )}
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'TRANSFER', 'OTHER'] as PaymentMethod[]).map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({...formData, paymentMethod: method, account: ''})} // Reset account on change
                                        className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all ${
                                            formData.paymentMethod === method 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500 ring-opacity-50' 
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {method === 'CREDIT_CARD' ? 'Crédito' :
                                         method === 'DEBIT_CARD' ? 'Débito' :
                                         method === 'PIX' ? 'Pix' :
                                         method === 'CASH' ? 'Dinheiro' :
                                         method === 'TRANSFER' ? 'Transf.' : 'Outro'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account/Card Selection */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isCardPayment ? 'Selecione o Cartão (Obrigatório)' : 'Conta / Origem (Opcional)'}
                            </label>
                            
                            {isCardPayment ? (
                                cards.length === 0 ? (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center justify-between">
                                        <span className="flex items-center"><CardIcon className="w-4 h-4 mr-2" /> Nenhum cartão cadastrado.</span>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const name = prompt('Nome do Cartão (ex: Nubank Violeta):');
                                                if (name) addCard({name, bank: name, owner: 'JOINT', limit: 1000, used: 0, closingDay: 1, dueDay: 10, brand: 'Mastercard'});
                                            }}
                                            className="text-rose-800 font-bold underline"
                                        >
                                            Cadastrar Agora
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={formData.account}
                                        required
                                        onChange={(e) => setFormData({...formData, account: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="" disabled>Selecione o cartão...</option>
                                        {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand})</option>)}
                                    </select>
                                )
                            ) : (
                                <select
                                    value={formData.account}
                                    onChange={(e) => setFormData({...formData, account: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Não vincular a nenhuma conta</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.bank})</option>)}
                                </select>
                            )}
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio"
                                        name="status"
                                        value="CONFIRMED"
                                        checked={formData.status === 'CONFIRMED'}
                                        onChange={() => setFormData({...formData, status: 'CONFIRMED'})}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">Realizado (Pago)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio"
                                        name="status"
                                        value="PENDING"
                                        checked={formData.status === 'PENDING'}
                                        onChange={() => setFormData({...formData, status: 'PENDING'})}
                                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">Previsto (Agendado)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            {editingId ? 'Salvar Alterações' : 'Criar Lançamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};