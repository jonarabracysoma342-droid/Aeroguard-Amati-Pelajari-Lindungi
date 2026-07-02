import React, { useState } from 'react';
import { Role, SiswaProfile, GuruProfile } from '../types';
import { GraduationCap, User, Sparkles, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPanelProps {
  darkMode: boolean;
  onLoginSiswa: (profile: SiswaProfile) => void;
  onLoginGuru: (profile: GuruProfile) => void;
  validateGroupCode: (code: string) => boolean;
  onAddNotification: (message: string, type: 'info' | 'success' | 'join') => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({
  darkMode,
  onLoginSiswa,
  onLoginGuru,
  validateGroupCode,
  onAddNotification,
}) => {
  const [role, setRole] = useState<Role>('siswa');
  const [siswaName, setSiswaName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  
  const [guruName, setGuruName] = useState('');
  const [guruSubject, setGuruSubject] = useState('Ilmu Pengetahuan Alam (IPA)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'siswa') {
      if (!siswaName.trim()) {
        alert('Tolong masukkan nama lengkap Anda.');
        return;
      }
      
      let validCode: string | null = null;
      if (groupCode.trim()) {
        const sanitized = groupCode.trim().toUpperCase();
        const isValid = validateGroupCode(sanitized);
        if (isValid) {
          validCode = sanitized;
          onAddNotification(`Berhasil bergabung dengan kelompok ${sanitized}! 🎉`, 'success');
        } else {
          alert('Kode kelompok tidak valid atau tidak ditemukan. Pastikan Anda memasukkan kode yang benar.');
          return;
        }
      }

      onLoginSiswa({
        name: siswaName.trim(),
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        ecoPoints: 0,
        joinCode: validCode,
        badges: [],
        completedModules: [],
        gameHighScore: 0,
        quizHighScore: 0,
      });

    } else {
      if (!guruName.trim()) {
        alert('Tolong masukkan nama lengkap Anda.');
        return;
      }
      if (!guruSubject.trim()) {
        alert('Tolong masukkan nama mata pelajaran.');
        return;
      }

      onLoginGuru({
        name: guruName.trim(),
        subject: guruSubject.trim(),
        createdGroups: [],
      });
    }
  };

  return (
    <div id="login-panel" className="max-w-md mx-auto py-10 px-4 sm:px-6 relative z-10 animate-fade-in">
      
      {/* Brand Logo & Name */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-xs font-black tracking-widest uppercase mb-4 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-500" /> Game Edukasi Interaktif
        </div>
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          UDARAKU
        </h1>
        <p className={`text-sm mt-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Pelajari & Selamatkan Atmosfer Bumi Kita
        </p>
      </div>

      {/* Role Selection Container */}
      <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-md shadow-2xl ${
        darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 gap-3 mb-8 bg-slate-950/20 p-1.5 rounded-2xl border border-slate-700/10">
          <button
            type="button"
            onClick={() => setRole('siswa')}
            className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              role === 'siswa'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Siswa
          </button>
          
          <button
            type="button"
            onClick={() => setRole('guru')}
            className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              role === 'guru'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Guru / Pendidik
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {role === 'siswa' ? (
            /* Student Form Inputs */
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap siswa..."
                  value={siswaName}
                  onChange={(e) => setSiswaName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Kode Kelompok Guru <span className="text-[10px] text-slate-500 font-normal lowercase">(opsional)</span>
                </label>
                <span className="text-[10px] text-slate-500 block mb-2 leading-tight">Masukkan kode dari guru jika ingin masuk ke kelas otomatis.</span>
                <input
                  type="text"
                  placeholder="Contoh: ECO-ABC1"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>
          ) : (
            /* Teacher Form Inputs */
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap guru..."
                  value={guruName}
                  onChange={(e) => setGuruName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">Mata Pelajaran</label>
                <select
                  value={guruSubject}
                  onChange={(e) => setGuruSubject(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                  <option value="Biologi Lingkungan">Biologi Lingkungan</option>
                  <option value="Geografi / Kebumian">Geografi / Kebumian</option>
                  <option value="Fisika & Kimia Atmosfer">Fisika & Kimia Atmosfer</option>
                  <option value="Ekologi & Konservasi">Ekologi & Konservasi</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span>Masuk ke Applet</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>

    </div>
  );
};
