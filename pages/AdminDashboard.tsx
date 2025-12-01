import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '../components/Button';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { useWorkOrders } from '../contexts/WorkOrderContext';
import { WorkOrder, OSStatus, OSPriority } from '../types';

export const AdminDashboard: React.FC = () => {
  const { orders, addOrder, deleteOrder } = useWorkOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived data for charts based on real context
  const completedCount = orders.filter(o => o.status === OSStatus.COMPLETED).length;
  const pendingCount = orders.filter(o => o.status === OSStatus.PENDING).length;
  const criticalCount = orders.filter(o => o.priority === 'CRITICAL').length;

  const chartData = [
    { name: 'Atual', completed: completedCount, critical: criticalCount },
    { name: 'Meta', completed: completedCount + 5, critical: 0 }, // Dummy comparison
  ];

  const handleCreateOrder = (newOrder: WorkOrder) => {
    addOrder(newOrder);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Confirma a exclusão desta Ordem de Serviço?')) {
      deleteOrder(id);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Comando Operacional</h2>
          <p className="text-sm text-gray-500">Supervisão em tempo real das operações de campo.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" icon={<span>📥</span>}>Relatório</Button>
           <Button onClick={() => setIsModalOpen(true)} icon={<span>+</span>}>Nova Ordem de Serviço</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Status Operacional</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="completed" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Concluídas" />
                <Bar dataKey="critical" fill="#dc2626" radius={[4, 4, 0, 0]} name="Críticas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Métricas de SLA</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm">Gráfico de Performance em Tempo Real (Simulação)</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Live Data) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Log de Auditoria Global (Últimas Entradas)</h3>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3">OS ID</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Prioridade</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{order.id}</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">{order.title}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.status === OSStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                          order.status === OSStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {order.priority === OSPriority.CRITICAL ? 'CRÍTICA' : 
                         order.priority === OSPriority.HIGH ? 'ALTA' :
                         order.priority === OSPriority.MEDIUM ? 'MÉDIA' : 'BAIXA'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                          title="Excluir OS"
                        >
                          🗑️
                        </button>
                      </td>
                  </tr>
                ))}
            </tbody>
        </table>
      </div>

      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrder} 
      />
    </div>
  );
};