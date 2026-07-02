import React, { useState } from 'react';
import { INFOGRAPHICS } from '../data';
import { InfographicItem, SiswaProfile, StudentQuestion } from '../types';
import { Car, Factory, Flame, Wind, Skull, Biohazard, Activity, CloudRain, Leaf, Sun, CheckCircle, Award, Compass, ArrowRight, X, ArrowLeft, BookOpen, Layers, Heart, Shield, Search, Sparkles, Send, Loader2, User, HelpCircle, GraduationCap } from 'lucide-react';
import { audio } from '../utils/audio';

// Import generated infographic visual assets
import imgDefinisi from '../assets/images/komposisi_udara_1782833859212.jpg';
import imgPengelompokan from '../assets/images/primer_sekunder_1782833875356.jpg';
import imgSumber from '../assets/images/sumber_polusi_1782833889666.jpg';
import imgDampak from '../assets/images/dampak_polusi_1782833904441.jpg';
import imgIndikator from '../assets/images/indikator_kualitas_1782833921742.jpg';
import imgSolusi from '../assets/images/solusi_polusi_1782833935390.jpg';

const imageMap: Record<string, string> = {
  'mat-definisi': imgDefinisi,
  'mat-pengelompokan': imgPengelompokan,
  'mat-sumber': imgSumber,
  'mat-dampak': imgDampak,
  'mat-indikator': imgIndikator,
  'mat-solusi': imgSolusi,
};

