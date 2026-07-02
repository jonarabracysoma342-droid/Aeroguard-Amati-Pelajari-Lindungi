import React from 'react';
import { SiswaProfile, Badge } from '../types';
import { BADGES_LIST } from '../data';
import { ShieldCheck, Calendar, Trophy, Sparkles, LogOut, Moon, Sun, RefreshCw, Star, ArrowLeft, Music, Upload, RotateCcw, Play, Square, Loader2, Volume1, Volume2, Zap, Smile, Activity } from 'lucide-react';
import { audio } from '../utils/audio';

interface SettingsPanelProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  profile: SiswaProfile | null;
  onLogout: () => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  darkMode,
  setDarkMode,
  profile,
  onLogout,
  onResetProgress,
  onBack,
}) => {
  const [bgmInfo, setBgmInfo] = React.useState(() => audio.getBgmInfo());
  const [loopStartInput, setLoopStartInput] = React.useState(bgmInfo.loopStart);
  const [loopEndInput, setLoopEndInput] = React.useState(bgmInfo.loopEnd);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // States for BGM Studio integration inside Profile
  const [isBgmOn, setIsBgmOn] = React.useState(() => audio.isPlayingBgm());
  const [bgmVolume, setBgmVolume] = React.useState(0.3);
  const [activeBgmPreset, setActiveBgmPreset] = React.useState<string>(() => {
    return audio.getActiveTrackId();
  });
  const [customTracks, setCustomTracks] = React.useState(() => audio.getCustomTracks());
  const [isMusicLoading, setIsMusicLoading] = React.useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audio.playSfx('click');
      setErrorMsg('');
      setLoading(true);
      const success = await audio.loadBgm(file);
      setLoading(false);
      if (success) {
        const info = audio.getBgmInfo();
        setBgmInfo(info);
        setLoopStartInput(info.loopStart);
        setLoopEndInput(info.loopEnd);
        
        // Refresh custom track list
        const tracks = audio.getCustomTracks();
        setCustomTracks(tracks);
        
        const activeTrackId = audio.getActiveTrackId();
        setActiveBgmPreset(activeTrackId);
      } else {
        setErrorMsg('Gagal memproses file audio. Pastikan file tidak rusak.');
      }
    }
  };

  const handleLoopChange = (start: number, end: number) => {
    setLoopStartInput(start);
    setLoopEndInput(end);
    audio.setLoopTimes(start, end);
    setBgmInfo(audio.getBgmInfo());
  };

  const handleResetBgm = () => {
    audio.playSfx('click');
    audio.resetBgmToDefault();
    const info = audio.getBgmInfo();
    setBgmInfo(info);
    setLoopStartInput(info.loopStart);
    setLoopEndInput(info.loopEnd);
    setErrorMsg('');
    setActiveBgmPreset('adventure');
  };

  const handleSelectBgmPreset = async (preset: string) => {
    setIsMusicLoading(true);
    audio.playSfx('click');
    const success = await audio.selectTrack(preset);
    if (success) {
      setActiveBgmPreset(preset);
      const info = audio.getBgmInfo();
      setBgmInfo(info);
      setLoopStartInput(info.loopStart);
      setLoopEndInput(info.loopEnd);
    } else {
      setErrorMsg('Gagal memproses pilihan musik.');
    }
    setIsMusicLoading(false);
  };

  const handleVolumeChangeLocal = (vol: number) => {
    setBgmVolume(vol);
    audio.setBgmVolume(vol);
  };

  const toggleBgmLocal = () => {
    audio.playSfx('click');
    if (isBgmOn) {
      audio.stopBgm();
      setIsBgmOn(false);
    } else {
      audio.playBgm();
      setIsBgmOn(true);
    }
  };

  return (
    <div id="settings-panel" className="max-w-3xl mx-auto py-4 px-4 sm:px-6 relative z-10 animate-fade-in">
      
      {/* Back Button */}
      <div className="flex justify-start mb-4">
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
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          ⚙️ Pengaturan & Profil Eco-Hero
        </h2>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-md mx-auto`}>
          Kelola mode tampilan mata, periksa pencapaian lencana, atau atur ulang kemajuan belajar Anda di sini.
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Card: Theme & Logout controls */}
        <div className={`md:col-span-1 p-6 rounded-3xl border flex flex-col justify-between backdrop-blur-md shadow-lg ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Preferensi</h3>
            
            {/* Dark Mode toggle */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">Tema Tampilan</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer border ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {darkMode ? 'Mode Gelap' : 'Mode Terang'}
                </span>
                <span className="text-xs opacity-60">Ubah</span>
              </button>
            </div>
            {/* BGM Studio Panel */}
            <div className="space-y-4 pt-4 border-t border-slate-700/10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 block flex items-center gap-1.5 uppercase tracking-wider">
                  <Music className="w-4 h-4 text-teal-500 animate-pulse" />
                  BGM Studio
                </span>
                
                {/* Visualizer bars */}
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{ 
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${0.6 + (i * 0.1)}s` 
                      }}
                      className={`w-0.5 bg-teal-500 rounded-full transition-all ${
                        isBgmOn ? 'animate-bounce h-3' : 'h-1'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Play/Stop button card */}
              <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${
                darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-150'
              }`}>
                <button
                  onClick={toggleBgmLocal}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                    isBgmOn 
                      ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-rose-500/15 scale-105 hover:scale-110' 
                      : 'bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-teal-500/15 hover:scale-105'
                  }`}
                >
                  {isBgmOn ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isBgmOn ? 'text-rose-500 animate-pulse' : 'text-teal-500'}`}>
                  {isBgmOn ? 'STOP BGM' : 'PLAY BGM'}
                </span>
              </div>

              {/* Soundtrack preset lists */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pilih Soundtrack</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    onClick={() => handleSelectBgmPreset('adventure')}
                    disabled={isMusicLoading}
                    className={`py-2 px-2 rounded-xl border text-left font-bold transition-all truncate flex items-center gap-1 cursor-pointer ${
                      activeBgmPreset === 'adventure'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-black'
                        : darkMode
                          ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Petualangan
                  </button>

                  <button
                    onClick={() => handleSelectBgmPreset('cyberpunk')}
                    disabled={isMusicLoading}
                    className={`py-2 px-2 rounded-xl border text-left font-bold transition-all truncate flex items-center gap-1 cursor-pointer ${
                      activeBgmPreset === 'cyberpunk'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-black'
                        : darkMode
                          ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Cyberpunk
                  </button>

                  <button
                    onClick={() => handleSelectBgmPreset('classic')}
                    disabled={isMusicLoading}
                    className={`py-2 px-2 rounded-xl border text-left font-bold transition-all truncate flex items-center gap-1 cursor-pointer ${
                      activeBgmPreset === 'classic'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-black'
                        : darkMode
                          ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5 text-yellow-400" />
                    Retro
                  </button>

                  <button
                    onClick={() => handleSelectBgmPreset('stream')}
                    disabled={isMusicLoading}
                    className={`py-2 px-2 rounded-xl border text-left font-bold transition-all truncate flex items-center gap-1 cursor-pointer ${
                      activeBgmPreset === 'stream'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-black'
                        : darkMode
                          ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {isMusicLoading && activeBgmPreset === 'stream' ? (
                      <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    Epic Stream
                  </button>

                  {/* Custom uploaded tracks */}
                  {customTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleSelectBgmPreset(track.id)}
                      disabled={isMusicLoading}
                      className={`py-2 px-2 rounded-xl border text-left font-bold transition-all truncate flex items-center gap-1.5 cursor-pointer ${
                        activeBgmPreset === track.id
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-black'
                          : darkMode
                            ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      title={track.name}
                    >
                      <Music className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                      <span className="truncate">{track.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider Block */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Volume BGM</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume1 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    onChange={(e) => handleVolumeChangeLocal(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Custom Uploader block */}
              <div className="space-y-2 pt-2 border-t border-slate-700/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Aktif: <span className="font-semibold text-teal-400 text-xs font-mono">{bgmInfo.fileName}</span></span>
                
                {bgmInfo.useAudioFileBgm && (
                  <div className="text-[9px] text-slate-400 space-y-0.5 leading-tight p-2 rounded-xl bg-slate-950/20 border border-slate-800">
                    <div>Poin Loop: <span className="font-mono text-teal-400">{bgmInfo.loopStart}s</span> s/d <span className="font-mono text-teal-400">{bgmInfo.loopEnd}s</span></div>
                    {bgmInfo.duration > 0 && <div>Total Durasi: <span className="font-mono">{bgmInfo.duration.toFixed(1)}s</span></div>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                        ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}>
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    {loading ? 'Memproses Audio...' : 'Unggah Musik Baru (.mp3)'}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      disabled={loading}
                      onChange={handleAudioUpload}
                    />
                  </label>

                  {errorMsg && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 leading-normal">{errorMsg}</p>
                  )}

                  {bgmInfo.useAudioFileBgm && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Mulai Loop (detik)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={loopStartInput}
                          onChange={(e) => handleLoopChange(Math.max(0, parseFloat(e.target.value) || 0), loopEndInput)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Akhir Loop (detik)</span>
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={loopEndInput}
                          onChange={(e) => handleLoopChange(loopStartInput, Math.max(0.1, parseFloat(e.target.value) || 28))}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {bgmInfo.useAudioFileBgm && (
                    <button
                      onClick={handleResetBgm}
                      className="w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Kembali ke Musik Bawaan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={onResetProgress}
              className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer border transition-colors ${
                darkMode
                  ? 'border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10'
                  : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atur Ulang Kemajuan
            </button>

            <button
              onClick={onLogout}
              className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer border transition-colors ${
                darkMode
                  ? 'border-slate-700 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar Akun
            </button>
          </div>
        </div>

        {/* Right Card: Gamification badges and highscores */}
        <div className={`md:col-span-2 p-6 sm:p-8 rounded-3xl border backdrop-blur-md shadow-lg ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {profile ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-teal-500 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Galeri Lencana Pencapaian
                </h3>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {profile.badges.length} / {BADGES_LIST.length} Unlocked
                </span>
              </div>

              {/* Badges Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {BADGES_LIST.map((b) => {
                  const unlocked = profile.badges.find((pb) => pb.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition-all flex gap-3 items-center ${
                        unlocked
                          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 text-slate-100'
                          : 'opacity-40 border-slate-700/10'
                      }`}
                    >
                      <div className="text-3xl filter drop-shadow select-none">{b.icon}</div>
                      <div>
                        <h4 className={`text-sm font-black ${unlocked ? 'text-amber-500' : 'text-slate-400'}`}>
                          {b.title}
                        </h4>
                        <p className={`text-[10px] mt-0.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {b.description}
                        </p>
                        {unlocked?.unlockedAt && (
                          <span className="text-[8px] text-slate-500 font-mono mt-1 block">
                            Diberikan: {unlocked.unlockedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements stats info */}
              <div className="pt-6 border-t border-slate-700/10 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/25 border border-slate-800/10">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-widest font-bold">Skor Kuis Tertinggi</span>
                  <span className="text-xl font-black text-violet-500 block mt-1">{profile.quizHighScore}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/25 border border-slate-800/10">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-widest font-bold">Skor Game Terbersih</span>
                  <span className="text-xl font-black text-amber-500 block mt-1">{profile.gameHighScore}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-teal-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Silakan masuk sebagai siswa untuk memeriksa pencapaian Anda.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
