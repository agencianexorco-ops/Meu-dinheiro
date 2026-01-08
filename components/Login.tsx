import React, { useState } from 'react';
import { User, Users, Check, Wallet } from 'lucide-react';
import { useFinanceContext } from '../App';
import { UserProfile } from '../types';

export const Login: React.FC = () => {
  const { updateUserProfile } = useFinanceContext();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'SINGLE' | 'COUPLE'>('COUPLE');
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1) return;
    if (mode === 'COUPLE' && !user2) return;

    const profile: UserProfile = {
      mode,
      user1Name: user1,
      user2Name: user2,
      setupComplete: true
    };
    updateUserProfile(profile);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Meu Dinheiro</h1>
          <p className="text-indigo-100">Organize suas finanças de forma simples e inteligente.</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 text-center">Como você vai usar o sistema?</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('SINGLE')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    mode === 'SINGLE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-600'
                  }`}
                >
                  <User className="w-8 h-8" />
                  <span className="font-medium">Individual</span>
                </button>

                <button
                  onClick={() => setMode('COUPLE')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    mode === 'COUPLE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-600'
                  }`}
                >
                  <Users className="w-8 h-8" />
                  <span className="font-medium">Casal</span>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Continuar
              </button>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 text-center">Vamos nos conhecer</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {mode === 'COUPLE' ? 'Seu Nome' : 'Seu Nome'}
                </label>
                <input
                  type="text"
                  required
                  value={user1}
                  onChange={(e) => setUser1(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Leonardo"
                />
              </div>

              {mode === 'COUPLE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome do(a) Parceiro(a)
                  </label>
                  <input
                    type="text"
                    required
                    value={user2}
                    onChange={(e) => setUser2(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Juliana"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 text-slate-600"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Acessar Sistema
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
