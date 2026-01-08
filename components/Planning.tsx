import React from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../constants';
import { useFinanceContext } from '../App';

export const Planning: React.FC = () => {
    const { viewMode, transactions } = useFinanceContext();

    const pendingTransactions = transactions.filter(t => {
        if (t.status === 'CONFIRMED') return false;
        if (viewMode === 'JOINT') return true;
        if (viewMode === 'LEONARDO') return t.owner === 'LEONARDO' || t.owner === 'JOINT';
        if (viewMode === 'JULIANA') return t.owner === 'JULIANA' || t.owner === 'JOINT';
        return true;
    });

    const payables = pendingTransactions.filter(t => t.type === 'EXPENSE');
    const receivables = pendingTransactions.filter(t => t.type === 'INCOME');

    const ListSection = ({ title, items, type }: any) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1">
            <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${type === 'pay' ? 'bg-rose-50/50' : 'bg-emerald-50/50'}`}>
                <h3 className={`font-bold ${type === 'pay' ? 'text-rose-700' : 'text-emerald-700'}`}>{title}</h3>
                <span className={`text-sm font-bold ${type === 'pay' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    Total: {formatCurrency(items.reduce((acc: number, curr: any) => acc + curr.amount, 0))}
                </span>
            </div>
            <div className="p-4">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Nenhum item pendente.</div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1.5 rounded-full ${type === 'pay' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{item.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {item.owner === 'JOINT' ? 'Casal' : item.owner === 'LEONARDO' ? 'Leo' : 'Ju'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">{formatCurrency(item.amount)}</p>
                                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full flex items-center justify-end gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> Pendente
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Planejamento Futuro</h2>
            <div className="flex flex-col lg:flex-row gap-6">
                <ListSection title="Contas a Pagar" items={payables} type="pay" />
                <ListSection title="Contas a Receber" items={receivables} type="receive" />
            </div>
        </div>
    );
};
