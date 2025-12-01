import React from 'react';
import { WorkOrder, OSPriority, OSStatus, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useWorkOrders } from '../contexts/WorkOrderContext';

interface Props {
  order: WorkOrder;
}

export const WorkOrderCard: React.FC<Props> = ({ order }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { deleteOrder } = useWorkOrders();

  const isAdmin = user?.role === UserRole.ADMIN;

  const statusColors = {
    [OSStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [OSStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-200',
    [OSStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    [OSStatus.VERIFIED]: 'bg-purple-100 text-purple-800 border-purple-200',
    [OSStatus.BLOCKED]: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    [OSStatus.PENDING]: 'PENDENTE',
    [OSStatus.IN_PROGRESS]: 'EM ANDAMENTO',
    [OSStatus.COMPLETED]: 'CONCLUÍDO',
    [OSStatus.VERIFIED]: 'VERIFICADO',
    [OSStatus.BLOCKED]: 'BLOQUEADO',
  };

  const priorityBadge = {
    [OSPriority.CRITICAL]: 'bg-red-600 text-white',
    [OSPriority.HIGH]: 'bg-orange-500 text-white',
    [OSPriority.MEDIUM]: 'bg-blue-500 text-white',
    [OSPriority.LOW]: 'bg-gray-400 text-white',
  };

  const priorityLabels = {
    [OSPriority.CRITICAL]: 'CRÍTICA',
    [OSPriority.HIGH]: 'ALTA',
    [OSPriority.MEDIUM]: 'MÉDIA',
    [OSPriority.LOW]: 'BAIXA',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (window.confirm(`Tem certeza que deseja excluir a OS #${order.id}?`)) {
      deleteOrder(order.id);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/order/${order.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-900 group-hover:bg-blue-600 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div>
            <span className="text-xs font-mono text-gray-500 tracking-wider">#{order.id}</span>
            <h3 className="font-semibold text-gray-900 mt-1">{order.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${priorityBadge[order.priority]}`}>
                {priorityLabels[order.priority]}
            </span>
            {isAdmin && (
              <button 
                onClick={handleDelete}
                className="mt-1 text-gray-300 hover:text-red-600 transition-colors p-1"
                title="Excluir OS (Admin)"
              >
                🗑️
              </button>
            )}
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {order.description}
      </p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">📍</span>
            <span className="truncate max-w-[150px]">{order.location.address}</span>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>Prazo: {new Date(order.dueDate).toLocaleDateString()}</span>
        <span>SLA: {order.slaHours}h</span>
      </div>
    </div>
  );
};