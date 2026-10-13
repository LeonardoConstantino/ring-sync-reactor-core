import React from 'react';
import { Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: 'GAME' | 'SECTORS' | 'SURVIVAL' | 'TRAINING' | 'RECORDS' | 'HOW_TO_PLAY') => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="h-14 border-b border-white/10 bg-[#0A0A0F]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Zone 1: Single text element wordmark */}
      <button
        type="button"
        onClick={() => onNavigate('SECTORS')}
        className="text-base sm:text-lg font-display font-bold tracking-tight text-white hover:text-[#00F5D4] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
        <span>Ring Sync: Reactor Core</span>
      </button>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          type="button"
          onClick={() => onNavigate('SECTORS')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'SECTORS' ? 'text-[#00F5D4] underline underline-offset-4' : ''
          }`}
        >
          Sectors
        </button>
        <button
          type="button"
          onClick={() => onNavigate('SURVIVAL')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'SURVIVAL' ? 'text-[#00F5D4] underline underline-offset-4' : ''
          }`}
        >
          Overload
        </button>
        <button
          type="button"
          onClick={() => onNavigate('TRAINING')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'TRAINING' ? 'text-[#00F5D4] underline underline-offset-4' : ''
          }`}
        >
          Calibration
        </button>
        <button
          type="button"
          onClick={() => onNavigate('RECORDS')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'RECORDS' ? 'text-[#00F5D4] underline underline-offset-4' : ''
          }`}
        >
          Records
        </button>
        <button
          type="button"
          onClick={() => onNavigate('HOW_TO_PLAY')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'HOW_TO_PLAY' ? 'text-[#00F5D4] underline underline-offset-4' : ''
          }`}
        >
          Manual
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00F5D4]" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="System Settings"
          aria-label="System Settings"
          className="p-2 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('SECTORS')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00F5D4]/20 hover:bg-[#00F5D4]/30 border border-[#00F5D4]/60 rounded-md transition-all whitespace-nowrap cursor-pointer"
        >
          Deploy Core
        </button>
      </div>
    </header>
  );
};
