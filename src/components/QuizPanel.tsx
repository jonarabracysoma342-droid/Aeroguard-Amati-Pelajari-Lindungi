import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data';
import { Question, SiswaProfile } from '../types';
import { Check, X, Award, HelpCircle, ArrowRight, RotateCcw, AlertCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { audio } from '../utils/audio';

interface QuizPanelProps {
  darkMode: boolean;
  profile: SiswaProfile | null;
  onUpdateProfile: (updated: Partial<SiswaProfile>) => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'join') => void;
  onBack: () => void;
  questions?: Question[];
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
  darkMode,
  profile,
  onUpdateProfile,
  onAddNotification,
  onBack,
  questions = [],
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const activeQuestions = questions.length > 0 ? questions : QUIZ_QUESTIONS;
  const currentQuestion = activeQuestions[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (hasAnswered || !currentQuestion) return;
    
    setSelectedAnswer(optIdx);
    setHasAnswered(true);

    const isCorrect = optIdx === currentQuestion.correctAnswer;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      audio.playSfx('correct');
    } else {
      audio.playSfx('incorrect');
    }
  };

  const handleNext = () => {
    audio.playSfx('click');
    setSelectedAnswer(null);
    setHasAnswered(false);

    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // End of quiz
      setShowSummary(true);
      calculateRewards();
    }
  };

  const calculateRewards = () => {
    if (!profile) return;

    const totalQuestions = activeQuestions.length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    // Gamification points
    const expGained = correctCount * 15;
    const ecoPointsGained = correctCount * 8;
    
    let newExp = profile.exp + expGained;
    let newLevel = profile.level;
    let leveledUp = false;

    if (newExp >= profile.expToNextLevel) {
      newExp -= profile.expToNextLevel;
      newLevel += 1;
      leveledUp = true;
    }

    const currentBadges = profile.badges || [];
    const newBadges = [...currentBadges];

    // Unlock perfect score badge
    if (finalScore === 100 && !newBadges.some((b) => b.id === 'badge-quiz-master')) {
      newBadges.push({
        id: 'badge-quiz-master',
        title: 'Eco-Hero Sejati',
        description: 'Mendapatkan nilai sempurna (100) pada Kuis Udara.',
        icon: '🛡️',
        unlockedAt: new Date().toLocaleTimeString(),
      });
      onAddNotification('Lencana Baru Unlocked: Eco-Hero Sejati! 🛡️', 'success');
    }

    const updatedHighScore = Math.max(profile.quizHighScore || 0, finalScore);

    onUpdateProfile({
      quizHighScore: updatedHighScore,
      exp: newExp,
      level: newLevel,
      ecoPoints: profile.ecoPoints + ecoPointsGained,
      badges: newBadges,
    });

    onAddNotification(`Kuis Selesai! Skor: ${finalScore}. Dapatkan +${expGained} XP & +${ecoPointsGained} Eco-Points!`, 'success');
    
    if (leveledUp) {
      onAddNotification(`Selamat! Anda naik ke Level ${newLevel}! 🎉`, 'success');
      audio.playSfx('level_up');
    } else if (finalScore >= 70) {
      audio.playSfx('quiz_success');
    } else if (finalScore < 50) {
      audio.playSfx('fail');
    } else {
      audio.playSfx('success');
    }
  };

  const resetQuiz = () => {
    audio.playSfx('click');
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCorrectCount(0);
    setShowSummary(false);
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-md mx-auto text-center py-12 p-6 bg-slate-900/40 rounded-3xl border border-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-bold">Belum Ada Pertanyaan Kuis</p>
        <p className="text-xs text-slate-400 mt-2">Silakan hubungi Guru untuk menambahkan soal pada Bank Soal.</p>
        <button onClick={() => { audio.playSfx('click'); onBack(); }} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-200 cursor-pointer">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div id="quiz-panel" className="max-w-2xl mx-auto py-4 px-4 sm:px-6 relative z-10 animate-fade-in">
      
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => { audio.playSfx('click'); onBack(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-slate-300 hover:text-white'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Menu
        </button>
      </div>
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-violet-400' : 'text-violet-800'}`}>
          🧠 Kuis Kompetensi Udara
        </h2>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-md mx-auto`}>
          Asah dan buktikan pemahamanmu mengenai mitigasi serta zat pencemar udara demi mendapatkan lencana pahlawan lingkungan.
        </p>
      </div>

      {!showSummary ? (
        <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden ${
          darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          
          {/* Progress bar */}
          <div className="flex justify-between items-center mb-6 text-xs font-bold text-slate-400">
            <span>SOAL {currentIdx + 1} DARI {activeQuestions.length}</span>
            <span className="text-violet-500">Skor: {Math.round((correctCount / activeQuestions.length) * 100)}</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-extrabold leading-snug mb-6 flex items-start gap-2.5">
            <HelpCircle className="w-6 h-6 text-violet-500 shrink-0 mt-0.5" />
            <span>{currentQuestion.text}</span>
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let btnStyle = 'border-slate-700/20 hover:bg-slate-500/5 hover:border-violet-500/30';
              let indicator = <div className="w-5 h-5 rounded-full border border-slate-400/50 shrink-0" />;

              if (hasAnswered) {
                if (idx === currentQuestion.correctAnswer) {
                  // This was the correct option
                  btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold';
                  indicator = (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  );
                } else if (idx === selectedAnswer) {
                  // Player chose this wrong option
                  btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold';
                  indicator = (
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  );
                } else {
                  // Other unselected wrong options
                  btnStyle = 'opacity-40 border-slate-700/10';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between gap-4 cursor-pointer ${btnStyle}`}
                >
                  <span className="leading-relaxed">{option}</span>
                  {indicator}
                </button>
              );
            })}
          </div>

          {/* Explanation Section */}
          {hasAnswered && (
            <div className={`mt-6 p-5 rounded-2xl border leading-relaxed animate-fade-in ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/5 border-rose-500/10 text-rose-500'
            }`}>
              <h4 className="font-extrabold flex items-center gap-1.5 text-xs uppercase tracking-widest mb-1.5">
                <BookOpen className="w-4 h-4" /> Pembahasan:
              </h4>
              <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={handleNext}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/15"
            >
              <span>{currentIdx < activeQuestions.length - 1 ? 'Pertanyaan Berikutnya' : 'Selesaikan Kuis'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

        </div>
      ) : (
        /* Summary Scorecard */
        <div className={`rounded-3xl border p-8 text-center backdrop-blur-md shadow-2xl ${
          darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="p-4 rounded-full bg-violet-500/10 text-violet-500 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Award className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-black">Evaluasi Selesai!</h3>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Berikut adalah performa kuis pelestarian udara Anda:
          </p>

          <div className="my-8 max-w-sm mx-auto p-6 rounded-2xl border border-slate-800/10 bg-slate-950/25">
            <span className="text-xs text-slate-400 block uppercase tracking-widest font-semibold">Skor Akhir</span>
            <span className="text-5xl font-black text-violet-500 block my-2">
              {Math.round((correctCount / activeQuestions.length) * 100)}
            </span>
            <span className="text-xs text-slate-400 block font-semibold">
              {correctCount} Jawaban Benar dari {activeQuestions.length} Soal
            </span>
          </div>

          <div className="my-6 space-y-2 text-xs">
            <p className="font-semibold text-emerald-500">
              🪙 +{correctCount * 8} Eco-Points Diklaim
            </p>
            <p className="font-semibold text-violet-500">
              🔥 +{correctCount * 15} XP Diperoleh
            </p>
            {correctCount === activeQuestions.length && (
              <p className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full inline-block animate-pulse">
                🛡️ Lencana Pahlawan 'Eco-Hero Sejati' Terbuka!
              </p>
            )}
          </div>

          <div className="flex gap-4 max-w-xs mx-auto">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi Kuis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
