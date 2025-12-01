import React, { useState, useEffect } from 'react';
import { OSPriority, OSStatus, WorkOrder } from '../types';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: WorkOrder) => void;
  orderToEdit?: WorkOrder | null;
}

export const CreateOrderModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, orderToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    priority: OSPriority.MEDIUM,
    slaHours: 24,
    value: 0,
    technicalNotes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (orderToEdit) {
        setFormData({
          title: orderToEdit.title,
          description: orderToEdit.description,
          address: orderToEdit.location.address,
          priority: orderToEdit.priority,
          slaHours: orderToEdit.slaHours,
          value: orderToEdit.value,
          technicalNotes: orderToEdit.technicalNotes
        });
      } else {
        // Reset if creating new
        setFormData({
          title: '',
          description: '',
          address: '',
          priority: OSPriority.MEDIUM,
          slaHours: 24,
          value: 0,
          technicalNotes: ''
        });
      }
    }
  }, [isOpen, orderToEdit]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newOrder: WorkOrder;

    if (orderToEdit) {
      // Preserve ID and other fields if editing
      newOrder = {
        ...orderToEdit,
        title: formData.title,
        description: formData.description,
        location: {
          ...orderToEdit.location,
          address: formData.address
        },
        priority: formData.priority as OSPriority,
        slaHours: Number(formData.slaHours),
        value: Number(formData.value),
        technicalNotes: formData.technicalNotes,
      };
    } else {
      // Create New
      const newId = `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      newOrder = {
        id: newId,
        title: formData.title,
        description: formData.description,
        location: {
          lat: -23.5505 + (Math.random() * 0.01),
          lng: -46.6333 + (Math.random() * 0.01),
          address: formData.address
        },
        priority: formData.priority as OSPriority,
        status: OSStatus.PENDING,
        assignedToId: 'usr_001',
        dueDate: new Date(Date.now() + formData.slaHours * 60 * 60 * 1000).toISOString(),
        referenceImages: [],
        evidenceImages: [],
        slaHours: Number(formData.slaHours),
        value: Number(formData.value),
        technicalNotes: formData.technicalNotes,
        requiredNorms: ['NR-10', 'ISO-9001']
      };
    }

    onSubmit(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {orderToEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {orderToEdit ? `Atualizando registro #${orderToEdit.id}` : 'Cadastro rápido de demanda operacional'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Form Scrollable Area */}
        <div className="p-6 overflow-y-auto">
          <form id="create-os-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Título da OS</label>
                <input 
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ex: Manutenção Preventiva HVAC"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Descrição Detalhada</label>
                <textarea 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Descreva o escopo do serviço..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Localização (Endereço)</label>
                <input 
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Setor, Andar ou Endereço"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Prioridade</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={OSPriority.CRITICAL}>CRÍTICA</option>
                  <option value={OSPriority.HIGH}>ALTA</option>
                  <option value={OSPriority.MEDIUM}>MÉDIA</option>
                  <option value={OSPriority.LOW}>BAIXA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">SLA (Horas)</label>
                <input 
                  type="number"
                  name="slaHours"
                  value={formData.slaHours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Valor Projetado (R$)</label>
                 <input 
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Observações Técnicas</label>
                 <input 
                  name="technicalNotes"
                  value={formData.technicalNotes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ferramentas especiais, códigos de acesso, etc."
                />
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-os-form">
            {orderToEdit ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
          </Button>
        </div>
      </div>
    </div>
  );
};