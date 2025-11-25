
export enum Difficulty {
  INICIANTE = "Iniciante",
  INTERMEDIARIO = "Intermediário",
  AVANCADO = "Avançado",
  MISTA = "Mista"
}

export enum Topic {
  DIVERSOS = "Diversos (Misto)",
  BIBLIA = "Bíblia Sagrada",
  LITURGIA = "Liturgia e Missa",
  OBJETOS = "Objetos Litúrgicos",
  CATECISMO = "Catecismo (Doutrina)",
  SANTOS = "Vida dos Santos",
  ORACOES = "Orações e Devoções"
}

export interface Question {
  id: string;
  questionText: string;
  options: string[]; // Array of 4 options (A-D)
  correctOptionIndex: number; // 0-3
  explanation: string;
  imageKeyword: string; // Keyword to generate the image
  moreInfoUrl?: string; // Optional URL for further reading
  category?: string; // To store category when in mixed mode
  difficulty?: string; // To store the specific difficulty of this question
}

export interface QuizConfig {
  difficulty: Difficulty;
  topic: Topic | 'SAVED'; // SAVED indicates a quiz from saved questions
  numberOfQuestions: number;
  lives: number; // Configurable lives
  avoidRepeats: boolean; // Request unique/rare questions
  confirmAnswer: boolean; // Require confirmation before showing result
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  lives: number;
  answers: (number | null)[]; // Stores user's selected index for each question
  isFinished: boolean;
  isGameOver: boolean;
}

export interface LeaderboardEntry {
  name: string;
  group?: string;
  region: string;
  score: number;
  date: string;
  difficulty: string;
}
