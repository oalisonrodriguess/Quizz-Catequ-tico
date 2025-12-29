
import React, { useState } from 'react';
import { Difficulty, Topic, QuizConfig, LeaderboardEntry, Question } from '../types';
import { BookOpen, Church, Flame, ListOrdered, Trophy, Bookmark, Play, Users, Map as MapIcon, Trash2, Printer, Download, Heart, Brain, MousePointerClick, Zap, ArrowRight } from 'lucide-react';

export const APP_VERSION = "1.1.0";

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
  savedQuestions: Question[];
  leaderboard: LeaderboardEntry[];
  onStartSaved: () => void;
  onDeleteSaved: (id: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onStart, 
  isLoading, 
  savedQuestions,
  leaderboard,
  onStartSaved,
  onDeleteSaved
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INICIANTE);
  const [topic, setTopic] = useState<Topic>(Topic.DIVERSOS);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [lives, setLives] = useState<number>(3);
  const [avoidRepeats, setAvoidRepeats] = useState<boolean>(false);
  const [confirmAnswer, setConfirmAnswer] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'setup' | 'leaderboard' | 'saved'>('setup');
  const [rankingType, setRankingType] = useState<'individual' | 'region'>('individual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ 
      difficulty, 
      topic, 
      numberOfQuestions,
      lives,
      avoidRepeats,
      confirmAnswer
    });
  };

  const handleQuickStart = () => {
    onStart({
      difficulty: Difficulty.INICIANTE,
      topic: Topic.DIVERSOS,
      numberOfQuestions: 10,
      lives: 3,
      avoidRepeats: false,
      confirmAnswer: false
    });
  };

  // Process Regional Ranking
  const regionRanking = React.useMemo(() => {
    const map = new Map<string, number>();
    leaderboard.forEach(entry => {
        const reg = entry.region.trim();
        const current = map.get(reg) || 0;
        map.set(reg, current + entry.score);
    });
    return Array.from(map.entries())
        .map(([region, score]) => ({ region, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
  }, [leaderboard]);

  const handlePrintSaved = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Por favor, permita pop-ups para imprimir.");
        return;
    }

    const content = `
      <html>
        <head>
          <title>Banco de Questões - Quiz Catequético</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; }
            h1 { text-align: center; color: #000; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .question { margin-bottom: 20px; page-break-inside: avoid; border-bottom: 1px dashed #ccc; padding-bottom: 15px; }
            .q-text { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
            .options { margin-left: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .option { margin-bottom: 5px; font-size: 14px; }
            .meta { font-size: 12px; color: #666; font-style: italic; margin-bottom: 5px; }
            .answer-key { margin-top: 50px; page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Banco de Questões Catequéticas</h1>
            <p><strong>Total de Perguntas:</strong> ${savedQuestions.length}</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="questions">
            ${savedQuestions.map((q, i) => `
              <div class="question">
                <div class="meta">[${q.category || 'Geral'}] (${q.difficulty || 'Geral'})</div>
                <div class="q-text">${i + 1}. ${q.questionText}</div>
                <div class="options">
                  ${q.options.map((opt, optI) => `
                    <div class="option">
                      ${String.fromCharCode(97 + optI)}) ${opt}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="answer-key">
            <h2>Gabarito</h2>
            ${savedQuestions.map((q, i) => `
              <div class="key-item">
                <strong>${i + 1}:</strong> ${String.fromCharCode(97 + q.correctOptionIndex)}) - ${q.options[q.correctOptionIndex]}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-t-4 border-church-gold transition-colors duration-300 relative">
      <div className="bg-church-blue p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg width="100%" height="100%">
                <pattern id="cross-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M20 0 V40 M0 20 H40" stroke="white" strokeWidth="2" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#cross-pattern)"></rect>
             </svg>
        </div>
        <Church className="w-16 h-16 text-church-gold mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold text-white mb-2">Quiz Catequético</h1>
        <p className="text-blue-100 font-sans">Teste e aprofunde sua fé</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('setup')}
          className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'setup' ? 'text-church-blue dark:text-blue-400 border-b-2 border-church-blue' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          <Play className="w-4 h-4" /> Jogar
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'saved' ? 'text-church-blue dark:text-blue-400 border-b-2 border-church-blue' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          <Bookmark className="w-4 h-4" /> Banco ({savedQuestions.length})
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'leaderboard' ? 'text-church-blue dark:text-blue-400 border-b-2 border-church-blue' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          <Trophy className="w-4 h-4" /> Ranking
        </button>
      </div>

      <div className="min-h-[384px]"> {/* Fixed min height to prevent jumping */}
        
        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <form onSubmit={handleSubmit} className="p-8 space-y-5 animate-fade-in">
            
            {/* Quick Start Button */}
            <button
              type="button"
              onClick={handleQuickStart}
              disabled={isLoading}
              className={`
                w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                text-white py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-between group
                transition-all transform active:scale-95 border border-emerald-400/50
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold uppercase tracking-wider opacity-95">Jogo Rápido</div>
                  <div className="text-[10px] font-normal opacity-80">Diversos • Iniciante • 10 Perguntas</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ou personalize</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-church-red dark:text-red-400" />
                Selecione o Tema
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                {Object.values(Topic).map((t) => (
                  <label key={t} className={`
                    flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all
                    ${topic === t 
                      ? 'border-church-blue bg-blue-50 text-church-blue dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 font-semibold shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'}
                  `}>
                    <input 
                      type="radio" 
                      name="topic" 
                      value={t} 
                      checked={topic === t}
                      onChange={() => setTopic(t)}
                      className="hidden"
                    />
                    <span className="ml-2 text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Nível de Dificuldade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Difficulty).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`
                      py-2 px-1 rounded-lg text-xs font-bold transition-all transform hover:-translate-y-0.5
                      ${difficulty === d 
                        ? 'bg-church-red text-white shadow-md ring-2 ring-red-200 dark:ring-red-900' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Lives Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1 flex items-center gap-2 text-sm">
                    <ListOrdered className="w-4 h-4 text-church-blue dark:text-blue-400" />
                    Perguntas: {numberOfQuestions}
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="1"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-church-blue"
                  />
                </div>

                {/* Lives */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1 flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-500" />
                    Vidas: {lives}
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={lives}
                    onChange={(e) => setLives(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-500"
                  />
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <label className="flex items-center justify-between cursor-pointer group">
                   <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-church-purple dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-church-blue transition-colors">Evitar Repetições (Criativo)</span>
                   </div>
                   <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={avoidRepeats} onChange={(e) => setAvoidRepeats(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-church-purple"></div>
                   </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                   <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-church-gold" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-church-blue transition-colors">Exigir Confirmação</span>
                   </div>
                   <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={confirmAnswer} onChange={(e) => setConfirmAnswer(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-church-gold"></div>
                   </div>
                </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-church-gold hover:bg-yellow-500 text-church-purple hover:shadow-xl'}
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criar com IA
                </span>
              ) : (
                "Gerar Quiz Online"
              )}
            </button>
          </form>
        )}

        {/* SAVED QUESTIONS TAB */}
        {activeTab === 'saved' && (
           <div className="p-6 h-[500px] flex flex-col animate-fade-in">
             <div className="flex gap-2 mb-4">
               <button
                  onClick={onStartSaved}
                  disabled={savedQuestions.length === 0}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm
                    ${savedQuestions.length > 0 
                      ? 'bg-church-blue text-white hover:bg-blue-800' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
               >
                 <Play className="w-4 h-4" /> Jogar Salvas
               </button>
               <button
                  onClick={handlePrintSaved}
                  disabled={savedQuestions.length === 0}
                  className={`py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm border
                    ${savedQuestions.length > 0 
                      ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 border-gray-200 cursor-not-allowed'}`}
               >
                 <Download className="w-4 h-4" /> Baixar
               </button>
             </div>

             <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {savedQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Bookmark className="w-12 h-12 mb-2 opacity-20" />
                    <p>Você ainda não salvou nenhuma pergunta.</p>
                    <p className="text-xs mt-1">Jogue o modo online e clique no ícone de salvar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedQuestions.map((q) => (
                      <div key={q.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 flex gap-3 group">
                         <div className="flex-1">
                            <div className="flex gap-2">
                                <span className="text-[10px] uppercase font-bold text-church-blue dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                {q.category || 'Geral'}
                                </span>
                                {q.difficulty && (
                                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                    {q.difficulty}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 line-clamp-2">
                              {q.questionText}
                            </p>
                         </div>
                         <button 
                           onClick={() => onDeleteSaved(q.id)}
                           className="text-gray-400 hover:text-red-500 p-1 transition-colors self-start"
                           title="Excluir pergunta"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="p-6 h-[500px] flex flex-col animate-fade-in">
            <div className="flex gap-2 mb-4">
               <button 
                  onClick={() => setRankingType('individual')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${rankingType === 'individual' ? 'bg-church-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
               >
                  <Users className="w-3 h-3" /> Individual
               </button>
               <button 
                  onClick={() => setRankingType('region')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${rankingType === 'region' ? 'bg-church-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
               >
                  <MapIcon className="w-3 h-3" /> Regiões
               </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin">
               {rankingType === 'individual' ? (
                  leaderboard.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Ainda não há pontuações.</p>
                  ) : (
                      <div className="space-y-3">
                      {leaderboard.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                              <span className={`
                              w-8 h-8 flex items-center justify-center rounded-full font-bold flex-shrink-0
                              ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 
                                  idx === 1 ? 'bg-gray-200 text-gray-700' :
                                  idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}
                              `}>
                              {idx + 1}
                              </span>
                              <div className="overflow-hidden">
                              <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{entry.name}</p>
                              <p className="text-xs text-gray-500 truncate">{entry.group || entry.region}</p>
                              </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-bold text-church-blue dark:text-blue-400">{entry.score} pts</p>
                              <p className="text-[10px] text-gray-400">{entry.date.slice(0,5)}</p>
                          </div>
                          </div>
                      ))}
                      </div>
                  )
               ) : (
                  regionRanking.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma região pontuou ainda.</p>
                  ) : (
                      <div className="space-y-3">
                          {regionRanking.map((entry, idx) => (
                               <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3">
                                      <span className="text-gray-400 font-bold w-6">{idx + 1}.</span>
                                      <p className="font-bold text-gray-800 dark:text-gray-200">{entry.region}</p>
                                  </div>
                                  <div className="bg-church-gold/20 text-church-purple px-2 py-1 rounded font-bold text-sm">
                                      {entry.score} pts
                                  </div>
                               </div>
                          ))}
                      </div>
                  )
               )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Version */}
      <div className="bg-gray-50 dark:bg-gray-900 py-2 text-center border-t border-gray-200 dark:border-gray-700">
         <p className="text-[10px] text-gray-400">Versão {APP_VERSION}</p>
      </div>
    </div>
  );
};
