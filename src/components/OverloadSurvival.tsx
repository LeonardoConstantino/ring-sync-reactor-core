import React from 'react';
import { Flame, Play, Trophy, ShieldAlert, RotateCcw } from 'lucide-react';

interface OverloadSurvivalProps {
  highScore: number;
  highestWave: number;
  onStartSurvival: () => void;
  onClose: () => void;
}

export const OverloadSurvival: React.FC<OverloadSurvivalProps> = ({
  highScore,
  highestWave,
  onStartSurvival,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0F]/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#140D14] border-2 border-[#9333EA]/60 rounded-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(147,51,234,0.25)] flex flex-col gap-6 text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#9333EA]/20 border border-[#9333EA] flex items-center justify-center text-[#9333EA] shadow-[0_0_20px_#9333EA]">
            <Flame className="w-8 h-8 animate-pulse text-[#FF6B00]" />
          </div>

          <div className="text-xs font-mono-tech tracking-widest text-[#9333EA] uppercase">
            Emergency Survival Protocol
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            INFINITE OVERLOAD
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-mono-tech max-w-sm">
            Endless cascading rings with escalating velocities. No checkpoints. No pauses. How long can you prevent critical singularity meltdown?
          </p>
        </div>

        {/* High Score / Best Wave Callouts */}
        <div className="grid grid-cols-2 gap-3 bg-black/50 border border-white/10 p-4 rounded-lg font-mono-tech">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#00F5D4]" />
              Survival Record
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {highScore.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Deepest Wave Reached
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#FF6B00] tabular-nums">
              WAVE {highestWave > 0 ? highestWave : '—'}
            </div>
          </div>
        </div>

        {/* Hazard Protocol Notice */}
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-xs font-mono-tech text-slate-400 space-y-1">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF2244]" />
            Continuous Pressure Curve
          </div>
          <p className="text-[11px]">
            Every ring locked spawns faster rotation. Slow-Mo charges regenerate only every 5 successful waves.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onStartSurvival}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#9333EA] to-[#FF6B00] hover:opacity-95 text-white font-display font-bold text-xs sm:text-sm tracking-wide rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Engage Overload</span>
          </button>
        </div>
      </div>
    </div>
  );
};
