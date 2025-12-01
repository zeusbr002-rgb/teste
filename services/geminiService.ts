import { GoogleGenAI } from "@google/genai";
import { WorkOrder } from "../types";

const apiKey = process.env.API_KEY || ''; 
const getAIClient = () => new GoogleGenAI({ apiKey });

export const generateAIResponse = async (
  history: { role: string; text: string }[],
  currentOrder: WorkOrder | null,
  userMessage: string
): Promise<string> => {
  const ai = getAIClient();

  // OMNI System Instruction - Enterprise Grade
  const systemInstruction = `
    IDENTIDADE:
    Você é o OMNI (Operational Master Network Intelligence), uma IA de suporte de engenharia avançada para técnicos de campo.
    Seu tom é profissional, conciso, autoritário, porém prestativo, e obcecado por segurança.

    CONTEXTO ATUAL:
    ${currentOrder 
      ? `
        Você está atualmente auxiliando na Ordem de Serviço ID: ${currentOrder.id}
        Título: ${currentOrder.title}
        Descrição: ${currentOrder.description}
        Localização: ${currentOrder.location.address} (Lat: ${currentOrder.location.lat}, Lng: ${currentOrder.location.lng})
        Prioridade: ${currentOrder.priority}
        Horas SLA: ${currentOrder.slaHours}
        Notas Técnicas: ${currentOrder.technicalNotes}
        Normas Obrigatórias (Conformidade Estrita): ${currentOrder.requiredNorms.join(', ')}
        Status: ${currentOrder.status}
      ` 
      : `
        Nenhuma Ordem de Serviço específica selecionada. Você está no Modo de Suporte Global.
        Você pode responder perguntas sobre normas gerais de segurança (NR-10, NR-35), protocolos da empresa e melhores práticas de engenharia civil/elétrica.
      `}

    REGRAS DE ENGAJAMENTO:
    1. SEGURANÇA EM PRIMEIRO LUGAR: Se o usuário perguntar sobre procedimentos, SEMPRE comece citando os EPIs obrigatórios e NRs relevantes.
    2. CONSCIÊNCIA DE CONTEXTO: Use a localização e notas técnicas para dar conselhos específicos (ex: se ao ar livre, alerte sobre o clima; se alta tensão, alerte sobre bloqueio/etiquetagem).
    3. ESTILO CHECKLIST: Quando solicitado um "como fazer", forneça listas numeradas.
    4. RELATÓRIOS: Se solicitado a escrever um relatório, gere um texto formal e conciso adequado para um log de auditoria.
    5. IDIOMA: Responda em Português (PT-BR).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Temperatura mais baixa para respostas mais determinísticas/profissionais
      },
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]
    });

    return response.text || "Sistema OMNI: A resposta foi processada, mas nenhum texto foi gerado. Verifique a conexão.";
  } catch (error) {
    console.error("AI Error:", error);
    return "ALERTA CRÍTICO OMNI: Falha na conexão com o módulo cognitivo central. Tente novamente.";
  }
};

export const analyzeEvidenceImage = async (base64Image: string, order: WorkOrder): Promise<string> => {
  const ai = getAIClient();

  const prompt = `
    ATUE COMO: Auditor de Garantia de Qualidade OMNI.
    
    CONTEXTO:
    Analisando evidência para Ordem de Serviço: ${order.title} (#${order.id})
    Descrição: ${order.description}
    
    TAREFA:
    1. Relevância: A imagem mostra o trabalho descrito?
    2. Qualidade: Avalie a execução (Baixa/Média/Alta).
    3. Segurança: Detecte quaisquer violações visíveis de segurança (falta de EPI, ambiente inseguro).
    4. Resumo: Uma frase concisa para o log do banco de dados.
    
    IDIOMA: Português (PT-BR).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "Análise visual concluída sem retorno de texto.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Alerta do Sistema OMNI: Diagnóstico visual falhou.";
  }
};