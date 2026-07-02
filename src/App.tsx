import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/auth';
import { Role, SiswaProfile, GuruProfile, Group, NotificationItem, Question, StudentQuestion } from './types';
import { BackgroundFX } from './components/BackgroundFX';
import { NotificationToast, playNotificationSound } from './components/NotificationToast';
import { LoginPanel } from './components/LoginPanel';
import { MateriPanel } from './components/MateriPanel';
import { GamePanel } from './components/GamePanel';
import { QuizPanel } from './components/QuizPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TeacherDashboard } from './components/TeacherDashboard';
import { BookOpen, Gamepad2, GraduationCap, Award, Settings, LogOut, Moon, Sun, Wind, Bell, Compass, ArrowRight, Trash2, Volume2, VolumeX, Music, Play, Square, Upload, Loader2, RotateCcw, Volume1, Sparkles, Zap, Smile, Activity } from 'lucide-react';
import { audio } from './utils/audio';
import { QUIZ_QUESTIONS } from './data';

import { KelompokPanel } from './components/KelompokPanel';

const QUICK_TIPS = [
  "💡 Tahukah kamu? Menanam pohon di sekitar rumah dapat menyerap polutan udara dan memproduksi oksigen segar.",
  "💡 Fakta Singkat: Menggunakan kendaraan umum terbukti mengurangi emisi gas rumah kaca di perkotaan.",
  "💡 Tahukah kamu? Menghemat listrik di rumah juga membantu mengurangi polusi udara dari pembangkit listrik berbahan bakar fosil.",
  "💡 Fakta Udara: Bersepeda atau berjalan kaki untuk jarak dekat lebih sehat, hemat, dan nol emisi karbon!",
  "💡 Ingat! Membakar sampah sembarangan di halaman akan menghasilkan asap beracun yang sangat berbahaya bagi paru-paru sekitar."
];

const LOCAL_STORAGE_PREFIX = 'udaraku_';

// Initial pre-populated groups for teacher demo
const PRE_POPULATED_GROUPS: Group[] = [
  {
    code: 'ECO-9988',
    name: 'Kelas VII-A Sains Lingkungan',
    teacherName: 'Bu Kartini, S.Pd.',
    teacherSubject: 'Ilmu Pengetahuan Alam (IPA)',
    students: [
      {
        name: 'Budi Santoso',
        level: 4,
        exp: 60,
        ecoPoints: 340,
        quizHighScore: 90,
        gameHighScore: 140,
        joinedAt: '30-06-2026, 09:12',
        timeSpentSeconds: 245,
        wrongAnswersCount: 1,
        wrongTopics: ['Partikulat PM2.5'],
        rewards: ['Sertifikat Udara Bersih']
      },
      {
        name: 'Siti Aminah',
        level: 3,
        exp: 15,
        ecoPoints: 210,
        quizHighScore: 80,
        gameHighScore: 110,
        joinedAt: '30-06-2026, 10:45',
        timeSpentSeconds: 310,
        wrongAnswersCount: 2,
        wrongTopics: ['Partikulat PM2.5', 'Hujan Asam'],
        rewards: []
      },
      {
        name: 'Kevin Wijaya',
        level: 5,
        exp: 40,
        ecoPoints: 450,
        quizHighScore: 100,
        gameHighScore: 190,
        joinedAt: '30-06-2026, 11:15',
        timeSpentSeconds: 185,
        wrongAnswersCount: 0,
        wrongTopics: [],
        rewards: ['Lencana Sempurna', 'Sertifikat Udara Bersih', 'Bintang Kelas']
      }
    ]
  }
];

const INITIAL_STUDENT_QUESTIONS: StudentQuestion[] = [
  {
    id: 'q1',
    studentName: 'Budi Santoso',
    joinCode: 'ECO-9988',
    moduleName: 'Infeksi Saluran Pernapasan Akut (ISPA)',
    moduleId: 'ispa',
    questionText: 'Bu, kenapa kalau polusi udara sedang tinggi kita sangat gampang terkena batuk-batuk dan sesak napas (ISPA)?',
    askedAt: '30-06-2026, 14:15',
    destination: 'teacher',
    isAnswered: false
  },
  {
    id: 'q2',
    studentName: 'Siti Aminah',
    joinCode: 'ECO-9988',
    moduleName: 'Partikulat PM2.5',
    moduleId: 'pm25',
    questionText: 'Apakah masker kain biasa sudah cukup untuk menyaring polutan partikel PM2.5 di jalan raya, Bu?',
    askedAt: '30-06-2026, 15:30',
    destination: 'teacher',
    isAnswered: true,
    answerText: 'Masker kain biasa kurang efektif menyaring partikel PM2.5 karena seratnya terlalu renggang. Disarankan memakai masker minimal jenis medis bedah atau standar respirator seperti KN95/KF94 untuk perlindungan jalan raya.',
    answeredAt: '30-06-2026, 16:00'
  }
];

