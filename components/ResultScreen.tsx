import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Share2, Printer, Save, Copy } from 'lucide-react';
import { QuizConfig, Question } from '../types';
import confetti from 'canvas-confetti';

interface ResultScreenProps {
  score: number;
  total: number;
  config: QuizConfig;
  questions: Question[]; // Needed for printing
  isGameOver: boolean;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (name: string, group: string, region: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ 
  score, 
  total, 
  config, 
  questions,
  isGameOver, 
  onRestart, 
  onHome,
  onSaveScore 
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [region, setRegion] = useState('');
  const [saved, setSaved] = useState(false);
  
  const percentage = (score / total) * 100;
  
  useEffect(() => {
    if (!isGameOver && percentage >= 60) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isGameOver, percentage]);

  let message = "";
  let colorClass = "";
  
  if (isGameOver) {
    message = "Suas vidas acabaram! Mas não desista da caminhada.";
    colorClass = "text-red-500";
  } else if (percentage === 100) {
    message = "Excelente! Você demonstrou grande sabedoria.";
    colorClass = "text-church-gold";
  } else if (percentage >= 60) {
    message = "Muito bom! Continue estudando para aprofundar sua fé.";
    colorClass = "text-church-blue dark:text-blue-300";
  } else {
    message = "Não desanime. A catequese é um caminho contínuo de aprendizado.";
    colorClass = "text-gray-600 dark:text-gray-400";
  }

  const handleShare = async () => {
    // Determina o rótulo da dificuldade para o texto
    const difficultyLabel = config.topic === 'SAVED' ? 'Misto (Salvas)' : config.difficulty;
    const topicLabel = config.topic === 'SAVED' ? 'Banco de Questões' : config.topic;

    const shareData = {
      title: 'Quizz Catequético - Meu Resultado',
      text: `✝️ *Quizz Catequético*\n\n🏆 Fiz *${score} de ${total}* pontos!\n📊 Dificuldade: *${difficultyLabel}*\n📖 Tema: _${topicLabel}_\n\nVenha testar seus conhecimentos sobre a fé católica! 👇`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      // Fallback para área de transferência se o navegador não suportar share nativo
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        .then(() => alert("Resultado copiado! Cole no WhatsApp ou Instagram."))
        .catch(() => alert(`Pontuação: ${score}/${total}. Tire um print!`));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && region.trim()) {
      onSaveScore(name, group, region);
      setSaved(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Por favor, permita pop-ups para imprimir.");
        return;
    }

    const content = `
      <html>
        <head>
          <title>Quizz Catequético - Impressão</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; }
            h1 { text-align: center; color: #000; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .question { margin-bottom: 20px; page-break-inside: avoid; }
            .q-text { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
            .options { margin-left: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .option { margin-bottom: 5px; font-size: 14px; }
            .meta { font-size: 11px; font-style: italic; color: #555; margin-bottom: 4px; }
            .answer-key { margin-top: 50px; page-break-before: always; }
            .key-item { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quizz Catequético</h1>
            <p><strong>Tópico:</strong> ${config.topic}</p>
            <p><strong>Dificuldade Geral:</strong> ${config.difficulty}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Nome:</strong> __________________________________________</p>
          </div>
          
          <div class="questions">
            ${questions.map((q, i) => `
              <div class="question">
                <div class="meta">[${q.difficulty || 'Geral'}]</div>
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
            <h2>Gabarito (Para o Catequista)</h2>
            ${questions.map((q, i) => `
              <div class="key-item">
                <strong>${i + 1}:</strong> ${String.fromCharCode(97 + q.correctOptionIndex)}) - ${q.options[q.correctOptionIndex]}
                <br><em>Explicação: ${q.explanation}</em>
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
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-fade-in transition-colors duration-300">
      <div className="mb-6 flex justify-center">
        <div className={`p-6 rounded-full bg-gray-50 dark:bg-gray-700 border-4 relative ${percentage === 100 ? 'border-church-gold' : 'border-gray-200 dark:border-gray-600'}`}>
          <Trophy className={`w-16 h-16 ${percentage === 100 ? 'text-church-gold' : isGameOver ? 'text-gray-400' : 'text-church-blue dark:text-blue-400'}`} />
          {percentage === 100 && (
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
          )}
        </div>
      </div>

      <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-2">
        {isGameOver ? "Fim de Jogo" : "Quiz Concluído!"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
        {config.topic === 'SAVED' ? 'Perguntas Salvas' : `${config.topic} • ${config.difficulty}`}
      </p>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 transform transition hover:scale-105 duration-300">
        <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
          {score}<span className="text-2xl text-gray-400 dark:text-gray-500">/{total}</span>
        </div>
        <p className={`font-medium ${colorClass}`}>{message}</p>
      </div>

      {!saved && !isGameOver && score > 0 && config.topic !== 'SAVED' && (
        <form onSubmit={handleSave} className="mb-6 bg-blue-50 dark:bg-gray-700 p-4 rounded-xl border border-blue-100 dark:border-gray-600">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-left">Registrar no Ranking</h3>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Seu Nome *" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-church-blue outline-none"
              maxLength={20}
              required
            />
            <input 
              type="text" 
              placeholder="Nome do Grupo/Paróquia (Opcional)" 
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-church-blue outline-none"
              maxLength={30}
            />
            <input 
              type="text" 
              placeholder="Região Pastoral *" 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-church-blue outline-none"
              maxLength={30}
              required
            />
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar Pontuação
            </button>
          </div>
        </form>
      )}

      {saved && (
        <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-bold">
            Pontuação salva com sucesso!
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onRestart}
            className="col-span-1 bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg text-xs sm:text-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Jogar
          </button>
          
          <button
             onClick={handleShare}
             className="col-span-1 bg-church-gold text-church-purple py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg text-xs sm:text-sm"
          >
             <Share2 className="w-5 h-5" />
             Partilhar
          </button>

          <button
             onClick={handlePrint}
             className="col-span-1 bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg text-xs sm:text-sm"
          >
             <Printer className="w-5 h-5" />
             Imprimir
          </button>
        </div>

        <button
          onClick={onHome}
          className="w-full py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};