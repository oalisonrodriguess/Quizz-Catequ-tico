

import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Topic, Question } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (topic: Topic | 'SAVED', difficulty: Difficulty, count: number, avoidRepeats: boolean = false): Promise<Question[]> => {
  // If playing from saved, we don't generate new ones here (handled in App.tsx)
  if (topic === 'SAVED') return [];

  // FIX: Updated model to gemini-3-pro-preview for complex text generation as per guidelines.
  const modelName = "gemini-3-pro-preview";
  
  let topicInstruction = `Tópico: ${topic}`;
  if (topic === Topic.DIVERSOS) {
    topicInstruction = `Tópico: Misto. Gere perguntas variadas abrangendo Bíblia, Liturgia, Catecismo, Santos e Objetos Litúrgicos.`;
  }

  // Handle Mixed Difficulty Logic
  let difficultyInstruction = `Nível de Dificuldade Geral: ${difficulty}`;
  let brevityInstruction = "";
  let creativityInstruction = "";

  if (avoidRepeats) {
    creativityInstruction = `
      MODO CRIATIVO ATIVADO (EVITAR REPETIÇÕES):
      - Gere perguntas INÉDITAS, POUCO COMUNS ou sobre detalhes específicos.
      - EVITE perguntas clichês de catequese básica (ex: "Quem é a mãe de Jesus?", "Quantos sacramentos existem?", "Onde Jesus nasceu?").
      - Explore curiosidades teológicas, detalhes da liturgia, santos menos conhecidos ou livros bíblicos menos citados.
      - Aumente ligeiramente a complexidade intelectual, mesmo para níveis iniciantes.
    `;
  }

  if (difficulty === Difficulty.MISTA) {
    difficultyInstruction = `
      Nível de Dificuldade: MISTO.
      Gere uma variedade equilibrada de perguntas:
      - Algumas fáceis (Iniciante)
      - Algumas médias (Intermediário)
      - Algumas difíceis (Avançado)
      IDENTIFIQUE corretamente o nível de cada uma no campo 'difficulty'.
    `;
    // For mixed, apply brevity constraint generally to ensure flow, but allow depth for advanced ones if needed.
    brevityInstruction = "Para perguntas de nível Iniciante/Intermediário, mantenha as opções CURTAS. Para Avançado, podem ser mais elaboradas.";
  } else {
    // Specific difficulty constraint
    if (difficulty === Difficulty.INICIANTE || difficulty === Difficulty.INTERMEDIARIO) {
      brevityInstruction = "IMPORTANTE: Como o nível é Iniciante/Intermediário, as perguntas e as opções de resposta devem ser CURTAS, DIRETAS e de MÚLTIPLA ESCOLHA SIMPLES. Evite textos longos nas opções.";
    }
  }

  const prompt = `
    Você é um especialista em teologia católica e catequese.
    Crie ${count} perguntas de múltipla escolha para um "Quiz Catequético".
    
    ${topicInstruction}
    ${difficultyInstruction}
    ${creativityInstruction}
    Público Alvo: Católicos de língua portuguesa.

    Requisitos:
    - As perguntas devem ser doutrinariamente corretas conforme o Catecismo da Igreja Católica (CIC).
    - Gere EXATAMENTE 4 opções de resposta (A, B, C, D) para cada pergunta.
    - ${brevityInstruction}
    - A explicação deve ser breve e educativa.
    - O campo 'imageKeyword' deve ser uma palavra-chave simples em INGLÊS que descreva visualmente o tema da pergunta (ex: 'chalice', 'bible', 'jesus', 'rosary') para gerar uma imagem.
    - O campo 'moreInfoUrl' deve ser OBRIGATORIAMENTE uma URL de busca do Google para garantir que o link funcione. Formato: "https://www.google.com/search?q=site:vatican.va+[TEMA_PRINCIPAL]" ou um link direto da Wikipedia em português (pt.wikipedia.org). NÃO invente URLs diretas do vatican.va que não sejam de busca.
    - O campo 'category' deve indicar a qual área pertence a pergunta (ex: "Liturgia", "Bíblia").
    - O campo 'difficulty' deve ser preenchido com "Iniciante", "Intermediário" ou "Avançado" correspondente à pergunta específica.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctOptionIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
              explanation: { type: Type.STRING, description: "Short explanation of why the answer is correct" },
              imageKeyword: { type: Type.STRING, description: "English keyword for image generation" },
              moreInfoUrl: { type: Type.STRING, description: "Google Search URL or Wikipedia URL" },
              category: { type: Type.STRING, description: "Category name in Portuguese" },
              difficulty: { type: Type.STRING, enum: ["Iniciante", "Intermediário", "Avançado"], description: "The specific difficulty level of this question" }
            },
            required: ["questionText", "options", "correctOptionIndex", "explanation", "imageKeyword", "difficulty"]
          }
        }
      }
    });

    const rawJson = response.text;
    if (!rawJson) throw new Error("Sem resposta da IA");

    const parsedData = JSON.parse(rawJson);

    // Add unique IDs to questions
    const questions: Question[] = parsedData.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      imageKeyword: q.imageKeyword,
      moreInfoUrl: q.moreInfoUrl,
      category: q.category || topic,
      difficulty: q.difficulty || (difficulty === Difficulty.MISTA ? "Geral" : difficulty)
    }));

    return questions;

  } catch (error) {
    console.error("Error generating questions:", error);
    // Return a fallback question set in case of error
    return [
      {
        id: "fallback-1",
        questionText: "Ocorreu um erro ao gerar perguntas novas. Quem é a mãe de Jesus?",
        options: ["Santa Ana", "Maria", "Santa Isabel", "Maria Madalena"],
        correctOptionIndex: 1,
        explanation: "Maria é a Mãe de Deus (Theotokos) e mãe de Jesus, concebida sem pecado original.",
        imageKeyword: "virgin mary",
        moreInfoUrl: "https://www.google.com/search?q=site:vatican.va+Maria+M%C3%A3e+de+Deus",
        category: "Mariologia",
        difficulty: "Iniciante"
      }
    ];
  }
};
