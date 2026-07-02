import React, { useState, useEffect, useRef } from 'react';
import { SiswaProfile } from '../types';
import { audio } from '../utils/audio';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  CloudRain, 
  TreePine, 
  Award, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  ArrowLeft, 
  Trophy, 
  ShieldCheck, 
  Check, 
  Heart, 
  Swords, 
  FileText, 
  Zap,
  Activity,
  Smile,
  Landmark,
  TreeDeciduous,
  Info,
  Car,
  Factory,
  Flame,
  Wind,
  Target,
  Crosshair
} from 'lucide-react';
import imgSumber from '../assets/images/sumber_polusi_1782833889666.jpg';
import imgGreen from '../assets/images/green_solutions_1782833596766.jpg';
import imgRegenLevel3 from '../assets/images/regenerated_image_1782909807957.png';

interface GamePanelProps {
  darkMode: boolean;
  profile: SiswaProfile | null;
  onUpdateProfile: (updated: Partial<SiswaProfile>) => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'join') => void;
  onBack: () => void;
}

// LEVEL 1: City Source Hunting Structures
interface PollutionSource {
  id: string;
  name: string;
  emoji: string;
  x: number; // % from left
  y: number; // % from top
  pollutant: string;
  explanation: string;
  found: boolean;
}

// LEVEL 2: Falling pollutant Structures
interface FallingPollutant {
  id: number;
  x: number; // % from left
  y: number; // % from top
  size: number;
  speed: number;
  type: 'CO2' | 'CO' | 'SO2' | 'NO2';
  color: string;
  scoreVal: number;
}

// LEVEL 4: Lab Diagnostic Case Structure
interface LabCase {
  id: string;
  title: string;
  region: string;
  anomaly: string;
  graphLabel: string;
  graphValues: { label: string; val: number }[];
  question: string;
  options: { text: string; correct: boolean; feedback: string }[];
}

