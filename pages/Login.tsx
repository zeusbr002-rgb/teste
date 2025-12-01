import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login, register } = useUser();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        navigate('/');
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (e) {
      setError('Erro no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError('Senhas não conferem.');
      return;
    }

    setIsLoading(true);
    try {
      await register(registerData.name, registerData.email, registerData.password);
      navigate('/');
    } catch (e) {
      setError('Erro ao registrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="bg-slate-900 p-8 text-center shrink-0">
           <h1 className="text-3xl font-bold text-white tracking-tight">COPS<span className="text-blue-400">APP</span></h1>
           <p className="text-slate-400 mt-2 text-sm">
             {isRegistering ? 'Cadastro de Colaborador' : 'Portal de Acesso Corporativo'}
           </p>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${!isRegistering ? 'text-blue-900 border-b-2 border-blue-900 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsRegistering(false); setError(''); }}
          >
            Entrar
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${isRegistering ? 'text-blue-900 border-b-2 border-blue-900 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsRegistering(true); setError(''); }}
          >
            Novo Cadastro
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {isRegistering ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nome Completo</label>
                <input 
                  type="text" required value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                <input 
                  type="email" required value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Senha</label>
                  <input 
                    type="password" required value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Confirmar</label>
                  <input 
                    type="password" required value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
              </div>
              {error && <div className="text-red-500 text-xs text-center">{error}</div>}
              <Button fullWidth size="lg" type="submit" isLoading={isLoading}>Finalizar Cadastro</Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                  <input 
                    type="text" required value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Senha</label>
                  <input 
                    type="password" required value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                  />
                </div>
              </div>
              {error && <div className="p-3 rounded bg-red-50 text-red-600 text-xs text-center">{error}</div>}
              <Button fullWidth size="lg" type="submit" isLoading={isLoading}>Acessar Sistema</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};