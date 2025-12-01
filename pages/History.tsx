import React, { useState } from 'react';
import { useWorkOrders } from '../contexts/WorkOrderContext';
import { OSStatus, UserRole, WorkOrder } from '../types';
import { CURRENT_USER } from '../services/mockData';
import { useNavigate } from 'react-router-dom';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { useUser } from '../contexts/UserContext';

export const History: React.FC = () => {
  const { orders, editOrder, deleteOrder } = useWorkOrders();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'ALL'>('ALL');
  
  // State for Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    const statusMatch = filterStatus === 'ALL' || o.status === filterStatus;
    
    // 2. Role Filter
    const ownershipMatch = isAdmin ? true : o.assignedToId === (user?.id || CURRENT_USER.id) || o.assignedToId === 'usr_001';

    return statusMatch && ownershipMatch;
  });

  const handleEditClick = (order: WorkOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço permanentemente?')) {
      deleteOrder(id);
    }
  };

  const handleModalSubmit = (order: WorkOrder) => {
    if (editingOrder) {
      editOrder(order);
    }
  };

  const statusLabels = {
    [OSStatus.PENDING]: 'PENDENTE',
    [OSStatus.IN_PROGRESS]: 'EM ANDAMENTO',
    [OSStatus.COMPLETED]: 'CONCLUÍDO',
    [OSStatus.VERIFIED]: 'VERIFICADO',
    [OSStatus.BLOCKED]: 'BLOQUEADO',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestão & Auditoria' : 'Meus Registros'}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdmin 
              ? 'Controle total de ordens, edições e auditoria.' 
              : 'Histórico pessoal de serviços executados.'}
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <button 
             onClick={() => setFilterStatus('ALL')}
             className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Todos
           </button>
           <button 
             onClick={() => setFilterStatus(OSStatus.COMPLETED)}
             className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === OSStatus.COMPLETED ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Concluídos
           </button>
           <button 
             onClick={() => setFilterStatus(OSStatus.PENDING)}
             className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === OSStatus.PENDING ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Pendentes
           </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
           <div className="p-10 text-center text-gray-400">
             <p>Nenhum registro encontrado para os filtros selecionados.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">OS ID / Data</th>
                  {isAdmin && <th className="px-6 py-4 font-semibold">Responsável</th>}
                  <th className="px-6 py-4 font-semibold">Título / Detalhes</th>
                  <th className="px-6 py-4 font-semibold">Evidência / IA</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-blue-600 font-medium text-xs">{order.id}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.completedAt 
                          ? new Date(order.completedAt).toLocaleDateString() 
                          : new Date(order.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            CMD
                          </div>
                          <div className="text-xs text-gray-700">Encarregado</div>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{order.title}</div>
                      <div className="text-xs text-gray-500 truncate">{order.description}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {order.evidenceImages.length > 0 ? (
                           <span className="text-[10px] text-green-600 flex items-center gap-1">
                             📷 Imagem Anexada
                           </span>
                        ) : (
                           <span className="text-[10px] text-gray-400">Sem imagem</span>
                        )}
                        
                        {order.aiAnalysisLog ? (
                          <span className="text-[10px] text-indigo-600 flex items-center gap-1 font-medium">
                            ⚡ Análise IA OK
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300">--</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        order.status === OSStatus.COMPLETED 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === OSStatus.PENDING 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Visualizar Detalhes"
                        >
                          👁️
                        </button>
                        
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => handleEditClick(order)}
                              className="text-gray-500 hover:text-blue-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="Editar OS"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(order.id)}
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Excluir OS"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        orderToEdit={editingOrder}
      />
    </div>
  );
};