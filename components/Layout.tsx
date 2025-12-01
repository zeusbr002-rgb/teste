import React from 'react';
import { User } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Ordens de Serviço', path: '/', icon: '📋' },
    { label: 'Cronograma', path: '/Cronograma', icon: '📅' },
    { label: 'Histórico', path: '/history', icon: 'clock' },
    ...(user?.role === 'ADMIN' ? [
      { label: 'Painel', path: '/admin', icon: '📊' },
      { label: 'Auditoria', path: '/admin/history', icon: '🔍' }
    ] : [])
  ];

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">COPS<span className="text-white">APP</span></h1>
          <p className="text-xs text-slate-400 mt-1">JURUBEBA</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon === 'clock' ? '🕒' : item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 mb-4 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors group"
            title="Editar Perfil"
          >
            <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-blue-400 object-cover" />
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-blue-300">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role === 'ADMIN' ? 'Gestor' : 'Encarregado'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-xs text-slate-400 hover:text-white text-left pl-3 flex items-center gap-2">
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
           <h1 className="text-xl font-bold tracking-tight text-blue-400">COPS</h1>
           <div onClick={() => navigate('/profile')} className="cursor-pointer">
             <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full object-cover border border-slate-600" />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => (
             <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 ${
                location.pathname === item.path ? 'text-blue-900' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon === 'clock' ? '🕒' : item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          {/* Profile Mobile Item */}
           <button
              onClick={() => navigate('/profile')}
              className={`flex flex-col items-center space-y-1 ${
                location.pathname === '/profile' ? 'text-blue-900' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-[10px] font-medium">Perfil</span>
            </button>
        </nav>
      </main>
    </div>
  );
};