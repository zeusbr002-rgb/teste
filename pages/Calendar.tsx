import React, { useState } from 'react';
import { OSStatus, OSPriority, UserRole } from '../types';
import { useWorkOrders } from '../contexts/WorkOrderContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/Button';

export const Calendar: React.FC = () => {
  const { orders, externalScheduleUrl, updateScheduleUrl } = useWorkOrders();
  const { user } = useUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [viewMode, setViewMode] = useState<'SYSTEM' | 'EXTERNAL'>('SYSTEM');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  // Sort by Due Date for System View
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const statusColors = {
    [OSStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OSStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [OSStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [OSStatus.VERIFIED]: 'bg-purple-100 text-purple-800',
    [OSStatus.BLOCKED]: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    [OSStatus.PENDING]: 'PENDENTE',
    [OSStatus.IN_PROGRESS]: 'EM ANDAMENTO',
    [OSStatus.COMPLETED]: 'CONCLUÍDO',
    [OSStatus.VERIFIED]: 'VERIFICADO',
    [OSStatus.BLOCKED]: 'BLOQUEADO',
  };

  const priorityColors = {
    [OSPriority.CRITICAL]: 'text-red-600 font-bold',
    [OSPriority.HIGH]: 'text-orange-600 font-semibold',
    [OSPriority.MEDIUM]: 'text-blue-600',
    [OSPriority.LOW]: 'text-gray-500',
  };

  const priorityLabels = {
    [OSPriority.CRITICAL]: 'CRÍTICA',
    [OSPriority.HIGH]: 'ALTA',
    [OSPriority.MEDIUM]: 'MÉDIA',
    [OSPriority.LOW]: 'BAIXA',
  };

  const handleSaveUrl = () => {
    updateScheduleUrl(tempUrl);
    setIsEditingUrl(false);
  };

  const handleEditUrlClick = () => {
    setTempUrl(externalScheduleUrl);
    setIsEditingUrl(true);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cronograma Operacional</h2>
          <p className="text-sm text-gray-500">Gestão de prazos e alocação de recursos.</p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex shadow-inner">
           <button
             onClick={() => setViewMode('SYSTEM')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
               viewMode === 'SYSTEM' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
             }`}
           >
             Visão do Sistema
           </button>
           <button
             onClick={() => setViewMode('EXTERNAL')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
               viewMode === 'EXTERNAL' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
             }`}
           >
             <span>📊</span> Planilha Live
           </button>
        </div>
      </div>

      {viewMode === 'SYSTEM' ? (
        // SYSTEM VIEW (Internal Table)
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="px-6 py-3 font-semibold">OS ID</th>
                  <th className="px-6 py-3 font-semibold">Descrição / Título</th>
                  <th className="px-6 py-3 font-semibold">Localização</th>
                  <th className="px-6 py-3 font-semibold text-center">Prioridade</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Prazo</th>
                  <th className="px-6 py-3 font-semibold text-right">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-gray-500 text-xs">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={order.title}>{order.title}</div>
                      <div className="text-xs text-gray-400 truncate" title={order.description}>{order.description}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-600" title={order.location.address}>
                      {order.location.address}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-xs ${priorityColors[order.priority]}`}>
                         {priorityLabels[order.priority]}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                          {new Date(order.dueDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                          {new Date(order.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">
                      {order.slaHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // EXTERNAL VIEW (Embedded Sheet)
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden relative">
          
          {/* Admin Toolbar */}
          {isAdmin && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-green-100 text-green-700 p-1.5 rounded">📊</span>
                <span>Configure a URL pública da planilha (Google Sheets / Excel Online) para toda a equipe.</span>
              </div>
              
              {!isEditingUrl ? (
                <Button size="sm" variant="secondary" onClick={handleEditUrlClick}>
                  {externalScheduleUrl ? 'Alterar Link da Planilha' : 'Configurar Planilha'}
                </Button>
              ) : (
                <div className="flex w-full md:w-auto gap-2">
                  <input 
                    type="text" 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="Cole o link https://..."
                    className="flex-1 md:w-80 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Button size="sm" onClick={handleSaveUrl}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingUrl(false)}>Cancelar</Button>
                </div>
              )}
            </div>
          )}

          {/* Iframe Content */}
          <div className="flex-1 bg-slate-100 relative">
            {externalScheduleUrl ? (
              <iframe 
                src={externalScheduleUrl} 
                className="absolute inset-0 w-full h-full border-0"
                title="Planilha Mestra"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-2xl">
                  📄
                </div>
                <h3 className="text-lg font-medium text-gray-700">Nenhuma planilha configurada</h3>
                <p className="max-w-md mt-2">
                  {isAdmin 
                    ? 'Use o botão acima para adicionar o link de uma planilha do Google Sheets ou Excel Online.' 
                    : 'O gestor ainda não disponibilizou a planilha mestra neste canal.'}
                </p>
                {isAdmin && (
                  <button 
                    onClick={handleEditUrlClick}
                    className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                  >
                    Configurar agora
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Status Footer */}
          {externalScheduleUrl && (
            <div className="bg-white border-t border-gray-200 px-4 py-2 text-[10px] text-gray-400 flex justify-between items-center">
               <span>Visualização em tempo real via Embed Seguro.</span>
               <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 Conexão Ativa
               </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};