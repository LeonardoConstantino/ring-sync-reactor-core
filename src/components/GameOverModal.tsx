import React from 'react';
import { LevelConfig } from '../types/game';
import { AlertOctagon, RotateCcw, Grid } from 'lucide-react';

interface GameOverModalProps {
  level: LevelConfig;
  cause: 'meltdown' | 'strikes';
  onRetry: () => void;
  onSectorMap: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  cause,
  onRetry,
  onSectorMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0F]/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#160D12] border-2 border-[#FF2244]/60 rounded-xl p-5 sm:p-7 shadow-[0_0_60px_rgba(255,34,68,0.3)] flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#FF2244]/20 border border-[#FF2244] flex items-center justify-center text-[#FF2244] shadow-[0_0_20px_#FF2244]">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>

          <div className="text-xs font-mono-tech tracking-widest text-[#FF2244] uppercase">
            Emergency Failure Protocol
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
            REACTOR MELTDOWN
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-mono-tech max-w-xs">
            {cause === 'meltdown'
              ? 'Core temperature exceeded 100% critical threshold. Total thermal containment breach.'
              : 'Triple synchronization failure detected. Emergency dampeners severed.'}
          </p>
        </div>

        <div className="bg-black/50 border border-[#FF2244]/20 p-3.5 rounded-lg text-xs font-mono-tech space-y-1.5 text-slate-400">
          <div className="flex justify-between">
            <span>Installation:</span>
            <span className="text-white">{level.sectorName}</span>
          </div>
          <div className="flex justify-between">
            <span>Terminal:</span>
            <span className="text-white">{level.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-[#FF2244] font-bold">GRID OFFLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSectorMap}
            className="flex-1 py-2.5 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Sectors</span>
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-2.5 px-4 bg-[#FF2244] hover:bg-[#FF2244]/90 text-white font-display font-bold text-xs sm:text-sm tracking-wide rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,34,68,0.4)] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Emergency Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
