import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkOrder, OSStatus, UserRole, OSPriority } from '../types';
import { Button } from '../components/Button';
import { analyzeEvidenceImage } from '../services/geminiService';
import { AIAssistant } from '../components/AIAssistant';
import { useWorkOrders } from '../contexts/WorkOrderContext';
import { useUser } from '../contexts/UserContext';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, completeOrder, deleteOrder } = useWorkOrders();
  const { user } = useUser();
  
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;
  
  useEffect(() => {
    const found = orders.find(o => o.id === id);
    if (found) {
      setOrder(found);
      // If order is completed, load evidence
      if (found.status === OSStatus.COMPLETED && found.evidenceImages.length > 0) {
        setPreviewUrl(found.evidenceImages[0]);
        setAnalysis(found.aiAnalysisLog || 'Sem análise registrada.');
      }
    } else {
      // If order not found (e.g., deleted), go back
      navigate('/');
    }
  }, [id, orders, navigate]);

  if (!order) return <div className="p-8 text-center text-gray-500">Carregando OS...</div>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!previewUrl || !order) return;
    setIsAnalyzing(true);
    const base64 = previewUrl.split(',')[1];
    const result = await analyzeEvidenceImage(base64, order);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleComplete = () => {
    if (!order || !previewUrl) return;
    setIsCompleting(true);
    setTimeout(() => {
      // Use the context function to save data persistently
      completeOrder(order.id, previewUrl, analysis || 'Concluído manualmente sem análise prévia da IA.');
      setIsCompleting(false);
      navigate('/'); 
    }, 1500);
  };

  const handleDelete = () => {
    if (window.confirm('ATENÇÃO: Deseja realmente excluir esta Ordem de Serviço permanentemente?')) {
      deleteOrder(order.id);
      navigate('/');
    }
  };

  const statusMap = {
    [OSStatus.PENDING]: 'PENDENTE',
    [OSStatus.IN_PROGRESS]: 'EM ANDAMENTO',
    [OSStatus.COMPLETED]: 'CONCLUÍDO',
    [OSStatus.VERIFIED]: 'VERIFICADO',
    [OSStatus.BLOCKED]: 'BLOQUEADO',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">← Voltar</button>
               <span className="text-gray-300">|</span>
               <span className="text-sm font-mono text-gray-500">{order.id}</span>
               {isAdmin && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">VISÃO ADMIN</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
            <p className="text-gray-600 mt-2 max-w-3xl">{order.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="text-2xl font-bold text-blue-900">R$ {order.value}</div>
             <div className="text-xs text-gray-500 mb-1">VALOR PROJETADO</div>
             {isAdmin && (
               <Button size="sm" variant="danger" onClick={handleDelete} className="text-xs">
                 EXCLUIR REGISTRO
               </Button>
             )}
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
           <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Status</div>
              <div className="font-medium text-gray-800">{statusMap[order.status]}</div>
           </div>
           <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Prioridade</div>
              <div className="font-medium text-red-600">
                {order.priority === OSPriority.CRITICAL ? 'CRÍTICA' : 
                 order.priority === OSPriority.HIGH ? 'ALTA' :
                 order.priority === OSPriority.MEDIUM ? 'MÉDIA' : 'BAIXA'}
              </div>
           </div>
           <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Responsável</div>
              <div className="flex items-center gap-1 mt-1">
                 <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">W</div>
                 <span className="text-sm text-gray-700 font-medium truncate">Encarregado</span>
              </div>
           </div>
           <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Normas</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {order.requiredNorms.map(norm => (
                  <span key={norm} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                    {norm}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
         <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Localização</h3>
            <span className="text-xs text-blue-600 font-medium">{order.location.address}</span>
         </div>
         <div className="h-48 bg-slate-200 relative flex items-center justify-center">
             <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/1000/400?grayscale')] bg-cover bg-center"></div>
             <div className="relative bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-center">
                <p className="text-sm font-bold text-gray-800">Lat: {order.location.lat.toFixed(5)}, Lng: {order.location.lng.toFixed(5)}</p>
             </div>
         </div>
      </div>

      {/* Execution / Evidence Module */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
         <h3 className="text-lg font-bold text-gray-900 mb-4">
           {order.status === OSStatus.COMPLETED ? 'Registro de Conclusão & Evidência' : 'Execução do Serviço'}
         </h3>
         
         {order.status === OSStatus.COMPLETED ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Completed State - Evidence View */}
               <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Evidência Fotográfica</h4>
                  {previewUrl ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                       <img src={previewUrl} alt="Evidence" className="w-full h-auto object-cover" />
                       <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                          Capturado em: {new Date(order.completedAt!).toLocaleString()}
                       </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-8 text-center text-gray-500 rounded-lg">Sem imagem</div>
                  )}
               </div>

               <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Auditoria Cognitiva (IA)</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed font-mono">
                     {order.aiAnalysisLog}
                  </div>
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xl">✓</div>
                     <div>
                        <div className="font-bold text-green-800">Finalizado com Sucesso</div>
                        <div className="text-xs text-green-600">Status verificado</div>
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="space-y-6">
                {/* Image Upload */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">1. Capturar Evidência (Obrigatório)</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="evidence-upload"
                      />
                      {previewUrl ? (
                         <div className="relative">
                            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded shadow-md" />
                            <label htmlFor="evidence-upload" className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer">
                              Refazer
                            </label>
                         </div>
                      ) : (
                        <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                          <span className="text-4xl text-gray-300 mb-2">📷</span>
                          <span className="text-sm text-blue-600 font-medium">Selecionar foto</span>
                        </label>
                      )}
                   </div>
                </div>

                {/* AI Analysis */}
                {previewUrl && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-medium text-gray-700">2. Verificação Cognitiva</label>
                       <Button size="sm" variant="secondary" onClick={handleAnalyze} isLoading={isAnalyzing} disabled={!!analysis}>
                         Analisar Imagem
                       </Button>
                    </div>
                    {analysis && (
                       <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900 leading-relaxed">
                          <strong className="block mb-1 text-indigo-700">Relatório IA:</strong>
                          {analysis}
                       </div>
                    )}
                  </div>
                )}

                {/* Completion */}
                <div className="pt-4 border-t border-gray-100">
                    <Button 
                      fullWidth 
                      size="lg" 
                      onClick={handleComplete} 
                      disabled={!previewUrl} 
                      isLoading={isCompleting}
                    >
                      Finalizar & Enviar
                    </Button>
                </div>
            </div>
         )}
      </div>

      <AIAssistant currentOrder={order} />
    </div>
  );
};