import React, { useState } from 'react';
import { useWorkOrders } from '../contexts/WorkOrderContext';
import { OSStatus, UserRole } from '../types';
import { CURRENT_USER } from '../services/mockData'; // In real app, map user IDs to users
import { useNavigate } from 'react-router-dom';

export const AdminHistory: React.FC = () => {
  const { orders } = useWorkOrders();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'ALL'>('ALL');

  // Logic to simulate finding the user. 
  // In a real database, orders have assignedToId which relates to a users table.
  const getAssignedUser = (userId: string) => {
    // For demo, we assume all are assigned to the mock CURRENT_USER
    return CURRENT_USER; 
  };

  const filteredOrders = orders.filter(o => filterStatus === 'ALL' || o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Auditoria</h2>
          <p className="text-sm text-gray-500">Rastreabilidade completa de execuções e mídias.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <button 
             onClick={() => setFilterStatus('ALL')}
             className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Todos
           </button>
           <button 
             onClick={() => setFilterStatus(OSStatus.COMPLETED)}
             className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === OSStatus.COMPLETED ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Concluídos
           </button>
           <button 
             onClick={() => setFilterStatus(OSStatus.PENDING)}
             className={`px-3 py-1.5 text-xs font-medium rounded ${filterStatus === OSStatus.PENDING ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:text-gray-900'}`}
           >
             Pendentes
           </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">OS ID / Data</th>
              <th className="px-6 py-4 font-semibold">Responsável</th>
              <th className="px-6 py-4 font-semibold">Detalhes da Execução</th>
              <th className="px-6 py-4 font-semibold">Evidência</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const worker = getAssignedUser(order.assignedToId);
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-blue-600 font-medium">{order.id}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {order.completedAt 
                        ? `Concluído: ${new Date(order.completedAt).toLocaleDateString()}` 
                        : `Criado: ${new Date(order.dueDate).toLocaleDateString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={worker.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                      <div>
                        <div className="font-medium text-gray-900">{worker.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{worker.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{order.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.aiAnalysisLog ? (
                        <span className="flex items-center gap-1 text-indigo-600">
                          <span>🤖</span> Análise IA Registrada
                        </span>
                      ) : (
                        <span className="text-gray-400">Sem análise de IA</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.evidenceImages.length > 0 ? (
                      <div className="relative group w-16 h-12 rounded overflow-hidden cursor-pointer border border-gray-200">
                        <img 
                          src={order.evidenceImages[0]} 
                          alt="Evidence" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === OSStatus.COMPLETED 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Inspecionar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};