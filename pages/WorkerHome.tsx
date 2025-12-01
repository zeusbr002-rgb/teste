import React, { useState } from 'react';
import { WorkOrderCard } from '../components/WorkOrderCard';
import { OSStatus } from '../types';
import { useWorkOrders } from '../contexts/WorkOrderContext';

export const WorkerHome: React.FC = () => {
  const { orders } = useWorkOrders();
  const [filter, setFilter] = useState<'TODOS' | 'PENDING' | 'COMPLETED'>('TODOS');

  const filteredOrders = orders.filter(o => {
    if (filter === 'TODOS') return true;
    if (filter === 'PENDING') return o.status === OSStatus.PENDING || o.status === OSStatus.IN_PROGRESS;
    if (filter === 'COMPLETED') return o.status === OSStatus.COMPLETED;
    return true;
  });

  const inProgressCount = orders.filter(o => o.status === OSStatus.IN_PROGRESS || o.status === OSStatus.PENDING).length;
  const criticalCount = orders.filter(o => o.priority === 'CRITICAL').length;
  const completedPercentage = orders.length > 0 
    ? Math.round((orders.filter(o => o.status === OSStatus.COMPLETED).length / orders.length) * 100)
    : 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">DEMANDAS</h2>
           <p className="text-sm text-gray-500">Visualize e realize os registros.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           {(['TODOS', 'PENDING', 'COMPLETED'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                 filter === f 
                   ? 'bg-blue-100 text-blue-900' 
                   : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               {f === 'TODOS' ? 'Todos' : f === 'PENDING' ? 'Pendentes' : 'Completos'}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-900 rounded-xl p-4 text-white shadow-lg">
          <div className="text-3xl font-bold">{inProgressCount}</div>
          <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Pendentes</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-gray-800 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold">{criticalCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">URGENTES</div>
        </div>
         <div className="bg-white rounded-xl p-4 text-gray-800 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold">{completedPercentage}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Conclusão</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <WorkOrderCard key={order.id} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
         <div className="text-center py-20 text-gray-400">
            <p>Nenhuma OS encontrada para este filtro.</p>
         </div>
      )}
    </div>
  );
};