import React from 'react';
import { Play, RotateCcw, Grid, Volume2, VolumeX } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface PauseModalProps {
  level: LevelConfig;
  onResume: () => void;
  onRestart: () => void;
  onSectorMap: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  onResume,
  onRestart,
  onSectorMap,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0F]/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#12131D] border border-white/15 rounded-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center flex flex-col items-center gap-1 border-b border-white/10 pb-3">
          <span className="text-[10px] font-mono-tech tracking-widest text-[#00F5D4] uppercase">
            OPERATIONS SUSPENDED
          </span>
          <h2 className="text-xl font-display font-bold">{level.name}</h2>
          <span className="text-xs text-slate-400 font-mono-tech">{level.sectorName}</span>
        </div>

        <div className="flex flex-col gap-2.5 font-display text-sm font-bold">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-2.5 px-4 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Operations [Esc]</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Stage [R]</span>
          </button>

          <button
            type="button"
            onClick={onSectorMap}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Sector Deployment Map</span>
          </button>
        </div>

        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs font-mono-tech text-slate-400">
          <span>Audio Synthesizer:</span>
          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-1.5 text-white hover:text-[#00F5D4] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00F5D4]" />}
            <span>{isMuted ? 'Muted' : 'Active'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
