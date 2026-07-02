import React, { useState } from 'react';
import { Group, StudentProgress, Question, StudentQuestion } from '../types';
import { 
  Plus, Users, Copy, Check, BarChart3, Award, Sparkles, UserPlus, 
  FileSpreadsheet, Trash2, ArrowLeft, LogOut, BookOpen, AlertTriangle, 
  TrendingUp, Clock, HelpCircle, Edit3, ChevronRight, Download, Printer,
  CheckCircle, RefreshCw, Star, Shield, Trophy, Flame, FileText, Gift,
  GraduationCap, Send, MessageSquare, Loader2
} from 'lucide-react';
import { audio } from '../utils/audio';

interface TeacherDashboardProps {
  darkMode: boolean;
  teacherName: string;
  teacherSubject: string;
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
  onAddGroup: (groupName: string) => void;
  onDeleteGroup: (groupCode: string) => void;
  onSimulateJoin: (groupCode: string) => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'join') => void;
  onBackToMenu: () => void;
  onNavigateToHome: () => void;
  onLogout: () => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  studentQuestions?: StudentQuestion[];
  onUpdateStudentQuestions?: (questions: StudentQuestion[]) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  darkMode,
  teacherName,
  teacherSubject,
  groups,
  onUpdateGroups,
  onAddGroup,
  onDeleteGroup,
  onSimulateJoin,
  onAddNotification,
  onBackToMenu,
  onNavigateToHome,
  onLogout,
  questions,
  onUpdateQuestions,
  studentQuestions = [],
  onUpdateStudentQuestions,
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [activeGroupCode, setActiveGroupCode] = useState<string | null>(groups[0]?.code || null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'ringkasan' | 'monitoring' | 'banksoal' | 'leaderboard' | 'laporan' | 'tanyajawab'>('ringkasan');

  // Manual student form states
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');

  // Student QA states
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [teacherResponseText, setTeacherResponseText] = useState('');

  const handleAnswerStudentQuestion = (id: string) => {
    if (!teacherResponseText.trim()) return;

    if (onUpdateStudentQuestions) {
      const updated = studentQuestions.map(q => {
        if (q.id === id) {
          return {
            ...q,
            isAnswered: true,
            answerText: teacherResponseText,
            answeredAt: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          };
        }
        return q;
      });
      onUpdateStudentQuestions(updated);
      onAddNotification('Jawaban berhasil terkirim ke Siswa! 👩‍🏫', 'success');
      audio.playSfx('success');
      setAnsweringQuestionId(null);
      setTeacherResponseText('');
    }
  };
  const [manualStudentLevel, setManualStudentLevel] = useState(3);
  const [manualStudentExp, setManualStudentExp] = useState(40);
  const [manualStudentQuiz, setManualStudentQuiz] = useState(80);
  const [manualStudentGame, setManualStudentGame] = useState(120);
  const [manualStudentTime, setManualStudentTime] = useState(210); // in seconds
  const [manualStudentWrongCount, setManualStudentWrongCount] = useState(1);
  const [manualStudentWrongTopics, setManualStudentWrongTopics] = useState('Partikulat PM2.5');

  // Question bank form states
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit'>('Sedang');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState(0);
  const [questionExplanation, setQuestionExplanation] = useState('');

  // Rewards Modal/Select state
  const [selectedStudentForReward, setSelectedStudentForReward] = useState<StudentProgress | null>(null);
  const [rewardType, setRewardType] = useState<'badge' | 'certificate' | 'points'>('badge');
  const [selectedBadge, setSelectedBadge] = useState('Lencana Cendekia');
  const [selectedPoints, setSelectedPoints] = useState(100);

  // Certificate Modal state
  const [activeCertificateStudent, setActiveCertificateStudent] = useState<StudentProgress | null>(null);

  // Print Report state
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    onAddGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onAddNotification(`Kode kelompok ${code} berhasil disalin!`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Find the selected group
  const activeGroup = groups.find((g) => g.code === activeGroupCode) || groups[0];

  // Helper: Calculate AQI based on student stats
  const getStudentAQI = (student: StudentProgress) => {
    let aqi = 220;
    const modulesRead = Math.min(student.level, 5);
    aqi -= modulesRead * 15;
    aqi -= (student.quizHighScore / 100) * 35;
    aqi -= Math.min(student.gameHighScore * 0.25, 40);
    aqi -= (student.level - 1) * 10;
    return Math.max(12, Math.round(aqi));
  };

  // Calculate Group Statistics
  const getGroupStats = (group: Group | undefined) => {
    if (!group || group.students.length === 0) {
      return { avgScore: 0, totalEco: 0, avgLevel: 1, highestGame: 0, avgAqiRepaired: 0, totalPlaying: 0 };
    }
    const total = group.students.length;
    const sumQuiz = group.students.reduce((acc, curr) => acc + curr.quizHighScore, 0);
    const sumEco = group.students.reduce((acc, curr) => acc + curr.ecoPoints, 0);
    const sumLevel = group.students.reduce((acc, curr) => acc + curr.level, 0);
    const maxGame = Math.max(...group.students.map((s) => s.gameHighScore));
    
    // Calculate repaired AQI
    // Baseline dirty AQI starts at 220. Repaired = 220 - current_aqi
    const totalAqiRepaired = group.students.reduce((acc, student) => {
      const studentAqi = getStudentAQI(student);
      return acc + (220 - studentAqi);
    }, 0);

    const activePlayingCount = group.students.filter(s => s.quizHighScore > 0 || s.gameHighScore > 0).length;

    return {
      avgScore: Math.round(sumQuiz / total),
      totalEco: sumEco,
      avgLevel: Number((sumLevel / total).toFixed(1)),
      highestGame: maxGame,
      avgAqiRepaired: Math.round(totalAqiRepaired / total),
      totalPlaying: activePlayingCount
    };
  };

  const stats = getGroupStats(activeGroup);

  // Handle adding student manually
  const handleAddStudentManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    if (!manualStudentName.trim()) {
      onAddNotification("Nama siswa harus diisi!", "info");
      return;
    }

    // Check if duplicate name
    if (activeGroup.students.some(s => s.name.toLowerCase() === manualStudentName.trim().toLowerCase())) {
      onAddNotification(`Siswa "${manualStudentName}" sudah terdaftar di kelas ini.`, "info");
      return;
    }

    const wrongTopicsArray = manualStudentWrongTopics.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const newStudent: StudentProgress = {
      name: manualStudentName.trim(),
      level: Number(manualStudentLevel),
      exp: Number(manualStudentExp),
      ecoPoints: Number(manualStudentLevel * 100 + manualStudentExp * 2),
      quizHighScore: Number(manualStudentQuiz),
      gameHighScore: Number(manualStudentGame),
      joinedAt: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      timeSpentSeconds: Number(manualStudentTime),
      wrongAnswersCount: Number(manualStudentWrongCount),
      wrongTopics: wrongTopicsArray,
      rewards: []
    };

    const updatedGroups = groups.map(g => {
      if (g.code === activeGroup.code) {
        return {
          ...g,
          students: [...g.students, newStudent]
        };
      }
      return g;
    });

    onUpdateGroups(updatedGroups);
    setManualStudentName('');
    setShowAddStudentForm(false);
    onAddNotification(`Siswa "${newStudent.name}" berhasil ditambahkan secara manual!`, "success");
  };

  // Handle deleting student
  const handleDeleteStudent = (studentName: string) => {
    if (!activeGroup) return;
    setConfirmModal({
      isOpen: true,
      title: 'Keluarkan Siswa',
      message: `Apakah Anda yakin ingin mengeluarkan siswa "${studentName}" dari kelompok ini?`,
      onConfirm: () => {
        const updatedGroups = groups.map(g => {
          if (g.code === activeGroup.code) {
            return {
              ...g,
              students: g.students.filter(s => s.name !== studentName)
            };
          }
          return g;
        });
        onUpdateGroups(updatedGroups);
        onAddNotification(`Siswa "${studentName}" dikeluarkan dari kelompok.`, "info");
      }
    });
  };

  // Handle awarding reward/badge
  const handleAwardReward = (studentName: string) => {
    if (!activeGroup) return;
    
    let rewardValue = '';
    if (rewardType === 'badge') {
      rewardValue = `🏅 Lencana ${selectedBadge}`;
    } else if (rewardType === 'points') {
      rewardValue = `🪙 +${selectedPoints} Eco-Points`;
    } else {
      rewardValue = `📜 Sertifikat Kompetensi`;
    }

    const updatedGroups = groups.map(g => {
      if (g.code === activeGroup.code) {
        return {
          ...g,
          students: g.students.map(s => {
            if (s.name === studentName) {
              const currentRewards = s.rewards || [];
              if (currentRewards.includes(rewardValue)) {
                onAddNotification(`${studentName} sudah memiliki penghargaan ini.`, 'info');
                return s;
              }
              
              // If eco points given, increase it
              let newEcoPoints = s.ecoPoints;
              if (rewardType === 'points') {
                newEcoPoints += selectedPoints;
              }

              onAddNotification(`Reward "${rewardValue}" disematkan kepada ${studentName}!`, 'success');
              return {
                ...s,
                ecoPoints: newEcoPoints,
                rewards: [...currentRewards, rewardValue]
              };
            }
            return s;
          })
        };
      }
      return g;
    });

    onUpdateGroups(updatedGroups);
    setSelectedStudentForReward(null);
  };

  // Question Bank operations
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
      onAddNotification("Semua field pertanyaan harus diisi!", "info");
      return;
    }

    const newQuestion: Question = {
      id: editingQuestionId !== null ? editingQuestionId : (questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1),
      text: questionText.trim(),
      options: [option1.trim(), option2.trim(), option3.trim(), option4.trim()],
      correctAnswer: Number(correctAnswerIdx),
      explanation: questionExplanation.trim() || "Pembahasan disediakan oleh Guru.",
      difficulty: questionDifficulty
    };

    if (editingQuestionId !== null) {
      // Edit mode
      const updated = questions.map(q => q.id === editingQuestionId ? newQuestion : q);
      onUpdateQuestions(updated);
      onAddNotification("Pertanyaan kuis berhasil diperbarui!", "success");
      setEditingQuestionId(null);
    } else {
      // Add mode
      onUpdateQuestions([...questions, newQuestion]);
      onAddNotification("Pertanyaan kuis baru berhasil ditambahkan!", "success");
    }

    // Reset form states
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectAnswerIdx(0);
    setQuestionExplanation('');
  };

  const handleEditQuestionClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.text);
    setQuestionDifficulty(q.difficulty || 'Sedang');
    setOption1(q.options[0] || '');
    setOption2(q.options[1] || '');
    setOption3(q.options[2] || '');
    setOption4(q.options[3] || '');
    setCorrectAnswerIdx(q.correctAnswer);
    setQuestionExplanation(q.explanation);
  };

  const handleDeleteQuestion = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pertanyaan',
      message: "Apakah Anda yakin ingin menghapus pertanyaan ini dari Bank Soal?",
      onConfirm: () => {
        onUpdateQuestions(questions.filter(q => q.id !== id));
        onAddNotification("Pertanyaan kuis dihapus.", "info");
      }
    });
  };

  // CSV Report Downloader
  const handleDownloadCSV = () => {
    if (!activeGroup || activeGroup.students.length === 0) {
      onAddNotification("Belum ada data siswa untuk diunduh.", "info");
      return;
    }
    
    // CSV content construction
    let csvContent = "\uFEFF"; // Byte Order Mark for Excel Indonesian encoding
    csvContent += "Nama Siswa,Level,XP,Eco-Points,Skor Kuis (%),Skor Game,Waktu Penyelesaian (Detik),Jumlah Jawaban Salah,Materi Sulit (Koleksi),Penghargaan / Rewards,AQI Udara Akhir\n";
    
    activeGroup.students.forEach((student) => {
      const wrongTopicsStr = (student.wrongTopics || []).join("; ");
      const rewardsStr = (student.rewards || []).join("; ");
      const studentAqi = getStudentAQI(student);
      const row = `"${student.name}",${student.level},${student.exp},${student.ecoPoints},${student.quizHighScore},${student.gameHighScore},${student.timeSpentSeconds || 0},${student.wrongAnswersCount || 0},"${wrongTopicsStr}","${rewardsStr}",${studentAqi}`;
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kelas_${activeGroup.name.replace(/\s+/g, '_')}_Udaraku.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddNotification("Laporan kelas (Excel/CSV) berhasil diunduh!", "success");
  };

  // Level completion stats (Persentase penyelesaian tiap level)
  const getLevelPercentage = (level: number) => {
    if (!activeGroup || activeGroup.students.length === 0) return 0;
    const count = activeGroup.students.filter(s => s.level >= level).length;
    return Math.round((count / activeGroup.students.length) * 100);
  };

  // Difficult topics aggregator (Materi yang paling sulit dipahami)
  const getDifficultTopics = () => {
    if (!activeGroup || activeGroup.students.length === 0) return [];
    const counts: Record<string, number> = {};
    activeGroup.students.forEach(s => {
      if (s.wrongTopics) {
        s.wrongTopics.forEach(topic => {
          counts[topic] = (counts[topic] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([topic, count]) => ({ topic, count, percentage: Math.round((count / activeGroup.students.length) * 100) }))
      .sort((a, b) => b.count - a.count);
  };

  const difficultTopics = getDifficultTopics();

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="teacher-dashboard" className="w-full mx-auto py-2 px-2 sm:py-4 sm:px-4 lg:py-6 lg:px-6 relative z-10 animate-fade-in print:p-0">
      
      {/* Top Action Buttons (Kembali ke Menu & Keluar) - Hidden during print */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6 print:hidden">
        <button
          onClick={() => {
            audio.playSfx('click');
            onBackToMenu();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-teal-400 hover:text-teal-300'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-teal-600 hover:text-teal-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          onClick={() => {
            audio.playSfx('click');
            onNavigateToHome();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-emerald-400 hover:text-emerald-300'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-emerald-600 hover:text-emerald-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Menu
        </button>

        <button
          onClick={onLogout}
          className={`flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-rose-400 hover:text-rose-300'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-rose-600 hover:text-rose-700'
          }`}
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
      
      {/* Welcome Banner - Hidden during print */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border mb-6 sm:mb-8 backdrop-blur-md shadow-lg print:hidden ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-teal-500 uppercase tracking-widest block">Sistem Kendali Pembelajaran</span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">Halo Guru, {teacherName}!</h2>
            <p className={`text-[10px] sm:text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mata Pelajaran: <span className="font-bold text-teal-500">{teacherSubject}</span>
            </p>
          </div>

          <form onSubmit={handleCreateGroup} className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Nama Kelas Baru..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-teal-500 w-full ${
                darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Buat Kelas
            </button>
          </form>
        </div>
      </div>

      {/* Main Container */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-700/20 rounded-3xl p-8 backdrop-blur-sm print:hidden">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold">Belum Ada Kelas yang Dibuat</h3>
          <p className={`text-sm mt-2 max-w-sm mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Mulai dengan mengetikkan nama kelas di formulir kanan atas (contoh: "Kelas VIII-C IPA").
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Class Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-700/10 pb-px overflow-x-auto scrollbar-none print:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
              Daftar Kelas:
            </span>
            {groups.map((group) => {
              const isSelected = activeGroup?.code === group.code;
              return (
                <button
                  key={group.code}
                  onClick={() => {
                    setActiveGroupCode(group.code);
                    setShowAddStudentForm(false);
                  }}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {group.name}
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-teal-500/20' : 'bg-slate-800/50'}`}>
                    {group.students.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group Content Dashboard */}
          {activeGroup && (
            <div className="space-y-6">
              
              {/* Active Group Header / Code Card (Hidden during print) */}
              <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold">{activeGroup.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-semibold uppercase tracking-widest text-[9px]">
                      Aktif
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                    Siswa dapat menggunakan Kode Gabung di bawah ini untuk tersinkronisasi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 font-mono text-center flex-1 md:flex-initial">
                    <span className="text-[10px] text-slate-400 block font-sans tracking-wide uppercase">KODE KELAS</span>
                    <span className="text-lg font-black text-teal-400 tracking-wider">{activeGroup.code}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(activeGroup.code)}
                    className="p-3.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 cursor-pointer transition-transform hover:scale-105"
                    title="Salin Kode Kelas"
                  >
                    {copiedCode === activeGroup.code ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => onSimulateJoin(activeGroup.code)}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/10 transition-transform hover:scale-105 shrink-0"
                    title="Simulasikan Murid Baru Bergabung secara otomatis"
                  >
                    <UserPlus className="w-4 h-4" /> Simulasi Gabung
                  </button>

                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Hapus Kelas',
                        message: `Apakah Anda yakin ingin menghapus kelas "${activeGroup.name}"? Semua data murid di kelas ini akan hilang secara permanen.`,
                        onConfirm: () => {
                          onDeleteGroup(activeGroup.code);
                          if (activeGroupCode === activeGroup.code) {
                            setActiveGroupCode(groups.find((g) => g.code !== activeGroup.code)?.code || null);
                          }
                        }
                      });
                    }}
                    className="px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 shrink-0"
                    title="Hapus Kelas Ini"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Kelas
                  </button>
                </div>
              </div>

              {/* Sub Navigation Tabs inside Dashboard (Hidden during print) */}
              <div className="flex border-b border-slate-700/10 gap-2 overflow-x-auto pb-px print:hidden scrollbar-none">
                <button
                  onClick={() => setDashboardTab('ringkasan')}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    dashboardTab === 'ringkasan'
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Ringkasan & Siswa
                </button>
                <button
                  onClick={() => setDashboardTab('monitoring')}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    dashboardTab === 'monitoring'
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Monitoring Hasil & Reward
                </button>
                <button
                  onClick={() => setDashboardTab('banksoal')}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    dashboardTab === 'banksoal'
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Bank Soal ({questions.length})
                </button>
                <button
                  onClick={() => setDashboardTab('leaderboard')}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    dashboardTab === 'leaderboard'
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> Leaderboard Kelas
                </button>
                <button
                  onClick={() => setDashboardTab('laporan')}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    dashboardTab === 'laporan'
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Laporan & Analisis
                </button>
                <button
                  onClick={() => {
                    setDashboardTab('tanyajawab');
                    audio.playSfx('click');
                  }}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap relative ${
                    dashboardTab === 'tanyajawab'
                      ? 'border-violet-500 text-violet-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-violet-400" /> Tanya Jawab Siswa
                  {studentQuestions.filter(q => q.destination === 'teacher' && !q.isAnswered).length > 0 && (
                    <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold animate-bounce ml-1 shrink-0">
                      {studentQuestions.filter(q => q.destination === 'teacher' && !q.isAnswered).length}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: RINGKASAN & KELOLA KELAS */}
              {dashboardTab === 'ringkasan' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Statistics Summary Widgets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-2xl border backdrop-blur-sm shadow-sm ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Murid</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-teal-500">{activeGroup.students.length}</span>
                        <span className="text-xs text-slate-400">Terdaftar</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border backdrop-blur-sm shadow-sm ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Siswa Aktif Bermain</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-sky-500">{stats.totalPlaying}</span>
                        <span className="text-xs text-slate-400">/{activeGroup.students.length}</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border backdrop-blur-sm shadow-sm ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Rata-Rata Kuis</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-violet-500">{stats.avgScore}%</span>
                        <span className="text-xs text-slate-400">Benar</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border backdrop-blur-sm shadow-sm ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Rerata AQI Diperbaiki</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-emerald-500">+{stats.avgAqiRepaired}</span>
                        <span className="text-xs text-slate-400">Poin AQI</span>
                      </div>
                    </div>
                  </div>

                  {/* Level Completion Rate (Persentase penyelesaian tiap level) */}
                  <div className={`p-6 rounded-3xl border backdrop-blur-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Persentase Penyelesaian Tiap Level Kompetensi
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { lvl: 2, name: "Level 2: Detektor Pemula", desc: "Siswa mencapai Level 2+" },
                        { lvl: 4, name: "Level 4: Penjaga Lingkungan", desc: "Siswa mencapai Level 4+" },
                        { lvl: 5, name: "Level 5: Pahlawan Atmosfer", desc: "Siswa mencapai Level Sempurna (5)" }
                      ].map((item, idx) => {
                        const pct = getLevelPercentage(item.lvl);
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-semibold">{item.name}</span>
                              <span className="font-extrabold text-teal-400 text-sm">{pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kelola Siswa Block */}
                  <div className={`rounded-3xl border overflow-hidden backdrop-blur-md ${
                    darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="px-6 py-4 border-b border-slate-700/10 flex flex-wrap justify-between items-center gap-4">
                      <h4 className="text-sm font-black flex items-center gap-1.5 uppercase tracking-wide text-teal-500">
                        <Users className="w-4 h-4" /> Manajemen Anggota Kelas ({activeGroup.students.length} Siswa)
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                          className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Siswa Manual
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Add Student Form */}
                    {showAddStudentForm && (
                      <form onSubmit={handleAddStudentManual} className={`p-6 border-b border-slate-800/10 space-y-4 animate-slide-down ${darkMode ? 'bg-slate-950/40' : 'bg-slate-50'}`}>
                        <h5 className="font-bold text-xs text-teal-400 uppercase tracking-widest">Form Tambah Siswa Baru (Simulasi Demo)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">NAMA SISWA</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Ahmad Fauzi"
                              value={manualStudentName}
                              onChange={e => setManualStudentName(e.target.value)}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">TINGKAT LEVEL (1-5)</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="5"
                              value={manualStudentLevel}
                              onChange={e => setManualStudentLevel(Number(e.target.value))}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">XP SISWA</label>
                            <input 
                              type="number" 
                              min="0"
                              value={manualStudentExp}
                              onChange={e => setManualStudentExp(Number(e.target.value))}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">SKOR KUIS (0-100)</label>
                            <input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={manualStudentQuiz}
                              onChange={e => setManualStudentQuiz(Number(e.target.value))}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">SKOR GAME INTERAKTIF</label>
                            <input 
                              type="number" 
                              min="0"
                              value={manualStudentGame}
                              onChange={e => setManualStudentGame(Number(e.target.value))}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">DURASI BELAJAR (DETIK)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={manualStudentTime}
                              onChange={e => setManualStudentTime(Number(e.target.value))}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] text-slate-400 block font-bold mb-1">MATERI YANG SALAH/SULIT (Pemisah Koma)</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Partikulat PM2.5, Hujan Asam, Bioindikator Liken"
                              value={manualStudentWrongTopics}
                              onChange={e => setManualStudentWrongTopics(e.target.value)}
                              className={`px-3 py-2 text-sm rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddStudentForm(false)}
                            className="px-4 py-2 rounded-lg border border-slate-700/20 text-xs font-bold hover:bg-slate-800/10"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs"
                          >
                            Tambahkan Siswa
                          </button>
                        </div>
                      </form>
                    )}

                    {activeGroup.students.length === 0 ? (
                      <div className="text-center py-12 p-6">
                        <Users className="w-12 h-12 text-slate-500 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">Belum ada murid yang bergabung</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-sm mx-auto`}>
                          Gunakan tombol <b>"Simulasi Gabung"</b> di kanan atas atau klik <b>"Tambah Siswa Manual"</b> untuk mengisi data simulasi pembelajaran kelas Anda!
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800/10 bg-slate-950/15 text-xs text-slate-400 uppercase font-bold">
                              <th className="px-6 py-4">Nama Siswa</th>
                              <th className="px-6 py-4">Level Kelas</th>
                              <th className="px-6 py-4 text-center">Rerata Kuis</th>
                              <th className="px-6 py-4 text-center">Skor Game</th>
                              <th className="px-6 py-4 text-center">AQI Udara</th>
                              <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/10 text-xs sm:text-sm">
                            {activeGroup.students.map((student, idx) => {
                              const studentAqi = getStudentAQI(student);
                              return (
                                <tr key={idx} className={darkMode ? 'hover:bg-slate-900/35' : 'hover:bg-slate-100/35'}>
                                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                                    {student.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-semibold text-teal-400">Lv {student.level}</span>
                                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} ml-1.5`}>({student.exp} XP)</span>
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-violet-500">
                                    {student.quizHighScore}/100
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-amber-500">
                                    🪙 {student.gameHighScore}
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold">
                                    <span className={`px-2 py-1 rounded text-xs ${studentAqi < 50 ? 'bg-emerald-500/10 text-emerald-400' : studentAqi < 100 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                      {studentAqi} AQI
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleDeleteStudent(student.name)}
                                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                      title="Keluarkan dari kelas"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MONITORING HASIL & PEMBERIAN REWARD */}
              {dashboardTab === 'monitoring' && (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 rounded-3xl border backdrop-blur-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <h3 className="text-lg font-extrabold flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-teal-400" /> Pemantauan Detail Kompetensi & Penghargaan
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
                      Menganalisis durasi belajar, jumlah kesalahan kuis, dan topik spesifik yang masih membingungkan murid, serta membagikan lencana penghargaan langsung.
                    </p>

                    {activeGroup.students.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm">Belum ada murid di kelas ini.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-slate-800/10 text-slate-400 font-bold uppercase text-[11px] bg-slate-950/15">
                              <th className="px-4 py-3">Nama Siswa</th>
                              <th className="px-4 py-3">Waktu Belajar</th>
                              <th className="px-4 py-3 text-center">Jawaban Salah</th>
                              <th className="px-4 py-3">Materi Sulit Terdeteksi</th>
                              <th className="px-4 py-3">Rewards & Badges</th>
                              <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/10">
                            {activeGroup.students.map((student, idx) => {
                              const timeStr = student.timeSpentSeconds 
                                ? `${Math.floor(student.timeSpentSeconds / 60)}m ${student.timeSpentSeconds % 60}s`
                                : "Belum diukur";
                              return (
                                <tr key={idx} className={darkMode ? 'hover:bg-slate-900/35' : 'hover:bg-slate-100/35'}>
                                  <td className="px-4 py-4 font-bold">{student.name}</td>
                                  <td className="px-4 py-4 flex items-center gap-1.5 font-semibold text-sky-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeStr}
                                  </td>
                                  <td className="px-4 py-4 text-center font-bold text-red-500">
                                    {student.wrongAnswersCount || 0} Soal
                                  </td>
                                  <td className="px-4 py-4">
                                    {student.wrongTopics && student.wrongTopics.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {student.wrongTopics.map((topic, tIdx) => (
                                          <span key={tIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-emerald-500 text-[11px] font-bold">Tidak Ada (Sempurna) ✨</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    {student.rewards && student.rewards.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                                        {student.rewards.map((reward, rIdx) => (
                                          <span key={rIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 whitespace-nowrap">
                                            {reward}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-500 text-xs italic">Belum ada</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => setSelectedStudentForReward(student)}
                                        className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 cursor-pointer text-xs font-bold flex items-center gap-1"
                                        title="Berikan Reward Kustom"
                                      >
                                        <Gift className="w-3.5 h-3.5" /> Beri Reward
                                      </button>
                                      
                                      <button
                                        onClick={() => setActiveCertificateStudent(student)}
                                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 cursor-pointer text-xs font-bold flex items-center gap-1"
                                        title="Cetak Sertifikat"
                                      >
                                        <Award className="w-3.5 h-3.5" /> Cetak Serti
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BANK SOAL */}
              {dashboardTab === 'banksoal' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Bank Soal Splitting Grid */}
                  <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* Add/Edit Question Form Panel (1 col) */}
                    <div className={`md:col-span-1 p-5 rounded-3xl border self-start ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <h4 className="font-extrabold text-xs uppercase tracking-widest text-teal-500 mb-4 flex items-center gap-1">
                        <Edit3 className="w-4 h-4" /> {editingQuestionId !== null ? "Ubah Soal Kuis" : "Tambah Soal Kuis"}
                      </h4>
                      
                      <form onSubmit={handleSaveQuestion} className="space-y-3.5">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-1">SOAL PERTANYAAN</label>
                          <textarea
                            rows={3}
                            placeholder="Contoh: Mengapa gas CFC berbahaya bagi ketahanan atmosfer?"
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            className={`px-3 py-2 text-xs rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-1">TINGKAT KESULITAN</label>
                          <select
                            value={questionDifficulty}
                            onChange={e => setQuestionDifficulty(e.target.value as 'Mudah' | 'Sedang' | 'Sulit')}
                            className={`px-2 py-1.5 text-xs rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            <option value="Mudah">🟢 Mudah</option>
                            <option value="Sedang">🟡 Sedang</option>
                            <option value="Sulit">🔴 Sulit</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 block font-bold">PILIHAN JAWABAN (OPSI)</label>
                          <input 
                            type="text" 
                            placeholder="Pilihan A" 
                            value={option1} 
                            onChange={e => setOption1(e.target.value)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg border w-full focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'}`}
                          />
                          <input 
                            type="text" 
                            placeholder="Pilihan B" 
                            value={option2} 
                            onChange={e => setOption2(e.target.value)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg border w-full focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                          />
                          <input 
                            type="text" 
                            placeholder="Pilihan C" 
                            value={option3} 
                            onChange={e => setOption3(e.target.value)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg border w-full focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                          />
                          <input 
                            type="text" 
                            placeholder="Pilihan D" 
                            value={option4} 
                            onChange={e => setOption4(e.target.value)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg border w-full focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-1">PILIHAN BENAR (INDEKS)</label>
                          <select
                            value={correctAnswerIdx}
                            onChange={e => setCorrectAnswerIdx(Number(e.target.value))}
                            className={`px-2 py-1.5 text-xs rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            <option value={0}>A - Pilihan Pertama</option>
                            <option value={1}>B - Pilihan Kedua</option>
                            <option value={2}>C - Pilihan Ketiga</option>
                            <option value={3}>D - Pilihan Keempat</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-1">PEMBAHASAN EKSPILISIT</label>
                          <textarea
                            rows={2}
                            placeholder="Penjelasan ringkas jawaban yang benar..."
                            value={questionExplanation}
                            onChange={e => setQuestionExplanation(e.target.value)}
                            className={`px-3 py-2 text-xs rounded-lg border w-full focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          {editingQuestionId !== null && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestionId(null);
                                setQuestionText('');
                                setOption1('');
                                setOption2('');
                                setOption3('');
                                setOption4('');
                              }}
                              className="flex-1 py-2 rounded-lg border border-slate-700/20 text-xs font-bold hover:bg-slate-800/10 cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="submit"
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                          >
                            {editingQuestionId !== null ? "Update Soal" : "Simpan Soal"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Question List View (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Koleksi Bank Soal Aktif ({questions.length})
                        </h4>
                        <span className="text-[10px] text-slate-400">Status: Tersinkronisasi Kuis Siswa</span>
                      </div>

                      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                        {questions.map((q, idx) => (
                          <div 
                            key={q.id}
                            className={`p-5 rounded-2xl border transition-all relative group ${
                              darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-teal-400 text-xs font-mono">#{idx+1}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  q.difficulty === 'Sulit' 
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                    : q.difficulty === 'Mudah'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {q.difficulty || 'Sedang'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditQuestionClick(q)}
                                  className="p-1 rounded text-teal-400 hover:bg-teal-500/10 cursor-pointer"
                                  title="Edit Soal"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  title="Hapus Soal"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm font-bold leading-relaxed pr-6 mb-3">{q.text}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = optIdx === q.correctAnswer;
                                return (
                                  <div 
                                    key={optIdx}
                                    className={`p-2 rounded-lg border flex justify-between items-center ${
                                      isCorrect 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' 
                                        : 'border-slate-800/10 bg-slate-950/10 text-slate-400'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className={`mt-3 p-3 rounded-xl text-[11px] leading-relaxed ${darkMode ? 'bg-slate-950/45 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <span className="font-bold text-teal-500 block mb-0.5">Bahasan:</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: LEADERBOARD KELAS */}
              {dashboardTab === 'leaderboard' && (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 rounded-3xl border backdrop-blur-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div className="text-center max-w-sm mx-auto mb-6">
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-extrabold tracking-tight">Leaderboard Kelas Terbuka</h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                        Peringkat real-time siswa berdasarkan kompetensi kuis, XP harian, dan kecepatan penyelesaian materi.
                      </p>
                    </div>

                    {activeGroup.students.length === 0 ? (
                      <div className="text-center py-12 text-xs">Belum ada murid.</div>
                    ) : (
                      <div className="space-y-8">
                        
                        {/* 1st, 2nd, 3rd place podiums visualizer */}
                        {(() => {
                          const sortedByScore = [...activeGroup.students].sort((a,b) => b.quizHighScore - a.quizHighScore || b.gameHighScore - a.gameHighScore);
                          const first = sortedByScore[0];
                          const second = sortedByScore[1];
                          const third = sortedByScore[2];
                          
                          return (
                            <div className="flex justify-center items-end gap-3 sm:gap-6 pt-6 pb-2 max-w-md mx-auto">
                              
                              {/* 2nd place (Left) */}
                              {second && (
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-bold text-sky-400 text-center truncate max-w-[80px]">{second.name}</span>
                                  <span className="text-xs font-bold text-slate-400 mt-1">{second.quizHighScore} Pts</span>
                                  <div className="w-16 sm:w-20 bg-gradient-to-t from-slate-800/80 to-slate-700/40 border border-slate-600/30 h-24 rounded-t-2xl mt-2 flex flex-col justify-end items-center pb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-200 shadow-md shadow-slate-400/20">2</div>
                                    <span className="text-[10px] text-slate-400 font-bold mt-1">Silver</span>
                                  </div>
                                </div>
                              )}

                              {/* 1st place (Center) */}
                              {first && (
                                <div className="flex flex-col items-center">
                                  <div className="text-center animate-bounce mb-1">👑</div>
                                  <span className="text-xs font-extrabold text-amber-400 text-center truncate max-w-[90px]">{first.name}</span>
                                  <span className="text-xs font-extrabold text-amber-300 mt-0.5">{first.quizHighScore} Pts</span>
                                  <div className="w-20 sm:w-24 bg-gradient-to-t from-amber-950/50 to-amber-500/20 border border-amber-500/30 h-32 rounded-t-2xl mt-2 flex flex-col justify-end items-center pb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center border-2 border-amber-200 shadow-md shadow-amber-400/30">1</div>
                                    <span className="text-[10px] text-amber-400 font-bold mt-1.5">Emas</span>
                                  </div>
                                </div>
                              )}

                              {/* 3rd place (Right) */}
                              {third && (
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-bold text-amber-600 text-center truncate max-w-[80px]">{third.name}</span>
                                  <span className="text-xs font-bold text-slate-400 mt-1">{third.quizHighScore} Pts</span>
                                  <div className="w-16 sm:w-20 bg-gradient-to-t from-orange-950/40 to-orange-700/20 border border-orange-700/20 h-20 rounded-t-2xl mt-2 flex flex-col justify-end items-center pb-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center border-2 border-amber-600 shadow-md shadow-amber-700/20">3</div>
                                    <span className="text-[10px] text-amber-600 font-bold mt-1">Perunggu</span>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })()}

                        {/* Leaderboard Table Rankings */}
                        <div className="border border-slate-700/10 rounded-2xl overflow-hidden">
                          <div className="px-4 py-2 text-slate-400 font-bold uppercase text-[10px] bg-slate-950/15 flex justify-between">
                            <span>Siswa</span>
                            <div className="flex gap-12 pr-6">
                              <span>Skor Kuis</span>
                              <span>Skor Game</span>
                              <span>Peringkat</span>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-slate-800/10">
                            {[...activeGroup.students]
                              .sort((a,b) => b.quizHighScore - a.quizHighScore || b.gameHighScore - a.gameHighScore)
                              .map((student, idx) => (
                                <div key={idx} className={`p-4 flex justify-between items-center ${idx === 0 ? 'bg-amber-500/5' : ''}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center border ${
                                      idx === 0 ? 'bg-amber-400 text-slate-950 border-amber-200' :
                                      idx === 1 ? 'bg-slate-300 text-slate-900 border-slate-100' :
                                      idx === 2 ? 'bg-amber-700 text-white border-amber-600' :
                                      'bg-slate-800 text-slate-300 border-slate-700'
                                    }`}>
                                      {idx+1}
                                    </span>
                                    <span className="font-bold text-xs sm:text-sm">{student.name}</span>
                                  </div>

                                  <div className="flex items-center gap-12 font-bold text-xs pr-2">
                                    <span className="text-violet-500">{student.quizHighScore} Pts</span>
                                    <span className="text-amber-500">🪙 {student.gameHighScore}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{idx === 0 ? "Juara" : idx+1}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: LAPORAN PEMBELAJARAN */}
              {dashboardTab === 'laporan' && (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 rounded-3xl border backdrop-blur-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                    
                    {/* Header Report Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/10">
                      <div>
                        <h3 className="text-lg font-black flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Laporan Analisis Kelompok Udaraku
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                          Sajian hasil belajar kumulatif untuk memantau penguasaan kurikulum polutan atmosfer.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadCSV}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <Download className="w-4 h-4" /> Unduh Laporan Excel
                        </button>
                        <button
                          onClick={() => setShowPrintReportModal(true)}
                          className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <Printer className="w-4 h-4" /> Cetak / PDF Laporan
                        </button>
                      </div>
                    </div>

                    {activeGroup.students.length === 0 ? (
                      <div className="text-center py-12 text-xs">Belum ada murid di kelas. Laporan kosong.</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6 pt-6">
                        
                        {/* Left: Materi Sulit Terdeteksi */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400" /> Materi Sulit & Kendala Pemahaman
                          </h4>
                          
                          {difficultTopics.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-slate-700/25 text-center text-xs">
                              Luar biasa! Tidak ada kendala materi terdeteksi harian siswa.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {difficultTopics.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/15 border border-slate-800/10 space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-slate-200">{item.topic}</span>
                                    <span className="text-rose-400 font-bold">{item.count} Siswa Salah ({item.percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                                      style={{ width: `${item.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Dynamic Feedback (Saran tindak lanjut) */}
                          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            <h5 className="font-extrabold text-amber-500 uppercase text-[10px] tracking-wider mb-2">💡 SARAN TINDAK LANJUT PEMBELAJARAN (PEDAGOGI)</h5>
                            {difficultTopics.length > 0 ? (
                              <p>
                                Berdasarkan analisis kesalahan siswa, materi <b>"{difficultTopics[0]?.topic}"</b> adalah materi yang paling menyulitkan kelas. Disarankan untuk memutar ulang modul infografis tersebut, memandu sesi diskusi kelas terpadu, dan melakukan re-kuis kustom pada materi tersebut.
                              </p>
                            ) : (
                              <p>
                                Seluruh siswa berhasil menyelesaikan kuis dengan pemahaman optimal. Disarankan untuk melanjutkan ke praktikum luar ruangan, mengamati tanaman bioindikator liken (lumut kerak) di lingkungan sekolah untuk pengayaan empiris.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Nilai Murid Quick Table */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-400" /> Hasil Evaluasi Kelas Terbuka
                          </h4>
                          
                          <div className="max-h-[300px] overflow-y-auto pr-1 border border-slate-700/10 rounded-xl divide-y divide-slate-800/10">
                            {activeGroup.students.map((student, idx) => (
                              <div key={idx} className="p-3 flex justify-between items-center text-xs">
                                <span className="font-semibold">{student.name}</span>
                                <div className="flex gap-6 font-bold">
                                  <span className="text-violet-500">Kuis: {student.quizHighScore}/100</span>
                                  <span className="text-sky-400">Game: {student.gameHighScore}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 6: TANYA JAWAB SISWA */}
              {dashboardTab === 'tanyajawab' && (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 rounded-3xl border backdrop-blur-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div className="pb-6 border-b border-slate-700/10 mb-6">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-violet-400 animate-pulse" /> Panel Diskusi & Pertanyaan Siswa
                      </h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                        Jawab pertanyaan konseptual langsung dari para siswa di kelas Anda demi pembelajaran interaktif dua arah.
                      </p>
                    </div>

                    {!activeGroup || studentQuestions.filter(q => q.destination === 'teacher' && q.joinCode === activeGroup.code).length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-slate-700/20 rounded-2xl max-w-md mx-auto">
                        <MessageSquare className="w-10 h-10 text-slate-500 mx-auto opacity-40 mb-3" />
                        <p className="text-sm font-bold text-slate-400">Belum ada pertanyaan siswa</p>
                        <p className="text-xs text-slate-500 mt-1">Siswa Anda yang telah bergabung dengan kode kelompok ini ({activeGroup?.code || 'KELAS'}) dapat mengajukan pertanyaan dari panel infografis mereka.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                        {studentQuestions
                          .filter(q => q.destination === 'teacher' && q.joinCode === activeGroup.code)
                          .map((q) => (
                            <div 
                              key={q.id}
                              className={`p-5 rounded-2xl border transition-all ${
                                darkMode 
                                  ? q.isAnswered ? 'bg-slate-950/40 border-slate-800/80' : 'bg-violet-950/10 border-violet-500/20'
                                  : q.isAnswered ? 'bg-slate-50 border-slate-200' : 'bg-violet-50/50 border-violet-100'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                    Modul: {q.moduleName}
                                  </div>
                                  <div className="text-xs font-black">
                                    {q.studentName}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 font-mono">{q.askedAt}</span>
                                  {q.isAnswered ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Terjawab
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                      Butuh Jawaban
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className={`text-sm leading-relaxed italic mb-4 font-medium pl-4 border-l-2 border-violet-500/30 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                "{q.questionText}"
                              </p>

                              {q.isAnswered ? (
                                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-900/60 text-slate-300' : 'bg-white text-slate-700'} border border-slate-700/10 space-y-1.5`}>
                                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-violet-400 tracking-wider">
                                    <GraduationCap className="w-3.5 h-3.5" /> Jawaban Anda ({q.answeredAt}):
                                  </div>
                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{q.answerText}</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {answeringQuestionId === q.id ? (
                                    <div className="space-y-2 animate-fade-in">
                                      <textarea
                                        rows={3}
                                        value={teacherResponseText}
                                        onChange={(e) => setTeacherResponseText(e.target.value)}
                                        placeholder="Ketik jawaban penjelasan Anda secara rinci di sini..."
                                        className={`w-full p-3 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-violet-500 resize-none ${
                                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                                        }`}
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAnsweringQuestionId(null);
                                            setTeacherResponseText('');
                                          }}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                            darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                                          }`}
                                        >
                                          Batal
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAnswerStudentQuestion(q.id)}
                                          disabled={!teacherResponseText.trim()}
                                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center gap-1.5"
                                        >
                                          <Send className="w-3.5 h-3.5" /> Kirim Jawaban
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAnsweringQuestionId(q.id);
                                          setTeacherResponseText('');
                                          audio.playSfx('click');
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <GraduationCap className="w-3.5 h-3.5" /> Jawab Pertanyaan
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* REWARDS ISSUING MODAL */}
      {selectedStudentForReward && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-black mb-1">Berikan Penghargaan (Reward)</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              Tentukan jenis reward untuk menghargai usaha belajar <b>{selectedStudentForReward.name}</b>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold mb-1">KATEGORI REWARD</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'badge', label: '🏅 Lencana' },
                    { id: 'points', label: '🪙 Poin' },
                    { id: 'certificate', label: '📜 Serti' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRewardType(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        rewardType === t.id
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                          : 'bg-transparent border-slate-700/20 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {rewardType === 'badge' && (
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-1.5">PILIH LENCANA KOMPETENSI</label>
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className={`px-3 py-2 text-xs rounded-lg border w-full focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Bintang Kelas">⭐ Lencana Bintang Kelas</option>
                    <option value="Pelajar Disiplin">⏰ Lencana Pelajar Disiplin</option>
                    <option value="Pahlawan Karbon">🛡️ Lencana Pahlawan Karbon</option>
                    <option value="Eco-Hero">🌱 Lencana Pelestari Lingkungan</option>
                  </select>
                </div>
              )}

              {rewardType === 'points' && (
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-1.5">JUMLAH BONUS ECO-POINTS</label>
                  <select
                    value={selectedPoints}
                    onChange={(e) => setSelectedPoints(Number(e.target.value))}
                    className={`px-3 py-2 text-xs rounded-lg border w-full focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value={50}>🪙 +50 Eco-Points</option>
                    <option value={100}>🪙 +100 Eco-Points</option>
                    <option value={200}>🪙 +200 Eco-Points</option>
                  </select>
                </div>
              )}

              {rewardType === 'certificate' && (
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Sertifikat kelulusan digital akan otomatis diterbitkan. Anda juga dapat melihat dan mencetak layout sertifikat di tombol "Cetak Serti".
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setSelectedStudentForReward(null)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => handleAwardReward(selectedStudentForReward.name)}
                className="py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg cursor-pointer"
              >
                Sematkan Reward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL CERTIFICATE MODAL */}
      {activeCertificateStudent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:bg-white print:p-0 print:static print:z-auto">
          <div className="w-full max-w-2xl bg-white text-slate-900 border-[10px] border-emerald-800 p-8 sm:p-12 shadow-2xl relative rounded-xl print:shadow-none print:border-emerald-700 print:rounded-none">
            
            {/* Certificate Decorative Elements */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-emerald-600 border-dashed pointer-events-none" />
            
            <div className="text-center space-y-6 relative z-10">
              <span className="text-[11px] font-bold text-emerald-800 tracking-widest uppercase block">PROYEK PELESTARIAN UDARA GURU</span>
              
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <Award className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-serif font-extrabold tracking-tight text-emerald-950">SERTIFIKAT PENGHARGAAN</h2>
              
              <p className="text-xs text-slate-500 italic">Diberikan dengan hormat kepada:</p>
              
              <h3 className="text-2xl font-black text-slate-800 underline decoration-emerald-500 underline-offset-8 decoration-2">{activeCertificateStudent.name}</h3>
              
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Atas dedikasi, usaha belajar luar biasa, serta pencapaian luhur dalam program pendidikan lingkungan interaktif <b>Udaraku</b> demi memulihkan kualitas udara bersih Indonesia.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6 text-xs border-t border-slate-200 max-w-md mx-auto">
                <div className="text-left">
                  <span className="text-slate-400 block uppercase tracking-wide text-[9px]">GURU PEMBIMBING</span>
                  <span className="font-bold text-slate-800 block mt-1">{teacherName}</span>
                  <span className="text-slate-500 block text-[10px]">{teacherSubject}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block uppercase tracking-wide text-[9px]">TANGGAL TERBIT</span>
                  <span className="font-bold text-slate-800 block mt-1">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="text-emerald-600 font-extrabold block text-[10px]">UDARAKU EXCELLENCE</span>
                </div>
              </div>
            </div>

            {/* Print and Close buttons */}
            <div className="flex justify-end gap-2 mt-8 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak / Save PDF
              </button>
              <button
                onClick={() => setActiveCertificateStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE PRINTABLE REPORT MODAL */}
      {showPrintReportModal && activeGroup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:bg-white print:p-0 print:static print:z-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 p-8 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none print:p-0 print:static">
            
            {/* Printable Area */}
            <div id="printable-report" className="space-y-6">
              
              {/* Report Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-2xl font-serif font-black tracking-tight text-slate-900">LAPORAN HASIL BELAJAR MURID (RAPORT KELAS)</h2>
                <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mt-1">PROGRAM PENDIDIKAN MITIGASI POLUSI - UDARAKU</p>
                <p className="text-xs text-slate-500 mt-1">Laporan resmi diterbitkan secara digital pada tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold">KELAS / KELOMPOK</span>
                  <span className="text-sm font-bold text-slate-800">{activeGroup.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold">GURU MATA PELAJARAN</span>
                  <span className="text-sm font-bold text-slate-800">{teacherName} ({teacherSubject})</span>
                </div>
              </div>

              {/* Core metrics averages */}
              <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">RATA-RATA NILAI</span>
                  <span className="text-xl font-black text-violet-600">{stats.avgScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">AVG AQI DIPERBAIKI</span>
                  <span className="text-xl font-black text-emerald-600">+{stats.avgAqiRepaired} Poin</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">JUMLAH SISWA</span>
                  <span className="text-xl font-black text-teal-600">{activeGroup.students.length} Siswa</span>
                </div>
              </div>

              {/* Students Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold">
                    <th className="p-2">Nama Siswa</th>
                    <th className="p-2 text-center">Level Kelas</th>
                    <th className="p-2 text-center">Rata-Rata Kuis</th>
                    <th className="p-2 text-center">Eco-Points</th>
                    <th className="p-2 text-center">Koreksi AQI</th>
                    <th className="p-2 text-right">Penghargaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeGroup.students.map((student, idx) => {
                    const studentAqi = getStudentAQI(student);
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{student.name}</td>
                        <td className="p-2 text-center">Level {student.level}</td>
                        <td className="p-2 text-center font-bold text-violet-600">{student.quizHighScore}/100</td>
                        <td className="p-2 text-center">🪙 {student.ecoPoints}</td>
                        <td className="p-2 text-center font-bold text-emerald-600">{220 - studentAqi} Poin</td>
                        <td className="p-2 text-right font-semibold text-amber-600">{(student.rewards || []).join(', ') || 'Belum ada'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Class Struggles & Pedagogical feedback */}
              <div className="border border-slate-200 p-4 rounded-xl text-xs space-y-2 bg-slate-50">
                <h4 className="font-extrabold text-teal-600 uppercase text-[10px]">I. EVALUASI DAN TINDAK LANJUT GURU</h4>
                {difficultTopics.length > 0 ? (
                  <p className="leading-relaxed">
                    Berdasarkan rekapitulasi data belajar, topik <b>"{difficultTopics[0]?.topic}"</b> menjadi fokus materi yang paling sulit dikuasai oleh kelas. Disarankan pendidik melakukan remedial terpadu dan kuis penguatan berkala untuk menstabilkan pemahaman ekosistem udara.
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    Siswa terbukti menunjukkan penguasaan materi pelestarian udara yang sangat tinggi. Direkomendasikan pendidik melanjutkan dengan proyek observasi liken (bioindikator alami) di pekarangan sekolah untuk melatih kecakapan empiris.
                  </p>
                )}
              </div>

              {/* Signatures placeholders */}
              <div className="grid grid-cols-2 gap-12 pt-12 text-xs text-center">
                <div>
                  <span className="block h-12"></span>
                  <span className="block border-t border-slate-400 pt-1 font-bold">Kepala Sekolah</span>
                </div>
                <div>
                  <span className="block h-12"></span>
                  <span className="block border-t border-slate-400 pt-1 font-bold">{teacherName}</span>
                </div>
              </div>

            </div>

            {/* Print action actions */}
            <div className="flex justify-end gap-2 mt-8 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak Laporan / Simpan PDF
              </button>
              <button
                onClick={() => setShowPrintReportModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in print:hidden">
          <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">{confirmModal.title}</h3>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {confirmModal.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
