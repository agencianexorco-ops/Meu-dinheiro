import React, { useMemo, useState } from 'react';
import { CreditCard as CardIcon, Plus, Calendar, AlertCircle, X } from 'lucide-react';
import { useFinanceContext } from '../App';
import { formatCurrency } from '../constants';
import { CreditCard, Owner } from '../types';

export const CreditCards: React.FC = () => {
    const { cards, viewMode, addCard, userProfile } = useFinanceContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCard, setNewCard] = useState<Omit<CreditCard, 'id'>>({
        name: '', bank: '', owner: 'JOINT', limit: 0, used: 0, closingDay: 1, dueDay: 10, brand: 'Mastercard'
    });

    const filteredCards = useMemo(() => {
        return cards.filter(c => {
            if (viewMode === 'JOINT') return true;
            if (viewMode === 'USER1') return c.owner === 'USER1' || c.owner === 'JOINT';
            if (viewMode === 'USER2') return c.owner === 'USER2' || c.owner === 'JOINT';
            return true;
        });
    }, [viewMode, cards]);

    const getUtilizationColor = (used: number, limit: number) => {
        const percentage = (used / limit) * 100;
        if (percentage > 80) return 'bg-rose-500';
        if (percentage > 50) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        addCard(newCard);
        setIsModalOpen(false);
        setNewCard({ name: '', bank: '', owner: 'JOINT', limit: 0, used: 0, closingDay: 1, dueDay: 10, brand: 'Mastercard' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Cartões de Crédito</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Novo Cartão
                </button>
            </div>

            {filteredCards.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-500">
                    Você ainda não tem cartões cadastrados.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCards.map(card => {
                    const percentage = Math.min(100, (card.used / card.limit) * 100);
                    const available = card.limit - card.used;

                    return (
                        <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Card Visual Header */}
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white relative">
                                <div className="absolute top-4 right-4 opacity-50">
                                    <CardIcon className="w-12 h-12" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm text-slate-300 font-medium mb-1">{card.bank}</p>
                                    <h3 className="text-xl font-bold mb-4">{card.name}</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider">Fatura Atual</p>
                                            <p className="text-lg font-bold">{formatCurrency(card.used)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 uppercase tracking-wider">{card.brand}</p>
                                            <p className="text-sm font-medium">Final ****</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">Limite Utilizado</span>
                                            <span className="font-bold text-slate-900">{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div 
                                                className={`h-full rounded-full ${getUtilizationColor(card.used, card.limit)}`} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>Disponível: {formatCurrency(available)}</span>
                                            <span>Total: {formatCurrency(card.limit)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-t border-slate-100">
                                        <div className="flex items-center text-slate-600">
                                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-900">Dia {card.dueDay}</p>
                                                <p className="text-xs">Vencimento</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-600">
                                            <AlertCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                            <div className="text-sm text-right">
                                                <p className="font-medium text-slate-900">Dia {card.closingDay}</p>
                                                <p className="text-xs">Fechamento</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-2 text-indigo-600 font-medium bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-sm">
                                        Ver Fatura
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Card Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Novo Cartão de Crédito</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCard} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cartão</label>
                                <input 
                                    type="text" required value={newCard.name}
                                    onChange={e => setNewCard({...newCard, name: e.target.value})}
                                    placeholder="Ex: Nubank Ultravioleta"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
                                    <input 
                                        type="text" required value={newCard.bank}
                                        onChange={e => setNewCard({...newCard, bank: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Limite</label>
                                    <input 
                                        type="number" required value={newCard.limit || ''}
                                        onChange={e => setNewCard({...newCard, limit: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fechamento</label>
                                    <input 
                                        type="number" min="1" max="31" required value={newCard.closingDay || ''}
                                        onChange={e => setNewCard({...newCard, closingDay: parseInt(e.target.value) || 1})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                                    <input 
                                        type="number" min="1" max="31" required value={newCard.dueDay || ''}
                                        onChange={e => setNewCard({...newCard, dueDay: parseInt(e.target.value) || 1})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dono</label>
                                <select 
                                    value={newCard.owner} onChange={e => setNewCard({...newCard, owner: e.target.value as Owner})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="JOINT">Casal</option>
                                    <option value="USER1">{userProfile.user1Name}</option>
                                    {userProfile.mode === 'COUPLE' && <option value="USER2">{userProfile.user2Name}</option>}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2">
                                Adicionar Cartão
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