const ECO_TERMS = [
  {
    term: 'ISPA',
    longName: 'Infeksi Saluran Pernapasan Akut',
    category: 'Kesehatan',
    desc: 'Infeksi parah pada saluran pernapasan (hidung, tenggorokan, paru-paru) akibat terus-menerus menghirup udara berpolutan tinggi seperti PM2.5, asap pembakaran sampah, dan gas industri.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '🫁'
  },
  {
    term: 'Hb (Hemoglobin)',
    longName: 'Hemoglobin Darah',
    category: 'Fisiologi Tubuh',
    desc: 'Protein dalam sel darah merah pengikat oksigen untuk diedarkan ke seluruh organ tubuh. Kehadiran polutan gas CO (Karbon Monoksida) sangat berbahaya karena gas CO mengikat Hb 200 kali lebih kuat daripada oksigen, menyumbat peredaran oksigen tubuh secara fatal.',
    dangerLevel: 'Sangat Fatal',
    dangerColor: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: '🩸'
  },
  {
    term: 'AQI (Air Quality Index)',
    longName: 'Indeks Kualitas Udara',
    category: 'Sains & Parameter',
    desc: 'Indeks standar global yang mengonversi konsentrasi polutan udara kompleks (PM2.5, PM10, CO, SO2, NOx, Ozon) menjadi angka tunggal 0-500 yang mudah dipahami publik. Semakin tinggi angkanya, semakin beracun kualitas udara sekitarmu.',
    dangerLevel: 'Edukasi / Info',
    dangerColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    icon: '📈'
  },
  {
    term: 'ISPU',
    longName: 'Indeks Standar Pencemar Udara',
    category: 'Sains & Parameter',
    desc: 'Versi resmi Indonesia untuk Indeks Kualitas Udara, dikelola oleh Kementerian Lingkungan Hidup dan Kehutanan (KLHK) untuk menilai tingkat kesehatan udara harian di berbagai provinsi tanah air.',
    dangerLevel: 'Edukasi / Info',
    dangerColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    icon: '🇮🇩'
  },
  {
    term: 'CO2',
    longName: 'Karbon Dioksida',
    category: 'Gas Rumah Kaca',
    desc: 'Senyawa gas tidak berwarna yang diproduksi alami lewat respirasi makhluk hidup dan secara masif lewat pembakaran bahan bakar fosil. CO2 bertindak bagaikan selimut raksasa di atmosfer yang menangkap panas matahari (Efek Rumah Kaca) pemicu krisis perubahan iklim global.',
    dangerLevel: 'Sedang / Iklim',
    dangerColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    icon: '🔥'
  },
  {
    term: 'CO',
    longName: 'Karbon Monoksida',
    category: 'Polutan Gas Beracun',
    desc: 'Gas super beracun, tidak berbau, tidak berwarna, dan tidak berasa yang keluar dari knalpot kendaraan bermotor berkat pembakaran mesin yang tidak sempurna. Gas ini adalah pembunuh senyap karena menyumbat asupan oksigen sel-sel tubuh seketika saat dihirup.',
    dangerLevel: 'Sangat Fatal',
    dangerColor: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: '💨'
  },
  {
    term: 'SO2',
    longName: 'Sulfur Dioksida',
    category: 'Polutan Gas Asam',
    desc: 'Gas berbau belerang menyengat hasil pembakaran batu bara industri atau minyak bumi berat. Di atmosfer, gas ini bereaksi cepat dengan uap air membentuk zat asam pekat (asam sulfat), yang turun ke bumi sebagai Hujan Asam perusak hutan, danau, gedung, dan memicu iritasi paru.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '🌋'
  },
  {
    term: 'NOx',
    longName: 'Nitrogen Oksida',
    category: 'Polutan Gas Kimia',
    desc: 'Gas kemerahan sangat reaktif dari pembakaran mesin kendaraan bersuhu tinggi. NOx bertindak sebagai katalis utama pemicu terbentuknya Smog (kabut asap beracun) dan O3 (ozon permukaan tanah) yang mengikis kesehatan sistem paru-paru.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '⚡'
  },
  {
    term: 'PM2.5',
    longName: 'Particulate Matter 2.5 Mikron',
    category: 'Polutan Debu Mikro',
    desc: 'Partikel padat sangat kecil berdiameter di bawah 2.5 mikrometer (30 kali lebih tipis dari sehelai rambut!). Bahayanya luar biasa karena mampu lolos dari filter alami bulu hidung kita, menembus dinding paru-paru (alveolus), dan langsung hanyut ke aliran darah memicu serangan jantung/kanker.',
    dangerLevel: 'Sangat Fatal',
    dangerColor: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: '😷'
  },
  {
    term: 'PM10',
    longName: 'Particulate Matter 10 Mikron',
    category: 'Polutan Debu Kasar',
    desc: 'Partikel udara berukuran di bawah 10 mikrometer seperti jelaga knalpot diesel, debu semen, serbuk kayu, dan abu terbang. Mengendap di saluran pernapasan bagian atas, memicu asma kumat, batuk kronis, dan tenggorokan gatal.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '🌪️'
  },
  {
    term: 'O3',
    longName: 'Ozon Tingkat Permukaan',
    category: 'Polutan Gas Sekunder',
    desc: 'Berbeda dengan ozon baik di stratosfer pelindung bumi dari UV, ozon tingkat permukaan tanah adalah polutan beracun hasil reaksi kimia gas NOx dan hidrokarbon di bawah panas terik matahari. Mengiritasi mata, memicu radang paru-paru, dan menghancurkan sel tumbuhan.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '☀️'
  },
  {
    term: 'CFC',
    longName: 'Klorofluorokarbon',
    category: 'Gas Perusak Ozon',
    desc: 'Gas buatan manusia dari AC kuno, kulkas lama, dan propelan aerosol kaleng. Ketika melayang bebas ke stratosfer bumi, radiasi matahari memecahnya menjadi zat radikal yang menggerogoti dan melubangi lapisan ozon pelindung bumi.',
    dangerLevel: 'Bahaya Tinggi',
    dangerColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: '❄️'
  },
  {
    term: 'Liken (Lumut Kerak)',
    longName: 'Simbiosis Bioindikator Alami',
    category: 'Indikator Biologis',
    desc: 'Simbiosis unik antara jamur dan alga yang menempel di batang pepohonan. Organisme ini tidak memiliki kutikula pelindung sehingga menyerap semua polutan udara secara langsung. Jika di kotamu tidak ada liken sama sekali, itu tanda pasti bahwa udara di daerahmu sangat tercemar!',
    dangerLevel: 'Aman / Alami',
    dangerColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    icon: '🌿'
  }
];

