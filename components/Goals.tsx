import React, { useState } from 'react';
import { Target, Trophy, AlertTriangle, Plus, X } from 'lucide-react';
import { useFinanceContext } from '../App';
import { formatCurrency, formatDate } from '../constants';
import { Goal, Owner } from '../types';

export const Goals: React.FC = () => {
    const { goals, addGoal, viewMode } = useFinanceContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date().toISOString().split('T')[0],
        owner: 'JOINT',
        type: 'SAVING'
    });

    const filteredGoals = goals.filter(g => {
        if (viewMode === 'JOINT') return true;
        if (viewMode === 'LEONARDO') return g.owner === 'LEONARDO' || g.owner === 'JOINT';
        if (viewMode === 'JULIANA') return g.owner === 'JULIANA' || g.owner === 'JOINT';
        return true;
    });

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        addGoal(newGoal);
        setIsModalOpen(false);
        setNewGoal({
            title: '',
            targetAmount: 0,
            currentAmount: 0,
            deadline: new Date().toISOString().split('T')[0],
            owner: 'JOINT',
            type: 'SAVING'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Metas Financeiras</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Nova Meta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGoals.map(goal => {
                    const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    const isSaving = goal.type === 'SAVING';
                    
                    return (
                        <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${isSaving ? 'text-indigo-600' : 'text-rose-600'}`}>
                                <Target className="w-24 h-24" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                            isSaving ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                                        }`}>
                                            {isSaving ? 'Economia' : 'Limite de Gasto'}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-2">{goal.title}</h3>
                                        <p className="text-sm text-slate-500">Alvo: {formatDate(goal.deadline)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-900">{percentage}%</p>
                                        <p className="text-xs text-slate-500">Concluído</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-slate-600">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-slate-400">de {formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                isSaving ? 'bg-indigo-600' : percentage > 90 ? 'bg-rose-500' : 'bg-green-500'
                                            }`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    {!isSaving && percentage > 90 && (
                                        <div className="flex items-center text-xs text-rose-600 mt-2">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Atenção! Você está próximo do limite.
                                        </div>
                                    )}
                                    {isSaving && percentage >= 100 && (
                                        <div className="flex items-center text-xs text-indigo-600 mt-2">
                                            <Trophy className="w-4 h-4 mr-1" />
                                            Parabéns! Meta atingida.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Nova Meta Financeira</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddGoal} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input 
                                    type="text" required value={newGoal.title}
                                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo</label>
                                    <input 
                                        type="number" required value={newGoal.targetAmount || ''}
                                        onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual</label>
                                    <input 
                                        type="number" required value={newGoal.currentAmount || ''}
                                        onChange={e => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
                                <input 
                                    type="date" required value={newGoal.deadline}
                                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                    <select 
                                        value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value as any})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="SAVING">Economia</option>
                                        <option value="SPENDING_LIMIT">Limite de Gastos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dono</label>
                                    <select 
                                        value={newGoal.owner} onChange={e => setNewGoal({...newGoal, owner: e.target.value as Owner})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="JOINT">Casal</option>
                                        <option value="LEONARDO">Leonardo</option>
                                        <option value="JULIANA">Juliana</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2">
                                Salvar Meta
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
