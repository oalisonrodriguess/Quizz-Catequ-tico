
import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { generateQuestions } from './services/geminiService';
import { QuizConfig, QuizState, Question, LeaderboardEntry, Topic, Difficulty } from './types';
import { Moon, Sun, CheckCircle2, Trash2, BookmarkCheck, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'finished'>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Persistence
  const [savedQuestions, setSavedQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('catholic_quiz_saved_questions');
    return saved ? JSON.parse(saved) : [];
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('catholic_quiz_leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('catholic_quiz_saved_questions', JSON.stringify(savedQuestions));
  }, [savedQuestions]);

  useEffect(() => {
    localStorage.setItem('catholic_quiz_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
  };
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    answers: [],
    isFinished: false,
    isGameOver: false
  });

  const handleStartQuiz = async (selectedConfig: QuizConfig) => {
    setIsLoading(true);
    setConfig(selectedConfig);
    
    try {
      let questions: Question[] = [];

      if (selectedConfig.topic === 'SAVED') {
        questions = [...savedQuestions].sort(() => 0.5 - Math.random()).slice(0, selectedConfig.numberOfQuestions);
        if (questions.length === 0) {
          showToast("Você não tem perguntas salvas!", 'error');
          setIsLoading(false);
          return;
        }
      } else {
        questions = await generateQuestions(
            selectedConfig.topic, 
            selectedConfig.difficulty, 
            selectedConfig.numberOfQuestions,
            selectedConfig.avoidRepeats
        );
      }
      
      setQuizState({
        questions,
        currentQuestionIndex: 0,
        score: 0,
        lives: selectedConfig.lives, // Use configured lives
        answers: Array(questions.length).fill(null), // Initialize answers array
        isFinished: false,
        isGameOver: false
      });
      setGameState('playing');
    } catch (error) {
      console.error("Failed to start quiz", error);
      showToast("Erro ao conectar com a Catequese Digital. Tente novamente.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number, isCorrect: boolean) => {
    setQuizState(prev => {
      // If already answered this specific question, don't update score/lives again
      if (prev.answers[prev.currentQuestionIndex] !== null) {
          return prev;
      }

      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = index;

      const newScore = isCorrect ? prev.score + 1 : prev.score;
      const newLives = isCorrect ? prev.lives : prev.lives - 1;
      const isGameOver = newLives === 0;

      // If game over, finish immediately
      if (isGameOver) {
        setGameState('finished');
        return {
          ...prev,
          answers: newAnswers,
          score: newScore,
          lives: newLives,
          isFinished: true,
          isGameOver: true
        };
      }

      return {
        ...prev,
        answers: newAnswers,
        score: newScore,
        lives: newLives
      };
    });
  };

  const handleNextQuestion = () => {
    setQuizState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= prev.questions.length) {
        setGameState('finished');
        return { ...prev, isFinished: true };
      }
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  };

  const handlePrevQuestion = () => {
    setQuizState(prev => {
      const prevIndex = prev.currentQuestionIndex - 1;
      if (prevIndex < 0) return prev;
      return { ...prev, currentQuestionIndex: prevIndex };
    });
  };

  const handleRestart = () => {
    if (config && config.topic === 'SAVED') {
        handleStartQuiz(config);
    } else {
        // If it was a generated quiz, just keep config and regenerate
        if (config) handleStartQuiz(config);
        else setGameState('welcome');
    }
  };

  const handleHome = () => {
    setGameState('welcome');
    setConfig(null);
  };

  const toggleSaveQuestion = (question: Question) => {
    setSavedQuestions(prev => {
      const exists = prev.find(q => q.questionText === question.questionText);
      if (exists) {
        showToast("Pergunta removida dos salvos", 'info');
        return prev.filter(q => q.questionText !== question.questionText);
      } else {
        showToast("Pergunta salva no banco!", 'success');
        return [...prev, question];
      }
    });
  };

  const deleteSavedQuestion = (id: string) => {
    setSavedQuestions(prev => prev.filter(q => q.id !== id));
    showToast("Pergunta excluída", 'info');
  };

  const saveToLeaderboard = (name: string, group: string, region: string) => {
    if (!config || config.topic === 'SAVED') return;

    const newEntry: LeaderboardEntry = {
      name,
      group,
      region,
      score: quizState.score,
      date: new Date().toLocaleDateString('pt-BR'),
      difficulty: config.difficulty
    };

    setLeaderboard(prev => {
      // Sort by score descending
      const updated = [...prev, newEntry].sort((a, b) => b.score - a.score);
      return updated.slice(0, 50); // Keep top 50 mostly
    });
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
             style={{
                 backgroundImage: `radial-gradient(${isDarkMode ? '#374151' : '#e5e7eb'} 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
             }}>
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 transition-colors"
          aria-label="Alternar tema"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-church-blue" />
          )}
        </button>

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4 text-center">
                <Loader2 className="w-12 h-12 text-church-gold animate-spin mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-800 dark:text-white mb-2">Preparando Catequese...</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm">A Inteligência Artificial está consultando os documentos da Igreja para criar seu quiz.</p>
             </div>
          </div>
        )}

        <div className="z-10 w-full flex justify-center">
          {gameState === 'welcome' && (
            <WelcomeScreen 
              onStart={handleStartQuiz} 
              isLoading={isLoading} 
              savedQuestions={savedQuestions}
              leaderboard={leaderboard}
              onStartSaved={() => handleStartQuiz({
                topic: 'SAVED',
                difficulty: Difficulty.INTERMEDIARIO, // Default for saved
                numberOfQuestions: 10,
                lives: 3,
                avoidRepeats: false,
                confirmAnswer: false
              })}
              onDeleteSaved={deleteSavedQuestion}
            />
          )}

          {gameState === 'playing' && quizState.questions.length > 0 && !isLoading && (
            <QuizScreen
              question={quizState.questions[quizState.currentQuestionIndex]}
              questionNumber={quizState.currentQuestionIndex + 1}
              totalQuestions={quizState.questions.length}
              lives={quizState.lives}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              onPrev={handlePrevQuestion}
              onBackToHome={handleHome}
              onToggleSave={toggleSaveQuestion}
              isSaved={savedQuestions.some(q => q.questionText === quizState.questions[quizState.currentQuestionIndex].questionText)}
              userAnswer={quizState.answers[quizState.currentQuestionIndex]}
              requireConfirmation={config?.confirmAnswer || false}
            />
          )}

          {gameState === 'finished' && config && !isLoading && (
            <ResultScreen
              score={quizState.score}
              total={quizState.questions.length}
              config={config}
              questions={quizState.questions}
              isGameOver={quizState.isGameOver}
              onRestart={handleRestart}
              onHome={handleHome}
              onSaveScore={saveToLeaderboard}
              onToast={showToast}
            />
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 animate-pop font-bold text-sm flex items-center gap-3 transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-church-blue text-white border border-blue-400' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white border border-red-400'
              : 'bg-gray-800 text-white border border-gray-600'
          }`}>
            {toast.type === 'success' ? (
              <BookmarkCheck className="w-5 h-5 text-church-gold" />
            ) : toast.type === 'error' ? (
              <Trash2 className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
