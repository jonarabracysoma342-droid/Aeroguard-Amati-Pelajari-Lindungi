import React, { useEffect } from 'react';
import { NotificationItem } from '../types';
import { X, Bell, UserPlus, Info, CheckCircle } from 'lucide-react';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}

export const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Design a friendly retro game pop chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (err) {
    console.warn('Audio context failed to play sound', err);
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
  // Play sound when a new notification joins
  useEffect(() => {
    if (notifications.length > 0) {
      playNotificationSound();
    }
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  return (
    <div id="notification-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {notifications.map((n) => {
        let Icon = Bell;
        let iconBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        
        if (n.type === 'join') {
          Icon = UserPlus;
          iconBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        } else if (n.type === 'success') {
          Icon = CheckCircle;
          iconBg = 'bg-teal-500/20 text-teal-400 border-teal-500/30';
        } else if (n.type === 'info') {
          Icon = Info;
          iconBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        }

        return (
          <div
            key={n.id}
            className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 text-white shadow-2xl backdrop-blur-md animate-slide-in transition-all duration-300 hover:translate-x-1"
          >
            <div className={`p-2 rounded-xl border ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">{n.message}</p>
              <span className="text-xs text-slate-400 mt-1 block">{n.time}</span>
            </div>

            <button
              onClick={() => onClose(n.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
