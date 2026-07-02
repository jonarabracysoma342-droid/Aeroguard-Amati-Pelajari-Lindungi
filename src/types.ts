/**
 * Types and interfaces for the Udaraku Educational App
 */

export type Role = 'siswa' | 'guru';

export interface SiswaProfile {
  name: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  ecoPoints: number;
  joinCode: string | null;
  badges: Badge[];
  completedModules: string[]; // ids of completed modules
  gameHighScore: number;
  quizHighScore: number;
}

export interface GuruProfile {
  name: string;
  subject: string;
  createdGroups: string[]; // Array of group codes
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StudentProgress {
  name: string;
  level: number;
  exp: number;
  ecoPoints: number;
  quizHighScore: number;
  gameHighScore: number;
  joinedAt: string;
  timeSpentSeconds?: number; // e.g. 150 (in seconds)
  wrongAnswersCount?: number; // number of incorrect answers
  wrongTopics?: string[]; // e.g. ['PM2.5', 'Hujan Asam']
  rewards?: string[]; // e.g. ['Sertifikat Udara Bersih', 'Bintang Kelas']
}

export interface Group {
  code: string;
  name: string;
  teacherName: string;
  teacherSubject: string;
  students: StudentProgress[];
}

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'join';
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'Mudah' | 'Sedang' | 'Sulit';
}

export interface InfographicItem {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  content: string[];
  stats: { label: string; value: string; color: string }[];
  solutions: string[];
  imageUrl?: string;
  source: string;
}

export interface StudentQuestion {
  id: string;
  studentName: string;
  joinCode: string | null;
  moduleName: string;
  moduleId: string;
  questionText: string;
  askedAt: string;
  destination: 'ai' | 'teacher';
  answerText?: string;
  answeredAt?: string;
  isAnswered: boolean;
}