const SIMULATED_NAMES = [
  'Rian Syahputra', 'Dewi Lestari', 'Agus Prayogo', 'Nadia Safitri', 
  'Fajar Ramadhan', 'Riska Amalia', 'Yusuf Maulana', 'Indah Permata',
  'Andi Wijaya', 'Sinta Claudia', 'Dimas Prasetyo', 'Laras Putri'
];

export default function App() {
  // Theme & Layout state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : true; // default to dark mode for rich atmospheric look
  });
  
  const [activeTab, setActiveTab] = useState<'home' | 'materi' | 'main' | 'kuis' | 'pengaturan' | 'dashboard-guru' | 'kelompok' | 'classroom'>('home');

  const [isBgmOn, setIsBgmOn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}bgm_on`);
    return saved ? JSON.parse(saved) : false;
  });

  // Auto-attempt to load default background music file on mount
  useEffect(() => {
    const loadDefaultBgm = async () => {
      await audio.tryLoadDefaultBacksound();
    };
    loadDefaultBgm();
  }, []);

  // Handle BGM Play/Stop state changes
  useEffect(() => {
    if (isBgmOn) {
      audio.playBgm();
    } else {
      audio.stopBgm();
    }
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}bgm_on`, JSON.stringify(isBgmOn));
    
    // Cleanup on unmount
    return () => {
      audio.stopBgm();
    };
  }, [isBgmOn]);

  const [activeBgmPreset, setActiveBgmPreset] = useState<'classic' | 'adventure' | 'cyberpunk' | 'stream'>('adventure');
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [bgmVolume, setBgmVolume] = useState<number>(0.3);

  const handleSelectBgmPreset = async (preset: 'classic' | 'adventure' | 'cyberpunk' | 'stream') => {
    setIsMusicLoading(true);
    audio.playSfx('click');
    if (preset === 'stream') {
      const success = await audio.loadBgm('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Epic Techno-Arcade (Stream)');
      if (success) {
        audio.setLoopTimes(0, 28.00); // 0s s/d 28.00s loop
        setActiveBgmPreset('stream');
        addNotification('Berhasil memuat Musik Online! Loop diset ke 0s s/d 28s. 🎵', 'success');
        if (isBgmOn) {
          audio.stopBgm();
          audio.playBgm();
        }
      } else {
        addNotification('Gagal memuat musik online. Menggunakan synthesizer lokal.', 'info');
        setActiveBgmPreset('adventure');
        audio.setSynthPreset('adventure');
      }
    } else {
      audio.resetBgmToDefault();
      audio.setSynthPreset(preset);
      setActiveBgmPreset(preset);
      if (isBgmOn) {
        audio.stopBgm();
        audio.playBgm();
      }
    }
    setIsMusicLoading(false);
  };

  const handleVolumeChange = (vol: number) => {
    setBgmVolume(vol);
    audio.setBgmVolume(vol);
  };

  const toggleBgm = () => {
    audio.playSfx('click');
    setIsBgmOn(!isBgmOn);
  };

  const handleTabChange = (tab: 'home' | 'materi' | 'main' | 'kuis' | 'pengaturan' | 'dashboard-guru' | 'kelompok' | 'classroom') => {
    audio.playSfx('click');
    setActiveTab(tab);
  };

  // Login States
  const [role, setRole] = useState<Role | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}role`);
    return (saved as Role) || null;
  });

  const [siswaProfile, setSiswaProfile] = useState<SiswaProfile | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}siswa_profile`);
    return saved ? JSON.parse(saved) : null;
  });

  const [guruProfile, setGuruProfile] = useState<GuruProfile | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}guru_profile`);
    return saved ? JSON.parse(saved) : null;
  });

  // Groups/Classrooms State
  const [groups, setGroups] = useState<Group[]>(PRE_POPULATED_GROUPS);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groupsData = snapshot.docs.map(doc => doc.data() as Group);
      const mergedGroups = [...PRE_POPULATED_GROUPS];
      groupsData.forEach(g => {
        const index = mergedGroups.findIndex(mg => mg.code === g.code);
        if (index >= 0) {
          mergedGroups[index] = g;
        } else {
          mergedGroups.push(g);
        }
      });
      setGroups(mergedGroups);
    });
    return () => unsubscribe();
  }, []);

  // Stateful Quiz Questions Bank
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}questions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Set default questions with randomized difficulty if not yet stored
    return QUIZ_QUESTIONS.map((q) => ({
      ...q,
      difficulty: q.difficulty || (q.id === 1 || q.id === 2 || q.id === 3 ? 'Sulit' : q.id === 4 || q.id === 5 ? 'Sedang' : 'Mudah'),
    }));
  });

  // Push Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Quick Tip State
  const [quickTip, setQuickTip] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'home' && role === 'siswa') {
      // 50% chance to show a tip on the dashboard
      if (Math.random() > 0.5) {
        setQuickTip(QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)]);
      } else {
        setQuickTip(null);
      }
    }
  }, [activeTab, role]);

  // Student Questions State
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}student_questions`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_QUESTIONS;
  });

  // Beautiful Custom Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Persistent Storage Synchronizer
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}student_questions`, JSON.stringify(studentQuestions));
  }, [studentQuestions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}questions`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}dark_mode`, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (role) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}role`, role);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}role`);
    }
  }, [role]);

  useEffect(() => {
    if (siswaProfile) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}siswa_profile`, JSON.stringify(siswaProfile));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}siswa_profile`);
    }
  }, [siswaProfile]);

  useEffect(() => {
    if (guruProfile) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}guru_profile`, JSON.stringify(guruProfile));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}guru_profile`);
    }
  }, [guruProfile]);

  // Sync state across multiple tabs when changed elsewhere
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        if (e.key === `${LOCAL_STORAGE_PREFIX}groups` && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          setGroups((prev) => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
        }
        if (e.key === `${LOCAL_STORAGE_PREFIX}siswa_profile`) {
          setSiswaProfile(e.newValue ? JSON.parse(e.newValue) : null);
        }
        if (e.key === `${LOCAL_STORAGE_PREFIX}guru_profile`) {
          setGuruProfile(e.newValue ? JSON.parse(e.newValue) : null);
        }
        if (e.key === `${LOCAL_STORAGE_PREFIX}role`) {
          setRole(e.newValue ? (e.newValue as Role) : null);
        }
        if (e.key === `${LOCAL_STORAGE_PREFIX}dark_mode` && e.newValue) {
          setDarkMode(JSON.parse(e.newValue));
        }
        if (e.key === `${LOCAL_STORAGE_PREFIX}student_questions` && e.newValue) {
          setStudentQuestions(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error("Error parsing storage sync", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Synchronize student stats to active teacher group in Firestore
  useEffect(() => {
    if (role === 'siswa' && siswaProfile && siswaProfile.joinCode) {
      const syncToFirestore = async () => {
        try {
          const studentJoinCode = siswaProfile.joinCode!.trim().toUpperCase();
          const groupRef = doc(db, 'groups', studentJoinCode);
          console.log("Attempting to sync student:", siswaProfile.name, "to group:", studentJoinCode);
          const groupSnap = await getDoc(groupRef);
          
          if (groupSnap.exists()) {
            const groupData = groupSnap.data() as Group;
            const hasStudent = groupData.students.some((s) => s.name.trim().toLowerCase() === siswaProfile.name.trim().toLowerCase());
            
            let updatedStudents = [];
            if (hasStudent) {
              updatedStudents = groupData.students.map((s) => {
                if (s.name.trim().toLowerCase() === siswaProfile.name.trim().toLowerCase()) {
                  return {
                    ...s,
                    level: siswaProfile.level,
                    exp: siswaProfile.exp,
                    ecoPoints: siswaProfile.ecoPoints,
                    quizHighScore: siswaProfile.quizHighScore,
                    gameHighScore: siswaProfile.gameHighScore,
                  };
                }
                return s;
              });
            } else {
              const newStudent = {
                name: siswaProfile.name,
                level: siswaProfile.level,
                exp: siswaProfile.exp,
                ecoPoints: siswaProfile.ecoPoints,
                quizHighScore: siswaProfile.quizHighScore,
                gameHighScore: siswaProfile.gameHighScore,
                joinedAt: new Date().toLocaleString('id-ID', { hour12: false }).replace(/\//g, '-').slice(0, 17),
              };
              updatedStudents = [...groupData.students, newStudent];
            }
            
            // Only update if there are changes to avoid excessive writes
            if (JSON.stringify(groupData.students) !== JSON.stringify(updatedStudents)) {
              await updateDoc(groupRef, {
                students: updatedStudents
              });
            }
          }
        } catch (error) {
          console.error("Error syncing student to group:", error);
        }
      };

      syncToFirestore();
    }
  }, [role, siswaProfile?.name, siswaProfile?.joinCode, siswaProfile?.level, siswaProfile?.exp, siswaProfile?.ecoPoints, siswaProfile?.quizHighScore, siswaProfile?.gameHighScore]);

  // Synchronize teacher profile name with their created groups
  useEffect(() => {
    if (role === 'guru' && guruProfile && guruProfile.createdGroups && guruProfile.createdGroups.length > 0) {
      const syncTeacherName = async () => {
        for (const code of guruProfile.createdGroups) {
          const g = groups.find(x => x.code === code);
          if (g && (g.teacherName !== guruProfile.name || g.teacherSubject !== guruProfile.subject)) {
            try {
              await updateDoc(doc(db, 'groups', code), {
                teacherName: guruProfile.name,
                teacherSubject: guruProfile.subject
              });
            } catch (err) {
              console.error("Failed to sync teacher name", err);
            }
          }
        }
      };
      syncTeacherName();
    }
  }, [role, guruProfile, groups]);

  // Toast helper
  const addNotification = (message: string, type: NotificationItem['type'] = 'info') => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    
    // Play premium context-aware SFX
    const msgLower = message.toLowerCase();
    if (msgLower.includes('naik level') || msgLower.includes('leveled up')) {
      audio.playSfx('level_up');
    } else if (msgLower.includes('lencana') || msgLower.includes('unlocked') || msgLower.includes('berhasil')) {
      audio.playSfx('success');
    } else if (msgLower.includes('buruk') || msgLower.includes('bahaya') || msgLower.includes('polusi') || msgLower.includes('kritis') || msgLower.includes('waspada') || msgLower.includes('salah') || msgLower.includes('peringatan')) {
      audio.playSfx('warning');
    } else if (type === 'success') {
      audio.playSfx('correct');
    } else {
      audio.playSfx('click');
    }

    // Auto clear after 5s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Group handling
  const handleAddGroup = async (groupName: string) => {
    const code = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGroup: Group = {
      code,
      name: groupName,
      teacherName: guruProfile?.name || 'Guru',
      teacherSubject: guruProfile?.subject || 'Ilmu Pengetahuan Alam (IPA)',
      students: [],
    };
    
    // Save to Firestore, ensuring we also include groupCode explicitly as requested
    await setDoc(doc(db, 'groups', code), { ...newGroup, groupCode: code });
    
    if (guruProfile) {
      setGuruProfile({
        ...guruProfile,
        createdGroups: [...guruProfile.createdGroups, code],
      });
    }

    addNotification(`Kelompok "${groupName}" berhasil dibuat!`, 'success');
  };

  const handleDeleteGroup = async (groupCode: string) => {
    // Need import deleteDoc
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'groups', groupCode));
    
    if (guruProfile) {
      setGuruProfile({
        ...guruProfile,
        createdGroups: guruProfile.createdGroups.filter((c) => c !== groupCode),
      });
    }
    addNotification(`Kelompok ${groupCode} dihapus.`, 'info');
  };

  // Simulate Student Joining via Dashboard (makes demo extremely engaging & fully automated)
  const handleSimulateJoin = (groupCode: string) => {
    const randomName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const targetGroup = groups.find((g) => g.code === groupCode);
    if (!targetGroup) return;

    // Check if name already exists
    if (targetGroup.students.some((s) => s.name === randomName)) {
      addNotification(`Siswa ${randomName} sudah ada di kelompok ini.`, 'info');
      return;
    }

    const newStudent = {
      name: randomName,
      level: Math.floor(Math.random() * 3) + 1,
      exp: Math.floor(Math.random() * 80),
      ecoPoints: Math.floor(Math.random() * 150) + 50,
      quizHighScore: [60, 70, 80, 90, 100][Math.floor(Math.random() * 5)],
      gameHighScore: Math.floor(Math.random() * 100) + 30,
      joinedAt: new Date().toLocaleString('id-ID', { hour12: false }).replace(/\//g, '-').slice(0, 17),
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.code === groupCode) {
          return {
            ...g,
            students: [...g.students, newStudent],
          };
        }
        return g;
      })
    );

    addNotification(`Siswa "${randomName}" baru saja bergabung ke kelompok ${groupCode}! 👥`, 'join');
  };

  const validateGroupCode = async (code: string): Promise<boolean> => {
    const sanitized = code.trim().toUpperCase();
    
    if (groups.some((g) => g.code === sanitized)) {
      return true;
    }

    try {
      const snap = await getDoc(doc(db, 'groups', sanitized));
      return snap.exists();
    } catch (err: any) {
      console.error("Firebase validateGroupCode error:", err);
      if (err.message && err.message.includes('offline')) {
        alert('Koneksi terputus. Tidak dapat memverifikasi kode kelompok dari server. Pastikan kode sudah benar atau koneksi Anda stabil.');
      }
      return false;
    }
  };

  // Gamified Dynamic AQI Calculation based on student profile progress
  const getDynamicAQI = () => {
    if (!siswaProfile) return 150; // default medium-unhealthy for menu view
    
    // Base polluted AQI starts at 220
    let aqi = 220;
    
    // Each read module filters/purifies the air
    const modulesRead = (siswaProfile.completedModules || []).length;
    aqi -= modulesRead * 15;

    // Quiz score filters air
    if ((siswaProfile.quizHighScore || 0) > 0) {
      aqi -= ((siswaProfile.quizHighScore || 0) / 100) * 35;
    }

    // Game high score filters air
    if ((siswaProfile.gameHighScore || 0) > 0) {
      aqi -= Math.min((siswaProfile.gameHighScore || 0) * 0.25, 40);
    }

    // Level filters air
    aqi -= ((siswaProfile.level || 1) - 1) * 10;

    return Math.max(12, Math.round(aqi));
  };

  const aqiValue = getDynamicAQI();

  // Color mapping of AQI
  const getAQIDetails = (val: number) => {
    if (val <= 50) return { label: 'Sangat Baik (Bersih)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', msg: 'Langit biru cerah! Terima kasih, pahlawan lingkungan!' };
    if (val <= 100) return { label: 'Sedang (Aman)', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25', msg: 'Kondisi udara lumayan bersahabat. Teruskan langkah hijau Anda!' };
    if (val <= 150) return { label: 'Kurang Sehat', color: 'text-amber-500 bg-amber-500/10 border-amber-500/25', msg: 'Mulai berdebu. Kurangi pembakaran sampah di area pemukiman!' };
    return { label: 'Sangat Berbahaya', color: 'text-rose-500 bg-rose-500/10 border-rose-500/25', msg: 'Asap tebal! Pakailah masker N95 dan beralih ke transportasi umum!' };
  };

  const aqiDetails = getAQIDetails(aqiValue);

  // Play warning sound if AQI worsens
  const prevAqiRef = useRef<number>(aqiValue);
  useEffect(() => {
    if (role === 'siswa' && siswaProfile) {
      if (aqiValue > prevAqiRef.current) {
        // AQI has increased (worse quality)
        addNotification(`Peringatan! Kualitas udara memburuk menjadi ${aqiValue} AQI (${aqiDetails.label})! ⚠️`, 'info');
        audio.playSfx('warning');
      }
      prevAqiRef.current = aqiValue;
    }
  }, [aqiValue, role, siswaProfile]);

  // Logout/Reset
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setRole(null);
    setSiswaProfile(null);
    setGuruProfile(null);
    setActiveTab('home');
    setIsLogoutModalOpen(false);
    addNotification('Sesi berhasil keluar. Sampai jumpa lagi! 👋', 'info');
  };

  const handleBackToRoleSelection = () => {
    setRole(null);
    setActiveTab('home');
    addNotification('Kembali ke menu pemilihan peran utama.', 'info');
  };

  const handleResetProgress = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmResetProgress = () => {
    if (siswaProfile) {
      setSiswaProfile({
        ...siswaProfile,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        ecoPoints: 0,
        completedModules: [],
        badges: [],
        quizHighScore: 0,
        gameHighScore: 0,
      });
      addNotification('Progres belajar telah diatur ulang ke awal.', 'info');
    }
    setIsResetModalOpen(false);
  };

  // Join a class in-app
  const handleJoinClassInApp = async (code: string) => {
    const sanitized = code.trim().toUpperCase();
    
    if (groups.some((g) => g.code === sanitized)) {
      setSiswaProfile((prev) => {
        if (!prev) return null;
        return { ...prev, joinCode: sanitized };
      });
      addNotification(`Berhasil bergabung ke kelompok ${sanitized}! 👥`, 'success');
      return;
    }
      
    try {
      const snap = await getDoc(doc(db, 'groups', sanitized));
      if (snap.exists()) {
        setSiswaProfile((prev) => {
          if (!prev) return null;
          return { ...prev, joinCode: sanitized };
        });
        addNotification(`Berhasil bergabung ke kelompok ${sanitized}! 👥`, 'success');
      } else {
        alert(`Kode kelompok "${code}" tidak ada atau tidak ditemukan.`);
      }
    } catch (err: any) {
      console.error("Firebase handleJoinClassInApp error:", err);
      if (err.message && err.message.includes('offline')) {
        alert('Koneksi terputus. Tidak dapat memverifikasi kode kelompok dari server.');
      } else {
        alert(`Kode kelompok "${code}" tidak ada atau tidak ditemukan.`);
      }
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-between font-sans overflow-x-hidden ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Interactive Atmoshpere Background Canvas */}
      <BackgroundFX darkMode={darkMode} aqiValue={aqiValue} />

      {/* Header Bar */}
      <header className="relative z-20 border-b border-slate-700/15 backdrop-blur-md bg-slate-950/20 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tight bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Aeroguard :Amati, Pelajari, Lindungi
              </h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Edu-Game Pencemaran Udara
              </p>
            </div>
          </div>

          {/* Gamified Status Bar & AQI Panel (displays if student is logged in) */}
          {role === 'siswa' && siswaProfile && (
            <div className="flex items-center gap-4 flex-wrap justify-center">
              
              {/* AQI Status Dial */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${aqiDetails.color}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                <div>
                  <span className="text-[9px] text-slate-400 block -mb-0.5 uppercase tracking-wide">AQI UDARAKU</span>
                  <span>{aqiValue} - {aqiDetails.label}</span>
                </div>
              </div>

              {/* Points & Level Box */}
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/40 p-2 rounded-2xl">
                
                {/* Level Display */}
                <div className="text-center bg-teal-500/10 px-2.5 py-1 rounded-xl border border-teal-500/20">
                  <span className="text-[9px] text-slate-400 block font-sans">LEVEL</span>
                  <span className="text-sm font-black text-teal-400">{siswaProfile.level}</span>
                </div>

                {/* EXP indicator */}
                <div className="min-w-20">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>XP</span>
                    <span>{siswaProfile.exp}/{siswaProfile.expToNextLevel}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${(siswaProfile.exp / siswaProfile.expToNextLevel) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Eco Points */}
                <div className="text-center border-l border-slate-800 pl-3 pr-2">
                  <span className="text-[9px] text-slate-400 block">ECO POINTS</span>
                  <span className="text-sm font-black text-emerald-400">🪙 {siswaProfile.ecoPoints}</span>
                </div>

              </div>

              {/* Class Info Box */}
              <div className="text-xs bg-slate-900/40 px-3 py-2 rounded-2xl border border-slate-800/20 text-slate-300">
                {siswaProfile.joinCode ? (
                  <p>Kelompok: <span className="font-bold text-teal-400">{siswaProfile.joinCode}</span></p>
                ) : (
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="Kode Guru..."
                      id="in-app-join"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleJoinClassInApp((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="bg-slate-950/60 border border-slate-800 text-[10px] px-2 py-1 rounded-lg w-16 focus:outline-none focus:border-teal-500"
                    />
                    <button 
                      onClick={() => {
                        const val = (document.getElementById('in-app-join') as HTMLInputElement)?.value;
                        if (val) {
                          handleJoinClassInApp(val);
                          (document.getElementById('in-app-join') as HTMLInputElement).value = '';
                        }
                      }}
                      className="text-[10px] font-bold bg-teal-500 text-white px-2 py-1 rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Teacher Profile summary in header */}
          {role === 'guru' && guruProfile && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-teal-400">{guruProfile.name}</p>
                <p className="text-[10px] text-slate-400">{guruProfile.subject}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Audio & Theme Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Engine BGM Toggle Button */}
            <button
              onClick={toggleBgm}
              title={isBgmOn ? "Matikan Musik Latar" : "Aktifkan Musik Latar (Energetik)"}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                isBgmOn 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 shadow-md shadow-emerald-500/5' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {isBgmOn ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:inline">MUSIC ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 hidden sm:inline">MUSIC OFF</span>
                </>
              )}
            </button>

            {/* General Dark/Light mode toggle */}
            <button
              onClick={() => { audio.playSfx('click'); setDarkMode(!darkMode); }}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center items-center py-6 px-4">
        
        {/* If Not Logged In, Show Login Selection */}
        {!role ? (
          <LoginPanel
            darkMode={darkMode}
            onLoginSiswa={(p) => {
              setSiswaProfile(p);
              setRole('siswa');
              setActiveTab('home');
              addNotification(`Selamat datang siswa, ${p.name}! Mulai petualangan belajar di menu Ilmu Baru.`, 'success');
            }}
            onLoginGuru={(p) => {
              setGuruProfile(p);
              setRole('guru');
              setActiveTab('dashboard-guru');
              addNotification(`Selamat datang guru, ${p.name}! Anda dapat mengelola kelompok belajar di sini.`, 'success');
            }}
            validateGroupCode={validateGroupCode}
            onAddNotification={addNotification}
          />
        ) : (
          /* If Logged In, Render Views */
          <div className="w-full max-w-7xl">
            
            {/* 1. Home Dashboard View */}
            {activeTab === 'home' && (
              <div className="space-y-8 animate-fade-in py-4">
                
                {/* Hero / Information Callout */}
                <div className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-md shadow-2xl relative overflow-hidden max-w-4xl mx-auto ${
                  darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
                  
                  <div className="max-w-2xl relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                      Tantangan Hari Ini
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-4 leading-tight">
                      Misi Penyelamat Udara Bersih
                    </h2>
                    <p className={`text-sm mt-3 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Indeks polusi udara Anda saat ini adalah <span className="font-extrabold text-teal-400">{aqiValue} AQI</span> ({aqiDetails.label}). {aqiDetails.msg} 
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          audio.playSfx('click');
                          handleTabChange('materi');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-teal-500/20"
                      >
                        Buka Ilmu Baru 📚
                      </button>
                      <button
                        onClick={() => {
                          audio.playSfx('click');
                          handleTabChange('main');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm hover:scale-105 transition-transform cursor-pointer border border-slate-700"
                      >
                        Main Game Pelindung 🎮
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Tip / Fakta Singkat */}
                {quickTip && (
                  <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md max-w-4xl mx-auto flex gap-4 items-start animate-fade-in ${
                    darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <Sparkles className={`w-6 h-6 shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    <p className="text-sm sm:text-base leading-relaxed font-medium">
                      {quickTip}
                    </p>
                  </div>
                )}

                {/* Main 3D Styled Cards Navigation Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  
                  {/* Card 1: Ilmu Baru */}
                  <div
                    onClick={() => handleTabChange('materi')}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between ${
                      darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40' : 'bg-white border-slate-200 hover:border-emerald-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-4xl filter drop-shadow mb-4 group-hover:scale-110 transition-transform duration-300">
                        📖
                      </div>
                      <h3 className="text-lg font-black group-hover:text-emerald-400 transition-colors">Ilmu Baru</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Pelajari sumber zat pencemar, bahaya gas beracun, dan resep aksi hijau untuk langit segar.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/15 flex justify-between items-center text-xs text-emerald-400 font-bold">
                      <span>Jelajahi Materi</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 2: Bermain */}
                  <div
                    onClick={() => handleTabChange('main')}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between ${
                      darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-4xl filter drop-shadow mb-4 group-hover:scale-110 transition-transform duration-300">
                        🎮
                      </div>
                      <h3 className="text-lg font-black group-hover:text-amber-400 transition-colors">Bermain</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Aksi pembersihan gas beracun yang terbang merusak lapisan ozon kota. Dapatkan poin & XP!
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/15 flex justify-between items-center text-xs text-amber-400 font-bold">
                      <span>Mulai Misi</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 3: Kuis */}
                  <div
                    onClick={() => handleTabChange('kuis')}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between ${
                      darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-violet-500/40' : 'bg-white border-slate-200 hover:border-violet-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-4xl filter drop-shadow mb-4 group-hover:scale-110 transition-transform duration-300">
                        🧠
                      </div>
                      <h3 className="text-lg font-black group-hover:text-violet-400 transition-colors">Kuis Udara</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Uji pemahaman mitigasi lingkungan udara dan dapatkan lencana Eco-Hero Sejati.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/15 flex justify-between items-center text-xs text-violet-400 font-bold">
                      <span>Uji Kompetensi</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 4: Pengaturan & Profil */}
                  <div
                    onClick={() => handleTabChange('pengaturan')}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between ${
                      darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40' : 'bg-white border-slate-200 hover:border-teal-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-4xl filter drop-shadow mb-4 group-hover:scale-110 transition-transform duration-300">
                        🏆
                      </div>
                      <h3 className="text-lg font-black group-hover:text-teal-400 transition-colors">Badges & Profil</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Lihat lencana penghargaan yang berhasil Anda menangkan dan edit setelan akun.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/15 flex justify-between items-center text-xs text-teal-400 font-bold">
                      <span>Buka Profil</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 5: Kelompok */}
                  {(role === 'guru' || siswaProfile?.joinCode) && (
                    <div
                      onClick={() => handleTabChange('kelompok')}
                      className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between ${
                        darkMode ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/40' : 'bg-white border-slate-200 hover:border-blue-500/40'
                      }`}
                    >
                      <div>
                        <div className="text-4xl filter drop-shadow mb-4 group-hover:scale-110 transition-transform duration-300">
                          👥
                        </div>
                        <h3 className="text-lg font-black group-hover:text-blue-400 transition-colors">Kelompok</h3>
                        <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Lihat teman sekelompok dan bersaing menjadi juara lingkungan hidup!
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-700/15 flex justify-between items-center text-xs text-blue-400 font-bold">
                        <span>Lihat Kelompok</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  )}


                </div>

              </div>
            )}

            {/* 2. Materi "Ilmu Baru" View */}
            {activeTab === 'materi' && (
              <MateriPanel
                darkMode={darkMode}
                profile={siswaProfile}
                onUpdateProfile={(updated) => setSiswaProfile(prev => prev ? { ...prev, ...updated } : null)}
                onAddNotification={addNotification}
                onBack={() => setActiveTab(role === 'guru' ? 'dashboard-guru' : 'home')}
                studentQuestions={studentQuestions}
                onUpdateStudentQuestions={setStudentQuestions}
              />
            )}

            {/* 3. Game "Bermain" View */}
            {activeTab === 'main' && (
              <GamePanel
                darkMode={darkMode}
                profile={siswaProfile}
                onUpdateProfile={(updated) => setSiswaProfile(prev => prev ? { ...prev, ...updated } : null)}
                onAddNotification={addNotification}
                onBack={() => setActiveTab(role === 'guru' ? 'dashboard-guru' : 'home')}
              />
            )}

            {/* 4. Quiz View */}
            {activeTab === 'kuis' && (
              <QuizPanel
                darkMode={darkMode}
                profile={siswaProfile}
                onUpdateProfile={(updated) => setSiswaProfile(prev => prev ? { ...prev, ...updated } : null)}
                onAddNotification={addNotification}
                onBack={() => setActiveTab(role === 'guru' ? 'dashboard-guru' : 'home')}
                questions={questions}
              />
            )}

            {/* 5. Settings / Badges View */}
            {activeTab === 'pengaturan' && (
              <SettingsPanel
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                profile={siswaProfile}
                onLogout={handleLogout}
                onResetProgress={handleResetProgress}
                onBack={() => setActiveTab(role === 'guru' ? 'dashboard-guru' : 'home')}
              />
            )}

            {/* 6. Kelompok View */}
            {activeTab === 'kelompok' && (
              <KelompokPanel
                darkMode={darkMode}
                profile={role === 'guru' ? null : siswaProfile}
                group={role === 'guru' ? groups[0] : groups.find(g => g.code === siswaProfile?.joinCode)}
                onBack={() => setActiveTab('home')}
              />
            )}

            {/* 8. Teacher Classroom Dashboard View */}
            {activeTab === 'dashboard-guru' && role === 'guru' && (
              <TeacherDashboard
                darkMode={darkMode}
                teacherName={guruProfile?.name || 'Pendidik'}
                teacherSubject={guruProfile?.subject || 'IPA'}
                groups={groups}
                onUpdateGroups={setGroups}
                onAddGroup={handleAddGroup}
                onDeleteGroup={handleDeleteGroup}
                onSimulateJoin={handleSimulateJoin}
                onAddNotification={addNotification}
                onBackToMenu={handleBackToRoleSelection}
                onNavigateToHome={() => setActiveTab('home')}
                onLogout={handleLogout}
                questions={questions}
                onUpdateQuestions={setQuestions}
                studentQuestions={studentQuestions}
                onUpdateStudentQuestions={setStudentQuestions}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer Navigation Tabs Bar (Visible when logged in) */}
      {role && (
        <footer className="relative z-20 border-t border-slate-700/15 bg-slate-950/45 backdrop-blur-md px-4 py-2 mt-8">
          <div className="max-w-2xl mx-auto flex justify-around items-center text-xs">
            
            {role === 'siswa' && (
              <>
                <button
                  onClick={() => handleTabChange('home')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'home' ? 'text-teal-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span>Menu</span>
                </button>

                <button
                  onClick={() => handleTabChange('materi')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'materi' ? 'text-emerald-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Ilmu Baru</span>
                </button>

                <button
                  onClick={() => handleTabChange('main')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'main' ? 'text-amber-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Bermain</span>
                </button>

                <button
                  onClick={() => handleTabChange('kuis')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'kuis' ? 'text-violet-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span>Kuis</span>
                </button>

                <button
                  onClick={() => handleTabChange('pengaturan')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'pengaturan' ? 'text-teal-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Profil</span>
                </button>
              </>
            )}

            {role === 'guru' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard-guru')}
                  className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                    activeTab === 'dashboard-guru' ? 'text-teal-400 font-bold scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Dashboard Guru</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-1 p-2 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </>
            )}

          </div>
        </footer>
      )}

      {/* Beautiful Custom Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Konfirmasi Keluar</h3>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Apakah Anda yakin ingin keluar dari akun? Seluruh sesi belajar dan profil aktif Anda di perangkat ini akan diselesaikan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Custom Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Atur Ulang Kemajuan</h3>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Apakah Anda yakin ingin mengatur ulang seluruh kemajuan belajar, skor kuis, dan lencana Anda? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmResetProgress}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Ya, Atur Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push-like Custom Toaster Alerts */}
      <NotificationToast notifications={notifications} onClose={removeNotification} />

    </div>
  );
}
