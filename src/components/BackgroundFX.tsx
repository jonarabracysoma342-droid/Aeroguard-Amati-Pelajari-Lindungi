import React, { useEffect, useState } from 'react';

interface BackgroundFXProps {
  darkMode: boolean;
  aqiValue: number; // 0 to 500. Lower is cleaner. Higher is dirtier.
}

export const BackgroundFX: React.FC<BackgroundFXProps> = ({ darkMode, aqiValue }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }[]>([]);

  // Generate floating soot/dust particles
  useEffect(() => {
    const particleCount = Math.min(Math.floor(aqiValue / 10) + 15, 60);
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let nextY = p.y - p.speed;
          if (nextY < -5) {
            nextY = 105;
          }
          return { ...p, y: nextY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [aqiValue]);

  // Determine pollution colors
  // AQI 0-50: Good, 51-100: Moderate, 101-150: Unhealthy for Sensitive, 151+: Very Unhealthy
  const getPollutionOverlay = () => {
    if (aqiValue < 50) return 'from-emerald-500/5 to-teal-900/10';
    if (aqiValue < 120) return 'from-amber-600/10 to-stone-800/30';
    return 'from-stone-700/20 to-stone-950/70';
  };

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-1000 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Sky Gradient (starts bright blue at top, fades to polluted smog gray-brown at bottom) */}
      <div 
        id="sky-gradient"
        className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-b ${
          darkMode 
            ? 'from-indigo-950 via-slate-900 to-[#2c2420]' 
            : 'from-sky-400 via-sky-200 to-[#dcd0c0]'
        }`}
      />

      {/* Dynamic Smog Overlay based on AQI value */}
      <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-1000 ${getPollutionOverlay()}`} />

      {/* Floating Smoke Clouds (CSS animated) */}
      <div className="absolute inset-x-0 bottom-0 h-96 opacity-30 select-none">
        <div className={`absolute -left-20 bottom-10 w-96 h-96 rounded-full blur-[80px] animate-pulse duration-[8s] ${darkMode ? 'bg-stone-800/40' : 'bg-[#a39684]/30'}`} />
        <div className={`absolute right-10 bottom-20 w-80 h-80 rounded-full blur-[60px] animate-pulse duration-[12s] ${darkMode ? 'bg-stone-900/50' : 'bg-[#bcaf9c]/30'}`} />
        <div className={`absolute left-1/3 bottom-5 w-72 h-72 rounded-full blur-[70px] animate-pulse duration-[10s] ${darkMode ? 'bg-[#403830]/40' : 'bg-[#e5dcd0]/40'}`} />
      </div>

      {/* Dynamic Dust Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full transition-transform duration-75 ${
            darkMode 
              ? 'bg-amber-300/40 shadow-[0_0_8px_rgba(217,119,6,0.3)]' 
              : 'bg-stone-600/30'
          }`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* City Skyline Silhouette */}
      <div className="absolute inset-x-0 bottom-0 select-none">
        {/* Far layer */}
        <svg 
          className={`w-full h-40 opacity-20 transition-colors duration-1000 ${darkMode ? 'fill-slate-800' : 'fill-stone-500'}`} 
          viewBox="0 0 1000 120" 
          preserveAspectRatio="none"
        >
          <path d="M0,120 L0,70 L40,70 L40,80 L80,80 L80,50 L110,50 L110,90 L140,90 L140,60 L180,60 L180,85 L220,85 L220,40 L260,40 L260,100 L300,100 L300,55 L350,55 L350,75 L390,75 L390,45 L440,45 L440,90 L480,90 L480,30 L520,30 L520,70 L570,70 L570,50 L610,50 L610,95 L650,95 L650,40 L700,40 L700,85 L740,85 L740,60 L780,60 L780,100 L820,100 L820,35 L870,35 L870,80 L910,80 L910,55 L950,55 L950,90 L1000,90 L1000,120 Z" />
        </svg>

        {/* Near Layer with factories and smoking chimneys */}
        <svg 
          className={`w-full h-48 opacity-45 -mt-8 transition-colors duration-1000 ${darkMode ? 'fill-stone-900' : 'fill-stone-600'}`} 
          viewBox="0 0 1000 150" 
          preserveAspectRatio="none"
        >
          {/* Factory shapes with smokestacks */}
          <path d="M0,150 L0,90 L50,90 L50,110 L100,110 L120,60 L135,60 L135,110 L180,110 L180,80 L230,80 L230,120 L280,120 L280,70 L300,50 L320,70 L350,70 L350,120 L400,120 L400,80 L420,40 L435,40 L435,120 L500,120 L500,95 L550,95 L570,60 L585,60 L585,120 L640,120 L640,75 L690,75 L690,110 L750,110 L770,30 L790,30 L790,110 L840,110 L840,80 L890,80 L890,120 L940,120 L940,70 L960,50 L980,70 L1000,70 L1000,150 Z" />
        </svg>
      </div>

      {/* Animated Puff Clouds from Chimneys */}
      <div className="absolute inset-x-0 bottom-0 h-48 select-none overflow-hidden">
        {/* Chimney 1 smoke */}
        <div className="absolute left-[125px] bottom-36 animate-ping duration-[4s] w-6 h-6 rounded-full bg-stone-500/20 blur-sm" />
        <div className="absolute left-[122px] bottom-40 animate-pulse duration-[3s] w-8 h-8 rounded-full bg-stone-500/10 blur" />
        
        {/* Chimney 2 smoke */}
        <div className="absolute left-[425px] bottom-[110px] animate-ping duration-[3.5s] w-5 h-5 rounded-full bg-stone-400/20 blur-sm" />
        <div className="absolute left-[422px] bottom-[115px] animate-pulse duration-[2.5s] w-7 h-7 rounded-full bg-stone-400/10 blur" />

        {/* Chimney 3 smoke */}
        <div className="absolute left-[775px] bottom-[120px] animate-ping duration-[5s] w-8 h-8 rounded-full bg-stone-600/20 blur-sm" />
      </div>

    </div>
  );
};
