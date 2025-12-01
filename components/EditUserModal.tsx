import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onSave: (id: string, updates: Partial<User>) => void;
}

export const EditUserModal: React.FC<Props> = ({ isOpen, onClose, userToEdit, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: UserRole.WORKER,
    password: ''
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        role: userToEdit.role,
        password: '' // Don't show current password
      });
    }
  }, [userToEdit]);

  if (!isOpen || !userToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<User> = {
      name: formData.name,
      role: formData.role
    };
    
    // Only update password if typed
    if (formData.password.trim()) {
      updates.password = formData.password;
    }

    onSave(userToEdit.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Editar Usuário</h2>
            <p className="text-slate-400 text-xs mt-1">{userToEdit.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nome</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Função / Cargo</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value={UserRole.WORKER}>Encarregado (Worker)</option>
              <option value={UserRole.ADMIN}>Gestor (Admin)</option>
              <option value={UserRole.AUDITOR}>Auditor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Redefinir Senha</label>
            <input 
              type="password" 
              placeholder="Nova senha (opcional)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">Deixe em branco para manter a senha atual.</p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};