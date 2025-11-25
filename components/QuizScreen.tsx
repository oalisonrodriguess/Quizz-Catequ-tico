
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, BookOpenCheck, ExternalLink, Heart, Home, Bookmark, Copy, Check, MousePointerClick } from 'lucide-react';

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  lives: number;
  onAnswer: (index: number, isCorrect: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onBackToHome: () => void;
  onToggleSave: (question: Question) => void;
  isSaved: boolean;
  userAnswer: number | null | undefined;
  requireConfirmation: boolean; // Prop for confirmation mode
}

// Helper component for Copy functionality
const CopyButton = ({ text, className = "" }: { text: string, className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events (like selecting an answer)
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex-shrink-0 ${className}`}
      title="Copiar texto"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  questionNumber,
  totalQuestions,
  lives,
  onAnswer,
  onNext,
  onPrev,
  onBackToHome,
  onToggleSave,
  isSaved,
  userAnswer,
  requireConfirmation
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // Final answer
  const [tempSelectedOption, setTempSelectedOption] = useState<number | null>(null); // For confirmation mode
  const [isAnswered, setIsAnswered] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const [animClass, setAnimClass] = useState("");

  // Restore state or reset when question changes
  useEffect(() => {
    if (userAnswer !== null && userAnswer !== undefined) {
      setSelectedOption(userAnswer);
      setTempSelectedOption(userAnswer);
      setIsAnswered(true);
      // No animation when restoring history
      setAnimClass("");
    } else {
      setSelectedOption(null);
      setTempSelectedOption(null);
      setIsAnswered(false);
      setAnimClass("animate-fade-in");
    }

    // Only update image if question ID changes to avoid flicker when navigating back/forth
    const keyword = encodeURIComponent(question.imageKeyword || 'catholic');
    setImgSrc(`https://image.pollinations.ai/prompt/catholic%20church%20${keyword}?width=600&height=300&nologo=true&seed=${question.id}`);
    setImgError(false);
    
    // Reset animation class after mount
    const timer = setTimeout(() => setAnimClass(""), 500);
    return () => clearTimeout(timer);
  }, [question, userAnswer]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    if (requireConfirmation) {
        setTempSelectedOption(index);
    } else {
        submitAnswer(index);
    }
  };

  const submitAnswer = (index: number) => {
    setSelectedOption(index);
    setTempSelectedOption(index);
    setIsAnswered(true);
    
    const isCorrect = index === question.correctOptionIndex;
    
    // Trigger animations
    if (isCorrect) {
        setAnimClass("animate-pop");
    } else {
        setAnimClass("animate-shake");
    }

    onAnswer(index, isCorrect);
  };

  const handleConfirm = () => {
    if (tempSelectedOption !== null) {
        submitAnswer(tempSelectedOption);
    }
  };

  // Keyboard accessibility for the div-button
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionClick(index);
    }
  };

  const getOptionStyles = (index: number) => {
    const baseStyle = "w-full p-4 rounded-xl text-left border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-church-blue dark:focus:ring-offset-gray-800";
    
    // Confirmed/Answered State
    if (isAnswered) {
        if (index === question.correctOptionIndex) {
            return `${baseStyle} border-green-500 bg-green-50 dark:bg-green-900/40 text-green-900 dark:text-green-100 font-bold shadow-green-100`;
        }

        if (index === selectedOption && index !== question.correctOptionIndex) {
            return `${baseStyle} border-red-500 bg-red-50 dark:bg-red-900/40 text-red-900 dark:text-red-100 shadow-red-100`;
        }

        return `${baseStyle} border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 opacity-60 grayscale`;
    }

    // Temporary Selection (Waiting for confirmation)
    if (requireConfirmation && index === tempSelectedOption) {
        return `${baseStyle} border-church-blue bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30 text-church-blue dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900`;
    }

    // Default Unanswered State
    return `${baseStyle} border-gray-200 dark:border-gray-700 hover:border-church-blue dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md`;
  };

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return 'bg-gray-600';
    const d = diff.toLowerCase();
    if (d.includes('iniciante')) return 'bg-green-600';
    if (d.includes('intermedi')) return 'bg-yellow-600';
    if (d.includes('avan')) return 'bg-red-600';
    return 'bg-gray-600';
  };

  return (
    <div className={`max-w-2xl w-full ${animClass}`}>
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 px-1">
        <button 
          onClick={onBackToHome}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          title="Voltar ao início"
        >
          <Home className="w-6 h-6" />
        </button>

        <div className="flex gap-1 items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
          <Heart className={`w-5 h-5 fill-red-500 text-red-500 mr-1`} />
          <span className="font-bold text-gray-700 dark:text-gray-200">{lives}</span>
        </div>

        <button 
          onClick={() => onToggleSave(question)}
          className={`p-2 rounded-full transition-all duration-300 transform active:scale-90 ${isSaved ? 'text-church-gold scale-110' : 'text-gray-400 hover:text-church-gold'}`}
          title="Salvar pergunta"
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-gray-200 dark:bg-gray-700 rounded-full h-4 w-full shadow-inner p-1">
        <div 
          className="bg-church-blue dark:bg-blue-400 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative">
        
        {/* Dynamic Image Header with Error Handling */}
        <div className="w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden relative group">
            <img 
                src={imgError ? "https://images.unsplash.com/photo-1548625361-e88c60eb8307?auto=format&fit=crop&q=80&w=800" : imgSrc}
                alt={question.imageKeyword} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-6">
                <div className="flex gap-2">
                    <span className="bg-church-gold text-church-purple px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/20 backdrop-blur-sm">
                        {question.category || "Geral"}
                    </span>
                    {question.difficulty && (
                        <span className={`${getDifficultyColor(question.difficulty)} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/20 backdrop-blur-sm`}>
                            {question.difficulty}
                        </span>
                    )}
                </div>
                <span className="text-white/90 text-sm font-mono font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                    {questionNumber}/{totalQuestions}
                </span>
            </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 leading-relaxed flex-1">
              {question.questionText}
            </h2>
            <CopyButton text={question.questionText} className="mt-1" />
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={isAnswered ? -1 : 0}
                onClick={() => handleOptionClick(idx)}
                onKeyDown={(e) => !isAnswered && handleKeyDown(e, idx)}
                className={getOptionStyles(idx)}
              >
                <span className="font-medium text-lg relative z-10 flex-1 pr-2">{option}</span>
                
                <div className="flex items-center gap-2 relative z-20">
                  <CopyButton text={option} />
                  
                  {isAnswered && idx === question.correctOptionIndex && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 animate-pop" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== question.correctOptionIndex && (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 animate-shake" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Confirmation Button */}
          {!isAnswered && requireConfirmation && tempSelectedOption !== null && (
              <div className="mt-6 animate-fade-in-up">
                  <button
                    onClick={handleConfirm}
                    className="w-full bg-church-blue text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MousePointerClick className="w-5 h-5" />
                    Confirmar Resposta
                  </button>
              </div>
          )}

          <div className="mt-8 animate-fade-in-up">
            {/* Explanation Box - Shown only if answered */}
            {isAnswered && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-5 rounded-r-lg mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <BookOpenCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-amber-800 dark:text-amber-300">Explicação Catequética</h3>
                             <CopyButton text={question.explanation} className="text-amber-700/50 hover:text-amber-700 hover:bg-amber-200/50" />
                          </div>
                          
                          <p className="text-amber-900 dark:text-amber-100 leading-relaxed mb-3 text-sm sm:text-base">{question.explanation}</p>
                          
                          {question.moreInfoUrl && (
                              <a 
                                  href={question.moreInfoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm font-bold text-church-blue dark:text-blue-400 hover:underline"
                              >
                                  Aprofundar mais
                                  <ExternalLink className="w-3 h-3" />
                              </a>
                          )}
                      </div>
                    </div>
                </div>
            )}

            {/* Navigation Footer */}
            <div className="flex gap-4 mt-6">
                {questionNumber > 1 && (
                    <button
                        onClick={onPrev}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Anterior
                    </button>
                )}
                
                {isAnswered ? (
                    <button
                        onClick={onNext}
                        className="flex-[2] bg-church-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        {questionNumber === totalQuestions ? "Ver Resultado" : "Próxima"}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    // Spacer to keep layout if Previous button is present but Next is not
                    questionNumber > 1 && !requireConfirmation ? <div className="flex-[2]"></div> : null
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
