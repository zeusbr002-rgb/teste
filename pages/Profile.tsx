import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/Button';
import { UserRole, User } from '../types';
import { EditUserModal } from '../components/EditUserModal';

export const Profile: React.FC = () => {
  const { user, allUsers, updateProfile, deleteUser } = useUser();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'TEAM'>('PROFILE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Form State for Profile
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '', 
  });

  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateProfile(user.id, { avatarUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<User> = {
      name: formData.name
    };
    if (formData.password) {
      updates.password = formData.password;
    }
    updateProfile(user.id, updates);
    alert('Perfil atualizado com sucesso!');
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário? A ação é irreversível.')) {
      deleteUser(id);
    }
  };

  const openEditUserModal = (targetUser: User) => {
    setUserToEdit(targetUser);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
          <p className="text-sm text-gray-500">Gerencie seus dados e preferências de acesso.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'PROFILE'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Meu Perfil
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('TEAM')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'TEAM'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestão de Equipe
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-3xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 transition-all" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">ALTERAR</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSaveProfile} className="flex-1 space-y-5 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email (ID Corporativo)</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">O email não pode ser alterado. Contate o suporte administrativo.</p>
                </div>

                <div className="col-span-2 md:col-span-1">
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nova Senha</label>
                   <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Deixe em branco para manter"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'TEAM' && isAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Membros da Equipe</h3>
              <p className="text-sm text-gray-500">Gerenciamento de credenciais e acessos.</p>
            </div>
            {/* In a real app, Add User would open a modal similar to Register */}
          </div>
          
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Usuário</th>
                <th className="px-6 py-3 font-semibold">Função</th>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full border border-gray-200 object-cover" />
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {u.role === UserRole.ADMIN ? 'Gestor' : 'Encarregado'}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    {u.id}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button
                          onClick={() => openEditUserModal(u)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                       >
                         Editar
                       </button>
                       {u.id !== user.id && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        userToEdit={userToEdit}
        onSave={updateProfile}
      />
    </div>
  );
};