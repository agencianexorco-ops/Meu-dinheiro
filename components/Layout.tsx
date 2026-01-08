import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, PieChart, Wallet, Target, Menu, Bell, CreditCard, Settings, LogOut, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useFinanceContext } from '../App';
import { ViewMode, UserProfile, Notification } from '../types';

interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

// Notification Component moved outside to avoid re-creation on render and fix type inference issues
const Toast: React.FC<ToastProps> = ({ notification, onRemove }) => {
  const colors = {
    SUCCESS: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
    ERROR: 'bg-rose-50 text-rose-800 border-rose-200',
    INFO: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  const icons = {
    SUCCESS: CheckCircle,
    WARNING: AlertCircle,
    ERROR: AlertCircle,
    INFO: Info
  };
  const Icon = icons[notification.type as keyof typeof icons] || Info;

  return (
    <div className={`flex items-center p-4 rounded-lg border shadow-lg mb-3 animate-slide-in-right max-w-sm w-full backdrop-blur-sm ${colors[notification.type as keyof typeof colors]}`}>
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{notification.message}</p>
      <button onClick={() => onRemove(notification.id)} className="ml-3 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { viewMode, setViewMode, userProfile, updateUserProfile, notifications, removeNotification } = useFinanceContext();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/' },
    { icon: ArrowRightLeft, label: 'Lançamentos', path: '/transactions' },
    { icon: PieChart, label: 'Fluxo de Caixa', path: '/cashflow' },
    { icon: Wallet, label: 'Planejamento', path: '/planning' },
    { icon: CreditCard, label: 'Cartões', path: '/cards' },
    { icon: Target, label: 'Metas', path: '/goals' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.label : 'Dashboard';
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateUserProfile(tempProfile);
      setIsProfileModalOpen(false);
  };

  const handleLogout = () => {
      if(window.confirm('Deseja sair e resetar sua sessão?')) {
          window.location.reload();
      }
  };

  const ModeToggle = () => (
    <div className="flex bg-slate-100 p-1 rounded-lg">
       <button
        onClick={() => setViewMode('JOINT')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === 'JOINT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Consolidado
      </button>
      <button
        onClick={() => setViewMode('USER1')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === 'USER1' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {userProfile.user1Name}
      </button>
      {userProfile.mode === 'COUPLE' && (
        <button
            onClick={() => setViewMode('USER2')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === 'USER2' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {userProfile.user2Name}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
            {notifications.map(n => <Toast key={n.id} notification={n} onRemove={removeNotification} />)}
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">Meu Dinheiro</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
            <button 
                onClick={() => {
                    setTempProfile(userProfile);
                    setIsProfileModalOpen(true);
                }}
                className="flex items-center w-full p-2 rounded-lg hover:bg-slate-50 transition-colors mb-2"
            >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <Settings className="w-5 h-5" />
                </div>
                <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-slate-700">Configurações</p>
                    <p className="text-xs text-slate-500">Editar Perfil</p>
                </div>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 md:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile View Toggle (Visible only on small screens below header) */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-2 flex justify-center">
          <ModeToggle />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

       {/* Settings Modal */}
       {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Editar Perfil</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Principal</label>
                <input 
                  type="text" 
                  value={tempProfile.user1Name}
                  onChange={e => setTempProfile({...tempProfile, user1Name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {tempProfile.mode === 'COUPLE' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Parceiro(a)</label>
                    <input 
                    type="text" 
                    value={tempProfile.user2Name}
                    onChange={e => setTempProfile({...tempProfile, user2Name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              )}
              
              <div className="pt-2 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
                    Salvar Alterações
                  </button>
                  <button type="button" onClick={handleLogout} className="w-full border border-rose-200 text-rose-600 py-2 rounded-lg font-medium hover:bg-rose-50 flex items-center justify-center">
                    <LogOut className="w-4 h-4 mr-2" /> Sair / Resetar
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};