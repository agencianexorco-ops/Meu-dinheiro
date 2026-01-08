import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinanceContext } from '../App';
import { formatCurrency } from '../constants';

export const CashFlow: React.FC = () => {
  const { viewMode, transactions } = useFinanceContext();

  const data = useMemo(() => {
    // Group transactions by day
    const dailyData: Record<string, { income: number; expense: number; balance: number }> = {};
    const days = Array.from({length: 30}, (_, i) => i + 1); // Mock 30 days
    
    // Initialize
    days.forEach(d => {
        dailyData[d] = { income: 0, expense: 0, balance: 0 };
    });

    let runningBalance = 20000; // Starting Balance Mock

    transactions.forEach(t => {
        if (
            (viewMode === 'JOINT') ||
            (viewMode === 'LEONARDO' && (t.owner === 'LEONARDO' || t.owner === 'JOINT')) ||
            (viewMode === 'JULIANA' && (t.owner === 'JULIANA' || t.owner === 'JOINT'))
        ) {
            const day = parseInt(t.date.split('-')[2]);
            if (dailyData[day]) {
                if (t.type === 'INCOME') dailyData[day].income += t.amount;
                if (t.type === 'EXPENSE') dailyData[day].expense += t.amount;
            }
        }
    });

    // Calculate running balance
    return days.map(day => {
        const dData = dailyData[day] || { income: 0, expense: 0 };
        runningBalance += (dData.income - dData.expense);
        return {
            name: `Dia ${day}`,
            Receitas: dData.income,
            Despesas: dData.expense,
            Saldo: runningBalance
        };
    });
  }, [viewMode, transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Fluxo de Caixa Diário</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(val: number) => formatCurrency(val)}
            />
            <Legend verticalAlign="top" height={36}/>
            <Bar yAxisId="right" dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="right" dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="left" type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Resumo do Período</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-600">Total Entradas</span>
                    <span className="text-emerald-600 font-bold">
                        {formatCurrency(data.reduce((acc, curr) => acc + curr.Receitas, 0))}
                    </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-600">Total Saídas</span>
                    <span className="text-rose-600 font-bold">
                        {formatCurrency(data.reduce((acc, curr) => acc + curr.Despesas, 0))}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-900 font-medium">Resultado</span>
                    <span className="text-indigo-600 font-bold text-lg">
                        {formatCurrency(data.reduce((acc, curr) => acc + curr.Receitas - curr.Despesas, 0))}
                    </span>
                </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
             <div className="mb-4 p-4 bg-indigo-50 rounded-full text-indigo-600">
                <Line className="w-8 h-8 opacity-0" /> {/* Spacer */}
                <span className="text-2xl font-bold">OK</span>
             </div>
             <p className="text-slate-600 max-w-xs">
                 Seu fluxo de caixa está positivo neste mês. Continue mantendo as despesas abaixo das receitas para atingir suas metas.
             </p>
         </div>
      </div>
    </div>
  );
};
