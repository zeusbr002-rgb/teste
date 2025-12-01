import React, { useState, useEffect, useRef } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { WorkOrder, ChatMessage } from '../types';
import { Button } from './Button';

interface Props {
  currentOrder: WorkOrder | null;
}

export const AIAssistant: React.FC<Props> = ({ currentOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Módulo Cognitivo OMNI iniciado. Estou pronto para auxiliar na execução tática.',
      timestamp: Date.now()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Contextual Suggestions based on OS Status
  const getSuggestions = () => {
    if (!currentOrder) {
      return [
        "Quais as normas de segurança gerais?",
        "Como acesso meu histórico?",
        "Status do servidor central"
      ];
    }
    const prompts = [
      "Resuma os riscos desta OS",
      "Liste os EPIs obrigatórios",
      "Procedimento técnico recomendado"
    ];
    if (currentOrder.status === 'IN_PROGRESS') {
      prompts.push("Sugerir texto de conclusão");
    }
    return prompts;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const aiText = await generateAIResponse(history, currentOrder, userMsg.text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - Pulsing when closed to indicate AI readiness */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-105 hover:shadow-blue-500/20 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Abrir Assistente OMNI"
      >
        <div className="relative">
          <span className="text-2xl">⚡</span>
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </button>

      {/* Main Console Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-8 md:right-6 w-full md:w-[450px] h-[100dvh] md:h-[600px] bg-slate-50 md:rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 font-sans">
          
          {/* Header - Tactical Look */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white border-b border-blue-900 shadow-md shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wider text-blue-100">OMNI <span className="text-blue-500">AI</span></h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               {/* Context Badge */}
               {currentOrder && (
                 <span className="hidden sm:block px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-gray-300 font-mono">
                   OS-{currentOrder.id.split('-')[0]}
                 </span>
               )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-end max-w-[90%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-blue-400'
                  }`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {/* Timestamp */}
                <span className={`text-[10px] text-gray-400 mt-1 mx-9`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                 <div className="w-6 h-6 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-[10px]">AI</div>
                 <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1 h-[46px]">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggestions (Chips) */}
          {!isLoading && (
            <div className="px-4 py-2 bg-slate-50 overflow-x-auto flex gap-2 no-scrollbar border-t border-slate-100">
              {getSuggestions().map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="flex-shrink-0 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full text-xs text-slate-600 hover:text-blue-700 transition-all shadow-sm whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite um comando ou pergunta..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              disabled={isLoading}
              autoFocus
            />
            <Button 
              size="md" 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
              className="!px-3 !py-2.5 bg-slate-900 hover:bg-slate-800"
            >
              <span className="sr-only">Enviar</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transform rotate-90">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};