export const GamePanel: React.FC<GamePanelProps> = ({
  darkMode,
  profile,
  onUpdateProfile,
  onAddNotification,
  onBack,
}) => {
  // General Game States
  const [currentLevel, setCurrentLevel] = useState<number | null>(null); // null = Level Select
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]); // Default unlock Level 1
  const [isMuted, setIsMuted] = useState(false);
  const [activeIntroLevel, setActiveIntroLevel] = useState<number | null>(null);
  const [levelStatus, setLevelStatus] = useState<Record<number, 'locked' | 'unlocked' | 'cleared'>>({
    1: 'unlocked',
    2: 'locked',
    3: 'locked',
    4: 'locked',
    5: 'locked',
  });

  // Sound Synth Generator (Mapped to premium unified audio engine)
  const playSound = (freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
    if (isMuted) return;

    // Map frequencies to premium unified audio engine presets
    if (freq === 750) {
      audio.playSfx('coin'); // Pop/coin sound when catching pollutants
    } else if (freq === 250) {
      audio.playSfx('warning'); // Warning sound if a pollutant hits the ground
    } else if (freq === 180 || freq === 120 || freq === 200) {
      audio.playSfx('fail'); // Game over / fail sound
    } else if (freq === 880 || freq === 950 || freq === 900) {
      audio.playSfx('correct'); // Correct / success chime
    } else if (freq === 1100 || freq === 1200 || freq === 1300) {
      audio.playSfx('success'); // Level completed / jackpot fanfare
    } else if (freq === 150) {
      audio.playSfx('incorrect'); // Locked/blocked warning
    } else if (freq === 440 || freq === 300 || freq === 350 || freq === 450 || freq === 550 || freq === 600 || freq === 750) {
      audio.playSfx('click'); // Button clicks or basic transitions
    } else {
      // Fallback
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }
  };

  // Synced high scores / progress with local profile
  useEffect(() => {
    // Determine which levels are unlocked based on high score or mock achievements
    // Let's load unlocked levels from localStorage or profile achievements
    const savedUnlocked = localStorage.getItem('udaraku_game_levels');
    if (savedUnlocked) {
      try {
        const parsed: number[] = JSON.parse(savedUnlocked);
        if (!parsed.includes(1)) {
          parsed.unshift(1);
        }
        setUnlockedLevels(parsed);
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const saveClearedLevel = (levelNum: number) => {
    let nextUnlocked = [...unlockedLevels];
    if (!nextUnlocked.includes(levelNum)) {
      nextUnlocked.push(levelNum);
    }
    const nextLevelToUnlock = levelNum + 1;
    if (nextLevelToUnlock <= 5 && !nextUnlocked.includes(nextLevelToUnlock)) {
      nextUnlocked.push(nextLevelToUnlock);
    }
    setUnlockedLevels(nextUnlocked);
    localStorage.setItem('udaraku_game_levels', JSON.stringify(nextUnlocked));

    // Award Eco-Points & EXP via profile
    if (profile) {
      const xpGained = levelNum * 50;
      const ecoGained = levelNum * 30;
      
      let newExp = profile.exp + xpGained;
      let newLevel = profile.level;
      let leveledUp = false;

      if (newExp >= profile.expToNextLevel) {
        newExp -= profile.expToNextLevel;
        newLevel += 1;
        leveledUp = true;
      }

      const currentBadges = profile.badges || [];
      const newBadges = [...currentBadges];
      
      // Unlock Game level badge
      const badgeId = `badge-game-level-${levelNum}`;
      if (!newBadges.some((b) => b.id === badgeId)) {
        const levelTitles = [
          'Detektif Sumber Polusi',
          'Pembersih Angkasa',
          'Gubernur Hijau Lestari',
          'Analis Lab Atmosfer',
          'Penakluk Raja Polusi'
        ];
        newBadges.push({
          id: badgeId,
          title: levelTitles[levelNum - 1],
          description: `Berhasil menyelesaikan Tantangan Game Edukasi Level ${levelNum}.`,
          icon: ['🔍', '🧹', '👔', '🧪', '👑'][levelNum - 1],
          unlockedAt: new Date().toLocaleTimeString(),
        });
        onAddNotification(`Lencana Baru Unlocked: ${levelTitles[levelNum - 1]}! 🎉`, 'success');
      }

      onUpdateProfile({
        gameHighScore: Math.max(profile.gameHighScore || 0, levelNum * 150),
        exp: newExp,
        level: newLevel,
        ecoPoints: (profile.ecoPoints || 0) + ecoGained,
        badges: newBadges,
      });

      if (leveledUp) {
        onAddNotification(`Selamat! Anda naik ke Level ${newLevel}! 🚀`, 'success');
      }
    }
  };

  const handleCheatUnlockAll = () => {
    const all = [1, 2, 3, 4, 5];
    setUnlockedLevels(all);
    localStorage.setItem('udaraku_game_levels', JSON.stringify(all));
    playSound(880, 'sine', 0.2);
    onAddNotification('Semua level game berhasil dibuka! 🎮', 'success');
  };

  // ==========================================
  // LEVEL 1: ANALISIS INFOGRAFIS (OBSERVATION & QUIZ)
  // ==========================================
  const level1Sources = [
    {
      id: 'pabrik',
      name: 'Pabrik & Kawasan Industri',
      emoji: '🏭🌋',
      pollutant: 'Sulfur Dioksida (SO2) & Nitrogen Dioksida (NO2)',
      impactTitle: 'Hujan Asam & Pencemaran Ekosistem',
      explanation: 'Cerobong asap pabrik yang melepaskan emisi gas SO2 dan NO2 tinggi tanpa filtrasi mumpuni. Gas ini bereaksi dengan uap air awan membentuk asam nitrat dan asam sulfat, mencetuskan hujan asam yang mengasamkan air danau/tanah, mematikan pepohonan hutan, merusak bahan bangunan beton/logam, serta mengganggu saluran pernapasan warga.',
      x: 75,
      y: 32,
    },
    {
      id: 'kendaraan',
      name: 'Kemacetan Kendaraan Bermotor',
      emoji: '🚗💨',
      pollutant: 'Karbon Monoksida (CO) & Partikulat PM2.5',
      impactTitle: 'Kekurangan Oksigen Darah & Sesak Napas',
      explanation: 'Kepadatan mobil dan motor berbahan bakar fosil menghasilkan gas beracun Karbon Monoksida (CO) dan debu hitam PM2.5 halus. Gas CO mengikat hemoglobin sel darah merah manusia 200 kali lebih kuat dibanding oksigen, meracuni aliran darah sehingga memicu pusing hebat, sesak napas, hingga pingsan.',
      x: 24,
      y: 68,
    },
    {
      id: 'sampah',
      name: 'Pembakaran Sampah Terbuka',
      emoji: '🔥🗑️',
      pollutant: 'Gas Dioksin Karsinogenik & PM10',
      impactTitle: 'Risiko Kanker & Endapan Paru-paru',
      explanation: 'Kegiatan membakar sampah domestik (terutama plastik) secara terbuka melepaskan senyawa kimia Dioksin yang bersifat karsinogenik (pemicu kanker paru-paru) dan partikel debu abu PM10. Menghirup asap pembakaran ini merusak organ alveolus paru secara permanen dan meningkatkan risiko infeksi pernapasan akut.',
      x: 50,
      y: 78,
    },
    {
      id: 'konstruksi',
      name: 'Kegiatan Konstruksi & Pembangunan',
      emoji: '🏗️🚧',
      pollutant: 'Partikulat Kasar PM10 & Debu Silika',
      impactTitle: 'Iritasi Saluran Pernapasan',
      explanation: 'Pembangunan infrastruktur besar dan pembongkaran gedung menghasilkan awan debu semen dan partikel material bangunan. Partikel kasar ini mudah masuk ke hidung dan tenggorokan, menyebabkan batuk, iritasi mata, dan memperburuk gejala asma bagi warga di sekitarnya.',
      x: 80,
      y: 70,
    },
    {
      id: 'rumah_tangga',
      name: 'Aktivitas Rumah Tangga',
      emoji: '🏠🍳',
      pollutant: 'Senyawa Karbon & Gas Rumah Kaca',
      impactTitle: 'Pencemaran Udara Skala Mikro',
      explanation: 'Penggunaan kayu bakar, minyak tanah, serta pendingin ruangan (AC) tua yang bocor menghasilkan freon dan gas emisi yang menumpuk. Meski dalam skala kecil per rumah, jika diakumulasikan dari jutaan rumah di metropolitan, menyumbang porsi besar pada polusi udara domestik.',
      x: 30,
      y: 45,
    },
  ];

  const [level1SelectedSourceId, setLevel1SelectedSourceId] = useState<string | null>(null);
  const [level1Explored, setLevel1Explored] = useState<Record<string, boolean>>({
    pabrik: false,
    kendaraan: false,
    sampah: false,
    konstruksi: false,
    rumah_tangga: false,
  });
  const [level1QuizActive, setLevel1QuizActive] = useState(false);
  const [level1QuizAnswers, setLevel1QuizAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null,
  });
  const [level1Success, setLevel1Success] = useState(false);
  const [level1ShowWrongFeedback, setLevel1ShowWrongFeedback] = useState<number | null>(null);
  const [l1ObservationInput, setL1ObservationInput] = useState('');
  const [l1FeedbackMessage, setL1FeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [l1ShowBanner, setL1ShowBanner] = useState(true);

  const level1SelectedSource = level1Sources.find(s => s.id === level1SelectedSourceId) || null;

  const handleExploreSource = (id: string) => {
    playSound(600, 'sine', 0.1);
    setLevel1SelectedSourceId(id);
    setLevel1Explored(prev => {
      const updated = { ...prev, [id]: true };
      if (!prev[id]) {
        setTimeout(() => playSound(750, 'sine', 0.15), 100);
      }
      return updated;
    });
  };

  const handleObserveSubmit = (text: string) => {
    const cleanText = text.trim().toLowerCase();
    if (!cleanText) return;

    // Keywords mappings
    const matches = {
      pabrik: ['pabrik', 'industri', 'cerobong', 'asap pabrik', 'asap hitam', 'asap putih', 'pembangkit', 'polusi industri', 'cerobong asap', 'belerang', 'sulfur'],
      kendaraan: ['kemacetan', 'macet', 'mobil', 'kendaraan', 'motor', 'jalan', 'jalanan', 'bus', 'transjakarta', 'knalpot', 'transportasi', 'emisi kendaraan', 'asap kendaraan', 'karbon monoksida'],
      sampah: ['sampah', 'bakar', 'pembakaran', 'pembakaran sampah', 'asap sampah', 'plastik', 'api', 'limbah', 'bakaran', 'tong sampah', 'tumpukan sampah'],
      konstruksi: ['konstruksi', 'bangunan', 'proyek', 'debu proyek', 'gedung', 'semen', 'pasir'],
      rumah_tangga: ['rumah', 'dapur', 'asap dapur', 'rumah tangga', 'pemukiman', 'ac', 'freon', 'kayu bakar']
    };

    let foundId: string | null = null;
    
    // Check direct matches or loose containing matches
    if (matches.kendaraan.some(keyword => cleanText.includes(keyword))) {
      foundId = 'kendaraan';
    } else if (matches.pabrik.some(keyword => cleanText.includes(keyword))) {
      foundId = 'pabrik';
    } else if (matches.sampah.some(keyword => cleanText.includes(keyword))) {
      foundId = 'sampah';
    } else if (matches.konstruksi.some(keyword => cleanText.includes(keyword))) {
      foundId = 'konstruksi';
    } else if (matches.rumah_tangga.some(keyword => cleanText.includes(keyword))) {
      foundId = 'rumah_tangga';
    }

    if (foundId) {
      const source = level1Sources.find(s => s.id === foundId);
      if (source) {
        if (level1Explored[foundId]) {
          setL1FeedbackMessage({
            text: `Kamu sudah menganalisis Sektor ${source.name}!`,
            type: 'info'
          });
          setLevel1SelectedSourceId(foundId);
          playSound(600, 'sine', 0.1);
        } else {
          handleExploreSource(foundId);
          setL1FeedbackMessage({
            text: `Hebat! Kamu berhasil mengidentifikasi: ${source.name} 🌟`,
            type: 'success'
          });
          onAddNotification(`Berhasil mengidentifikasi ${source.name}!`, 'success');
          setLevel1SelectedSourceId(foundId);
        }
      }
    } else {
      setL1FeedbackMessage({
        text: `Kata kunci "${text}" belum terdaftar. Coba amati gambar lebih jeli (seperti kemacetan, asap pabrik, pembakaran sampah, dll).`,
        type: 'error'
      });
      playSound(200, 'sine', 0.3);
    }
    setL1ObservationInput('');
  };

  const handleResetLevel1 = () => {
    setLevel1SelectedSourceId(null);
    setLevel1Explored({
      pabrik: false,
      kendaraan: false,
      sampah: false,
      konstruksi: false,
      rumah_tangga: false,
    });
    setLevel1QuizActive(false);
    setLevel1QuizAnswers({
      1: null,
      2: null,
      3: null,
    });
    setLevel1Success(false);
    setLevel1ShowWrongFeedback(null);
    setL1ObservationInput('');
    setL1FeedbackMessage(null);
    setL1ShowBanner(true);
  };

  const level1QuizQuestions = [
    {
      id: 1,
      question: '1. Berdasarkan infografis, cerobong asap pabrik menghasilkan emisi gas Sulfur Dioksida (SO₂) dan Nitrogen Dioksida (NO₂). Gas-gas ini jika bereaksi dengan air hujan di atmosfer akan memicu dampak lingkungan apa?',
      options: [
        { key: 0, text: 'A) Kebocoran lapisan Ozon stratofis (CFC)', isCorrect: false },
        { key: 1, text: 'B) Pembentukan Hujan Asam yang mengasamkan danau & mematikan tanaman', isCorrect: true },
        { key: 2, text: 'C) Produksi Gas Oksigen yang menyehatkan pernapasan kota', isCorrect: false }
      ],
      correctKey: 1,
      explanation: 'Gas SO2 & NO2 yang bereaksi dengan uap air awan membentuk asam sulfat & nitrat yang jatuh sebagai hujan asam (C2).'
    },
    {
      id: 2,
      question: '2. Mengapa gas Karbon Monoksida (CO) dari kemacetan kendaraan padat sangat berbahaya bagi kesehatan organ peredaran darah manusia?',
      options: [
        { key: 0, text: 'A) Gas CO mengikat hemoglobin sel darah merah jauh lebih kuat daripada oksigen', isCorrect: true },
        { key: 1, text: 'B) Gas CO merusak kornea mata luar secara instan', isCorrect: false },
        { key: 2, text: 'C) Gas CO tidak memiliki efek negatif bagi sirkulasi darah paru', isCorrect: false }
      ],
      correctKey: 0,
      explanation: 'Gas CO memiliki afinitas pengikatan hemoglobin darah 200 kali lebih kuat dibanding oksigen, memicu sesak napas akut.'
    },
    {
      id: 3,
      question: '3. Apa bahaya utama dari membakar sampah plastik rumah tangga di ruang terbuka bagi kesehatan organ paru kita?',
      options: [
        { key: 0, text: 'A) Memicu naiknya keasaman uap air danau sekitar', isCorrect: false },
        { key: 1, text: 'B) Pelepasan senyawa kimia Dioksin karsinogenik & partikel abu PM10/PM2.5', isCorrect: true },
        { key: 2, text: 'C) Mereduksi konsumsi limbah plastik industri nasional', isCorrect: false }
      ],
      correctKey: 1,
      explanation: 'Membakar sampah plastik melepaskan Dioksin (karsinogen pemicu kanker) serta partikulat PM2.5 halus yang mengendap di saluran pernapasan.'
    }
  ];

  const handleSubmitLevel1Quiz = () => {
    // Check if all answered
    if (level1QuizAnswers[1] === null || level1QuizAnswers[2] === null || level1QuizAnswers[3] === null) {
      playSound(250, 'sawtooth', 0.2);
      onAddNotification('Harap jawab semua 3 pertanyaan sebelum mengirim!', 'info');
      return;
    }

    const q1Correct = level1QuizAnswers[1] === 1;
    const q2Correct = level1QuizAnswers[2] === 0;
    const q3Correct = level1QuizAnswers[3] === 1;

    if (q1Correct && q2Correct && q3Correct) {
      // Success!
      playSound(900, 'sine', 0.35);
      setLevel1Success(true);
      saveClearedLevel(1);
      onAddNotification('Hebat! Anda menyelesaikan Level 1 dengan sempurna! 🎉', 'success');
    } else {
      playSound(180, 'sawtooth', 0.3);
      let wrongMsg = 'Beberapa jawaban Anda masih belum tepat! ';
      if (!q1Correct) wrongMsg += 'Periksa nomor 1. ';
      else if (!q2Correct) wrongMsg += 'Periksa nomor 2. ';
      else if (!q3Correct) wrongMsg += 'Periksa nomor 3. ';
      
      onAddNotification(wrongMsg + 'Silakan ulas materi di infografis.', 'info');
      
      // Highlight the first wrong answer for feedback
      setLevel1ShowWrongFeedback(!q1Correct ? 1 : (!q2Correct ? 2 : 3));
    }
  };


  // ==========================================
  // LEVEL 2: PENYARING UDARA (CATCHING GASES)
  // ==========================================
  const [level2Active, setLevel2Active] = useState(false);
  const [level2Score, setLevel2Score] = useState(0);
  const [level2HP, setLevel2HP] = useState(100);
  const [level2Items, setLevel2Items] = useState<FallingPollutant[]>([]);
  const [level2BasketX, setLevel2BasketX] = useState(50); // % from left
  const [level2Success, setLevel2Success] = useState(false);
  const [level2GameOver, setLevel2GameOver] = useState(false);
  
  const level2LoopRef = useRef<any>(null);
  const level2SpawnRef = useRef<any>(null);
  const level2NextId = useRef(1);

  const startLevel2 = () => {
    setLevel2Active(true);
    setLevel2Score(0);
    setLevel2HP(100);
    setLevel2Items([]);
    setLevel2BasketX(50);
    setLevel2Success(false);
    setLevel2GameOver(false);
    level2NextId.current = 1;
    playSound(440, 'sine', 0.15);
  };

  // Movement Controls (Keyboard support)
  useEffect(() => {
    if (!level2Active || level2Success || level2GameOver) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLevel2BasketX(prev => Math.max(5, prev - 8));
      } else if (e.key === 'ArrowRight') {
        setLevel2BasketX(prev => Math.min(95, prev + 8));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [level2Active, level2Success, level2GameOver]);

  // Spawning logic
  useEffect(() => {
    if (level2Active && !level2Success && !level2GameOver) {
      level2SpawnRef.current = setInterval(() => {
        const types: FallingPollutant['type'][] = ['CO2', 'CO', 'SO2', 'NO2'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        let color = 'bg-rose-500';
        let scoreVal = 10;
        
        if (randomType === 'CO2') { color = 'bg-slate-500'; scoreVal = 10; }
        else if (randomType === 'CO') { color = 'bg-amber-600'; scoreVal = 15; }
        else if (randomType === 'SO2') { color = 'bg-yellow-500'; scoreVal = 20; }
        else if (randomType === 'NO2') { color = 'bg-purple-600'; scoreVal = 20; }

        const newItem: FallingPollutant = {
          id: level2NextId.current++,
          x: 10 + Math.random() * 80,
          y: -5,
          size: 40,
          speed: 1.2 + Math.random() * 1.5,
          type: randomType,
          color,
          scoreVal,
        };
        setLevel2Items(prev => [...prev, newItem]);
      }, 1000);
    }
    return () => {
      if (level2SpawnRef.current) clearInterval(level2SpawnRef.current);
    };
  }, [level2Active, level2Success, level2GameOver]);

  // Physics Loop
  useEffect(() => {
    if (level2Active && !level2Success && !level2GameOver) {
      level2LoopRef.current = setInterval(() => {
        setLevel2Items(prev => {
          const updated: FallingPollutant[] = [];
          prev.forEach(p => {
            const nextY = p.y + p.speed;
            
            // Check Collision with Basket at y = 85 to 90
            const inYRange = nextY >= 82 && nextY <= 89;
            const inXRange = Math.abs(p.x - level2BasketX) < 12; // 12% width range

            if (inYRange && inXRange) {
              // Caught it!
              setLevel2Score(prevScore => {
                const ns = prevScore + 1;
                if (ns >= 15) {
                  // Winner!
                  playSound(880, 'sine', 0.15);
                  setTimeout(() => {
                    playSound(1100, 'sine', 0.3);
                    setLevel2Success(true);
                    setLevel2Active(false);
                    saveClearedLevel(2);
                  }, 200);
                }
                return ns;
              });
              playSound(750, 'sine', 0.08);
              return; // Skip adding to update (absorbed)
            }

            if (nextY >= 100) {
              // Missed pollutant -> hits citizens / ground
              setLevel2HP(prevHP => {
                const nextHP = prevHP - 15;
                if (nextHP <= 0) {
                  setLevel2GameOver(true);
                  setLevel2Active(false);
                  playSound(180, 'sawtooth', 0.4);
                  return 0;
                }
                playSound(250, 'triangle', 0.12);
                return nextHP;
              });
              return; // Removed
            }

            updated.push({ ...p, y: nextY });
          });
          return updated;
        });
      }, 30);
    }
    return () => {
      if (level2LoopRef.current) clearInterval(level2LoopRef.current);
    };
  }, [level2Active, level2Success, level2GameOver, level2BasketX]);


  // ==========================================
  // LEVEL 3: KEBIJAKAN KOTA (SIMULATOR)
  // ==========================================
  const [level3Day, setLevel3Day] = useState(1);
  const [level3Metrics, setLevel3Metrics] = useState({
    health: 70,
    environment: 60,
    economy: 65,
  });
  const [level3Active, setLevel3Active] = useState(false);
  const [level3SelectedPolicy, setLevel3SelectedPolicy] = useState<number | null>(null);
  const [level3TimeOfDay, setLevel3TimeOfDay] = useState<'siang' | 'sore' | 'malam' | 'pagi'>('siang');
  const [level3Log, setLevel3Log] = useState<string>('Selamat datang di simulator kebijakan kota! Ambil kebijakan terbaik harian.');
  const [level3Success, setLevel3Success] = useState(false);
  const [level3GameOver, setLevel3GameOver] = useState(false);
  const [level3IsAnimating, setLevel3IsAnimating] = useState(false);
  const [level3SelectedOptions, setLevel3SelectedOptions] = useState<number[]>([]);
  const [level3ShowInfo, setLevel3ShowInfo] = useState<number | null>(null);

  interface Level3Policy {
    question: string;
    description: string;
    options: {
      text: string;
      metrics: { health: number; environment: number; economy: number };
      log: string;
    }[];
  }

  const level3Policies: Record<number, Level3Policy> = {
    1: {
      question: 'Hari 1: Lonjakan Kemacetan Kendaraan Bermotor',
      description: 'Laporan menunjukkan jumlah asap kendaraan di pusat kota meningkat pesat, mengaburkan pemandangan jalan harian.',
      options: [
        {
          text: 'Pemberlakuan Bus Listrik Gratis & Jalur Sepeda',
          metrics: { health: 15, environment: 15, economy: -10 },
          log: 'Masyarakat antusias beralih ke transportasi umum bebas emisi. Kadar asap di pusat kota menurun secara signifikan!',
        },
        {
          text: 'Perlebar Jalan Raya Utama di Pusat Kota',
          metrics: { health: -10, environment: -15, economy: 15 },
          log: 'Kemacetan berkurang sementara, namun memicu peningkatan drastis jumlah mobil pribadi baru dan volume asap knalpot.',
        },
        {
          text: 'Biarkan Saja (Tidak Mengambil Kebijakan)',
          metrics: { health: -20, environment: -10, economy: 0 },
          log: 'Kemacetan kian parah. Warga mengeluhkan sesak napas akut dan udara terasa semakin menyesakkan.',
        },
      ],
    },
    2: {
      question: 'Hari 2: Emisi Asap Cerobong Sektor Industri',
      description: 'Kawasan industri pinggir kota beroperasi non-stop, melepas kabut sulfur pekat di udara malam hari.',
      options: [
        {
          text: 'Terapkan Filter Cerobong Wajib & Denda Berat',
          metrics: { health: 20, environment: 20, economy: -15 },
          log: 'Pabrik memasang filter Wet Scrubber. Emisi gas belerang ditekan habis, kualitas udara membaik drastis!',
        },
        {
          text: 'Berikan Subsidi Bahan Bakar Fosif Murah',
          metrics: { health: -20, environment: -25, economy: 20 },
          log: 'Biaya manufaktur turun, meningkatkan produksi ekonomi. Namun, asap hitam kian menyelimuti langit pemukiman warga.',
        },
        {
          text: 'Pasang Denda Emisi Ringan Secara Berkala',
          metrics: { health: 5, environment: 5, economy: 5 },
          log: 'Sebagian pabrik melakukan perbaikan minor, namun beberapa tetap memilih membayar denda murah daripada menyaring emisi.',
        },
      ],
    },
    3: {
      question: 'Hari 3: Krisis Penimbunan Sampah Plastik',
      description: 'Warga terbiasa membakar tumpukan sampah plastik di pekarangan rumah karena keterbatasan armada truk pengangkut.',
      options: [
        {
          text: 'Membangun PLTSa Ramah Lingkungan & Daur Ulang',
          metrics: { health: 15, environment: 20, economy: -15 },
          log: 'Sistem tata kelola sampah rapi terbangun. Warga berhenti membakar sampah di pekarangan rumah secara mandiri.',
        },
        {
          text: 'Membagi Jadwal Pembakaran Terkontrol',
          metrics: { health: -10, environment: -15, economy: 5 },
          log: 'Meskipun terjadwal, gas beracun dioksin tetap terhirup langsung oleh anak-anak sekolah yang melintasi jalan.',
        },
        {
          text: 'Himbauan Saja Tanpa Fasilitas Tambahan',
          metrics: { health: -20, environment: -20, economy: 0 },
          log: 'Himbauan tidak digubris akibat tidak adanya truk angkut sampah. Kebiasaan membakar sampah plastik harian terus berlangsung.',
        },
      ],
    },
    4: {
      question: 'Hari 4: Kebutuhan Pembangkit Listrik Baru',
      description: 'Pertumbuhan populasi memicu tingginya konsumsi listrik, memaksa kota memilih sumber energi baru.',
      options: [
        {
          text: 'Insentif Panel Surya Atap & Turbin Angin',
          metrics: { health: 15, environment: 15, economy: -10 },
          log: 'Kota beralih ke energi bersih berkelanjutan. Langit kota tetap bersih dari jelaga pembangkit listrik.',
        },
        {
          text: 'Bangun PLTU Batubara Tambahan (Murah)',
          metrics: { health: -25, environment: -30, economy: 25 },
          log: 'Energi berlimpah dan sangat murah. Namun, partikel halus abu terbang (fly ash) mulai turun menyelimuti atap rumah warga.',
        },
        {
          text: 'Kampanye Hemat Energi Mandiri di Media Sosial',
          metrics: { health: 5, environment: 5, economy: 0 },
          log: 'Kampanye berjalan dengan respon positif berskala kecil, konsumsi daya hanya berkurang sangat sedikit.',
        },
      ],
    },
    5: {
      question: 'Hari 5: Alokasi Tata Ruang Hijau Kota',
      description: 'Lahan tersisa di jantung kota diperebutkan antara pengembang komersial dan aktivis lingkungan hidup.',
      options: [
        {
          text: 'Konversi Menjadi Hutan Kota & Area Resapan',
          metrics: { health: 25, environment: 25, economy: -15 },
          log: 'Paru-paru kota terbentuk sempurna! Jutaan pohon menyaring debu PM2.5, menciptakan iklim mikro yang sangat sejuk.',
        },
        {
          text: 'Jual Lahan untuk Kompleks Mal Raksasa',
          metrics: { health: -15, environment: -20, economy: 30 },
          log: 'Pendapatan kota meroket tajam dari pajak mal. Namun, hilangnya lahan hijau memicu panas kota dan polusi yang terkepung.',
        },
        {
          text: 'Tanam Pohon Hias Kecil di Median Trotoar',
          metrics: { health: 5, environment: 5, economy: -5 },
          log: 'Memberikan aksen estetik minimal di trotoar jalan, namun kurang memiliki kapasitas menyerap polusi masif harian.',
        },
      ],
    },
  };

  const startLevel3 = () => {
    setLevel3Active(true);
    setLevel3Day(1);
    setLevel3Metrics({ health: 70, environment: 60, economy: 65 });
    setLevel3SelectedPolicy(null);
    setLevel3TimeOfDay('siang');
    setLevel3Log('Hari 1 telah dimulai. Silakan pilih opsi kebijakan terbaik Anda.');
    setLevel3Success(false);
    setLevel3GameOver(false);
    setLevel3IsAnimating(false);
    setLevel3SelectedOptions([]);
    playSound(440, 'sine', 0.1);
  };

  const handleApplyPolicy = () => {
    if (level3SelectedPolicy === null || level3IsAnimating) return;
    setLevel3IsAnimating(true);
    
    const policy = level3Policies[level3Day];
    const option = policy.options[level3SelectedPolicy];

    // Trigger Time of Day Transition Anim (Siang -> Sore -> Malam -> Pagi)
    setLevel3TimeOfDay('sore');
    playSound(350, 'sine', 0.12);

    setTimeout(() => {
      setLevel3TimeOfDay('malam');
      playSound(300, 'sine', 0.15);
    }, 1000);

    setTimeout(() => {
      setLevel3TimeOfDay('pagi');
      playSound(450, 'sine', 0.2);

      // Apply Metrics
      setLevel3Metrics(prev => {
        const nextHealth = Math.min(100, Math.max(0, prev.health + option.metrics.health));
        const nextEnv = Math.min(100, Math.max(0, prev.environment + option.metrics.environment));
        const nextEco = Math.min(100, Math.max(0, prev.economy + option.metrics.economy));

        // Check fail conditions
        if (nextHealth <= 25 || nextEnv <= 25 || nextEco <= 25) {
          setTimeout(() => {
            setLevel3GameOver(true);
            setLevel3Active(false);
            playSound(150, 'sawtooth', 0.5);
          }, 600);
        }

        return { health: nextHealth, environment: nextEnv, economy: nextEco };
      });

      setLevel3Log(option.log);
      setLevel3SelectedOptions(prev => {
        const updated = [...prev];
        updated[level3Day - 1] = level3SelectedPolicy;
        return updated;
      });
    }, 2000);

    setTimeout(() => {
      setLevel3TimeOfDay('siang');
      setLevel3IsAnimating(false);
      setLevel3SelectedPolicy(null);

      if (level3Day >= 5) {
        // Complete Level 3 successfully
        playSound(880, 'sine', 0.15);
        setTimeout(() => {
          playSound(1100, 'sine', 0.35);
          setLevel3Success(true);
          setLevel3Active(false);
          saveClearedLevel(3);
        }, 500);
      } else {
        setLevel3Day(prev => prev + 1);
      }
    }, 3500);
  };


  // ==========================================
  // LEVEL 3 HELPER ILLUSTRATIONS
  // ==========================================
  const getLevel3OptionImage = (day: number, optionIdx: number) => {
    const images: Record<number, string[]> = {
      1: [
        'https://image.pollinations.ai/prompt/modern%20electric%20bus%20and%20green%20bicycle%20lane%20city%20digital%20painting%20anime%20art%20vibrant%20colors?width=800&height=600',
        'https://image.pollinations.ai/prompt/widening%20of%20main%20city%20road%20construction%20anime%20style%202D%20Anime%20Vector%20Art%20clean%20cel-shading%20vibrant%20colors?width=800&height=600',
        'https://image.pollinations.ai/prompt/chaotic%20traffic%20jam%20heavy%20cars%20city%20digital%20painting%20anime%20art?width=800&height=600'
      ],
      2: [
        'https://image.pollinations.ai/prompt/modern%20factory%20chimney%20with%20complex%20filter%20system%20government%20legal%20notice%20for%20pollution%20fines%20digital%20painting%20anime%20art?width=800&height=600',
        'https://image.pollinations.ai/prompt/government%20subsidy%20for%20cheap%20fossil%20fuel%20burning%20heavy%20black%20smoke%20dark%20polluted%20sky%20over%20anime%20city%20digital%20painting?width=800&height=600',
        'https://image.pollinations.ai/prompt/industrial%20zone%20with%20smog%20digital%20painting%20anime%20art?width=800&height=600'
      ],
      3: [
        'https://image.pollinations.ai/prompt/modern%20high-tech%20automated%20recycling%20facility%20anime%20art%20style%20clean%20cel-shading?width=800&height=600',
        'https://image.pollinations.ai/prompt/smoky%20trash%20burning%20field%20at%20night%20anime%20art%20style%20dramatic%20lighting?width=800&height=600',
        'https://image.pollinations.ai/prompt/messy%20piles%20of%20trash%20on%20a%20city%20street%20anime%20art%20style%20urban%20setting?width=800&height=600'
      ],
      4: [
        'https://image.pollinations.ai/prompt/sunny%20field%20with%20solar%20panels%20and%20wind%20turbines%20anime%20art%20style%20vibrant%20colors?width=800&height=600',
        'https://image.pollinations.ai/prompt/massive%20coal%20power%20plant%20spewing%20dark%20smoke%20anime%20art%20style%20ominous?width=800&height=600',
        'https://image.pollinations.ai/prompt/young%20person%20using%20smartphone%20for%20a%20green%20campaign%20anime%20art%20style%20modern%20lifestyle?width=800&height=600'
      ],
      5: [
        'https://image.pollinations.ai/prompt/beautiful%20lush%20green%20city%20park%20with%20a%20lake%20anime%20art%20style%20peaceful?width=800&height=600',
        'https://image.pollinations.ai/prompt/giant%20commercial%20shopping%20mall%20complex%20in%20a%20city%20anime%20art%20style%20bustling?width=800&height=600',
        'https://image.pollinations.ai/prompt/small%20potted%20plants%20on%20a%20city%20sidewalk%20anime%20art%20style%20charming?width=800&height=600'
      ]
    };
    return images[day]?.[optionIdx] || 'https://image.pollinations.ai/prompt/beautiful%20green%20sustainable%20city%20digital%20painting%20anime%20art?width=800&height=600';
  };

  const renderOptionIllustration = (day: number, optionIdx: number) => {
    return (
      <div className="w-full h-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
        <img 
          src={getLevel3OptionImage(day, optionIdx)}
          alt={`Ilustrasi Kebijakan Hari ${day} Pilihan ${optionIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  };


  // ==========================================
  // LEVEL 4: LAB DIAGNOSTIK (C4 ANALYZING & C5 EVALUATING)
  // ==========================================
  const [level4Active, setLevel4Active] = useState(false);
  const [level4Success, setLevel4Success] = useState(false);
  const [level4ActiveCaseIdx, setLevel4ActiveCaseIdx] = useState(0);
  const [level4Answers, setLevel4Answers] = useState<Record<string, number>>({});
  const [level4Feedback, setLevel4Feedback] = useState<string | null>(null);
  const [level4SolvedCount, setLevel4SolvedCount] = useState(0);
  const [level4SelectedPolutan, setLevel4SelectedPolutan] = useState<string | null>(null);
  const [level4SelectedSumber, setLevel4SelectedSumber] = useState<string | null>(null);
  const [level4SelectedSolusi, setLevel4SelectedSolusi] = useState<string | null>(null);
  const [infoPopupData, setInfoPopupData] = useState<any | null>(null);

  const level4InfoData: Record<string, { title: string; desc: string; icon: string; schema: React.ReactNode }> = {
    "PM2.5": {
      title: "Particulate Matter 2.5 (PM2.5)",
      icon: "🧬",
      desc: "Partikel halus di udara berdiameter < 2.5 mikrometer (30x lebih kecil dari sehelai rambut manusia). Berasal dari gas buang kendaraan, industri, dan asap pembakaran fosil. Berbahaya karena dapat menembus sistem pertahanan pernapasan hidung hingga paru-paru dan masuk ke aliran darah.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-emerald-400 uppercase tracking-wider text-[9px]">Infografis Skala Ukuran:</p>
          <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-slate-800">
            <div className="flex-1 flex flex-col items-center border-r border-slate-800 pr-1">
              <span className="text-xs">💇</span>
              <span className="text-[8px] text-slate-500 mt-0.5">Rambut (70µm)</span>
            </div>
            <div className="flex-1 flex flex-col items-center border-r border-slate-800 pr-1">
              <span className="text-xs">⚪</span>
              <span className="text-[8px] text-slate-400 mt-0.5">PM10 (10µm)</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[8px] text-emerald-400 animate-pulse">●</span>
              <span className="text-[8px] text-emerald-400 mt-0.5">PM2.5 (2.5µm)</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 flex justify-between">
            <span>Dampak: Jantung, Paru-paru</span>
            <span>Penetrasi: Alveolus & Darah</span>
          </div>
        </div>
      )
    },
    "PM10": {
      title: "Particulate Matter 10 (PM10)",
      icon: "⚪",
      desc: "Partikel kasar dengan diameter antara 2.5 hingga 10 mikrometer. Biasanya bersumber dari debu jalan raya non-aspal, aktivitas konstruksi, pembakaran sampah terbuka, dan abu tebal dari kebakaran hutan atau gambut.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-blue-400 uppercase tracking-wider text-[9px]">Infografis Komparasi Sumber:</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Kebakaran Hutan/Gambut</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[60%]" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Debu Jalanan & Konstruksi</span>
              <span>40%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-400 h-full w-[40%]" />
            </div>
          </div>
        </div>
      )
    },
    "SO2 & NO2": {
      title: "Sulfur Dioksida (SO₂) & Nitrogen Dioksida (NO₂)",
      icon: "🧪",
      desc: "Gas oksida belerang dan nitrogen yang dihasilkan oleh pembakaran batubara di pembangkit listrik (PLTU) serta pembakaran bahan bakar diesel industri. Gas-gas asam ini bereaksi kuat di awan atmosfer membentuk tetesan hujan asam korosif.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-amber-400 uppercase tracking-wider text-[9px]">Rantai Reaksi Kimia Hujan Asam:</p>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800 space-y-1 text-[10px] text-slate-300 font-mono">
            <p>1. Industri ➔ SO₂ & NO₂ Menguap</p>
            <p>2. Awan ➔ SO₂ + H₂O ➔ H₂SO₄ (Asam Kuat)</p>
            <p>3. Presipitasi ➔ Hujan Asam (pH &lt; 5)</p>
          </div>
          <p className="text-[9px] text-rose-400">Kerusakan: Atap seng korosif, mematikan biota danau.</p>
        </div>
      )
    },
    "CFC Freon": {
      title: "CFC Freon (Klorofluorokarbon)",
      icon: "❄️",
      desc: "Senyawa kimia buatan manusia yang digunakan sebagai agen pendingin pada kompresor AC lama, lemari es, dan gas pendorong kaleng semprot. Di stratosfer tinggi, klorin dari CFC memecah lapisan ozon pelindung bumi.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-purple-400 uppercase tracking-wider text-[9px]">Mekanisme Kerusakan Lapisan Ozon:</p>
          <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded text-[10px]">
            <span className="text-slate-400">Radiasi UV</span>
            <span className="text-slate-500">➔</span>
            <span className="text-red-400 font-bold">CFC Pecah</span>
            <span className="text-slate-500">➔</span>
            <span className="text-yellow-400 font-bold">O₃ Ozon Rusak</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">Dampak Global: Kenaikan kanker kulit & katarak akibat paparan sinar UV-B.</p>
        </div>
      )
    },
    "Transportasi Komuter": {
      title: "Transportasi Komuter Perkotaan",
      icon: "🏭",
      desc: "Pergerakan massal ratusan ribu kendaraan pribadi berbahan bakar minyak di kawasan megapolitan pada jam sibuk (rush hour). Karakteristik utamanya adalah lonjakan emisi harian berkala pada pagi dan sore hari.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-red-400 uppercase tracking-wider text-[9px]">Fluktuasi Emisi Harian Perkotaan:</p>
          <div className="flex gap-1 items-end h-12 bg-slate-900/60 p-1 rounded border border-slate-800">
            <div className="flex-1 bg-slate-800 h-[20%] rounded-sm" />
            <div className="flex-1 bg-rose-500 h-[90%] rounded-sm flex items-center justify-center"><span className="text-[6px] text-white rotate-90">Puncak</span></div>
            <div className="flex-1 bg-slate-800 h-[40%] rounded-sm" />
            <div className="flex-1 bg-rose-500 h-[100%] rounded-sm flex items-center justify-center"><span className="text-[6px] text-white rotate-90">Puncak</span></div>
            <div className="flex-1 bg-slate-800 h-[50%] rounded-sm" />
          </div>
          <div className="flex justify-between text-[8px] text-slate-500">
            <span>04.00</span>
            <span>08.00 (Kerja)</span>
            <span>12.00</span>
            <span>17.00 (Pulang)</span>
            <span>21.00</span>
          </div>
        </div>
      )
    },
    "Kebakaran Hutan Gambut": {
      title: "Kebakaran Hutan & Lahan Gambut",
      icon: "🔥",
      desc: "Pembakaran tak terkendali pada ekosistem lahan basah gambut kering akibat musim kemarau atau pembukaan lahan ilegal. Api dapat merambat lambat di bawah tanah sedalam beberapa meter dan melepas asap pekat (PM10) yang masif selama berbulan-bulan.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-amber-500 uppercase tracking-wider text-[9px]">Karakteristik Pembakaran Gambut:</p>
          <div className="p-2 bg-slate-900/50 rounded border border-slate-800 space-y-1.5 text-[9px]">
            <div className="flex justify-between">
              <span className="text-amber-400">Asap Peatland:</span>
              <span className="text-slate-300">10x Lebih Pekat dari Kayu Biasa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400">Merambat:</span>
              <span className="text-slate-300">Bawah Tanah (Tanpa Oksigen Bebas)</span>
            </div>
          </div>
        </div>
      )
    },
    "Cerobong Industri / PLTU": {
      title: "Cerobong Industri & PLTU Batubara",
      icon: "🏢",
      desc: "Emisi gas konstan dalam volume raksasa dari pembangkit listrik tenaga uap dan zona pabrik manufaktur berat. Tanpa penyaring cerobong, industri melepaskan senyawa sulfur oksida, merkuri logam berat, dan jelaga hitam.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-cyan-400 uppercase tracking-wider text-[9px]">Sebaran Polusi Cerobong Tinggi:</p>
          <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-[9px] space-y-1">
            <p className="text-slate-400">📌 Pola Emisi: Konstan 24 Jam Nonstop</p>
            <p className="text-slate-400">📌 Jarak Sebar: Mengikuti Arah Angin (Mencapai 50km+)</p>
            <p className="text-slate-400">📌 Prekursor: Hujan Asam Regional</p>
          </div>
        </div>
      )
    },
    "Kebocoran AC Lama": {
      title: "Kebocoran AC Lama & Kulkas",
      icon: "⚙️",
      desc: "Kegagalan pemeliharaan unit pengkondisi udara (AC) jadul yang masih menggunakan cairan refrigeran R-22 atau CFC Freon. Kebocoran gas terjadi akibat korosi mikro pada sambungan pipa evaporasi.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-purple-400 uppercase tracking-wider text-[9px]">Sumber Kerusakan Freon:</p>
          <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-[9px] space-y-1">
            <p>1. Pipa Tembaga AC Berkarat &amp; Retak</p>
            <p>2. Pengisian Refrigeran Non-Sertifikasi</p>
            <p>3. Pembuangan AC Bekas Sembarangan</p>
          </div>
        </div>
      )
    },
    "Bus Listrik & LEZ": {
      title: "Bus Listrik & Low Emission Zone (LEZ)",
      icon: "🌱",
      desc: "Kebijakan tata kota hijau: (1) Low Emission Zone (LEZ) adalah penutupan area perkotaan dari akses kendaraan pribadi berbahan bakar fosil tinggi. (2) Diimbangi penyediaan Bus Listrik gratis beremisi nol untuk mobilitas publik.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-emerald-400 uppercase tracking-wider text-[9px]">Efektivitas Reduksi Polutan:</p>
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between text-[9px]">
              <span>Kadar PM2.5 di Pusat Kota:</span>
              <span className="text-emerald-400 font-mono">-65%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[65%]" />
            </div>
            <div className="flex justify-between text-[9px]">
              <span>Polusi Suara:</span>
              <span className="text-emerald-400 font-mono">-40%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[40%]" />
            </div>
          </div>
        </div>
      )
    },
    "Sekat Kanal Gambut": {
      title: "Restorasi Gambut: Sekat Kanal (Canal Blocking)",
      icon: "🌱",
      desc: "Metode rewetting (pembasahan kembali) lahan gambut dengan membangun sekat bendungan kayu/tanah di parit kanal drainase. Hal ini menghentikan keluarnya air, sehingga tinggi muka air tanah gambut naik kembali untuk menjaga kelengasan tanah agar tidak rentan terbakar.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-blue-400 uppercase tracking-wider text-[9px]">Skema Bendungan Penjaga Air:</p>
          <div className="border border-slate-800 rounded bg-slate-900/60 p-2 text-[9px] leading-relaxed space-y-1">
            <p className="text-blue-300 font-black">💧 Kanal Disekat ➔ Air Tertahan ➔ Gambut Basah Kembali</p>
            <p className="text-slate-400">Mencegah api merambat di bawah permukaan serasah kering selama kemarau panjang.</p>
          </div>
        </div>
      )
    },
    "Teknologi FGD & SCR": {
      title: "Sistem Filtrasi Industri FGD & SCR",
      icon: "🌱",
      desc: "(1) FGD (Flue Gas Desulfurization) adalah instalasi penyerap sulfur menggunakan semprotan kapur alkalin cair untuk mengubah SO₂ menjadi gipsum padat aman. (2) SCR (Selective Catalytic Reduction) mereaksikan NOx dari cerobong dengan amonia di atas katalis logam mulia untuk diubah menjadi nitrogen bebas alami.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-yellow-400 uppercase tracking-wider text-[9px]">Persentase Efisiensi Penyaringan:</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]">
              <span>Reduksi Gas SO₂ (FGD)</span>
              <span className="text-yellow-400 font-mono">95%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full w-[95%]" />
            </div>
            <div className="flex justify-between text-[9px]">
              <span>Reduksi Gas NOx (SCR)</span>
              <span className="text-yellow-400 font-mono">90%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[90%]" />
            </div>
          </div>
        </div>
      )
    },
    "Saringan Kain Katun": {
      title: "Saringan Kain Katun Sederhana",
      icon: "🌱",
      desc: "Metode penyaringan debu fisik yang menggunakan lapisan kain tenun katun biasa. Hanya efektif menyaring serbuk sari, abu kasar kering, atau partikel tanah makro (>50 mikrometer). Tidak mampu menyaring molekul gas atau partikulat nano PM2.5.",
      schema: (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-2 font-bold text-slate-300">
          <p className="text-slate-400 uppercase tracking-wider text-[9px]">Evaluasi Kinerja Filtrasi:</p>
          <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-[9px] space-y-1.5">
            <div className="flex justify-between">
              <span>Debu Kasar:</span>
              <span className="text-emerald-400">Efektif (80%)</span>
            </div>
            <div className="flex justify-between">
              <span>Polutan Gas (SO₂/NO₂):</span>
              <span className="text-rose-400 font-black">Gagal (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>PM2.5 / PM10:</span>
              <span className="text-rose-400 font-black">Tidak Efektif (&lt;10%)</span>
            </div>
          </div>
        </div>
      )
    }
  };

  const level4Cases: LabCase[] = [
    {
      id: 'jakarta',
      title: 'Diagnosa Kasus A: Kabut Asap Perkotaan Metropolitan',
      region: 'DKI Jakarta & Sekitarnya',
      anomaly: 'Indeks PM2.5 menunjukkan lonjakan kritis (di atas 150 AQI) secara konsisten dari Senin hingga Jumat. Terjadi peningkatan pasien ISPA di puskesmas hingga 300%.',
      graphLabel: 'Konsentrasi PM2.5 Harian (Jam)',
      graphValues: [
        { label: '04.00 (Pagi)', val: 40 },
        { label: '08.00 (Puncak)', val: 165 },
        { label: '12.00 (Siang)', val: 80 },
        { label: '17.00 (Puncak)', val: 178 },
        { label: '21.00 (Malam)', val: 110 },
      ],
      question: 'C4 & C5 Analisis: Berdasarkan pola grafik harian di atas, kapankah puncak emisi terjadi, apa sumber utamanya, dan apa solusi kebijakan paling efisien untuk menanganinya?',
      options: [
        {
          text: 'Emisi memuncak pada jam komuter berangkat & pulang kerja (08:00 & 17:00). Sumber utama adalah sektor transportasi (knalpot komuter). Solusi terbaik adalah pengenalan Low Emission Zone (LEZ) dan perluasan transportasi umum berbasis listrik.',
          correct: true,
          feedback: 'Sangat Tepat! Pola lonjakan ganda bertepatan persis dengan jam pergi-pulang kantor menunjukkan transportasi komuter sebagai kontributor utama pencemaran kota.'
        },
        {
          text: 'Polutan merata di siang hari dari uap air tanah. Solusi terbaik adalah menyiram seluruh jalan protokol kota dengan air laut setiap jam siang.',
          correct: false,
          feedback: 'Kurang tepat. Grafik menunjukkan puncak tajam pada jam pergi/pulang kerja, bukan siang hari. Penyiraman jalan tidak mengatasi akar masalah emisi kendaraan.'
        },
        {
          text: 'Puncak polusi dipicu cerobong pabrik yang beroperasi jam 12 siang. Solusi terbaik adalah melarang penggunaan listrik AC di seluruh gedung kantor di siang hari.',
          correct: false,
          feedback: 'Salah analisis. Jam 12 siang justru menunjukkan nilai polusi yang lebih rendah dibanding jam komuter. Masalah utama bukan AC gedung kantor.'
        }
      ]
    },
    {
      id: 'forest_fire',
      title: 'Diagnosa Kasus B: Kabut Jingga Pekat Musiman',
      region: 'Kawasan Hutan Gambut, Kalimantan Tengah',
      anomaly: 'Indeks PM10 melampaui batas bahaya ekstrem (AQI 350+). Langit berubah warna menjadi jingga gelap di siang hari, menghentikan seluruh aktivitas sekolah dan penerbangan udara.',
      graphLabel: 'Indeks Kualitas Udara Musiman (Bulan)',
      graphValues: [
        { label: 'Jan-Apr', val: 35 },
        { label: 'Mei-Jun', val: 55 },
        { label: 'Jul-Agst', val: 120 },
        { label: 'Sept-Okt (Kemarau)', val: 380 },
        { label: 'Nov-Des', val: 45 },
      ],
      question: 'C4 & C5 Analisis: Hubungkan grafik musim kering ekstrem (Sept-Okt) dengan data lapangan. Apa penyebab utama dan tindakan evaluasi terbaik untuk mengatasinya?',
      options: [
        {
          text: 'Peningkatan dipicu polusi cerobong pabrik kelapa sawit musiman. Solusi terbaik adalah melarang operasional pabrik kelapa sawit selama 2 bulan di musim hujan.',
          correct: false,
          feedback: 'Kurang tepat. Grafik meningkat di kemarau (Sept-Okt), bukan musim hujan. Sumber utama kabut asap masif bukanlah cerobong pabrik biasa.'
        },
        {
          text: 'Pola musiman bertepatan dengan kemarau ekstrem dan pembukaan lahan dengan cara membakar hutan gambut. Evaluasi terbaik adalah sekat kanal gambut basah dan penegakan hukum pelarangan land clearing dengan pembakaran.',
          correct: true,
          feedback: 'Hebat! Lahan gambut yang kering sangat mudah terbakar dan melepaskan karbon dalam jumlah masif. Menjaga lahan gambut tetap basah melalui sekat kanal adalah metode preventif terbaik.'
        },
        {
          text: 'Peningkatan diakibatkan asap kompor dapur warga saat musim gugur daun kering. Solusi terbaik adalah melarang warga memasak menggunakan bahan bakar kayu.',
          correct: false,
          feedback: 'Salah analisis skala dampak. Pembakaran kayu memasak skala kecil tidak akan menaikkan PM10 hingga level ekstrem 380+ di seluruh provinsi.'
        }
      ]
    },
    {
      id: 'acid_rain',
      title: 'Diagnosa Kasus C: Hujan Asam & Kerusakan Ekosistem Danau',
      region: 'Sekitar Kompleks PLTU Batubara, Jawa Barat',
      anomaly: 'Warga melaporkan korosi dini pada seng atap rumah, dan air danau sekitar menunjukkan pH sangat asam (< 4.8), menyebabkan kematian massal bibit ikan budidaya.',
      graphLabel: 'Parameter Udara Ambien vs Baku Mutu (µg/m³)',
      graphValues: [
        { label: 'Gas CO', val: 30 },
        { label: 'Gas SO2 (Sulfur)', val: 240 },
        { label: 'Gas O3 (Ozon)', val: 45 },
        { label: 'Gas NO2', val: 180 },
      ],
      question: 'C4 & C5 Analisis: Berdasarkan visualisasi parameter udara ambien di atas, senyawa manakah yang melebihi batas aman dan memicu hujan asam, serta apa opsi mitigasi industri terbaik?',
      options: [
        {
          text: 'Tingginya konsentrasi CO memicu air danau berkarbonasi. Solusi terbaik adalah menyaring air danau dengan saringan pasir sederhana.',
          correct: false,
          feedback: 'Tidak tepat. Gas CO tidak memicu hujan asam (pH asam). Saringan pasir tidak dapat menaikkan pH asam kimia terlarut secara sistemik.'
        },
        {
          text: 'Kandungan Gas SO2 dan NO2 melampaui batas aman. Gas sulfur & nitrogen ini bereaksi dengan air di awan membentuk asam sulfat & nitrat. Solusi mitigasi terbaik adalah mewajibkan PLTU memasang teknologi Flue-Gas Desulfurization (FGD) dan Selective Catalytic Reduction (SCR).',
          correct: true,
          feedback: 'Jawaban Sempurna! FGD menyerap sulfur dioksida sebelum keluar dari cerobong, mencegahnya bersentuhan dengan uap awan pembentuk hujan asam.'
        },
        {
          text: 'Gas Ozon permukaan yang tinggi memicu penguapan air laut terlalu cepat. Solusi terbaik adalah menutup bendungan danau agar tidak terpapar matahari langsung.',
          correct: false,
          feedback: 'Salah interpretasi ilmiah. Ozon permukaan tidak berikatan dengan air membentuk hujan asam, dan menutup danau raksasa tidak memungkinkan.'
        }
      ]
    }
  ];

  const startLevel4 = () => {
    setLevel4Active(true);
    setLevel4Success(false);
    setLevel4ActiveCaseIdx(0);
    setLevel4Answers({});
    setLevel4Feedback(null);
    setLevel4SolvedCount(0);
    setLevel4SelectedPolutan(null);
    setLevel4SelectedSumber(null);
    setLevel4SelectedSolusi(null);
    playSound(440, 'sine', 0.12);
  };

  const handleNextLabCase = () => {
    setLevel4Feedback(null);
    setLevel4SelectedPolutan(null);
    setLevel4SelectedSumber(null);
    setLevel4SelectedSolusi(null);
    if (level4ActiveCaseIdx + 1 < level4Cases.length) {
      setLevel4ActiveCaseIdx(prev => prev + 1);
      playSound(550, 'sine', 0.08);
    } else {
      // Completed all cases
      playSound(900, 'sine', 0.15);
      setTimeout(() => {
        playSound(1200, 'sine', 0.3);
        setLevel4Success(true);
        setLevel4Active(false);
        saveClearedLevel(4);
      }, 500);
    }
  };

  const handleExecuteLabAnalysis = () => {
    const currentCase = level4Cases[level4ActiveCaseIdx];
    
    // Get targets
    let targetPolutan = '';
    let targetSumber = '';
    let targetSolusi = '';
    let explanation = '';
    
    if (currentCase.id === 'jakarta') {
      targetPolutan = 'PM2.5';
      targetSumber = 'Transportasi Komuter';
      targetSolusi = 'Bus Listrik & LEZ';
      explanation = 'Pola lonjakan ganda bertepatan persis dengan jam pergi-pulang kantor membuktikan sektor transportasi komuter sebagai kontributor utama PM2.5.';
    } else if (currentCase.id === 'forest_fire') {
      targetPolutan = 'PM10';
      targetSumber = 'Kebakaran Hutan Gambut';
      targetSolusi = 'Sekat Kanal Gambut';
      explanation = 'Lahan gambut kering sangat mudah terbakar melepas PM10 skala raksasa di kemarau. Pembasahan kanal gambut mencegah kebakaran menyebar.';
    } else {
      targetPolutan = 'SO2 & NO2';
      targetSumber = 'Cerobong Industri / PLTU';
      targetSolusi = 'Teknologi FGD & SCR';
      explanation = 'Belerang dan nitrogen industri berikatan dengan awan membentuk hujan asam korosif. FGD menyaring SO2 sebelum dilepaskan cerobong.';
    }

    if (!level4SelectedPolutan || !level4SelectedSumber || !level4SelectedSolusi) {
      playSound(150, 'sine', 0.15);
      setLevel4Feedback("Harap isi seluruh 3 slot analisis laboratorium sebelum menjalankan diagnosis!");
      return;
    }

    if (
      level4SelectedPolutan === targetPolutan &&
      level4SelectedSumber === targetSumber &&
      level4SelectedSolusi === targetSolusi
    ) {
      playSound(880, 'sine', 0.15);
      setTimeout(() => playSound(950, 'sine', 0.2), 150);
      setLevel4Feedback(`💡 Analisis Sukses! Hipotesis Anda 100% akurat. Penjelasan Ilmiah: ${explanation}`);
      setLevel4Answers(prev => ({ ...prev, [currentCase.id]: 0 })); // 0 represents solved
      setLevel4SolvedCount(prev => prev + 1);
    } else {
      playSound(180, 'sawtooth', 0.35);
      
      // Give targeted clue
      let clues = [];
      if (level4SelectedPolutan !== targetPolutan) clues.push("Zat Polutan");
      if (level4SelectedSumber !== targetSumber) clues.push("Sumber Emisi");
      if (level4SelectedSolusi !== targetSolusi) clues.push("Solusi Hijau");
      
      setLevel4Feedback(`❌ Diagnosa Gagal! Ada ketidakcocokan parameter pada: ${clues.join(", ")}. Teliti grafik dan indikator lalu pasang ulang kartu analisis!`);
    }
  };


  // ==========================================
  // LEVEL 5: RAJA POLUSI (BOSS BATTLE)
  // ==========================================
  const [level5Active, setLevel5Active] = useState(false);
  const [level5BossHP, setLevel5BossHP] = useState(500);
  const [level5PlayerHP, setLevel5PlayerHP] = useState(100);
  const [level5QIdx, setLevel5QIdx] = useState(0);
  const [level5Logs, setLevel5Logs] = useState<string[]>(['Raja Polusi menantang Anda! Jawab soal dengan benar untuk merusak pertahanannya.']);
  const [level5Success, setLevel5Success] = useState(false);
  const [level5GameOver, setLevel5GameOver] = useState(false);
  const [level5Shaking, setLevel5Shaking] = useState(false);
  const [level5PlayerFlash, setLevel5PlayerFlash] = useState(false);

  interface BossQuestion {
    q: string;
    options: string[];
    correct: number;
    dmg: number;
    attackName: string;
    explanation: string;
  }

  const level5Questions: BossQuestion[] = [
    {
      q: 'Mengapa polutan sekunder seperti Ozon Permukaan (O3) seringkali lebih berbahaya bagi paru-paru dibanding gas CO?',
      options: [
        { text: 'A. Karena Ozon terbentuk langsung dari knalpot mobil tanpa memerlukan bantuan sinar matahari.', correct: false },
        { text: 'B. Karena Ozon permukaan bersifat oksidator kuat yang langsung mengiritasi serta merusak jaringan mukosa paru-paru secara permanen.', correct: true },
        { text: 'C. Karena Ozon permukaan berbau wangi kelapa sehingga dihirup secara berlebihan oleh warga.', correct: false },
        { text: 'D. Karena Ozon menyatu dengan nitrogen di dalam sel darah merah kita.', correct: false }
      ].map(o => o.text),
      correct: 1,
      dmg: 125,
      attackName: 'Sinar Ultraviolet Pembasmi Ozon!',
      explanation: 'Ozon permukaan (polutan sekunder) adalah zat korosif yang merusak paru-paru secara langsung melalui proses oksidasi sel.'
    },
    {
      q: 'Ketika sulfur dioksida (SO2) bereaksi dengan uap air (H2O) di atmosfer dengan bantuan katalis logam, produk akhir yang merusak besi jembatan adalah...',
      options: [
        { text: 'A. Gas Oksigen Murni bebas racun', correct: false },
        { text: 'B. Asam Sulfat (H2SO4) pencetus hujan asam', correct: true },
        { text: 'C. Natrium Klorida padat', correct: false },
        { text: 'D. Gas Helium balon udara', correct: false }
      ].map(o => o.text),
      correct: 1,
      dmg: 125,
      attackName: 'Tembakan Penetral Asam Sulfat!',
      explanation: 'Reaksi belerang oksida dengan air membentuk asam sulfat, senyawa kuat dengan pH rendah perusak logam.'
    },
    {
      q: 'Manakah dari skenario berikut yang merepresentasikan efek "Suhu Inversi" (Temperature Inversion) terhadap kualitas udara kota?',
      options: [
        { text: 'A. Udara hangat di atas menahan udara dingin kotor di bawah, memerangkap polusi pekat dekat permukaan tanah.', correct: true },
        { text: 'B. Udara dingin naik cepat membawa seluruh asap pabrik terbang ke luar angkasa bebas hambatan.', correct: false },
        { text: 'C. Suhu udara yang stabil membuat angin bertiup kencang ke arah lautan lepas.', correct: false },
        { text: 'D. Hujan lebat turun membersihkan seluruh partikel debu mikro dalam 5 menit.', correct: false }
      ].map(o => o.text),
      correct: 0,
      dmg: 125,
      attackName: 'Booster Angin Konveksi Udara!',
      explanation: 'Inversi suhu bertindak seperti penutup cangkir, menahan polutan di permukaan tanah karena tidak ada sirkulasi udara vertikal.'
    },
    {
      q: 'Apa peran krusial konverter katalitik (catalytic converter) yang wajib dipasang di saluran knalpot mobil modern?',
      options: [
        { text: 'A. Mengubah gas beracun CO dan NOx menjadi gas yang lebih aman seperti CO2 dan N2.', correct: true },
        { text: 'B. Menyaring debu kasar PM10 agar suara knalpot terdengar sangat bising.', correct: false },
        { text: 'C. Mengurangi konsumsi bahan bakar fosil hingga 95%.', correct: false },
        { text: 'D. Mendinginkan suhu mesin agar AC mobil bekerja lebih dingin.', correct: false }
      ].map(o => o.text),
      correct: 0,
      dmg: 125,
      attackName: 'Rudal Katalitik Pembersih Gas!',
      explanation: 'Konverter katalitik menggunakan logam mulia (platina/paladium) untuk mereduksi gas beracun hasil pembakaran kendaraan.'
    }
  ];

  const startLevel5 = () => {
    setLevel5Active(true);
    setLevel5BossHP(500);
    setLevel5PlayerHP(100);
    setLevel5QIdx(0);
    setLevel5Logs(['Raja Polusi menantang Anda! Jawab soal dengan benar untuk menghancurkan awan racunnya!']);
    setLevel5Success(false);
    setLevel5GameOver(false);
    setLevel5Shaking(false);
    setLevel5PlayerFlash(false);
    playSound(300, 'sawtooth', 0.2);
  };

  const handleAnswerBossQuestion = (optIdx: number) => {
    if (level5Success || level5GameOver) return;
    const currentQ = level5Questions[level5QIdx];
    
    if (optIdx === currentQ.correct) {
      // Correct! Deal Damage to Boss
      playSound(880, 'sine', 0.12);
      setLevel5Shaking(true);
      setTimeout(() => setLevel5Shaking(false), 500);

      const nextHP = Math.max(0, level5BossHP - currentQ.dmg);
      setLevel5BossHP(nextHP);
      
      const logMsg = `BENAR! Anda melancarkan "${currentQ.attackName}" dan memberikan ${currentQ.dmg} DMG ke Raja Polusi!`;
      setLevel5Logs(prev => [logMsg, ...prev]);

      if (nextHP <= 0) {
        // Boss Defeated!
        playSound(950, 'sine', 0.15);
        setTimeout(() => {
          playSound(1300, 'sine', 0.4);
          setLevel5Success(true);
          setLevel5Active(false);
          saveClearedLevel(5);
        }, 800);
      } else {
        // Move to next question or loop
        setLevel5QIdx(prev => (prev + 1) % level5Questions.length);
      }
    } else {
      // Wrong! Player Takes Damage
      playSound(180, 'sawtooth', 0.3);
      setLevel5PlayerFlash(true);
      setTimeout(() => setLevel5PlayerFlash(false), 500);

      const nextPlayerHP = Math.max(0, level5PlayerHP - 25);
      setLevel5PlayerHP(nextPlayerHP);

      const logMsg = `SALAH! Raja Polusi menyemburkan gas beracun pekat! Anda menerima 25 DMG.`;
      setLevel5Logs(prev => [logMsg, ...prev]);

      if (nextPlayerHP <= 0) {
        setLevel5GameOver(true);
        setLevel5Active(false);
        playSound(120, 'sawtooth', 0.6);
      } else {
        // Move on anyway to keep game interactive
        setLevel5QIdx(prev => (prev + 1) % level5Questions.length);
      }
    }
  };


  // ==========================================
  // VIEW RENDER LOGIC
  // ==========================================
  return (
    <div id="game-panel" className="max-w-4xl mx-auto py-4 px-4 sm:px-6 relative z-10 animate-fade-in">
      
      {/* Educational Info Modal Popup for Level 4 */}
      {infoPopupData && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border text-left ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{infoPopupData.icon}</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  {infoPopupData.title}
                </h3>
              </div>
              <button 
                onClick={() => { audio.playSfx('click'); setInfoPopupData(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800/40 hover:bg-slate-800 border border-slate-700/20 text-slate-400 hover:text-white cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  📚 Penjelasan Ilmiah:
                </h4>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {infoPopupData.desc}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  📊 Visualisasi Infografis:
                </h4>
                {infoPopupData.schema}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-700/10 flex justify-end">
              <button
                onClick={() => { audio.playSfx('click'); setInfoPopupData(null); }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
              >
                Tutup Jendela ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro Modal (Tujuan, Cara Bermain, & Mulai) */}
      {activeIntroLevel !== null && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border text-left ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-700/10 mb-5">
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Tantangan Interaktif</span>
                <h3 className="text-xl font-black flex items-center gap-2 mt-0.5">
                  {activeIntroLevel === 1 && <>🔍 Level 1: Analisis Sektor Emisi</>}
                  {activeIntroLevel === 2 && <>🧹 Level 2: Penangkap Gas Polutan</>}
                  {activeIntroLevel === 3 && <>👔 Level 3: Simulasi Kebijakan Hijau</>}
                  {activeIntroLevel === 4 && <>🧪 Level 4: Lab Diagnosa Atmosfer</>}
                  {activeIntroLevel === 5 && <>👑 Level 5: Boss Fight - Raja Polusi</>}
                </h3>
              </div>
              <button 
                onClick={() => { audio.playSfx('click'); setActiveIntroLevel(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800/40 hover:bg-slate-800 border border-slate-700/20 text-slate-400 hover:text-white cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content per level */}
            <div className="space-y-5">
              {/* TUJUAN UTAMA */}
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  🎯 Tujuan Utama Misi:
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeIntroLevel === 1 && 'Gunakan keahlian observasi Anda untuk menganalisis minimal 3 aktivitas pencemaran udara pada infografis metropolitan dan selesaikan kuis sains atmosfer.'}
                  {activeIntroLevel === 2 && 'Filter dan tangkap molekul gas berbahaya (CO2, CO, SO2, NO2) dari atmosfer langit sebelum meracuni warga sipil di bawah.'}
                  {activeIntroLevel === 3 && 'Tentukan 5 kebijakan hijau terbaik kota dan amati dampaknya secara langsung pada miniatur kota metropolitan.'}
                  {activeIntroLevel === 4 && 'Pecahkan 3 kasus anomali kualitas udara nasional melalui analisis grafik data (C4) dan pilih kebijakan mitigasi industri terbaik (C5).'}
                  {activeIntroLevel === 5 && 'Gunakan pemahaman sains atmosfer tinggi (C6) Anda untuk menangkis asap beracun Raja Polusi dan memulihkan langit cerah abadi.'}
                </p>
              </div>
 
               {/* CARA BERMAIN */}
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  🕹️ Panduan Cara Bermain:
                </h4>
                <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  {activeIntroLevel === 1 && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Amati gambar infografis statis <strong className="text-amber-400 font-extrabold">Sumber Polusi Udara Metropolitan</strong> yang disediakan.</li>
                      <li>Ketik minimal <strong className="text-amber-400 font-extrabold">3 temuan aktivitas pencemar</strong> pada Kotak Analisis Detektif (seperti: "pabrik", "kemacetan", "pembakaran sampah", "konstruksi", "rumah tangga") atau ketuk tag bantuan.</li>
                      <li>Setelah berhasil mengobservasi minimal 3 emisi berbeda, Anda akan membuka <strong className="text-emerald-400 font-extrabold">Kuis Sains Atmosfer</strong>.</li>
                      <li>Jawab 3 pertanyaan kuis pemahaman dengan benar untuk memenangkan tantangan Level 1!</li>
                    </ul>
                  )}
                  {activeIntroLevel === 2 && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Gunakan tombol <strong className="text-sky-400 font-extrabold">Arrow Kiri / Kanan</strong> pada keyboard, atau ketuk tombol kontrol layar di bawah.</li>
                      <li>Gerakkan <strong className="text-sky-400 font-extrabold">Filter Udara Magnetik</strong> ke kiri dan kanan untuk menyaring gas yang jatuh.</li>
                      <li>Tangkap minimal <strong className="text-emerald-400 font-extrabold">15 partikel gas berbahaya</strong> untuk menyelesaikan level.</li>
                      <li>Hati-hati! Setiap partikel yang lolos akan mengurangi HP kota sebesar <strong className="text-rose-500 font-extrabold">15 HP</strong>. Jangan biarkan HP menyentuh 0!</li>
                    </ul>
                  )}
                  {activeIntroLevel === 3 && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Amati kanvas <strong className="text-purple-400 font-extrabold">Lalu Lintas Metropolitan</strong> yang awalnya polos.</li>
                      <li>Setiap hari (total 5 hari), Anda akan disajikan satu kasus dilema polusi perkotaan yang mendesak.</li>
                      <li>Pilih satu di antara 3 opsi kebijakan hijau terbaik (pilihan ganda) yang akan langsung diterapkan secara visual ke dalam kota.</li>
                      <li>Pertahankan ketiga indikator (Kesehatan, Lingkungan, Ekonomi) tetap di atas tingkat kritis <strong className="text-rose-500 font-extrabold">25%</strong> hingga hari ke-5 berakhir untuk memenangkan Level 3!</li>
                    </ul>
                  )}
                  {activeIntroLevel === 4 && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Amati grafik data indikator udara (seperti grafik jam komuter PM2.5, musim kemarau PM10, atau parameter SO2/NO2).</li>
                      <li>Pecahkan teka-teki taksonomi C4-C5 dengan memilih jawaban analisis ilmiah yang paling presisi.</li>
                      <li>Pilihan yang benar akan membuka umpan balik edukatif laboratorium yang berharga. Selesaikan semua 3 kasus untuk menang!</li>
                    </ul>
                  )}
                  {activeIntroLevel === 5 && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Raja Polusi memiliki pertahanan <strong className="text-rose-500 font-extrabold">500 HP</strong>.</li>
                      <li>Jawab soal-soal taksonomi sains atmosfer tingkat tinggi untuk meluncurkan serangan teknologi ekologi berkekuatan <strong className="text-emerald-400 font-extrabold">125 DMG</strong>.</li>
                      <li>Setiap jawaban yang keliru akan memicu balasan asap pekat dari bos yang mengurangi HP Anda sebesar <strong className="text-rose-500 font-extrabold">25 HP</strong>.</li>
                    </ul>
                  )}
                </div>
              </div>

              {/* ESTIMASI HADIAH */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-700/10 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400">🎁 Estimasi Reward:</span>
                <span className="text-amber-500 font-black">
                  {activeIntroLevel === 1 && '🪙 +30 Eco-Points | 🔥 +50 XP'}
                  {activeIntroLevel === 2 && '🪙 +60 Eco-Points | 🔥 +100 XP'}
                  {activeIntroLevel === 3 && '🪙 +90 Eco-Points | 🔥 +150 XP'}
                  {activeIntroLevel === 4 && '🪙 +120 Eco-Points | 🔥 +200 XP'}
                  {activeIntroLevel === 5 && '🪙 +150 Eco-Points | 🔥 +250 XP'}
                </span>
              </div>
            </div>

            {/* START BUTTON */}
            <div className="mt-6 pt-4 border-t border-slate-700/10 flex gap-3">
              <button
                onClick={() => { audio.playSfx('click'); setActiveIntroLevel(null); }}
                className="flex-1 py-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 border border-slate-700/20 text-slate-400 hover:text-white cursor-pointer transition-all text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  audio.playSfx('click');
                  const levelToStart = activeIntroLevel;
                  setActiveIntroLevel(null);
                  setCurrentLevel(levelToStart);
                  
                  // Trigger level specific start routines
                  if (levelToStart === 1) {
                    handleResetLevel1();
                  } else if (levelToStart === 2) {
                    startLevel2();
                  } else if (levelToStart === 3) {
                    startLevel3();
                  } else if (levelToStart === 4) {
                    startLevel4();
                  } else if (levelToStart === 5) {
                    startLevel5();
                  }
                }}
                className="flex-[2] py-3.5 rounded-xl font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all cursor-pointer text-xs text-center"
              >
                Mulai Misi Sekarang ➔
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={currentLevel !== null ? () => { audio.playSfx('click'); setCurrentLevel(null); } : () => { audio.playSfx('click'); onBack(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
            darkMode
              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-slate-300 hover:text-white'
              : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> {currentLevel !== null ? 'Kembali ke Pilih Level' : 'Kembali ke Menu Utama'}
        </button>

        {/* Cheat Code Area */}
        {currentLevel === null && (
          <button
            onClick={handleCheatUnlockAll}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 transition-all cursor-pointer"
          >
            🔓 Cheat: Buka Semua Level
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            darkMode ? 'bg-slate-800/50 hover:bg-slate-850 border-slate-700/40 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. LEVEL SELECTOR SCREEN */}
      {/* ========================================================= */}
      {currentLevel === null && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              🎮 Petualangan Edukasi: Pelindung Udara
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto leading-relaxed`}>
              Jelajahi level interaktif untuk menguasai ilmu pencemaran udara (C2-C5) dan kalahkan Raja Polusi demi memulihkan keasrian kota kita!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* LEVEL 1 CARD */}
            <div 
              onClick={() => {
                if (unlockedLevels.includes(1)) {
                  playSound(440);
                  setActiveIntroLevel(1);
                } else {
                  playSound(150, 'sawtooth', 0.2);
                  onAddNotification('Tingkat ini belum terbuka!', 'info');
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between h-[300px] overflow-hidden ${
                unlockedLevels.includes(1)
                  ? darkMode 
                    ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40 shadow-xl cursor-pointer' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-500/40 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-90'
              }`}
            >
              {!unlockedLevels.includes(1) && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-xl text-xl">
                    🔒
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Level 1</span>
                </div>
                
                {/* Visual Illustration Box */}
                <div className={`w-full h-28 rounded-xl relative mb-3 overflow-hidden border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center ${
                  darkMode ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-800 border-amber-900/40' : 'bg-gradient-to-b from-amber-200 via-amber-100 to-amber-50/50 border-amber-300/40'
                }`}>
                  {/* Floating Magnifying Glass & Source Symbols */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 gap-2">
                    <span className="text-2xl animate-bounce">🔍</span>
                    <div className="flex flex-col text-[10px] font-bold gap-0.5 bg-slate-950/40 px-2 py-1 rounded-lg backdrop-blur-xs text-amber-400">
                      <span>🏭 Pabrik</span>
                      <span>🚗 Macet</span>
                      <span>🔥 Sampah</span>
                    </div>
                  </div>
                  {/* Decorative glowing circles */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-rose-500/15 rounded-full blur-xl animate-pulse"></div>
                </div>

                <h3 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Analisis Infografis Emisi
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Amati infografis detail kota untuk mengidentifikasi 3 sumber emisi (Pabrik, Kendaraan Padat, Pembakaran Sampah) beserta dampaknya.
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-bold text-amber-500">Observasi & Analisis (C1-C2)</span>
                <span className={`px-2.5 py-1 text-[9px] rounded-md font-bold uppercase tracking-wider ${
                  unlockedLevels.includes(1) ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {unlockedLevels.includes(1) ? 'Mainkan' : 'Terkunci'}
                </span>
              </div>
            </div>

            {/* LEVEL 2 CARD */}
            <div 
              onClick={() => {
                if (unlockedLevels.includes(2)) {
                  playSound(440);
                  setActiveIntroLevel(2);
                } else {
                  playSound(150, 'sawtooth', 0.2);
                  onAddNotification('Tingkat ini belum terbuka!', 'info');
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between h-[300px] overflow-hidden ${
                unlockedLevels.includes(2)
                  ? darkMode 
                    ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-sky-500/40 shadow-xl cursor-pointer' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-500/40 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-90'
              }`}
            >
              {!unlockedLevels.includes(2) && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-xl text-xl">
                    🔒
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-sky-500 uppercase">Level 2</span>
                </div>
                
                {/* Visual Illustration Box */}
                <div className={`w-full h-28 rounded-xl relative mb-3 overflow-hidden border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] ${
                  darkMode ? 'bg-gradient-to-b from-blue-950 via-slate-900 to-slate-800 border-blue-900/40' : 'bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 border-sky-300/60'
                }`}>
                  {/* Basket at bottom */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-8 z-20">
                    <div className="w-full h-3 border-2 border-amber-700 rounded-full bg-amber-600/80 shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-20 relative"></div>
                    <div className="w-12 h-6 bg-amber-800/90 border-x border-b border-amber-900 rounded-b-xl mx-auto -mt-1 backdrop-blur-[1px] flex flex-col gap-0.5 pt-1 overflow-hidden shadow-md">
                       <div className="w-full h-px bg-amber-950/50"></div>
                       <div className="w-full h-px bg-amber-950/50"></div>
                       <div className="w-full h-px bg-amber-950/50"></div>
                    </div>
                  </div>

                  {/* Falling Objects */}
                  <div className="absolute top-2 left-4 z-10 animate-[floatY_3s_ease-in-out_infinite]">
                    <div className="w-8 h-6 bg-gradient-to-br from-purple-500 to-purple-800 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)] border border-purple-400 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-white drop-shadow-md">CO₂</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-6 z-10 animate-[floatY_4s_ease-in-out_infinite]">
                    <div className="w-7 h-5 bg-gradient-to-br from-slate-500 to-slate-800 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)] border border-slate-400 flex items-center justify-center">
                      <span className="text-[6px] font-bold text-white drop-shadow-md">SO₂</span>
                    </div>
                  </div>
                  <div className="absolute top-10 left-12 z-10 animate-[floatY_3.5s_ease-in-out_infinite]">
                    <div className="w-6 h-6 bg-gradient-to-br from-sky-300 to-blue-500 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.2)] border border-sky-200 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-[7px] font-black text-white drop-shadow-md">O₂</span>
                    </div>
                  </div>
                  <div className="absolute top-8 right-14 z-10 animate-[floatY_2.5s_ease-in-out_infinite]">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-tr-full rounded-br-full rounded-bl-full rotate-45 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)] border border-emerald-300 flex items-center justify-center">
                      <div className="w-4 h-[1.5px] bg-emerald-800/60 -rotate-45"></div>
                    </div>
                  </div>
                </div>

                <h3 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Menangkap Polutan
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Gerakkan penyaring di bawah untuk menangkap CO2, CO, SO2, dan NO2 yang jatuh berguguran.
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-bold text-sky-500">Kecepatan & Refleks</span>
                <span className={`px-2.5 py-1 text-[9px] rounded-md font-bold uppercase tracking-wider ${
                  unlockedLevels.includes(2) ? 'bg-sky-500/10 text-sky-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {unlockedLevels.includes(2) ? 'Mainkan' : 'Terkunci'}
                </span>
              </div>
            </div>

            {/* LEVEL 3 CARD */}
            <div 
              onClick={() => {
                if (unlockedLevels.includes(3)) {
                  playSound(440);
                  setActiveIntroLevel(3);
                } else {
                  playSound(150, 'sawtooth', 0.2);
                  onAddNotification('Selesaikan Level 2 terlebih dahulu!', 'info');
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between h-[300px] overflow-hidden ${
                unlockedLevels.includes(3)
                  ? darkMode 
                    ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-purple-500/40 shadow-xl cursor-pointer' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-500/40 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-90'
              }`}
            >
              {!unlockedLevels.includes(3) && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-xl text-xl">
                    🔒
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-purple-500 uppercase">Level 3</span>
                </div>
                
                {/* Visual Illustration Box */}
                <div className={`w-full h-28 rounded-xl relative mb-3 overflow-hidden border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] flex flex-col justify-between p-2 ${
                  darkMode ? 'bg-gradient-to-b from-indigo-950 to-slate-900 border-indigo-900/40' : 'bg-gradient-to-b from-indigo-200 to-indigo-50 border-indigo-300/50'
                }`}>
                  {/* City Background Silhouette */}
                  <div className="absolute bottom-0 w-full flex items-end justify-center px-1 opacity-20 pointer-events-none">
                    <div className="w-8 h-12 bg-slate-500 rounded-t-sm"></div>
                    <div className="w-10 h-16 bg-slate-600 rounded-t-sm"></div>
                    <div className="w-12 h-10 bg-slate-500 rounded-t-sm"></div>
                  </div>

                  {/* Question Bubble */}
                  <div className={`w-[90%] mx-auto rounded-lg shadow-md py-1.5 px-2 text-center z-10 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <span className={`text-[6px] leading-tight font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      Kemacetan meningkat, apa yang akan kamu lakukan?
                    </span>
                  </div>
                  
                  {/* Options Grid */}
                  <div className="flex justify-between gap-1.5 mt-1 z-10 w-full pb-0.5">
                    {/* A - Bus */}
                    <div className="flex-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-md border-b-2 border-emerald-700 shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex flex-col items-center py-1 relative overflow-hidden">
                      <div className="w-3.5 h-3.5 bg-emerald-700/50 rounded-full flex items-center justify-center text-[5px] text-white font-black mb-1 shadow-inner">A</div>
                      <div className="w-6 h-3 bg-gradient-to-br from-teal-700 to-teal-900 rounded-sm relative flex justify-center items-center shadow-sm border border-teal-600">
                        <div className="w-4 h-1.5 bg-cyan-200/60 rounded-[1px]"></div>
                        <div className="absolute -bottom-1 left-0.5 w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                        <div className="absolute -bottom-1 right-0.5 w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                      </div>
                    </div>
                    {/* B - Road */}
                    <div className="flex-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-md border-b-2 border-amber-700 shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex flex-col items-center py-1 relative overflow-hidden">
                      <div className="w-3.5 h-3.5 bg-amber-700/50 rounded-full flex items-center justify-center text-[5px] text-white font-black mb-1 shadow-inner">B</div>
                      <div className="w-5 h-5 bg-slate-800 rounded-sm relative overflow-hidden flex justify-center shadow-inner border border-slate-700 transform perspective-100 rotateX-12">
                        <div className="w-0.5 h-full border-l-[1.5px] border-dashed border-yellow-400/80"></div>
                      </div>
                    </div>
                    {/* C - Ignore (Person shrugging) */}
                    <div className="flex-1 bg-gradient-to-b from-rose-400 to-rose-600 rounded-md border-b-2 border-rose-700 shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex flex-col items-center py-1 relative overflow-hidden">
                      <div className="w-3.5 h-3.5 bg-rose-700/50 rounded-full flex items-center justify-center text-[5px] text-white font-black mb-1 shadow-inner">C</div>
                      <div className="w-3.5 h-3.5 bg-orange-200 rounded-full shadow-sm relative z-10 border border-orange-300">
                        {/* hair */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 rounded-t-full"></div>
                      </div>
                      <div className="w-5 h-2.5 bg-blue-600 rounded-t-sm -mt-0.5 shadow-sm border border-blue-700 flex justify-between px-0.5">
                        <div className="w-1 h-1.5 bg-orange-200 rounded-full -mt-0.5 -ml-1 transform -rotate-45"></div>
                        <div className="w-1 h-1.5 bg-orange-200 rounded-full -mt-0.5 -mr-1 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Kebijakan Kota Lestari
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Tentukan kebijakan harian dengan animasi transisi siang-malam untuk menjaga keseimbangan kota.
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-bold text-purple-500">Tata Kelola & Animasi</span>
                <span className={`px-2.5 py-1 text-[9px] rounded-md font-bold uppercase tracking-wider ${
                  unlockedLevels.includes(3) ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {unlockedLevels.includes(3) ? 'Mainkan' : 'Terkunci'}
                </span>
              </div>
            </div>

            {/* LEVEL 4 CARD */}
            <div 
              onClick={() => {
                if (unlockedLevels.includes(4)) {
                  playSound(440);
                  setActiveIntroLevel(4);
                } else {
                  playSound(150, 'sawtooth', 0.2);
                  onAddNotification('Selesaikan Level 3 terlebih dahulu!', 'info');
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between h-[300px] overflow-hidden ${
                unlockedLevels.includes(4)
                  ? darkMode 
                    ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-xl cursor-pointer' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-500/40 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-90'
              }`}
            >
              {!unlockedLevels.includes(4) && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-xl text-xl">
                    🔒
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Level 4</span>
                </div>
                
                {/* Visual Illustration Box */}
                <div className={`w-full h-28 rounded-xl relative mb-3 overflow-hidden border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] ${
                  darkMode ? 'bg-gradient-to-br from-teal-950 to-slate-900 border-teal-900/40' : 'bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 border-teal-300/50'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    {/* Lab Setup */}
                    <div className="relative flex items-end gap-3 mt-4">
                      {/* Test Tubes Rack */}
                      <div className="w-14 h-12 bg-slate-800/10 rounded-md border border-slate-700/20 backdrop-blur-sm flex items-end justify-around px-1 pb-1 shadow-sm">
                        <div className="w-2.5 h-8 bg-white/30 border border-white/50 rounded-b-full rounded-t-sm relative overflow-hidden flex items-end shadow-inner">
                          <div className="w-full h-5 bg-gradient-to-t from-rose-600 to-rose-400"></div>
                        </div>
                        <div className="w-2.5 h-9 bg-white/30 border border-white/50 rounded-b-full rounded-t-sm relative overflow-hidden flex items-end shadow-inner">
                          <div className="w-full h-7 bg-gradient-to-t from-amber-600 to-amber-400"></div>
                        </div>
                        <div className="w-2.5 h-7 bg-white/30 border border-white/50 rounded-b-full rounded-t-sm relative overflow-hidden flex items-end shadow-inner">
                          <div className="w-full h-4 bg-gradient-to-t from-emerald-600 to-emerald-400"></div>
                        </div>
                      </div>
                      
                      {/* Erlenmeyer Flask */}
                      <div className="flex flex-col items-center z-10 mb-1">
                        <div className="w-3 h-4 border-x-[1.5px] border-white/60 bg-white/20"></div>
                        <div className="w-12 h-12 rounded-b-xl rounded-t-[3px] border-[1.5px] border-white/60 bg-white/10 relative overflow-hidden flex items-end shadow-[inset_0_-2px_6px_rgba(255,255,255,0.4),0_4px_10px_rgba(16,185,129,0.2)]">
                           <div className="w-full h-7 bg-gradient-to-t from-teal-600 to-teal-400 relative animate-[pulse_2s_ease-in-out_infinite]">
                             <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
                             <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
                             <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/60"></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Grid/Graph background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30"></div>
                </div>

                <h3 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Lab Diagnosa Polusi
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Analis laporan anomali udara (C4) dan evaluasi kebijakan penyelesaian paling efisien (C5).
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-bold text-emerald-500">Kognitif: C4 - C5</span>
                <span className={`px-2.5 py-1 text-[9px] rounded-md font-bold uppercase tracking-wider ${
                  unlockedLevels.includes(4) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {unlockedLevels.includes(4) ? 'Mulai' : 'Terkunci'}
                </span>
              </div>
            </div>

            {/* LEVEL 5 CARD */}
            <div 
              onClick={() => {
                if (unlockedLevels.includes(5)) {
                  playSound(440);
                  setActiveIntroLevel(5);
                } else {
                  playSound(150, 'sawtooth', 0.2);
                  onAddNotification('Selesaikan Level 4 terlebih dahulu!', 'info');
                }
              }}
              className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between h-[300px] overflow-hidden ${
                unlockedLevels.includes(5)
                  ? darkMode 
                    ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-red-500/40 shadow-xl cursor-pointer' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-red-500/40 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-90'
              }`}
            >
              {!unlockedLevels.includes(5) && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-xl text-xl">
                    🔒
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">Level 5</span>
                </div>
                
                {/* Visual Illustration Box */}
                <div className={`w-full h-28 rounded-xl relative mb-3 overflow-hidden border shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] ${
                  darkMode ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-red-900/50' : 'bg-gradient-to-br from-indigo-900 via-slate-800 to-purple-900 border-red-800/50'
                }`}>
                  {/* Lightning Background */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 right-6 w-1.5 h-14 bg-gradient-to-b from-yellow-300 to-transparent rotate-[15deg] blur-[1px] opacity-70 animate-pulse"></div>
                    <div className="absolute top-2 left-8 w-1 h-12 bg-gradient-to-b from-yellow-300 to-transparent -rotate-12 blur-[1px] opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
                  </div>
                  
                  {/* Boss Fight Avatar */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    
                    <div className="relative w-20 h-14 flex items-center justify-center animate-[floatY_2.5s_ease-in-out_infinite]">
                      {/* Crown */}
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-5 bg-gradient-to-b from-yellow-300 to-amber-500 flex justify-between items-start border-b-2 border-amber-700 drop-shadow-md z-20" style={{ clipPath: 'polygon(0 0, 20% 100%, 80% 100%, 100% 0, 75% 50%, 50% 0, 25% 50%)'}}>
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mx-auto mt-1 shadow-sm border border-rose-600"></div>
                      </div>
                      
                      {/* Dark smog body (Claymation style) */}
                      <div className="absolute w-16 h-12 bg-gradient-to-br from-slate-700 to-slate-950 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.2)] z-10"></div>
                      <div className="absolute -left-2 top-1.5 w-10 h-10 bg-gradient-to-bl from-slate-700 to-slate-900 rounded-full shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1)] z-10"></div>
                      <div className="absolute -right-2 top-1.5 w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-[inset_-2px_2px_4px_rgba(0,0,0,0.2)] z-10"></div>
                      <div className="absolute -bottom-2 left-2 w-8 h-8 bg-gradient-to-t from-slate-950 to-slate-800 rounded-full z-10"></div>
                      <div className="absolute -bottom-2 right-2 w-8 h-8 bg-gradient-to-t from-slate-950 to-slate-800 rounded-full z-10"></div>
                      
                      {/* Face */}
                      <div className="absolute z-20 flex flex-col items-center mt-2 w-full">
                        {/* Angry Red Eyes */}
                        <div className="flex gap-2.5 justify-center w-full">
                          <div className="w-4 h-2.5 bg-gradient-to-b from-rose-500 to-red-600 rotate-12 shadow-[0_0_8px_rgba(244,63,94,0.9),inset_0_1px_1px_rgba(255,255,255,0.6)] rounded-sm border border-red-700 relative overflow-hidden">
                             <div className="absolute top-0 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                          </div>
                          <div className="w-4 h-2.5 bg-gradient-to-b from-rose-500 to-red-600 -rotate-12 shadow-[0_0_8px_rgba(244,63,94,0.9),inset_0_1px_1px_rgba(255,255,255,0.6)] rounded-sm border border-red-700 relative overflow-hidden">
                             <div className="absolute top-0 left-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                          </div>
                        </div>
                        {/* Fangs */}
                        <div className="flex gap-1 mt-1.5 bg-slate-950 px-1.5 rounded-full border border-slate-800 shadow-inner">
                          <div className="w-1.5 h-2 bg-white rounded-b-full"></div>
                          <div className="w-1 h-1 bg-white rounded-b-full"></div>
                          <div className="w-1.5 h-2 bg-white rounded-b-full"></div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                <h3 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Lawan Raja Polusi
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Pertempuran bos pamungkas! Jawab soal taksonomi tinggi untuk mengikis HP Raja Polusi.
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-bold text-red-500">Boss Fight & HP</span>
                <span className={`px-2.5 py-1 text-[9px] rounded-md font-bold uppercase tracking-wider ${
                  unlockedLevels.includes(5) ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {unlockedLevels.includes(5) ? 'Bertempur' : 'Terkunci'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 2. LEVEL 1 GAME SCREEN (INFOGRAFIS INTERAKTIF & KUIS) */}
      {/* ========================================================= */}
      {currentLevel === 1 && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Level 1: Detektif Sains</span>
            <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              🔍 Analisis Sektor Emisi Udara (C1-C2)
            </h2>
            <p className={`mt-2 text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto leading-relaxed`}>
              Pelajari 3 sektor emisi utama kota di bawah ini. Ketuk setiap sektor untuk menganalisis kandungannya, lalu selesaikan kuis pemahaman sains atmosfer.
            </p>

            {/* Global Exploration Progress Bar */}
            <div className="mt-4 max-w-md mx-auto bg-slate-950/20 rounded-full p-1.5 border border-slate-700/10 backdrop-blur-xs flex items-center justify-between px-4">
              <span className="text-[10px] font-bold text-slate-400">
                Materi Dipelajari: {Object.values(level1Explored).filter(Boolean).length} / 3 Sektor
              </span>
              <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden mx-3">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (Object.values(level1Explored).filter(Boolean).length / 3) * 100)}%` }}
                ></div>
              </div>
              {Object.values(level1Explored).filter(Boolean).length >= 3 ? (
                <span className="text-[10px] font-black text-emerald-400 animate-pulse">🌟 Siap Kuis!</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">Pelajari Infografis</span>
              )}
            </div>
          </div>

          {/* Interactive Screen Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: THE INTERACTIVE INFOGRAPHIC CONTAINER */}
            <div className="lg:col-span-7 flex flex-col gap-4 animate-fade-in">
              <div className={`relative h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border shadow-2xl transition-all ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {/* Static Infographic Image */}
                <img 
                  src={imgSumber} 
                  alt="Infografis Sumber Polusi Udara Metropolitan"
                  className="absolute inset-0 w-full h-full object-contain object-center transition-all duration-700 hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute top-3 right-3 z-30">
                   <div className="px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono font-bold tracking-wider text-teal-400 border border-teal-500/30 shadow-lg">
                      DIAGRAM VISUAL
                   </div>
                </div>

                {/* Absolute Positioned High-Contrast Bottom Overlay Banner */}
                {l1ShowBanner && (
                  <div className="absolute bottom-3 left-3 right-3 z-30 flex justify-between items-center bg-slate-950/85 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                    <span className="text-[10px] font-black text-slate-200 tracking-widest uppercase">INFOGRAFIS EMISI METROPOLITAN</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-amber-400 font-black tracking-wider animate-pulse flex items-center gap-1.5 hidden sm:flex">
                        <Info className="w-3.5 h-3.5 text-amber-400" /> Amati gambar & ketik temuanmu di bawah!
                      </span>
                      <button 
                        onClick={() => setL1ShowBanner(false)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Tutup banner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {/* DETECTIVE OBSERVATION INPUT BOX */}
            <div className={`p-5 rounded-3xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } shadow-lg transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✍️</span>
                <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${
                  darkMode ? 'text-teal-400' : 'text-teal-700'
                }`}>
                  Kotak Analisis & Observasi Detektif
                </h3>
              </div>

              <p className={`text-xs mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Coba ketik polusi udara atau masalah lingkungan yang kamu lihat di gambar infografis atas:
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleObserveSubmit(l1ObservationInput);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={l1ObservationInput}
                    onChange={(e) => setL1ObservationInput(e.target.value)}
                    placeholder="Contoh: kemacetan, asap pabrik, pembakaran sampah, konstruksi, aktivitas rumah tangga..."
                    className={`w-full py-3 pl-4 pr-10 rounded-xl text-xs font-bold border transition-all ${
                      darkMode
                        ? 'bg-slate-950/80 border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-slate-100 placeholder-slate-600'
                        : 'bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-slate-950 placeholder-slate-400'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">
                    🔍
                  </span>
                </div>
                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
                >
                  Analisis
                </button>
              </form>

              {/* Feedback Alert Message */}
              {l1FeedbackMessage && (
                <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2 text-xs transition-all animate-fade-in ${
                  l1FeedbackMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : l1FeedbackMessage.type === 'info'
                      ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  <span className="shrink-0">{l1FeedbackMessage.type === 'success' ? '🌟' : l1FeedbackMessage.type === 'info' ? 'ℹ️' : '⚠️'}</span>
                  <p className="flex-1 leading-relaxed">{l1FeedbackMessage.text}</p>
                  <button
                    type="button"
                    onClick={() => setL1FeedbackMessage(null)}
                    className="text-[10px] opacity-60 hover:opacity-100 font-bold ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Helper Tag Buttons (Auto-fills the box) */}
              <div className="mt-4 pt-3 border-t border-slate-700/10">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">Petunjuk bantuan (Ketuk untuk menyalin teks):</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Kemacetan 🚗', text: 'kemacetan' },
                    { label: 'Asap Pabrik 🏭', text: 'asap pabrik' },
                    { label: 'Bakar Sampah 🔥', text: 'pembakaran sampah' },
                    { label: 'Konstruksi 🚧', text: 'konstruksi' },
                    { label: 'Rumah Tangga 🏠', text: 'rumah tangga' },
                  ].map((tag) => (
                    <button
                      key={tag.text}
                      type="button"
                      onClick={() => {
                        setL1ObservationInput(tag.text);
                        playSound(500, 'sine', 0.05);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info / Explanation Card */}
            <div className={`rounded-3xl p-6 border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {level1SelectedSource ? (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/25">{level1SelectedSource.emoji.substring(0,2)}</span>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        INFORMASI DETIL SEKTOR
                      </span>
                      <h3 className={`text-md font-black mt-1 leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {level1SelectedSource.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      Kandungan Polutan Utama:
                    </div>
                    <div className={`text-xs font-black mt-1 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      {level1SelectedSource.pollutant}
                    </div>
                  </div>

                  <div className="mt-3 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/20">
                    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      Dampak Bagi Kesehatan & Lingkungan:
                    </div>
                    <div className={`text-xs font-black mt-1 ${darkMode ? 'text-rose-300' : 'text-rose-800'}`}>
                      {level1SelectedSource.impactTitle || 'Bahaya Gangguan Organ Dalam'}
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm mt-4 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {level1SelectedSource.explanation}
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 my-auto">
                  <div className="text-4xl text-amber-500 animate-pulse mb-3">📚</div>
                  <h4 className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Mulai Mengidentifikasi Sektor Polusi
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    Amati gambar kota metropolitan di atas. Temukan kemacetan kendaraan, asap pabrik, atau pembakaran sampah, lalu ketik di kotak observasi atau ketuk titik emisi untuk mendapatkan informasi penjelas!
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700/10 flex justify-end gap-2 mt-4">
                <button
                  onClick={handleResetLevel1}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atur Ulang
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: DYNAMIC ACTION & KUIS BOARD (5 COLS WIDE) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Quiz Board Card */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between h-full ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📝</span>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                      Papan Kuis Sains Atmosfer
                    </h3>
                  </div>

                  {!level1QuizActive ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🔬</div>
                      <h4 className={`text-md font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {Object.values(level1Explored).filter(Boolean).length >= 3 
                          ? 'Materi Pembelajaran Selesai!' 
                          : 'Pelajari Minimal 3 Sektor Terlebih Dahulu'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                        {Object.values(level1Explored).filter(Boolean).length >= 3
                          ? 'Anda telah mempelajari sektor emisi kota dengan sukses. Sekarang, ujilah pemahaman sains atmosfer Anda!'
                          : 'Ketik minimal 3 sumber emisi utama berdasarkan gambar untuk membuka Kuis Sains Atmosfer.'}
                      </p>

                      {/* Exploration Counter Status */}
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {level1Sources.map((src) => (
                          <div
                            key={src.id}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 ${
                              level1Explored[src.id]
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800/50 border-slate-700/30 text-slate-500'
                            }`}
                          >
                            <span>{src.emoji.substring(0,2)}</span>
                            <span>{src.id === 'pabrik' ? 'Pabrik' : src.id === 'kendaraan' ? 'Kendaraan' : src.id === 'sampah' ? 'Sampah' : src.id === 'konstruksi' ? 'Konstruksi' : 'Rumah Tangga'}</span>
                            {level1Explored[src.id] && <Check className="w-3 h-3 stroke-[3] text-emerald-400" />}
                          </div>
                        ))}
                      </div>

                      <button
                        disabled={Object.values(level1Explored).filter(Boolean).length < 3}
                        onClick={() => {
                          playSound(800, 'sine', 0.15);
                          setLevel1QuizActive(true);
                        }}
                        className={`w-full mt-6 py-3 px-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          Object.values(level1Explored).filter(Boolean).length >= 3
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02]'
                            : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Mulai Kuis Detektif <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Interactive Quiz Questions */}
                      {level1QuizQuestions.map((q) => (
                        <div 
                          key={q.id} 
                          className={`p-4 rounded-2xl border transition-all ${
                            level1ShowWrongFeedback === q.id 
                              ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                              : (level1QuizAnswers[q.id] !== null 
                                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                                  : 'bg-slate-800/10 border-slate-700/10')
                          }`}
                        >
                          <h4 className={`text-xs font-bold leading-relaxed mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {q.question}
                          </h4>

                          {/* Options */}
                          <div className="space-y-2">
                            {q.options.map((opt) => (
                              <button
                                key={opt.key}
                                onClick={() => {
                                  playSound(500 + opt.key * 100, 'sine', 0.08);
                                  setLevel1QuizAnswers(prev => ({ ...prev, [q.id]: opt.key }));
                                  if (level1ShowWrongFeedback === q.id) {
                                    setLevel1ShowWrongFeedback(null);
                                  }
                                }}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-start gap-2.5 cursor-pointer ${
                                  level1QuizAnswers[q.id] === opt.key
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                    : (darkMode 
                                        ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300' 
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300 text-slate-700')
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                  level1QuizAnswers[q.id] === opt.key 
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                    : 'bg-slate-800/30 border-slate-700 text-slate-400'
                                }`}>
                                  {opt.key === 0 ? 'A' : opt.key === 1 ? 'B' : 'C'}
                                </span>
                                <span className="flex-1 leading-relaxed">{opt.text.substring(3)}</span>
                              </button>
                            ))}
                          </div>

                          {/* Show custom explanation on wrong answer feedback */}
                          {level1ShowWrongFeedback === q.id && (
                            <div className="mt-3 flex items-start gap-1.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-medium">
                              <span className="text-xs">⚠️</span>
                              <p className="leading-relaxed">Jawaban belum tepat. Petunjuk: {q.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Action buttons inside Active Quiz */}
                      <div className="flex gap-2 pt-4 border-t border-slate-700/10">
                        <button
                          onClick={() => {
                            playSound(400, 'sine', 0.1);
                            setLevel1QuizActive(false);
                            setLevel1ShowWrongFeedback(null);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs tracking-wider border cursor-pointer transition-all ${
                            darkMode 
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Kembali Ke Peta
                        </button>
                        <button
                          onClick={handleSubmitLevel1Quiz}
                          className="flex-1 py-3 px-4 rounded-xl font-black text-xs tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          Kirim Kuis ✓
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Level Complete Dialog Overlay */}
          {level1Success && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3 text-3xl">
                    🎉
                  </div>
                  <h3 className="text-2xl font-black">Level 1 Selesai!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Luar biasa! Anda sukses mengenali 5 sumber polusi udara kota beserta karakteristik gas berbahayanya.
                  </p>
                </div>

                {/* Educational Components list inside Level 1 */}
                <div className="my-5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    🔬 Komponen Pencemaran yang Anda Identifikasi:
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🚗 Kendaraan Bermotor:</span> Melepaskan gas **Karbon Monoksida (CO)** dan partikulat **PM2.5** akibat sisa pembakaran bensin/solar, mengurangi suplai oksigen dalam sirkulasi darah manusia.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🏭 Pabrik Sektor Industri:</span> Memproduksi sulfur oksida tinggi (**Gas SO₂** & **NO₂**), menyumbang uap racun yang jika bereaksi dengan air hujan akan mencetuskan **Hujan Asam**.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🔥 Pembakaran Sampah:</span> Pembakaran plastik melepaskan partikel karsinogenik **Gas Dioksin** dan **PM10** yang mengendap dalam organ paru-paru terdalam.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🌳 Kebakaran Gambut:</span> Pelepasan masif **Karbon Dioksida (CO₂)** dan asap tebal yang membahayakan penerbangan dan kehidupan satwa liar.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🏢 Kebocoran Freon AC:</span> Melepaskan senyawa kimia **CFC** perusak molekul gas Ozon (O₃) di stratosfer, merobek lapisan perisai ultraviolet bumi.
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-extrabold text-center">
                  🪙 +30 Eco-Points  |  🔥 +50 XP  |  🎖️ Lencana Terbuka!
                </div>

                <button
                  onClick={() => {
                    setCurrentLevel(null);
                    setActiveIntroLevel(2);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer text-xs"
                >
                  Lanjut ke Level 2 ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================================= */}
      {/* 3. LEVEL 2 GAME SCREEN (MENANGKAP POLUTAN) */}
      {/* ========================================================= */}
      {currentLevel === 2 && (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>
              🧹 Level 2: Tangkap Molekul Polusi!
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto`}>
              Geser filter udara ke kiri dan kanan untuk menangkap gas emisi berbahaya sebelum jatuh menimpa warga. Kumpulkan 15 gas!
            </p>
          </div>

          <div className={`relative rounded-3xl border overflow-hidden backdrop-blur-md shadow-2xl ${
            darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Stats Bar */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-950/20 border-b border-slate-700/10">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Molekul Tertangkap</span>
                <p className="text-2xl font-black text-sky-500">{level2Score} / 15</p>
              </div>

              {/* HP Bar */}
              <div className="w-48">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-500 flex items-center gap-1">❤️ Ketahanan Kota</span>
                  <span className="text-rose-400">{level2HP}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-150"
                    style={{ width: `${level2HP}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Falling Area */}
            <div className="relative h-96 bg-slate-950 w-full overflow-hidden">
              
              {/* Detailed 2D Anime City Background */}
              <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-45" viewBox="0 0 800 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="l2Sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#120c1f" />
                    <stop offset="60%" stopColor="#2a1236" />
                    <stop offset="100%" stopColor="#0a0a14" />
                  </linearGradient>
                  <linearGradient id="l2Bldg1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4c1d95" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="l2Bldg2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e1e3f" />
                    <stop offset="100%" stopColor="#0b0a17" />
                  </linearGradient>
                </defs>
                
                <rect width="800" height="400" fill="url(#l2Sky)" />
                
                {/* Layered city background silhouette with anime styling */}
                <path d="M 0,400 L 0,280 L 40,250 L 80,280 L 120,220 L 160,280 L 220,180 L 280,280 L 350,150 L 420,280 L 500,200 L 580,280 L 650,130 L 720,280 L 800,240 L 800,400 Z" fill="url(#l2Bldg1)" opacity="0.6" />
                
                {/* Closer sharper building silhouettes with glowing windows */}
                <rect x="50" y="240" width="60" height="160" fill="url(#l2Bldg2)" stroke="#090d16" strokeWidth="1.5" />
                <circle cx="65" cy="260" r="1.5" fill="#fde047" />
                <circle cx="80" cy="260" r="1.5" fill="#fde047" />
                <circle cx="95" cy="260" r="1.5" fill="#fff" opacity="0.5" />
                <circle cx="65" cy="280" r="1.5" fill="#fff" opacity="0.5" />
                <circle cx="80" cy="280" r="1.5" fill="#fde047" />
                
                <rect x="180" y="190" width="80" height="210" fill="url(#l2Bldg2)" stroke="#090d16" strokeWidth="2" rx="4" />
                <rect x="195" y="210" width="12" height="8" fill="#fde047" opacity="0.8" rx="1" />
                <rect x="215" y="210" width="12" height="8" fill="#38bdf8" opacity="0.7" rx="1" />
                <rect x="235" y="210" width="12" height="8" fill="#fff" opacity="0.4" rx="1" />
                <rect x="195" y="230" width="12" height="8" fill="#fff" opacity="0.3" rx="1" />
                <rect x="215" y="230" width="12" height="8" fill="#fde047" opacity="0.9" rx="1" />
                <rect x="235" y="230" width="12" height="8" fill="#fde047" opacity="0.8" rx="1" />

                <rect x="380" y="220" width="70" height="180" fill="url(#l2Bldg2)" stroke="#090d16" strokeWidth="1.5" />
                <circle cx="400" cy="240" r="2" fill="#fde047" />
                <circle cx="420" cy="240" r="2" fill="#fff" />
                <circle cx="400" cy="260" r="2" fill="#fff" />
                <circle cx="420" cy="260" r="2" fill="#fde047" />
                
                <rect x="540" y="160" width="90" height="240" fill="url(#l2Bldg2)" stroke="#090d16" strokeWidth="2" rx="6" />
                <rect x="560" y="180" width="15" height="10" fill="#fde047" opacity="0.9" rx="1.5" />
                <rect x="590" y="180" width="15" height="10" fill="#fff" opacity="0.3" rx="1.5" />
                <rect x="560" y="200" width="15" height="10" fill="#38bdf8" opacity="0.8" rx="1.5" />
                <rect x="590" y="200" width="15" height="10" fill="#fde047" opacity="0.9" rx="1.5" />
                <rect x="560" y="220" width="15" height="10" fill="#fff" opacity="0.5" rx="1.5" />
                <rect x="590" y="220" width="15" height="10" fill="#fde047" opacity="0.85" rx="1.5" />

                <line x1="585" y1="160" x2="585" y2="110" stroke="#475569" strokeWidth="2" />
                <circle cx="585" cy="110" r="3" fill="#ef4444" className="animate-ping" />
                <circle cx="585" cy="110" r="2" fill="#ef4444" />
              </svg>

              {/* Floating Instructions */}
              {level2Items.length === 0 && !level2GameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 pointer-events-none z-10">
                  <span className="text-4xl animate-bounce mb-2">⌨️</span>
                  <p className="text-xs font-bold text-slate-300">Gunakan Tombol di Bawah / Ketuk Layar</p>
                  <p className="text-[10px] text-slate-500 mt-1">Atau gunakan tombol Arrow Kiri/Kanan pada keyboard Anda.</p>
                </div>
              )}

              {/* Falling Pollutant Balls */}
              {level2Items.map((p) => {
                let gradientColors = "from-slate-400 to-slate-700";
                let borderColor = "border-slate-300";
                if (p.type === 'CO₂') {
                  gradientColors = "from-purple-400 to-purple-800";
                  borderColor = "border-purple-300";
                }
                if (p.type === 'SO₂') {
                  gradientColors = "from-slate-400 to-slate-700";
                  borderColor = "border-slate-300";
                }
                if (p.type === 'NO₂') {
                  gradientColors = "from-rose-400 to-rose-800";
                  borderColor = "border-rose-300";
                }
                if (p.type === 'CO') {
                  gradientColors = "from-orange-400 to-orange-800";
                  borderColor = "border-orange-300";
                }

                return (
                  <div
                    key={p.id}
                    className={`absolute rounded-full flex flex-col items-center justify-center font-bold text-white shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.6),0_6px_10px_rgba(0,0,0,0.4)] border-2 ${borderColor} select-none bg-gradient-to-br ${gradientColors} overflow-hidden`}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 15,
                    }}
                  >
                    {/* Gloss Reflection Accent for Cel Shading */}
                    <div className="absolute top-1 left-1 w-[30%] h-[30%] bg-white/50 rounded-full blur-[0.5px]"></div>
                    <span className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] text-[11px] font-black z-10">{p.type}</span>
                  </div>
                );
              })}

              {/* Basket / Filter at bottom */}
              <div
                className="absolute bottom-4 h-11 rounded-b-2xl rounded-t-md border-x-4 border-b-4 border-t-2 border-amber-800 bg-gradient-to-b from-amber-700 to-amber-950 flex items-center justify-center text-white font-extrabold text-[10px] shadow-[0_6px_15px_rgba(0,0,0,0.6),inset_0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-75 z-20"
                style={{
                  left: `${level2BasketX}%`,
                  width: '94px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="absolute -top-1.5 w-[110%] h-3.5 rounded-full border-2 border-amber-500 bg-amber-400 shadow-md"></div>
                <div className="absolute inset-0 flex flex-col justify-evenly px-2 opacity-30">
                   <div className="w-full h-px bg-black"></div>
                   <div className="w-full h-px bg-black"></div>
                </div>
                <span className="relative z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] tracking-widest text-[10px] font-black">FILTER</span>
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="p-4 bg-slate-950/40 flex justify-between gap-4 border-t border-slate-700/10">
              <button
                onMouseDown={() => setLevel2BasketX(prev => Math.max(5, prev - 12))}
                onTouchStart={() => setLevel2BasketX(prev => Math.max(5, prev - 12))}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-2xl active:scale-95 cursor-pointer text-center select-none"
              >
                ◀ Kiri
              </button>
              <button
                onMouseDown={() => setLevel2BasketX(prev => Math.min(95, prev + 12))}
                onTouchStart={() => setLevel2BasketX(prev => Math.min(95, prev + 12))}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-2xl active:scale-95 cursor-pointer text-center select-none"
              >
                Kanan ▶
              </button>
            </div>
          </div>

          {/* Overlays */}
          {level2GameOver && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-sm rounded-3xl p-6 sm:p-7 bg-slate-900 border border-slate-800 text-center shadow-2xl">
                <span className="text-4xl">💀</span>
                <h3 className="text-2xl font-black text-rose-500 mt-3">Kota Terkontaminasi!</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Terlalu banyak gas berbahaya yang lolos menghujani warga. Atmosfer kota tertutup asap polutan.
                </p>
                <button
                  onClick={startLevel2}
                  className="w-full mt-6 py-3 rounded-xl font-bold bg-amber-500 text-white hover:scale-[1.02] cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {level2Success && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center mb-3 text-3xl">
                    🚀
                  </div>
                  <h3 className="text-2xl font-black">Level 2 Selesai!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Selamat! Anda berhasil memfilter partikel gas berbahaya dari langit pemukiman.
                  </p>
                </div>

                {/* Educational Components list inside Level 2 */}
                <div className="my-5 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/15 text-left">
                  <h4 className="text-xs font-black text-sky-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    🧹 Karakteristik Gas yang Berhasil Anda Filter:
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] leading-relaxed border-b border-sky-500/10 pb-2">
                      <span className="font-extrabold text-sky-400 block sm:inline">💨 CO₂ (Karbon Dioksida):</span> Gas efek rumah kaca utama yang menyerap radiasi termal bumi, memicu peningkatan temperatur global.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-sky-500/10 pb-2">
                      <span className="font-extrabold text-sky-400 block sm:inline">⚠️ CO (Karbon Monoksida):</span> Gas berbahaya tak berbau hasil pembakaran tidak sempurna, sangat beracun karena mengikat sel hemoglobin darah.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-sky-500/10 pb-2">
                      <span className="font-extrabold text-sky-400 block sm:inline">⚡ SO₂ (Sulfur Dioksida):</span> Gas perih berbau menyengat dari batubara, pemicu penyempitan saluran napas akut dan hujan asam.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-sky-400 block sm:inline">☣️ NO₂ (Nitrogen Dioksida):</span> Gas coklat kemerahan beracun hasil pembakaran suhu tinggi kendaraan, pemicu kabut asap fotokimia tebal.
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 text-xs text-sky-400 font-extrabold text-center">
                  🪙 +60 Eco-Points  |  🔥 +100 XP  |  🎖️ Lencana Terbuka!
                </div>

                <button
                  onClick={() => {
                    setCurrentLevel(null);
                    setActiveIntroLevel(3);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all cursor-pointer text-xs"
                >
                  Lanjut ke Level 3 ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================================= */}
      {/* 4. LEVEL 3 GAME SCREEN (SIMULATOR KEBIJAKAN & SIANG-MALAM) */}
      {/* ========================================================= */}
      {currentLevel === 3 && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          {/* Custom style inject for Level 3 animations */}
          <style>{`
            @keyframes smokeRise {
              0% { transform: translateY(0) scale(0.6); opacity: 0; }
              15% { opacity: 0.8; }
              85% { opacity: 0.3; }
              100% { transform: translateY(-50px) scale(1.6); opacity: 0; }
            }
            @keyframes driveRight {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(500px); }
            }
            @keyframes driveLeft {
              0% { transform: translateX(500px); }
              100% { transform: translateX(-120%); }
            }
            @keyframes turbineSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes solarShine {
              0% { left: -100%; }
              40% { left: 100%; }
              100% { left: 100%; }
            }
            @keyframes floatY {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
              100% { transform: translateY(0px); }
            }
            @keyframes cityDrift {
              0% { transform: translateX(-5px); }
              50% { transform: translateX(5px); }
              100% { transform: translateX(-5px); }
            }
            @keyframes walkRight {
              0% { transform: translateX(-10%) translateY(0) scaleX(1); }
              100% { transform: translateX(110%) translateY(0) scaleX(1); }
            }
            @keyframes walkLeft {
              0% { transform: translateX(110%) translateY(0) scaleX(-1); }
              100% { transform: translateX(-10%) translateY(0) scaleX(-1); }
            }
            @keyframes walkRightSlow {
              0% { transform: translateX(-20%) translateY(0) scaleX(1); }
              100% { transform: translateX(120%) translateY(0) scaleX(1); }
            }
            @keyframes bobbing {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
            @keyframes leafSway {
              0%, 100% { transform: rotate(0deg) skewX(0deg); }
              50% { transform: rotate(3deg) skewX(2deg); }
            }
          `}</style>

          {/* Premium Header Block from User's reference design */}
          <div className="flex flex-col items-center mb-6 select-none animate-fade-in text-center">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black tracking-widest text-xs sm:text-sm py-2 px-6 rounded-2xl shadow-[0_4px_14px_rgba(147,51,234,0.3)] border border-purple-400/20 uppercase">
              LEVEL 3 : KEBIJAKAN KOTA
            </div>
            <div className="flex justify-between items-center w-full max-w-lg mt-4 px-4 text-xs font-black">
              {/* Health Hearts */}
              <div className="flex gap-1 items-center bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="text-rose-500 text-sm sm:text-base animate-pulse">❤️</span>
                ))}
                <span className="text-[10px] text-rose-400 ml-1">STABIL</span>
              </div>
              
              {/* Day indicator capsule */}
              <div className={`px-4 py-1.5 rounded-full font-extrabold ${darkMode ? 'bg-slate-900/80 text-purple-400 border border-purple-500/20' : 'bg-slate-100 text-purple-700 border border-purple-200'}`}>
                HARI KE- <span className="text-sm font-black text-purple-500">{level3Day}</span> / <span className="text-slate-500">5</span>
              </div>
            </div>
          </div>

          {/* Policy Question prominent card */}
          {level3Day <= 5 && !level3GameOver && !level3Success && (
            <div className={`p-5 rounded-2xl border text-center shadow-md mb-6 animate-fade-in ${
              darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <p className="text-[10px] font-black uppercase text-purple-500 tracking-wider mb-1">
                {level3Policies[level3Day].question}
              </p>
              <p className="text-sm sm:text-base font-extrabold leading-relaxed max-w-xl mx-auto">
                {level3Policies[level3Day].description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Visual Day/Night Transition Canvas */}
            <div className="md:col-span-2 flex flex-col gap-4">
              
              {/* Laporan Masalah Kota */}
              <div className={`relative h-64 rounded-3xl overflow-hidden border shadow-2xl transition-all duration-1000 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {/* Header Panel */}
                <div className="absolute top-0 inset-x-0 h-10 bg-[#090d16] flex items-center justify-center border-b border-[#222e47]/30 rounded-t-3xl relative z-30 px-4 shadow-md">
                  <div className="absolute inset-x-0 bottom-1.5 border-b border-dashed border-rose-500/30" />
                  <span className="text-rose-400 font-extrabold tracking-[0.2em] text-[10px] sm:text-xs uppercase flex items-center gap-1.5 z-10 select-none">
                    ⚠️ LAPORAN MASALAH KOTA
                  </span>
                </div>

                {/* Problem Image & Content */}
                <div className="absolute inset-0 top-10 overflow-hidden flex flex-col bg-slate-950">
                  <img
                    src={
                      level3Day === 1 ? 'https://image.pollinations.ai/prompt/heavy%20city%20traffic%20jam%20smog%20digital%20painting%20anime%20art?width=800&height=600' :
                      level3Day === 2 ? 'https://image.pollinations.ai/prompt/industrial%20factory%20heavy%20air%20pollution%20night%20digital%20painting%20anime%20art?width=800&height=600' :
                      level3Day === 3 ? 'https://image.pollinations.ai/prompt/mountain%20of%20plastic%20garbage%20burning%20city%20digital%20painting%20anime%20art?width=800&height=600' :
                      level3Day === 4 ? 'https://image.pollinations.ai/prompt/dark%20city%20blackout%20power%20outage%20night%20digital%20painting%20anime%20art?width=800&height=600' :
                      level3Day === 5 ? 'https://image.pollinations.ai/prompt/barren%20empty%20city%20land%20dusty%20digital%20painting%20anime%20art?width=800&height=600' :
                      'https://image.pollinations.ai/prompt/beautiful%20sustainable%20green%20city%20digital%20painting%20anime%20art?width=800&height=600'
                    }
                    alt={`Masalah Kota Hari ${level3Day}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Problem Description Text overlaying the image */}
                  <div className="relative z-20 mt-auto w-full p-6 text-center animate-fade-in flex flex-col justify-end h-full">
                    <h3 className="text-xl sm:text-2xl font-black text-rose-400 mb-2 drop-shadow-md">
                      {level3Day <= 5 ? level3Policies[level3Day].question : (level3Success ? 'KOTA HIJAU BERHASIL!' : 'KOTA GAGAL')}
                    </h3>
                    <p className="text-sm sm:text-base font-medium text-slate-200 drop-shadow max-w-xl mx-auto leading-relaxed">
                      {level3Day <= 5 ? level3Policies[level3Day].description : (level3Success ? 'Anda telah berhasil mengubah kota menjadi kota yang hijau dan berkelanjutan.' : 'Kota mengalami keruntuhan lingkungan. Coba lagi dari awal.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status indicator overlay - moved outside so it doesn't block the city visualization */}
              <div className={`p-4 rounded-3xl border transition-all duration-300 ${
                darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-1.5">
                  <span>📢</span> <span className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Dampak Kebijakan:</span>
                </p>
                <p className={`text-xs font-bold mt-1.5 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {level3Log}
                </p>
              </div>

              {/* Premium Side-By-Side (Bento Style) Policy choice selector mimicking Level 4 */}
              {level3Day <= 5 && !level3GameOver && !level3Success && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {level3Policies[level3Day].options.map((opt, idx) => {
                      const badgeChar = idx === 0 ? 'A' : idx === 1 ? 'B' : 'C';
                      const themeColors = 
                        idx === 0 
                          ? {
                              borderActive: 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                              borderInactive: 'border-emerald-500/15 hover:border-emerald-500/40',
                              bgActive: 'bg-emerald-500/10 dark:bg-emerald-950/20',
                              bgInactive: 'bg-slate-50 hover:bg-emerald-500/5 dark:bg-slate-900/30 dark:hover:bg-emerald-950/5',
                              text: 'text-emerald-500 dark:text-emerald-400',
                              badgeBg: 'bg-emerald-600 text-white border-emerald-400',
                            }
                          : idx === 1
                          ? {
                              borderActive: 'border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                              borderInactive: 'border-amber-500/15 hover:border-amber-500/40',
                              bgActive: 'bg-amber-500/10 dark:bg-amber-950/20',
                              bgInactive: 'bg-slate-50 hover:bg-amber-500/5 dark:bg-slate-900/30 dark:hover:bg-amber-950/5',
                              text: 'text-amber-500 dark:text-amber-400',
                              badgeBg: 'bg-amber-600 text-white border-amber-400',
                            }
                          : {
                              borderActive: 'border-rose-500 ring-2 ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
                              borderInactive: 'border-rose-500/15 hover:border-rose-500/40',
                              bgActive: 'bg-rose-500/10 dark:bg-rose-950/20',
                              bgInactive: 'bg-slate-50 hover:bg-rose-500/5 dark:bg-slate-900/30 dark:hover:bg-rose-950/5',
                              text: 'text-rose-500 dark:text-rose-400',
                              badgeBg: 'bg-rose-600 text-white border-rose-400',
                            };

                      const isActive = level3SelectedPolicy === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => { setLevel3SelectedPolicy(idx); audio.playSfx('click'); }}
                          disabled={level3IsAnimating}
                          className={`flex flex-col p-4 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden select-none cursor-pointer min-h-[220px] sm:min-h-[260px] ${
                            isActive ? `${themeColors.bgActive} ${themeColors.borderActive}` : `${themeColors.bgInactive} ${themeColors.borderInactive}`
                          }`}
                        >
                          {/* Top Circular Option Badge (A, B, C) */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border shadow-sm mx-auto mb-2.5 ${themeColors.badgeBg}`}>
                            {badgeChar}
                          </div>

                          {/* Option text content */}
                          <span className={`text-[11px] sm:text-xs font-black tracking-tight leading-tight uppercase mb-4 block min-h-[32px] ${
                            isActive ? themeColors.text : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {opt.text}
                          </span>

                          {/* Info Button */}
                          <div
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLevel3ShowInfo(idx);
                              audio.playSfx('click');
                            }}
                            className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-colors z-30 cursor-pointer"
                          >
                            <Info size={14} />
                          </div>

                          {/* Active Check Indicator Overlay */}
                          {isActive && (
                            <div className="absolute top-2.5 right-2.5 bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow">
                              <Check size={11} className="stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Modal / Overlay for Level 3 */}
                  {level3ShowInfo !== null && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
                        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700/15 flex items-center justify-between">
                          <h4 className={`font-black text-sm uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Informasi Kebijakan
                          </h4>
                          <button 
                            onClick={() => setLevel3ShowInfo(null)}
                            className="p-1.5 rounded-full hover:bg-slate-700/20 text-slate-400 transition-colors"
                          >
                            <ArrowLeft size={18} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col gap-4">
                          <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-700/20 bg-slate-950 shadow-inner">
                            {renderOptionIllustration(level3Day, level3ShowInfo)}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Kebijakan Pilihan</span>
                            <h5 className={`text-lg font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {level3Policies[level3Day].options[level3ShowInfo].text}
                            </h5>
                          </div>

                          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            <p className={`text-sm font-medium leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              {level3Policies[level3Day].options[level3ShowInfo].log}
                            </p>
                          </div>

                          {/* Metric Impacts */}
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            <div className="flex flex-col items-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                              <Smile className="w-5 h-5 text-emerald-400 mb-1" />
                              <span className="text-[10px] font-black text-emerald-500 uppercase">Kesehatan</span>
                              <span className="text-sm font-black text-emerald-400">
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.health > 0 ? '+' : ''}
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.health}
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                              <Wind className="w-5 h-5 text-sky-400 mb-1" />
                              <span className="text-[10px] font-black text-sky-500 uppercase">Lingkungan</span>
                              <span className="text-sm font-black text-sky-400">
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.environment > 0 ? '+' : ''}
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.environment}
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                              <Landmark className="w-5 h-5 text-amber-400 mb-1" />
                              <span className="text-[10px] font-black text-amber-500 uppercase">Ekonomi</span>
                              <span className="text-sm font-black text-amber-400">
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.economy > 0 ? '+' : ''}
                                {level3Policies[level3Day].options[level3ShowInfo].metrics.economy}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Close Button */}
                        <div className="p-4 border-t border-slate-700/15">
                          <button 
                            onClick={() => setLevel3ShowInfo(null)}
                            className="w-full py-3 rounded-xl font-black bg-slate-800 text-white hover:bg-slate-700 transition-colors uppercase text-xs tracking-widest"
                          >
                            Tutup Informasi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission Action Button */}
                  <button
                    onClick={handleApplyPolicy}
                    disabled={level3SelectedPolicy === null || level3IsAnimating}
                    className="w-full mt-2 py-4 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl hover:shadow-purple-500/20 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-40 transition-all cursor-pointer text-center text-xs tracking-wider uppercase"
                  >
                    {level3IsAnimating ? 'Sedang Menerapkan Kebijakan... ⏳' : 'Terapkan Kebijakan Hari Ini'}
                  </button>
                </div>
              )}

              {/* Level 3 Summary Overlay when game is over/success */}
              {level3Day > 5 && (
                <div className="flex flex-col gap-4 animate-fade-in p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm">
                  <h3 className="text-xl font-black text-emerald-400 uppercase text-center">Rekap Akhir Kota</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {level3SelectedOptions.map((optIdx, day) => {
                      const dayNum = day + 1;
                      const policy = level3Policies[dayNum];
                      const option = policy.options[optIdx];
                      return (
                        <div key={day} className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                          <p className="text-[10px] font-black text-emerald-500 uppercase">Hari {dayNum}</p>
                          <p className="text-sm font-bold text-white">{option.text}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-lg font-black text-white">{level3Success ? "Kota Berhasil Diselamatkan!" : "Kota Perlu Perbaikan!"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Key City Indicators & Metrics */}
            <div className={`rounded-3xl p-6 border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <h3 className={`font-black text-sm tracking-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  📊 Parameter Kota Lestari
                </h3>

                <div className="flex flex-col gap-5">
                  {/* HEALTH METRIC */}
                  <div>
                    <div className="flex justify-between text-xs font-extrabold mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Smile className="w-4 h-4 text-emerald-400" /> Kesehatan Warga
                      </span>
                      <span className={level3Metrics.health <= 35 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}>
                        {level3Metrics.health}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          level3Metrics.health > 50 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{ width: `${level3Metrics.health}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dampak pernapasan, kasus ISPA, dan produktivitas warga.</p>
                  </div>

                  {/* ENVIRONMENT METRIC */}
                  <div>
                    <div className="flex justify-between text-xs font-extrabold mb-1.5">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <TreeDeciduous className="w-4 h-4 text-sky-400" /> Kualitas Lingkungan
                      </span>
                      <span className={level3Metrics.environment <= 35 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}>
                        {level3Metrics.environment}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          level3Metrics.environment > 50 ? 'bg-sky-500' : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{ width: `${level3Metrics.environment}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Kebersihan ozon, pH hujan asam, dan kelestarian hayati.</p>
                  </div>

                  {/* ECONOMY METRIC */}
                  <div>
                    <div className="flex justify-between text-xs font-extrabold mb-1.5">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Landmark className="w-4 h-4 text-amber-400" /> Ekonomi & Anggaran
                      </span>
                      <span className={level3Metrics.economy <= 35 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}>
                        {level3Metrics.economy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          level3Metrics.economy > 50 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{ width: `${level3Metrics.economy}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Penerimaan pajak, anggaran operasional, dan beban kota.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-700/10 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Misi Utama</span>
                <span className="text-[11px] text-amber-500 font-extrabold block mt-0.5">Jaga semua bar tetap di atas batas kritis 25%!</span>
              </div>
            </div>
          </div>

          {/* Overlays */}
          {level3GameOver && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-sm rounded-3xl p-6 sm:p-7 bg-slate-900 border border-slate-800 text-center shadow-2xl">
                <span className="text-4xl">📉</span>
                <h3 className="text-2xl font-black text-rose-500 mt-3">Kota Mengalami Krisis!</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Kebijakan Anda membuat salah satu indikator kota anjlok di bawah ambang batas aman. Jalankan simulasi ulang!
                </p>
                <button
                  onClick={startLevel3}
                  className="w-full mt-6 py-3 rounded-xl font-bold bg-purple-500 text-white hover:scale-[1.02] cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {level3Success && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mb-3 text-3xl">
                    🎖️
                  </div>
                  <h3 className="text-2xl font-black">Level 3 Selesai!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Luar biasa! Anda berhasil menjaga kestabilan aspek lingkungan, sosial, dan ekonomi kota selama 5 hari.
                  </p>
                </div>

                {/* Educational Components list inside Level 3 */}
                <div className="my-5 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 text-left">
                  <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    📊 Parameter Perkotaan Lestari yang Berhasil Diseimbangkan:
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] leading-relaxed border-b border-purple-500/10 pb-2">
                      <span className="font-extrabold text-purple-400 block sm:inline">😊 Kesehatan Warga:</span> Indikator krusial yang mengukur kerentanan warga terhadap penyakit infeksi saluran pernapasan akut (ISPA) akibat asap kendaraan, pembakaran sampah, dan cerobong pabrik.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-purple-500/10 pb-2">
                      <span className="font-extrabold text-purple-400 block sm:inline">🌲 Kualitas Lingkungan:</span> Indikator kebersihan ekosistem kota yang dipengaruhi langsung oleh tingkat konsentrasi jelaga batubara, hujan asam sulfur, polusi ozon permukaan, dan pemusnahan tata ruang hijau.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-purple-400 block sm:inline">🏛️ Ekonomi & Anggaran:</span> Indikator kapasitas dana fiskal kota untuk melakukan transisi energi Panel Surya, menyubsidi bus listrik perkotaan, menerapkan denda industri, dan membangun sistem daur ulang sampah.
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-xs text-purple-400 font-extrabold text-center">
                  🪙 +90 Eco-Points  |  🔥 +150 XP  |  🎖️ Lencana Terbuka!
                </div>

                <button
                  onClick={() => {
                    setCurrentLevel(null);
                    setActiveIntroLevel(4);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer text-xs"
                >
                  Lanjut ke Level 4 ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================================= */}
      {/* 5. LEVEL 4 GAME SCREEN (LAB DIAGNOSTIK - C4 & C5) */}
      {/* ========================================================= */}
      {currentLevel === 4 && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
              🧪 Level 4: Laboratorium Analisis & Evaluasi (C4-C5)
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto`}>
              Gunakan keahlian analisis Anda untuk memecahkan kasus anomali pencemaran udara riil di berbagai kota. Jawab dengan analisis yang tepat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Left Column: Data Analysis and Graph Charts */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <div className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black tracking-widest text-emerald-500 uppercase">Kasus {level4ActiveCaseIdx + 1} / 3</span>
                  <span className="text-xs font-bold text-slate-400">{level4Cases[level4ActiveCaseIdx].region}</span>
                </div>
                
                <h3 className="text-lg font-black tracking-tight leading-snug">
                  {level4Cases[level4ActiveCaseIdx].title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {level4Cases[level4ActiveCaseIdx].anomaly}
                </p>

                {/* 2D Anime Vector Art Illustration representing the Active Case */}
                <div className="mt-4 relative w-full h-32 rounded-2xl overflow-hidden border border-slate-700/30 shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-slate-950">
                  {level4Cases[level4ActiveCaseIdx].id === 'jakarta' && (
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="jkSky" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1e1b4b" />
                          <stop offset="50%" stopColor="#4c1d95" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                        <linearGradient id="jkBldg" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="120" fill="url(#jkSky)" />
                      {/* Sun glow */}
                      <circle cx="200" cy="80" r="45" fill="#fef08a" opacity="0.3" filter="blur(2px)" />
                      <circle cx="200" cy="80" r="15" fill="#fef08a" opacity="0.8" />
                      
                      {/* Back skyscrapers silhouette */}
                      <path d="M 10,120 L 10,60 L 35,50 L 60,60 L 60,120 Z" fill="#2e104e" opacity="0.7" />
                      <path d="M 330,120 L 330,50 L 360,40 L 390,50 L 390,120 Z" fill="#2e104e" opacity="0.7" />

                      {/* Foreground anime skyscrapers */}
                      <rect x="70" y="30" width="55" height="90" fill="url(#jkBldg)" stroke="#020617" strokeWidth="1.5" rx="3" />
                      {/* Windows with cel-shading look */}
                      <rect x="80" y="45" width="8" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="92" y="45" width="8" height="6" fill="#fff" opacity="0.5" rx="1" />
                      <rect x="104" y="45" width="8" height="6" fill="#fde047" opacity="0.8" rx="1" />
                      <rect x="80" y="60" width="8" height="6" fill="#fff" opacity="0.3" rx="1" />
                      <rect x="92" y="60" width="8" height="6" fill="#fde047" opacity="0.95" rx="1" />
                      <rect x="104" y="60" width="8" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="80" y="75" width="8" height="6" fill="#fde047" opacity="0.8" rx="1" />
                      <rect x="104" y="75" width="8" height="6" fill="#fff" opacity="0.4" rx="1" />

                      {/* Second building */}
                      <rect x="140" y="15" width="45" height="105" fill="url(#jkBldg)" stroke="#020617" strokeWidth="1.5" rx="3" />
                      {/* Antenna with ping effect */}
                      <line x1="162.5" y1="15" x2="162.5" y2="2" stroke="#475569" strokeWidth="1.5" />
                      <circle cx="162.5" cy="2" r="2.5" fill="#ef4444" className="animate-ping" />
                      <circle cx="162.5" cy="2" r="1.5" fill="#ef4444" />
                      <rect x="150" y="30" width="8" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="162" y="30" width="8" height="6" fill="#38bdf8" opacity="0.8" rx="1" />
                      <rect x="150" y="45" width="8" height="6" fill="#fff" opacity="0.5" rx="1" />
                      <rect x="162" y="45" width="8" height="6" fill="#fde047" opacity="0.85" rx="1" />
                      <rect x="150" y="60" width="8" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="162" y="60" width="8" height="6" fill="#fff" opacity="0.3" rx="1" />

                      {/* Third building */}
                      <rect x="250" y="40" width="60" height="80" fill="url(#jkBldg)" stroke="#020617" strokeWidth="1.5" rx="3" />
                      <rect x="260" y="55" width="10" height="6" fill="#fff" opacity="0.4" rx="1" />
                      <rect x="275" y="55" width="10" height="6" fill="#fde047" opacity="0.85" rx="1" />
                      <rect x="290" y="55" width="10" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="260" y="70" width="10" height="6" fill="#fde047" opacity="0.9" rx="1" />
                      <rect x="290" y="70" width="10" height="6" fill="#fff" opacity="0.2" rx="1" />

                      {/* Heavy city highway with stylized anime exhaust smoke */}
                      <path d="M 0,105 Q 200,95 400,105 L 400,120 L 0,120 Z" fill="#0f172a" />
                      {/* Road markings */}
                      <line x1="10" y1="112" x2="390" y2="112" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10,8" opacity="0.7" />
                      
                      {/* Stylized vector car shape */}
                      <g transform="translate(190, 85) scale(0.65)">
                        <path d="M 10,20 C 10,10 50,10 50,20 L 55,30 L 5,30 Z" fill="#ef4444" stroke="#000" strokeWidth="1.5" />
                        <rect x="2" y="30" width="56" height="12" fill="#ef4444" stroke="#000" strokeWidth="1.5" rx="3" />
                        <circle cx="15" cy="42" r="5" fill="#000" />
                        <circle cx="45" cy="42" r="5" fill="#000" />
                        {/* Exhaust particles */}
                        <circle cx="-5" cy="38" r="4" fill="#64748b" opacity="0.6" className="animate-pulse" />
                        <circle cx="-12" cy="35" r="2.5" fill="#94a3b8" opacity="0.4" />
                      </g>
                    </svg>
                  )}

                  {level4Cases[level4ActiveCaseIdx].id === 'forest_fire' && (
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="ffSky" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1e1b4b" />
                          <stop offset="35%" stopColor="#431407" />
                          <stop offset="70%" stopColor="#9a3412" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <linearGradient id="fireFlame1" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#b91c1c" />
                          <stop offset="60%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#fef08a" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="120" fill="url(#ffSky)" />
                      
                      {/* Background smoke silhouettes */}
                      <circle cx="120" cy="50" r="40" fill="#451a03" opacity="0.45" filter="blur(3px)" />
                      <circle cx="280" cy="45" r="55" fill="#451a03" opacity="0.45" filter="blur(4px)" />
                      
                      {/* Peat forest floor */}
                      <rect x="0" y="100" width="400" height="20" fill="#270e02" />
                      
                      {/* Detailed 2D Anime Trees (burning) */}
                      {/* Tree 1 */}
                      <path d="M 60,50 L 63,50 L 65,100 L 58,100 Z" fill="#451a03" stroke="#1c1917" strokeWidth="1.5" />
                      <path d="M 35,60 C 35,40 85,35 60,10 Z" fill="#15803d" opacity="0.2" stroke="#052e16" strokeWidth="1" />
                      {/* Active Flames on Tree 1 */}
                      <path d="M 52,100 Q 60,65 62,85 Q 70,75 75,100 Z" fill="url(#fireFlame1)" className="animate-pulse" />
                      
                      {/* Tree 2 */}
                      <path d="M 180,40 L 184,40 L 186,100 L 178,100 Z" fill="#451a03" stroke="#1c1917" strokeWidth="1.5" />
                      <path d="M 170,100 Q 180,50 185,75 Q 195,60 200,100 Z" fill="url(#fireFlame1)" className="animate-pulse" />

                      {/* Tree 3 */}
                      <path d="M 300,55 L 303,55 L 305,100 L 298,100 Z" fill="#451a03" stroke="#1c1917" strokeWidth="1.5" />
                      <path d="M 292,100 Q 300,70 302,88 Q 312,75 315,100 Z" fill="url(#fireFlame1)" className="animate-pulse" />

                      {/* Spark elements popping up */}
                      <circle cx="110" cy="70" r="1.5" fill="#fde047" className="animate-ping" />
                      <circle cx="190" cy="45" r="2" fill="#f97316" />
                      <circle cx="270" cy="55" r="1.5" fill="#fde047" className="animate-ping" />
                      
                      {/* Thick cartoon smoke billows */}
                      <path d="M -20,110 C 20,80 80,80 120,105 C 160,85 220,90 250,110 Z" fill="#78350f" opacity="0.3" />
                    </svg>
                  )}

                  {level4Cases[level4ActiveCaseIdx].id === 'acid_rain' && (
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="arSky" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0f172a" />
                          <stop offset="60%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                        <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0f766e" />
                          <stop offset="100%" stopColor="#115e59" />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="120" fill="url(#arSky)" />
                      
                      {/* Acid rain lines */}
                      <line x1="50" y1="5" x2="40" y2="115" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                      <line x1="120" y1="5" x2="110" y2="115" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
                      <line x1="200" y1="5" x2="190" y2="115" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                      <line x1="280" y1="5" x2="270" y2="115" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
                      <line x1="350" y1="5" x2="340" y2="115" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

                      {/* Distant Coal Power Plant */}
                      <rect x="260" y="40" width="70" height="50" fill="#334155" stroke="#0f172a" strokeWidth="1.5" rx="2" />
                      {/* Big Cooling tower */}
                      <path d="M 345,90 L 350,45 L 365,45 L 370,90 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
                      {/* Detailed emissions smoke */}
                      <path d="M 348,40 C 340,25 370,20 360,10" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                      <path d="M 348,40 C 340,25 370,20 360,10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" className="animate-pulse" />

                      {/* Acid Lake Bed */}
                      <ellipse cx="140" cy="105" rx="120" ry="15" fill="url(#lakeGrad)" stroke="#042f2e" strokeWidth="2" />
                      
                      {/* Skeletal dead tree on the left representing acid rain damage */}
                      <path d="M 40,110 L 44,110 L 45,65 Q 40,55 35,60" fill="none" stroke="#2d1502" strokeWidth="2.5" />
                      <path d="M 43,85 Q 52,75 58,80" fill="none" stroke="#2d1502" strokeWidth="1.5" />
                      <path d="M 43,75 Q 32,68 28,72" fill="none" stroke="#2d1502" strokeWidth="1.5" />

                      {/* Bubbles / Corrosive fizzing on the acid lake */}
                      <circle cx="100" cy="102" r="2.5" fill="#a7f3d0" opacity="0.75" className="animate-ping" />
                      <circle cx="150" cy="106" r="1.5" fill="#a7f3d0" opacity="0.6" />
                      <circle cx="190" cy="104" r="2" fill="#a7f3d0" opacity="0.8" className="animate-ping" />
                    </svg>
                  )}
                </div>

                {/* Simulated SVG Graph Chart to represent C4 analysis data */}
                <div className="mt-5 p-3 sm:p-5 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      📈 {level4Cases[level4ActiveCaseIdx].graphLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      Metode: Analisis Ambien Spektrofotometri
                    </span>
                  </div>
                  
                  {/* Outer container including Y-Axis and Main Chart Grid */}
                  <div className="flex gap-1.5 sm:gap-3 h-52 relative pt-2">
                    {/* Y-Axis labels (ticks) */}
                    <div className="flex flex-col justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 w-6 sm:w-10 text-right pr-1 pb-6 select-none h-full">
                      <span>{level4ActiveCaseIdx === 0 ? '200' : level4ActiveCaseIdx === 1 ? '400' : '300'}</span>
                      <span>{level4ActiveCaseIdx === 0 ? '150' : level4ActiveCaseIdx === 1 ? '300' : '225'}</span>
                      <span>{level4ActiveCaseIdx === 0 ? '100' : level4ActiveCaseIdx === 1 ? '200' : '150'}</span>
                      <span>{level4ActiveCaseIdx === 0 ? '50' : level4ActiveCaseIdx === 1 ? '100' : '75'}</span>
                      <span>0</span>
                    </div>

                    {/* Chart Area with Gridlines */}
                    <div className="flex-1 relative border-l border-b border-slate-800 h-full pb-6 flex items-end justify-around gap-1 sm:gap-2 px-1 sm:px-2">
                      {/* Gridlines */}
                      <div className="absolute inset-x-0 top-0 h-px bg-slate-800/40 border-dashed border-slate-800 pointer-events-none" />
                      <div className="absolute inset-x-0 top-1/4 h-px bg-slate-800/40 border-dashed border-slate-800 pointer-events-none" />
                      <div className="absolute inset-x-0 top-2/4 h-px bg-slate-800/40 border-dashed border-slate-800 pointer-events-none" />
                      <div className="absolute inset-x-0 top-3/4 h-px bg-slate-800/40 border-dashed border-slate-800 pointer-events-none" />

                      {/* Threshold line */}
                      {(() => {
                        const currentCase = level4Cases[level4ActiveCaseIdx];
                        let threshold = 100;
                        let maxVal = 200;
                        let unit = ' AQI';
                        if (currentCase.id === 'jakarta') {
                          threshold = 100;
                          maxVal = 200;
                        } else if (currentCase.id === 'forest_fire') {
                          threshold = 100;
                          maxVal = 400;
                        } else {
                          threshold = 150;
                          maxVal = 300;
                          unit = ' µg/m³';
                        }
                        const thresholdPercent = (threshold / maxVal) * 100;
                        return (
                          <div 
                            className="absolute inset-x-0 border-t-2 border-dashed border-rose-500/80 z-10 pointer-events-none transition-all duration-700"
                            style={{ bottom: `calc(${thresholdPercent}% + 24px)` }}
                          >
                            <span className="absolute left-2 -top-2 px-1 py-0.5 rounded bg-rose-500/90 text-white font-mono text-[6px] sm:text-[7px] font-black uppercase tracking-wider shadow-md">
                              Batas: {threshold}{unit}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Bar rendering */}
                      {level4Cases[level4ActiveCaseIdx].graphValues.map((g, idx) => {
                        const currentCase = level4Cases[level4ActiveCaseIdx];
                        let threshold = 100;
                        let maxVal = 200;
                        let unit = ' AQI';
                        if (currentCase.id === 'jakarta') {
                          threshold = 100;
                          maxVal = 200;
                        } else if (currentCase.id === 'forest_fire') {
                          threshold = 100;
                          maxVal = 400;
                        } else {
                          threshold = 150;
                          maxVal = 300;
                          unit = ' µg/m³';
                        }

                        // Cap percentage at 100% just in case
                        const percentHeight = Math.min((g.val / maxVal) * 100, 100);
                        
                        // Classify color category
                        let barGradient = "from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 shadow-emerald-500/40";
                        let valColor = "text-emerald-400";
                        let statusText = "Baik/Aman";
                        
                        if (g.val > threshold) {
                          barGradient = "from-red-400 to-rose-700 hover:from-red-300 hover:to-rose-600 shadow-red-500/40 animate-pulse";
                          valColor = "text-rose-400";
                          statusText = "Berbahaya!";
                        } else if (g.val > threshold * 0.75) {
                          barGradient = "from-amber-300 to-orange-600 hover:from-amber-200 hover:to-orange-500 shadow-amber-500/40";
                          valColor = "text-amber-400";
                          statusText = "Waspada";
                        }

                        return (
                          <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full relative group z-20">
                            {/* Hover Tooltip card */}
                            <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-700 rounded-lg p-1.5 shadow-xl text-center pointer-events-none w-24 z-30">
                              <p className="text-[8px] font-bold text-slate-300 leading-tight">{g.label}</p>
                              <p className={`text-[10px] font-black ${valColor} mt-0.5`}>
                                {g.val}{unit}
                              </p>
                              <p className="text-[7px] text-slate-400 font-mono">{statusText}</p>
                            </div>

                            {/* Value badge */}
                            <span className={`text-[8px] sm:text-[9px] font-black ${valColor} mb-1 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-800`}>
                              {g.val}
                            </span>

                            {/* Bar stick (Claymation style) */}
                            <div 
                              className={`w-full max-w-[32px] sm:max-w-[40px] bg-gradient-to-b ${barGradient} rounded-t-md sm:rounded-t-lg transition-all duration-1000 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.3)] border-t-2 border-x border-white/20 relative overflow-hidden`}
                              style={{ height: `${percentHeight}%` }}
                            >
                               <div className="absolute top-0 right-1 w-1.5 h-full bg-white/20 blur-[1px]"></div>
                            </div>
                            {/* Label positioning underneath */}
                            <span className="absolute -bottom-5 text-[6.5px] sm:text-[8px] text-slate-400 font-semibold text-center whitespace-nowrap">
                              <span className="sm:hidden">{g.label.replace(/\s*\(.*?\)/g, '')}</span>
                              <span className="hidden sm:inline">{g.label}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Color Scale Legend */}
                  <div className="mt-8 pt-3 border-t border-slate-800/60 flex flex-wrap gap-4 items-center justify-between text-[9px] font-semibold text-slate-400">
                    <span className="text-[10px] font-bold text-slate-300">📋 Legenda:</span>
                    <div className="flex gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gradient-to-t from-emerald-600 to-teal-400 inline-block border border-white/10" />
                        Aman
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gradient-to-t from-amber-500 to-yellow-500 inline-block border border-white/10" />
                        Waspada
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gradient-to-t from-rose-500 to-red-600 inline-block border border-white/10 animate-pulse" />
                        Bahaya
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Question Panel & Evaluation options */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className={`p-5 rounded-3xl border flex-1 flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1.5">Slot Analisis Spektroskopi (C4-C5):</h4>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4 leading-relaxed`}>
                    Isi slot dengan mengetuk kartu di bawah agar sesuai dengan indikator grafik untuk mengunci diagnosis ilmiah!
                  </p>

                  {/* 3 Interactive Slots */}
                  <div className="space-y-3 mb-5">
                    
                    {/* Slot 1: Polutan */}
                    <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      level4SelectedPolutan 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                        : 'bg-slate-950/25 border-dashed border-slate-700 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🧬</span>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Zat Polutan Utama</p>
                          <p className="text-xs font-black">{level4SelectedPolutan || 'Belum diisi...'}</p>
                        </div>
                      </div>
                      {level4SelectedPolutan && level4Answers[level4Cases[level4ActiveCaseIdx].id] === undefined && (
                        <button 
                          onClick={() => { setLevel4SelectedPolutan(null); playSound(300, 'sine', 0.1); }}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 bg-slate-950/40 rounded-lg cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    {/* Slot 2: Sumber */}
                    <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      level4SelectedSumber 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-300' 
                        : 'bg-slate-950/25 border-dashed border-slate-700 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏭</span>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Sumber Pencemaran</p>
                          <p className="text-xs font-black">{level4SelectedSumber || 'Belum diisi...'}</p>
                        </div>
                      </div>
                      {level4SelectedSumber && level4Answers[level4Cases[level4ActiveCaseIdx].id] === undefined && (
                        <button 
                          onClick={() => { setLevel4SelectedSumber(null); playSound(300, 'sine', 0.1); }}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 bg-slate-950/40 rounded-lg cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    {/* Slot 3: Solusi */}
                    <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      level4SelectedSolusi 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' 
                        : 'bg-slate-950/25 border-dashed border-slate-700 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌱</span>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Solusi Mitigasi Hijau</p>
                          <p className="text-xs font-black">{level4SelectedSolusi || 'Belum diisi...'}</p>
                        </div>
                      </div>
                      {level4SelectedSolusi && level4Answers[level4Cases[level4ActiveCaseIdx].id] === undefined && (
                        <button 
                          onClick={() => { setLevel4SelectedSolusi(null); playSound(300, 'sine', 0.1); }}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 bg-slate-950/40 rounded-lg cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Cards Deck Selector */}
                  {level4Answers[level4Cases[level4ActiveCaseIdx].id] === undefined && (
                    <div className="space-y-4 pt-3 border-t border-slate-800">
                      
                      {/* Polutan Options */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-emerald-400 mb-1.5">Pilih Polutan Utama:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["PM2.5", "PM10", "SO2 & NO2", "CFC Freon"].map((p) => (
                            <div key={p} className="flex items-center gap-1">
                              <button
                                disabled={level4SelectedPolutan === p}
                                onClick={() => { setLevel4SelectedPolutan(p); audio.playSfx('click'); }}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                                  level4SelectedPolutan === p
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-50'
                                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-emerald-500'
                                }`}
                              >
                                🧬 {p}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfoPopupData({ key: p, ...level4InfoData[p] });
                                  audio.playSfx('click');
                                }}
                                className="w-6 h-6 rounded-md bg-slate-950/60 border border-slate-800 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                title={`Informasi Detail ${p}`}
                              >
                                <Info size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sumber Options */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-blue-400 mb-1.5">Pilih Sumber Emisi:</p>
                        <div className="flex flex-col gap-1.5">
                          {["Transportasi Komuter", "Kebakaran Hutan Gambut", "Cerobong Industri / PLTU", "Kebocoran AC Lama"].map((s) => (
                            <div key={s} className="flex items-center gap-1.5 w-full">
                              <button
                                disabled={level4SelectedSumber === s}
                                onClick={() => { setLevel4SelectedSumber(s); audio.playSfx('click'); }}
                                className={`flex-1 px-2.5 py-1.5 text-left text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                                  level4SelectedSumber === s
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 opacity-50'
                                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-blue-500'
                                }`}
                              >
                                🏭 {s}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfoPopupData({ key: s, ...level4InfoData[s] });
                                  audio.playSfx('click');
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                title={`Informasi Detail ${s}`}
                              >
                                <Info size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Solusi Options */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-amber-400 mb-1.5">Pilih Solusi Mitigasi:</p>
                        <div className="flex flex-col gap-1.5">
                          {["Bus Listrik & LEZ", "Sekat Kanal Gambut", "Teknologi FGD & SCR", "Saringan Kain Katun"].map((t) => (
                            <div key={t} className="flex items-center gap-1.5 w-full">
                              <button
                                disabled={level4SelectedSolusi === t}
                                onClick={() => { setLevel4SelectedSolusi(t); audio.playSfx('click'); }}
                                className={`flex-1 px-2.5 py-1.5 text-left text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                                  level4SelectedSolusi === t
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 opacity-50'
                                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-amber-500'
                                }`}
                              >
                                🌱 {t}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfoPopupData({ key: t, ...level4InfoData[t] });
                                  audio.playSfx('click');
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-500 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                title={`Informasi Detail ${t}`}
                              >
                                <Info size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Feedback & Actions Panel */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  {level4Feedback && (
                    <div className={`p-3 rounded-xl text-xs leading-relaxed mb-4 border ${
                      level4Feedback.startsWith('❌') 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    }`}>
                      {level4Feedback}
                    </div>
                  )}

                  {level4Answers[level4Cases[level4ActiveCaseIdx].id] !== undefined ? (
                    <button
                      onClick={handleNextLabCase}
                      className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all cursor-pointer text-center text-xs"
                    >
                      {level4ActiveCaseIdx + 1 === level4Cases.length ? 'Selesaikan Uji Lab 🧪' : 'Kasus Selanjutnya ➔'}
                    </button>
                  ) : (
                    <button
                      onClick={handleExecuteLabAnalysis}
                      className="w-full py-3 rounded-xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white shadow-lg shadow-emerald-500/20 animate-pulse hover:scale-[1.01] transition-all cursor-pointer text-center text-xs"
                    >
                      Jalankan Analisis Laboratorium 🧪
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Level Complete Dialog Overlay */}
          {level4Success && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3 text-3xl">
                    🎉
                  </div>
                  <h3 className="text-2xl font-black">Level 4 Selesai!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Diagnosis luar biasa! Anda sukses menganalisis anomali udara (C4) dan mengevaluasi solusi terbaik di lapangan (C5).
                  </p>
                </div>

                {/* Educational Components list inside Level 4 */}
                <div className="my-5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    🧪 Komponen Kasus Analisis Laboratorium (C4-C5):
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">📈 Kasus PM2.5 Perkotaan:</span> Terjadi puncak ganda konsentrasi partikel mikro halus pada jam komuter pergi-pulang kerja, terbukti bersumber dari emisi sektor transportasi harian.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-emerald-500/10 pb-2">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🍂 Kasus PM10 Gambut:</span> Lonjakan ekstrem partikulat debu kasar musiman di musim kemarau dipicu pembakaran land clearing gambut, membutuhkan tindakan pembasahan kanal restoratif.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-emerald-400 block sm:inline">🌧️ Kasus Hujan Asam Danau:</span> Lepasan gas SO₂ dan NO₂ dari industri energi tanpa scrubber, ditangani secara industri dengan teknologi filtrasi kimia cerobong Flue-Gas Desulfurization (FGD).
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-extrabold text-center">
                  🪙 +120 Eco-Points  |  🔥 +200 XP  |  🎖️ Lencana Terbuka!
                </div>

                <button
                  onClick={() => {
                    setCurrentLevel(null);
                    setActiveIntroLevel(5);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer text-xs"
                >
                  Lanjut ke Level 5 (BOSS FIGHT!) ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================================= */}
      {/* 6. LEVEL 5 GAME SCREEN (BOSS BATTLE - RAJA POLUSI) */}
      {/* ========================================================= */}
      {currentLevel === 5 && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-red-500">
              👑 Level 5: Pertempuran Raja Polusi!
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto`}>
              Kalahkan Raja Polusi dengan menjawab rangkaian soal evaluasi dampak lingkungan di bawah. Hati-hati, jika nyawa Anda habis, Raja Polusi akan menguasai kota!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Battle Stage representation */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <div className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between h-96 ${
                level5Shaking ? 'animate-shake' : ''
              } ${
                level5PlayerFlash ? 'border-red-500 bg-red-950/20' : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                
                {/* Stunning 2D Anime Vector Art Combat Background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-45">
                  <svg className="w-full h-full object-cover" viewBox="0 0 400 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="bgSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="40%" stopColor="#311042" />
                        <stop offset="70%" stopColor="#701a75" />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="smokeCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#111827" />
                        <stop offset="100%" stopColor="#030712" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#bgSkyGrad)" />
                    {/* Glowing toxic lightning bolts */}
                    <path d="M 120,0 L 150,50 L 130,70 L 180,130 L 170,135" fill="none" stroke="#d946ef" strokeWidth="2.5" opacity="0.8" filter="blur(1px)" className="animate-pulse" />
                    <path d="M 120,0 L 150,50 L 130,70 L 180,130 L 170,135" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.95" />
                    
                    <path d="M 280,0 L 260,40 L 290,65 L 250,110" fill="none" stroke="#a21caf" strokeWidth="2" opacity="0.6" filter="blur(1px)" />
                    
                    {/* Dark smog vortex clouds on the corners */}
                    <circle cx="50" cy="20" r="80" fill="url(#smokeCloudGrad)" opacity="0.8" />
                    <circle cx="350" cy="30" r="90" fill="url(#smokeCloudGrad)" opacity="0.8" />
                    
                    {/* Silhouette of threatened city below */}
                    <path d="M 0,300 L 0,260 L 20,260 L 20,270 L 40,250 L 55,250 L 55,300 Z" fill="#030712" opacity="0.95" />
                    <path d="M 320,300 L 320,240 L 345,230 L 345,300 L 370,250 L 400,260 L 400,300 Z" fill="#030712" opacity="0.95" />
                  </svg>
                </div>

                {/* Boss Avatar & Status */}
                <div className="text-center relative z-10 flex flex-col items-center">
                  <div className="relative w-32 h-24 flex items-center justify-center animate-[floatY_2.5s_ease-in-out_infinite] mt-2 mb-6">
                    {/* Magical Purple Glow Ring (Boss Aura) */}
                    <div className="absolute w-36 h-36 border-2 border-dashed border-purple-500/35 rounded-full animate-spin [animation-duration:15s] pointer-events-none"></div>
                    <div className="absolute w-32 h-32 border border-rose-500/20 rounded-full animate-ping [animation-duration:3s] pointer-events-none"></div>

                    {/* Crown */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-8 bg-gradient-to-b from-yellow-300 to-amber-500 flex justify-between items-start border-b-4 border-amber-700 drop-shadow-lg z-20" style={{ clipPath: 'polygon(0 0, 20% 100%, 80% 100%, 100% 0, 75% 50%, 50% 0, 25% 50%)'}}>
                      <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mx-auto mt-1 shadow-sm border border-rose-600"></div>
                    </div>
                    
                    {/* Dark smog body (Claymation style) */}
                    <div className="absolute w-28 h-20 bg-gradient-to-br from-slate-700 to-slate-950 rounded-full shadow-[0_8px_15px_rgba(0,0,0,0.7),inset_-4px_-4px_8px_rgba(0,0,0,0.5),inset_4px_4px_8px_rgba(255,255,255,0.2)] z-10"></div>
                    <div className="absolute -left-4 top-2 w-16 h-16 bg-gradient-to-bl from-slate-700 to-slate-900 rounded-full shadow-[inset_3px_3px_6px_rgba(255,255,255,0.1)] z-10"></div>
                    <div className="absolute -right-4 top-2 w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-[inset_-3px_3px_6px_rgba(0,0,0,0.2)] z-10"></div>
                    <div className="absolute -bottom-3 left-4 w-12 h-12 bg-gradient-to-t from-slate-950 to-slate-800 rounded-full z-10"></div>
                    <div className="absolute -bottom-3 right-4 w-12 h-12 bg-gradient-to-t from-slate-950 to-slate-800 rounded-full z-10"></div>
                    
                    {/* Face */}
                    <div className="absolute z-20 flex flex-col items-center mt-3 w-full">
                      {/* Angry Red Eyes */}
                      <div className="flex gap-4 justify-center w-full">
                        <div className="w-7 h-4 bg-gradient-to-b from-rose-500 to-red-600 rotate-12 shadow-[0_0_12px_rgba(244,63,94,0.9),inset_0_2px_2px_rgba(255,255,255,0.6)] rounded-sm border border-red-700 relative overflow-hidden">
                           <div className="absolute top-0 right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full"></div>
                        </div>
                        <div className="w-7 h-4 bg-gradient-to-b from-rose-500 to-red-600 -rotate-12 shadow-[0_0_12px_rgba(244,63,94,0.9),inset_0_2px_2px_rgba(255,255,255,0.6)] rounded-sm border border-red-700 relative overflow-hidden">
                           <div className="absolute top-0 left-1 w-2.5 h-2.5 bg-yellow-300 rounded-full"></div>
                        </div>
                      </div>
                      {/* Fangs */}
                      <div className="flex gap-1.5 mt-2.5 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 shadow-inner">
                        <div className="w-2.5 h-3.5 bg-white rounded-b-full"></div>
                        <div className="w-1.5 h-2 bg-white rounded-b-full"></div>
                        <div className="w-2.5 h-3.5 bg-white rounded-b-full"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-rose-500 uppercase tracking-widest mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Raja Polusi (The Smoke Lord)</h3>
                  
                  {/* Boss HP Bar */}
                  <div className="w-full max-w-xs mt-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Kekuatan Gas Racun</span>
                      <span className="text-rose-500 font-extrabold">{level5BossHP} / 500 HP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-rose-500/20">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
                        style={{ width: `${(level5BossHP / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* VS Indicator */}
                <div className="text-center font-black text-xs text-slate-500 uppercase tracking-widest my-2 relative z-10">
                  ⚔️ PERTEMPURAN BERLANGSUNG ⚔️
                </div>

                {/* Player Status / Guard Bar */}
                <div className="flex justify-between items-end relative z-10 border-t border-slate-700/10 pt-4">
                  <div className="text-left">
                    <span className="text-xs font-black text-emerald-400">🛡️ Pelindung Langit (Anda)</span>
                    <div className="w-48 mt-1.5">
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-emerald-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${level5PlayerHP}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-400">{level5PlayerHP} HP</span>
                </div>
              </div>

              {/* Live Battle Log Feed */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-xs font-mono h-28 overflow-y-auto flex flex-col-reverse gap-1">
                {level5Logs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('BENAR') ? 'text-emerald-400' : log.startsWith('SALAH') ? 'text-red-500' : 'text-slate-400'}>
                    ⚡ {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Quiz Option Panel turned into Weapon Deck Selector */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className={`p-5 rounded-3xl border flex-1 flex flex-col justify-between ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black tracking-wider text-red-500 uppercase">Amanat Pertahanan Langit:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                      SERANG: +125 DMG
                    </span>
                  </div>

                  {/* Active threat warning card */}
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 mb-5 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400">⚠️ Ancaman Gas Racun Aktif:</p>
                    <p className={`text-xs font-bold leading-relaxed mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {level5QIdx === 0 && "👹 Serangan Ozon Sekunder (O₃) Korosif!"}
                      {level5QIdx === 1 && "👹 Serangan Gas Sulfur Dioksida (SO₂) Asam!"}
                      {level5QIdx === 2 && "👹 Serangan Kubah Suhu Inversi Udara!"}
                      {level5QIdx === 3 && "👹 Semburan Gas Karbon Monoksida (CO) Mematikan!"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {level5QIdx === 0 && "Paru-paru warga terancam korosi oksidatif hebat! Siapkan senjata pelindung."}
                      {level5QIdx === 1 && "Belerang industri berikatan dengan awan air membentuk Hujan Asam (H₂SO₄)!"}
                      {level5QIdx === 2 && "Udara hangat di atas menahan polutan pekat beracun dingin terperangkap di bawah!"}
                      {level5QIdx === 3 && "Gas CO tak berbau mulai mengikat hemoglobin darah secara instan!"}
                    </p>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">PILIH DEK SENJATA / SOLUSI HIJAU:</p>
                  
                  <div className="flex flex-col gap-2.5">
                    {level5QIdx === 0 && [
                      { idx: 0, label: "💨 Saringan Debu PM10 (Filter Fisik)", desc: "Menahan partikel kasar, tidak menyerap gas." },
                      { idx: 1, label: "🧬 Absorber Oksidasi Katalis (Ozon)", desc: "Menetralisir senyawa O₃ oksidator kuat menjadi gas oksigen aman!", correct: true },
                      { idx: 2, label: "🌬️ Generator Angin Biasa", desc: "Menggerakkan udara permukaan tanpa mereduksi kadar racun." },
                      { idx: 3, label: "💧 Kondensor Uap Air (Hujan Buatan)", desc: "Menciptakan rintik air, namun O₃ tidak larut dalam air." }
                    ].map((btn) => (
                      <button
                        key={btn.idx}
                        onClick={() => handleAnswerBossQuestion(btn.idx)}
                        className={`text-left p-3 rounded-xl border cursor-pointer transition-all ${
                          btn.correct 
                            ? 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30' 
                            : 'bg-slate-950/30 hover:bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-[11px] font-black text-slate-200">{btn.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{btn.desc}</p>
                      </button>
                    ))}

                    {level5QIdx === 1 && [
                      { idx: 0, label: "🧪 Reaktor Nitrogen Bebas (SCR)", desc: "Berfungsi menyaring NO2, bukan senyawa sulfur SO2." },
                      { idx: 1, label: "🚿 Kabut Alkalin (FGD Flue Gas Desulfurization)", desc: "Menyemprotkan senyawa kalsium alkalin untuk menetralisir SO2 korosif!", correct: true },
                      { idx: 2, label: "🌡️ Kondensor Suhu Dingin", desc: "Mendinginkan cerobong pabrik saja." },
                      { idx: 3, label: "🎈 Saringan Gas Helium", desc: "Tidak berpengaruh pada emisi gas industri cerobong." }
                    ].map((btn) => (
                      <button
                        key={btn.idx}
                        onClick={() => handleAnswerBossQuestion(btn.idx)}
                        className={`text-left p-3 rounded-xl border cursor-pointer transition-all ${
                          btn.correct 
                            ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30' 
                            : 'bg-slate-950/30 hover:bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-[11px] font-black text-slate-200">{btn.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{btn.desc}</p>
                      </button>
                    ))}

                    {level5QIdx === 2 && [
                      { idx: 0, label: "🌀 Booster Konveksi Udara (Vertical Fan)", desc: "Memaksa sirkulasi udara vertikal mendobrak kubah inversi hangat!", correct: true },
                      { idx: 1, label: "🔥 Tungku Pembakaran Terbuka", desc: "Malah menambah kepekatan jelaga asap yang terperangkap." },
                      { idx: 2, label: "❄️ Saringan Freon AC", desc: "Berfungsi di dalam ruangan tertutup, bukan atmosfer luar." },
                      { idx: 3, label: "🚿 Saringan Kabut Cair", desc: "Tidak mampu menembus hambatan termal kubah inversi." }
                    ].map((btn) => (
                      <button
                        key={btn.idx}
                        onClick={() => handleAnswerBossQuestion(btn.idx)}
                        className={`text-left p-3 rounded-xl border cursor-pointer transition-all ${
                          btn.correct 
                            ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30' 
                            : 'bg-slate-950/30 hover:bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-[11px] font-black text-slate-200">{btn.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{btn.desc}</p>
                      </button>
                    ))}

                    {level5QIdx === 3 && [
                      { idx: 0, label: "⚙️ Konverter Katalitik Logam Mulia (Pt/Pd)", desc: "Mereduksi gas beracun CO & NOx menjadi CO₂ & N₂ bebas bahaya!", correct: true },
                      { idx: 1, label: "💨 Saringan Debu Kasar (PM10 Filter)", desc: "Hanya menyaring partikel abu, gas CO beracun tetap lolos." },
                      { idx: 2, label: "⛽ Subsidi BBM Premium Fosil", desc: "Memicu pelipatgandaan gas CO hasil pembakaran tidak sempurna." },
                      { idx: 3, label: "❄️ Sistem Radiator Pendingin Mesin", desc: "Mencegah mesin panas, tidak mereduksi emisi zat gas beracun." }
                    ].map((btn) => (
                      <button
                        key={btn.idx}
                        onClick={() => handleAnswerBossQuestion(btn.idx)}
                        className={`text-left p-3 rounded-xl border cursor-pointer transition-all ${
                          btn.correct 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30' 
                            : 'bg-slate-950/30 hover:bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-[11px] font-black text-slate-200">{btn.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{btn.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/10 text-center">
                  <span className="text-[9px] font-black tracking-widest text-slate-500 block uppercase">Pengetahuan adalah Perisai</span>
                  <span className="text-[10px] text-red-500 font-extrabold block mt-0.5">Salah memilih senjata pelindung mengurangi pertahanan Anda sebesar 25 HP!</span>
                </div>
              </div>
            </div>

          </div>

          {/* Overlays */}
          {level5GameOver && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-sm rounded-3xl p-6 sm:p-7 bg-slate-900 border border-slate-800 text-center shadow-2xl">
                <span className="text-4xl">👹👑</span>
                <h3 className="text-2xl font-black text-rose-500 mt-3">Kota Dikuasai Raja Polusi!</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Pertahanan Anda dihancurkan oleh tebaran asap pekat. Raja polusi berhasil merebut kekuasaan dan merusak atmosfer kota seutuhnya.
                </p>
                <button
                  onClick={startLevel5}
                  className="w-full mt-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:scale-[1.02] cursor-pointer"
                >
                  Mulai Ulang Pertempuran ⚔️
                </button>
              </div>
            </div>
          )}

          {level5Success && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mb-3 text-3xl">
                    👑
                  </div>
                  <h3 className="text-2xl font-black">Raja Polusi Dikalahkan!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Luar biasa! Seluruh awan kabut asap berhasil dibersihkan dari langit kota, dan warga kembali bernapas dengan lega. Anda adalah Pahlawan Udara Bersih!
                  </p>
                </div>

                {/* Educational Components list inside Level 5 */}
                <div className="my-5 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 text-left">
                  <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    🛡️ Ringkasan Konsep Evaluasi Sains Atmosfer:
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] leading-relaxed border-b border-rose-500/10 pb-2">
                      <span className="font-extrabold text-rose-400 block sm:inline">⛅ Ozon Permukaan (O₃):</span> Senyawa korosif sekunder hasil reaksi kimia sinar matahari dengan sisa gas NOx, menyebabkan iritasi permanen jaringan alveolus paru-paru.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-rose-500/10 pb-2">
                      <span className="font-extrabold text-rose-400 block sm:inline">🧪 H2SO4 (Asam Sulfat):</span> Cairan asam hasil pelarutan SO₂ di awan yang mempercepat korosi infrastruktur baja jembatan dan merusak pH air danau.
                    </div>
                    <div className="text-[11px] leading-relaxed border-b border-rose-500/10 pb-2">
                      <span className="font-extrabold text-rose-400 block sm:inline">🌡️ Suhu Inversi:</span> Fenomena penahanan udara dingin kotor permukaan oleh hamparan udara hangat di stratosfer, merangkap polusi pekat di dataran kota tanpa sirkulasi.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-rose-400 block sm:inline">⚙️ Konverter Katalitik:</span> Alat reduksi emisi gas buang berlogam mulia (platina/paladium) di knalpot modern untuk mengubah CO berbahaya dan NOx menjadi CO₂ dan N₂ yang lebih aman.
                    </div>
                  </div>
                </div>

                <div className="mb-5 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-xs text-red-400 font-extrabold text-center">
                  🪙 +150 Eco-Points  |  🔥 +250 XP  |  🎖️ Lencana Khusus Unlocked!
                </div>

                <button
                  onClick={() => {
                    setCurrentLevel(null);
                    onAddNotification('Selamat! Anda telah menamatkan seluruh 5 level petualangan udara! 🌟', 'success');
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all cursor-pointer text-xs"
                >
                  Selesaikan Misi & Kembali ke Peta
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