interface MateriPanelProps {
  darkMode: boolean;
  profile: SiswaProfile | null;
  onUpdateProfile: (updated: Partial<SiswaProfile>) => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'join') => void;
  onBack: () => void;
  studentQuestions?: StudentQuestion[];
  onUpdateStudentQuestions?: (questions: StudentQuestion[]) => void;
}

export const MateriPanel: React.FC<MateriPanelProps> = ({
  darkMode,
  profile,
  onUpdateProfile,
  onAddNotification,
  onBack,
  studentQuestions = [],
  onUpdateStudentQuestions,
}) => {
  const [currentSection, setCurrentSection] = useState<'modules' | 'decoder'>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'definisi' | 'pengelompokan' | 'sumber' | 'indikator' | 'dampak' | 'solusi'>('definisi');
  const [selectedItem, setSelectedItem] = useState<InfographicItem | null>(null);

  const [modalSubTab, setModalSubTab] = useState<'materi' | 'tanya'>('materi');
  const [questionText, setQuestionText] = useState('');
  const [questionDestination, setQuestionDestination] = useState<'ai' | 'teacher'>(() => {
    return profile?.joinCode ? 'teacher' : 'ai';
  });
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleTabClick = (tab: 'definisi' | 'pengelompokan' | 'sumber' | 'indikator' | 'dampak' | 'solusi') => {
    setActiveTab(tab);
    const items = INFOGRAPHICS[tab];
    if (items && items.length > 0) {
      setSelectedItem(items[0]);
    }
  };

  const tabLabels = {
    definisi: '1. Definisi & Komposisi',
    pengelompokan: '2. Pengelompokan Polutan',
    sumber: '3. Sumber Pencemaran',
    indikator: '4. Parameter & Indikator',
    dampak: '5. Dampak Pencemaran',
    solusi: '6. Solusi & Regulasi',
  };

  const modulesConfig = [
    {
      key: 'definisi' as const,
      tag: 'Tingkat 1 - Definisi',
      title: 'Definisi & Komposisi Normal',
      desc: 'Pengertian & Kondisi Keseimbangan Udara Bersih',
      emoji: '🌍',
      colorClasses: 'from-blue-600 to-indigo-600 ring-blue-400/50',
      moduleId: 'mat-definisi',
    },
    {
      key: 'pengelompokan' as const,
      tag: 'Tingkat 2 - Klasifikasi',
      title: 'Pengelompokan Polutan',
      desc: 'Polutan Primer (CO, SO2, NOx) & Sekunder (O3, Smog)',
      emoji: '🥞',
      colorClasses: 'from-cyan-600 to-blue-600 ring-cyan-400/50',
      moduleId: 'mat-pengelompokan',
    },
    {
      key: 'sumber' as const,
      tag: 'Tingkat 3 - Asal Emisi',
      title: 'Sumber Pencemaran Udara',
      desc: 'Faktor Alamiah (Volkano) & Manusia (Antropogenik, AC CFC)',
      emoji: '🏭',
      colorClasses: 'from-teal-600 to-emerald-600 ring-teal-400/50',
      moduleId: 'mat-sumber',
    },
    {
      key: 'indikator' as const,
      tag: 'Tingkat 4 - Parameter',
      title: 'Parameter & Indikator Kualitas',
      desc: 'Fisik (Bau, Warna), Kimia (ISPU/AQI), & Biologi (Liken/Lumut Kerak)',
      emoji: '📈',
      colorClasses: 'from-amber-500 to-orange-600 ring-amber-400/50',
      moduleId: 'mat-indikator',
    },
    {
      key: 'dampak' as const,
      tag: 'Tingkat 5 - Dampak',
      title: 'Dampak Pencemaran Udara',
      desc: 'Kesehatan (ISPA, Hb), Lingkungan (Hujan Asam), & Tumbuhan (Klorosis)',
      emoji: '💔',
      colorClasses: 'from-rose-500 to-red-600 ring-rose-400/50',
      moduleId: 'mat-dampak',
    },
    {
      key: 'solusi' as const,
      tag: 'Tingkat 6 - Aksi Inti',
      title: 'Upaya & Solusi Riil',
      desc: 'Tindakan Preventif, Kuratif, & Kepatuhan Hukum',
      emoji: '🛡️',
      colorClasses: 'from-emerald-600 to-teal-600 ring-emerald-400/50',
      moduleId: 'mat-solusi',
    },
  ];

  const getIcon = (name: string, className: string = 'w-6 h-6') => {
    switch (name) {
      case 'Car': return <Car className={className} />;
      case 'Factory': return <Factory className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Wind': return <Wind className={className} />;
      case 'Skull': return <Skull className={className} />;
      case 'Biohazard': return <Biohazard className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'CloudRain': return <CloudRain className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Shield': return <Shield className={className} />;
      default: return <Compass className={className} />;
    }
  };

  const handleMarkAsRead = (itemId: string) => {
    if (!profile) {
      setSelectedItem(null);
      return;
    }
    
    const completedModules = profile.completedModules || [];
    if (completedModules.includes(itemId)) {
      setSelectedItem(null);
      return; // Already completed
    }

    const completed = [...completedModules, itemId];
    const expGained = 25;
    const ecoPointsGained = 15;
    
    let newExp = (profile.exp || 0) + expGained;
    let newLevel = profile.level || 1;
    let leveledUp = false;

    if (newExp >= (profile.expToNextLevel || 100)) {
      newExp -= (profile.expToNextLevel || 100);
      newLevel += 1;
      leveledUp = true;
    }

    // Check badges
    const currentBadges = profile.badges || [];
    const newBadges = [...currentBadges];
    if (completed.length === 1 && !newBadges.some(b => b.id === 'badge-first-lesson')) {
      newBadges.push({
        id: 'badge-first-lesson',
        title: 'Pelajar Pemula',
        description: 'Membaca modul Ilmu Baru untuk pertama kalinya.',
        icon: '📖',
        unlockedAt: new Date().toLocaleTimeString(),
      });
      onAddNotification('Lencana Baru Unlocked: Pelajar Pemula! 📖', 'success');
    }

    // Check if all available modules are completed (total 12 items now)
    const totalAvailable = Object.values(INFOGRAPHICS).flat().length;
    if (completed.length === totalAvailable && !newBadges.some(b => b.id === 'badge-all-lessons')) {
      newBadges.push({
        id: 'badge-all-lessons',
        title: 'Cendekia Udara',
        description: 'Menyelesaikan seluruh modul pembelajaran polusi udara.',
        icon: '🎓',
        unlockedAt: new Date().toLocaleTimeString(),
      });
      onAddNotification('Lencana Legendaris Unlocked: Cendekia Udara! 🎓', 'success');
    }

    onUpdateProfile({
      completedModules: completed,
      exp: newExp,
      level: newLevel,
      ecoPoints: (profile.ecoPoints || 0) + ecoPointsGained,
      badges: newBadges,
    });

    onAddNotification(`Modul selesai! +${expGained} XP & +${ecoPointsGained} Eco-Points`, 'success');
    
    if (leveledUp) {
      onAddNotification(`Selamat! Anda naik ke Level ${newLevel}! 🎉`, 'success');
      audio.playSfx('level_up');
    } else {
      audio.playSfx('success');
    }

    setSelectedItem(null);
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;

    if (questionDestination === 'ai') {
      setIsAskingAI(true);
      setAiError('');
      try {
        const response = await fetch('/api/gemini/tanya', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: questionText,
            moduleName: selectedItem?.title,
            context: selectedItem?.content,
          }),
        });

        if (!response.ok) {
          throw new Error('Gagal mendapatkan jawaban dari AI.');
        }

        const data = await response.json();
        
        // Add question to list
        const newQuestion: StudentQuestion = {
          id: 'ai-' + Date.now(),
          studentName: profile?.name || 'Siswa',
          joinCode: profile?.joinCode || null,
          moduleName: selectedItem?.title || 'Kualitas Udara',
          moduleId: selectedItem?.id || '',
          questionText: questionText,
          askedAt: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          destination: 'ai',
          answerText: data.answer,
          answeredAt: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          isAnswered: true,
        };

        if (onUpdateStudentQuestions) {
          onUpdateStudentQuestions([newQuestion, ...studentQuestions]);
        }
        setQuestionText('');
        onAddNotification('Asisten AI berhasil menjawab pertanyaanmu! 🧠✨', 'success');
        audio.playSfx('success');
      } catch (err: any) {
        setAiError(err.message || 'Terjadi kesalahan saat memproses jawaban AI.');
        onAddNotification('Gagal menghubungi AI. Coba lagi.', 'info');
      } finally {
        setIsAskingAI(false);
      }
    } else {
      // Destination: Teacher
      const newQuestion: StudentQuestion = {
        id: 'guru-' + Date.now(),
        studentName: profile?.name || 'Siswa',
        joinCode: profile?.joinCode || null,
        moduleName: selectedItem?.title || 'Kualitas Udara',
        moduleId: selectedItem?.id || '',
        questionText: questionText,
        askedAt: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        destination: 'teacher',
        isAnswered: false,
      };

      if (onUpdateStudentQuestions) {
        onUpdateStudentQuestions([newQuestion, ...studentQuestions]);
      }
      setQuestionText('');
      onAddNotification('Pertanyaan berhasil dikirim ke Guru! 👩‍🏫', 'success');
      audio.playSfx('success');
    }
  };

  return (
    <div id="materi-panel" className="max-w-4xl mx-auto py-4 px-4 sm:px-6 relative z-10 animate-fade-in">
      
      {/* Back Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => {
            audio.playSfx('click');
            onBack();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-slate-300 hover:text-white'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Menu
        </button>
      </div>
      
      {/* Panel Header */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-teal-400' : 'text-teal-800'}`}>
          📚 Galeri Ilmu Baru
        </h2>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto`}>
          Materi edukasi komprehensif tentang pencemaran lingkungan udara, disajikan secara terstruktur menggunakan metode piramida terbalik dari lingkup global hingga lingkup seluler tubuh kita.
        </p>
      </div>

      {/* Section Switcher (Modul vs Dekoder) */}
      <div className="flex justify-center mb-8">
        <div className={`p-1.5 rounded-2xl border flex gap-1.5 ${
          darkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-100/80 border-slate-200'
        }`}>
          <button
            onClick={() => {
              audio.playSfx('click');
              setCurrentSection('modules');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              currentSection === 'modules'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md scale-102'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Kurikulum Modul
          </button>
          
          <button
            onClick={() => {
              audio.playSfx('click');
              setCurrentSection('decoder');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              currentSection === 'decoder'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md scale-102'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Dekoder Istilah Hijau 🔍
          </button>
        </div>
      </div>

      {currentSection === 'modules' ? (
        /* Interactive Curriculum Grid Component */
        <div className={`mb-10 p-5 sm:p-7 rounded-3xl border backdrop-blur-md ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' 
            : 'bg-white/70 border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
        }`}>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              KURIKULUM PEMBELAJARAN
            </span>
            <h3 className={`text-lg sm:text-xl font-extrabold mt-2.5 ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>
              Materi Pencemaran Udara Komprehensif
            </h3>
            <p className={`text-xs mt-1.5 max-w-lg mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Silabus materi terpadu yang disusun secara mendalam dari teori dasar, pengelompokan zat, pelacakan sumber emisi, parameter kualitas udara, hingga analisis dampak tubuh dan aksi solusi regulatif.
            </p>
          </div>

          {/* The Uniform Grid of Learning Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full py-2">
            {modulesConfig.map((mod) => {
              const isCompleted = (profile?.completedModules || []).includes(mod.moduleId);
              const isActive = activeTab === mod.key;
              return (
                <button
                  key={mod.key}
                  onClick={() => {
                    audio.playSfx('click');
                    handleTabClick(mod.key);
                  }}
                  className={`w-full p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between text-left shadow-md relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg ${
                    isActive
                      ? `bg-gradient-to-br ${mod.colorClasses} text-white ring-2 scale-[1.01] font-bold`
                      : `${
                          darkMode
                            ? 'bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-800/80'
                            : 'bg-slate-100/80 border border-slate-200 text-slate-700 hover:bg-slate-100/100'
                        }`
                  }`}
                >
                  <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-3xl filter drop-shadow">{mod.emoji}</span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Selesai
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-teal-500/10 text-teal-500'}`}>
                          Belum Dibaca
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isActive ? 'text-white/80' : 'text-teal-500'}`}>
                      {mod.tag}
                    </p>
                    <h4 className={`text-base font-black mt-1 ${isActive ? 'text-white' : darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {mod.title}
                    </h4>
                    <p className={`text-xs font-normal mt-1.5 line-clamp-2 leading-relaxed ${isActive ? 'text-white/75' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {mod.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t w-full border-white/10 flex justify-between items-center text-xs relative z-10">
                    <span className={`font-semibold ${isActive ? 'text-white/80' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      1 Modul Belajar
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isActive ? 'text-white' : 'text-teal-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Dekoder Istilah Hijau Component */
        <div className={`mb-10 p-5 sm:p-7 rounded-3xl border backdrop-blur-md animate-fade-in ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]' 
            : 'bg-white/70 border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
        }`}>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              ECO GLOSSARY DEKODER
            </span>
            <h3 className={`text-lg sm:text-xl font-extrabold mt-2.5 ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>
              Dekoder Istilah Hijau 🔍
            </h3>
            <p className={`text-xs mt-1.5 max-w-lg mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bingung dengan singkatan ilmiah di berita lingkungan? Cari dan pecahkan arti rahasia di balik singkatan polusi udara seperti ISPA, Hb, AQI, CO2, CO di sini!
            </p>
          </div>

          {/* Search bar & filter */}
          <div className="relative max-w-md mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-teal-500" />
            </div>
            <input
              type="text"
              placeholder="Cari istilah (contoh: ISPA, AQI, CO, Hb...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  audio.playSfx('click');
                  setSearchQuery('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grid of Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ECO_TERMS.filter(item => 
              item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.longName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.desc.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((item) => (
              <div
                key={item.term}
                onClick={() => audio.playSfx('click')}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-950/30 border-slate-800 hover:border-teal-500/30' 
                    : 'bg-white border-slate-150 hover:border-teal-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl filter drop-shadow">{item.icon}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.dangerColor}`}>
                      {item.dangerLevel}
                    </span>
                  </div>

                  <h4 className={`text-lg font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {item.term}
                  </h4>
                  <p className="text-xs font-bold text-teal-500 mt-0.5">
                    {item.longName}
                  </p>
                  <p className={`text-xs mt-3.5 leading-relaxed font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/10 flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  <span>Dekoder Edukasi</span>
                  <span className="text-teal-500">Misi Bersih</span>
                </div>
              </div>
            ))}
          </div>

          {ECO_TERMS.filter(item => 
            item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.longName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400">Istilah yang Anda cari tidak ditemukan. Coba ketik "ISPA" atau "CO".</p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Infographic Modal (Popup) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto animate-fade-in">
          <div className={`relative w-full max-w-md max-h-[85vh] rounded-2xl p-4 sm:p-5 shadow-2xl border transition-all my-4 overflow-hidden flex flex-col ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors cursor-pointer z-10"
            >
              <X className="w-4.5 h-4.5 text-slate-400 hover:text-red-500" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-2 pr-6">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                {getIcon(selectedItem.iconName, 'w-6 h-6')}
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest block">
                  {tabLabels[activeTab]}
                </span>
                <h3 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
                  {selectedItem.title}
                </h3>
              </div>
            </div>

            {/* Modal Sub-Tabs Navigation */}
            <div className="flex border-b border-slate-700/10 gap-4 mb-3 mt-1 shrink-0">
              <button
                onClick={() => setModalSubTab('materi')}
                className={`pb-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalSubTab === 'materi'
                    ? 'border-teal-500 text-teal-400 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Materi Pembelajaran
              </button>
              <button
                onClick={() => {
                  setModalSubTab('tanya');
                  audio.playSfx('click');
                }}
                className={`pb-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalSubTab === 'tanya'
                    ? 'border-amber-500 text-amber-400 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Ayo Tanya
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pr-1.5 -mr-1.5 space-y-4 scrollbar-thin my-2">
              {/* Content Body */}
              {modalSubTab === 'materi' ? (
                <div className="space-y-4">
                  
                  {/* Detailed Explanations (Moved to the Top!) */}
                  <div className="space-y-2.5">
                    {selectedItem.content.map((p, idx) => (
                      <p key={idx} className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Infographic Visual Image (Lowered below text!) */}
                  {imageMap[selectedItem.id] && (
                    <div className="w-full overflow-hidden rounded-xl border border-slate-700/20 shadow-md relative group mt-4">
                      <img 
                        src={imageMap[selectedItem.id]} 
                        alt={selectedItem.title}
                        className="w-full h-auto object-cover max-h-52 md:max-h-60 transition-all duration-500 hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[8px] font-mono font-bold tracking-wider text-teal-400 border border-teal-500/30">
                        DIAGRAM VISUAL
                      </div>
                    </div>
                  )}

                  {/* Infographic Visual Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    {selectedItem.stats.map((stat, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                      >
                        <span className="text-[10px] font-medium opacity-80 block">{stat.label}</span>
                        <span className="text-base sm:text-lg font-black tracking-tight block mt-0.5">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Eco Action Solutions Section */}
                  <div className={`p-3.5 sm:p-4 rounded-xl ${darkMode ? 'bg-emerald-950/20 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <h4 className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-500 mb-2">
                      <Award className="w-4.5 h-4.5" /> Langkah Aksi Hijau Kita:
                    </h4>
                    <ul className="space-y-1.5 text-[11px] sm:text-xs">
                      {selectedItem.solutions.map((sol, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Source Information */}
                  <div className={`text-[10px] italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sumber Informasi: {selectedItem.source}
                  </div>

                </div>
              ) : (
                // Tab Ayo Tanya AI / Guru
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Destination Selector */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kirim Pertanyaan Kepada:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestionDestination('ai')}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          questionDestination === 'ai'
                            ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500 text-teal-400'
                            : 'bg-slate-800/10 border-slate-700/30 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sistem AI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (profile?.joinCode) {
                            setQuestionDestination('teacher');
                          } else {
                            onAddNotification('Kamu harus bergabung ke kelas dulu untuk bertanya ke Guru!', 'info');
                          }
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                          !profile?.joinCode ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          questionDestination === 'teacher'
                            ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-500 text-violet-400'
                            : 'bg-slate-800/10 border-slate-700/30 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-violet-400" /> Guru Kelas
                        {!profile?.joinCode && (
                          <span className="absolute -top-1.5 -right-1 text-[8px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-full font-sans">
                            Kunci
                          </span>
                        )}
                      </button>
                    </div>
                    {!profile?.joinCode && (
                      <p className="text-[9px] text-amber-400 leading-normal mt-0.5">
                        💡 Kamu belum bergabung ke kelas mana pun. Silakan masukkan kode kelas dari Guru di menu utama untuk mengaktifkan fitur tanya Guru langsung!
                      </p>
                    )}
                  </div>

                  {/* Form Input */}
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder={
                        questionDestination === 'ai'
                          ? 'Tanyakan apa saja kepada AI, misal: "Bagaimana cara mendeteksi PM2.5 di rumah?"'
                          : 'Tanyakan hal yang belum kamu pahami kepada Guru mengenai materi ini...'
                      }
                      className={`w-full p-3 rounded-xl text-xs resize-none outline-none focus:ring-1 focus:ring-teal-500 border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                    
                    {aiError && (
                      <p className="text-[10px] text-red-500 leading-normal font-medium bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                        ⚠️ {aiError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleAskQuestion}
                      disabled={!questionText.trim() || isAskingAI}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAskingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          Asisten AI sedang memikirkan jawaban...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Kirim Pertanyaan ({questionDestination === 'ai' ? 'Asisten AI' : 'Guru Kelas'})
                        </>
                      )}
                    </button>
                  </div>

                  {/* Riwayat Tanya Jawab khusus modul ini */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Riwayat Diskusi Modul Ini
                    </span>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {studentQuestions.filter(q => q.moduleId === selectedItem.id).length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-700/20 rounded-xl">
                          <HelpCircle className="w-6 h-6 text-slate-500 mx-auto opacity-40 mb-1" />
                          <p className="text-[10px] text-slate-400">Belum ada riwayat tanya jawab. Ayo jadi yang pertama bertanya!</p>
                        </div>
                      ) : (
                        studentQuestions.filter(q => q.moduleId === selectedItem.id).map((q) => (
                          <div 
                            key={q.id} 
                            className={`p-3 rounded-xl border ${
                              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {/* Student Question Head */}
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[10px] text-teal-400">
                                  <User className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-black">{q.studentName}</span>
                              </div>
                              <span className="text-[8px] text-slate-400 font-mono">{q.askedAt}</span>
                            </div>
                            
                            {/* Question Text */}
                            <p className={`text-[11px] leading-relaxed pl-6 italic mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              "{q.questionText}"
                            </p>
                            
                            {/* Answer Part */}
                            <div className="pl-6 border-l-2 border-slate-700/20 space-y-1">
                              <div className="flex items-center gap-1.5">
                                {q.destination === 'ai' ? (
                                  <>
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Asisten AI Udaraku</span>
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap className="w-3 h-3 text-violet-400" />
                                    <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Guru Kelas (Bu Kartini)</span>
                                  </>
                                )}
                              </div>
                              
                              {q.isAnswered ? (
                                <p className={`text-[10.5px] leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {q.answerText}
                                </p>
                              ) : (
                                <div className="flex items-center gap-1.5 py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                                  <span className="text-[9px] text-violet-400 font-bold italic animate-pulse">Menunggu tanggapan Guru di kelas...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer (Gamification Claim) */}
            <div className="mt-3 pt-3 border-t border-slate-700/10 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="text-center sm:text-left">
                {!(profile?.completedModules || []).includes(selectedItem.id) ? (
                  <>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Membaca modul ini memberikan reward:
                    </p>
                    <p className="text-xs font-bold text-teal-500 mt-0.5">
                      🔥 +25 XP dan 🪙 +15 Eco-Points
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-bold text-emerald-500">
                    🎉 Anda telah menyelesaikan modul ini!
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 cursor-pointer text-xs ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  Tutup
                </button>

                {modalSubTab === 'materi' ? (
                  <button
                    onClick={() => {
                      setModalSubTab('tanya');
                      audio.playSfx('click');
                    }}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs bg-amber-500 hover:bg-amber-600 text-slate-950"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ayo Tanya
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setModalSubTab('materi');
                      audio.playSfx('click');
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                      darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Lihat Materi
                  </button>
                )}

                {!(profile?.completedModules || []).includes(selectedItem.id) && (
                  <button
                    onClick={() => handleMarkAsRead(selectedItem.id)}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:scale-102 text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Klaim Reward
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
