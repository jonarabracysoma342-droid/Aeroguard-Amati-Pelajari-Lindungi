import React from 'react';
import { Users, ArrowLeft, Trophy } from 'lucide-react';
import { Group, SiswaProfile } from '../types';

interface KelompokPanelProps {
  darkMode: boolean;
  profile: SiswaProfile | null | any;
  group: Group | undefined;
  onBack: () => void;
}

export const KelompokPanel: React.FC<KelompokPanelProps> = ({ darkMode, profile, group, onBack }) => {
  return (
    <div className={`max-w-4xl mx-auto py-6 px-4 animate-fade-in ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer mb-6 backdrop-blur-md ${
          darkMode
            ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/30 text-slate-300 hover:text-white'
            : 'bg-white/85 hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
        }`}
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {group ? (
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4 border-b border-slate-700/20 pb-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{group.name}</h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Kode: {group.code} • Guru: {group.teacherName}
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" /> Klasemen Anggota
          </h3>
          <div className="space-y-3">
            {[...group.students].sort((a, b) => b.exp - a.exp).map((student, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  student.name === profile?.name 
                    ? (darkMode ? 'bg-teal-500/10 border-teal-500/30' : 'bg-teal-50 border-teal-200')
                    : (darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200')
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-bold block">{student.name} {student.name === profile?.name && '(Anda)'}</span>
                    <span className="text-xs text-slate-400">Level {student.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-teal-400 block">{student.exp} XP</span>
                  <span className="text-xs text-emerald-400">🪙 {student.ecoPoints}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center rounded-3xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Users className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Belum Bergabung dengan Kelompok</h3>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            Anda belum bergabung dengan kelompok belajar manapun. Masukkan kode guru di menu atas untuk bergabung.
          </p>
        </div>
      )}
    </div>
  );
};
