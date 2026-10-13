import React from 'react';
import { LevelConfig, SectorConfig } from '../types/game';
import { Zap, AlertTriangle, Flame, ShieldAlert, Volume2, VolumeX, Pause } from 'lucide-react';
import { getComboMultiplier } from '../domain/scoring';

interface HUDProps {
  level: LevelConfig;
  sector: SectorConfig;
  score: number;
  elapsedTime: number;
  pressureFactor: number;
  slowMoCharges: number;
  isSlowMo: boolean;
  slowMoTimer: number;
  comboStreak: number;
  temperature: number;
  strikes: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onTriggerSlowMo: () => void;
  onTriggerSnap: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  sector,
  score,
  elapsedTime,
  pressureFactor,
  slowMoCharges,
  isSlowMo,
  slowMoTimer,
  comboStreak,
  temperature,
  strikes,
  isMuted,
  onToggleMute,
  onPause,
  onTriggerSlowMo,
  onTriggerSnap,
}) => {
  // Pressure calculation
  const speedBonusPct = Math.round(pressureFactor * elapsedTime * 100);
  const pressureFillPct = Math.min(100, Math.round((speedBonusPct / 150) * 100));

  const comboMult = getComboMultiplier(comboStreak);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* TOP HEADER */}
      <header className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 bg-[#0A0A0F]/80 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg">
          {/* Sector & Level Info */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono-tech tracking-wider text-slate-400">
                {sector.code} · STAGE {level.stageIndex + 1}
              </span>
              <h1 className="text-sm sm:text-base font-display font-bold tracking-wide text-white flex items-center gap-2">
                {level.name}
                {level.bossType && level.bossType !== 'none' && (
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#FF2244] bg-[#FF2244]/10 border border-[#FF2244]/30 px-1.5 py-0.5 rounded">
                    CRITICAL BOSS
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Score & Quick Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-right">
              <div className="text-[10px] font-mono-tech tracking-widest text-slate-400">SCORE</div>
              <div className="text-base sm:text-lg font-mono-tech font-bold text-[#00F5D4] tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="w-8 h-8 rounded border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00F5D4]" />}
              </button>

              <button
                type="button"
                onClick={onPause}
                title="Pause Operations (Esc)"
                aria-label="Pause Operations"
                className="w-8 h-8 rounded border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Warning Banner if present */}
        {level.warningAlert && (
          <div className="self-center bg-[#FF2244]/15 border border-[#FF2244]/40 text-[#FF2244] text-[11px] font-mono-tech px-3 py-1 rounded flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{level.warningAlert}</span>
          </div>
        )}

        {/* SUB-BAR: Pressure & Slow-Mo Gauges */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Pressure Meter */}
          <div className="flex items-center gap-2 bg-[#0A0A0F]/85 border border-white/10 px-3 py-1.5 rounded-md min-w-[140px] sm:min-w-[200px]">
            <span className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider">Pressure</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pressureFillPct > 70 ? 'bg-[#FF2244]' : pressureFillPct > 40 ? 'bg-[#FF6B00]' : 'bg-[#00F5D4]'
                }`}
                style={{ width: `${pressureFillPct}%` }}
              />
            </div>
            <span className="text-[10px] font-mono-tech text-white tabular-nums">+{speedBonusPct}%</span>
          </div>

          {/* Temporal Dilation (Slow-Mo) Battery Gauge */}
          <button
            type="button"
            onClick={onTriggerSlowMo}
            disabled={slowMoCharges <= 0 || isSlowMo}
            className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono-tech transition-all cursor-pointer ${
              isSlowMo
                ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.4)] animate-pulse'
                : slowMoCharges > 0
                ? 'bg-[#0A0A0F]/85 border-white/15 text-white hover:border-[#38BDF8]/60 hover:bg-white/5'
                : 'bg-[#0A0A0F]/85 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSlowMo ? 'fill-[#38BDF8]' : slowMoCharges > 0 ? 'text-[#38BDF8]' : 'text-slate-600'}`} />
            <span className="text-[11px] font-semibold tracking-wider">
              {isSlowMo ? `DILATION: ${slowMoTimer.toFixed(1)}s` : 'SLOW-MO [S]'}
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-2 h-3 rounded-xs ${
                    idx < slowMoCharges
                      ? 'bg-[#38BDF8] shadow-[0_0_6px_rgba(56,189,248,0.6)]'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </button>
        </div>
      </header>

      {/* BOTTOM CONTROLS & STATUS */}
      <footer className="flex flex-col gap-3 pointer-events-auto">
        {/* Status Metrics Bar */}
        <div className="flex items-center justify-between gap-3 bg-[#0A0A0F]/80 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg border border-white/10">
          {/* Combo Multiplier & Streak Dots */}
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono-tech tracking-widest text-slate-400">COMBO</span>
              <span
                className={`text-sm sm:text-base font-mono-tech font-bold tabular-nums ${
                  comboStreak >= 4
                    ? 'text-[#00F5D4] drop-shadow-[0_0_8px_rgba(0,245,212,0.8)]'
                    : comboStreak >= 2
                    ? 'text-[#00F5D4]'
                    : 'text-slate-300'
                }`}
              >
                ×{comboMult.toFixed(1)}
              </span>
            </div>
            {/* Streak dots */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((pip) => (
                <div
                  key={pip}
                  className={`w-2 h-2 rounded-full transition-all ${
                    comboStreak >= pip
                      ? 'bg-[#00F5D4] shadow-[0_0_6px_#00F5D4]'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Temperature & Strikes */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] font-mono-tech tracking-widest text-slate-400">REACTOR TEMP</div>
              <div
                className={`text-sm sm:text-base font-mono-tech font-bold tabular-nums flex items-center justify-end gap-1 ${
                  temperature >= 66
                    ? 'text-[#FF2244] animate-pulse drop-shadow-[0_0_8px_#FF2244]'
                    : temperature >= 33
                    ? 'text-[#FF6B00]'
                    : 'text-[#00F5D4]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                {Math.round(temperature)}%
              </div>
            </div>

            {/* Strikes Warning Markers */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((sIdx) => (
                <div
                  key={sIdx}
                  title={`Failure Strike ${sIdx + 1}/3`}
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono-tech font-bold border transition-all ${
                    sIdx < strikes
                      ? 'bg-[#FF2244] border-[#FF2244] text-white shadow-[0_0_8px_#FF2244]'
                      : 'bg-white/5 border-white/15 text-slate-600'
                  }`}
                >
                  ✕
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRIMARY INTERACTIVE LOCK BUTTON */}
        <button
          type="button"
          onClick={onTriggerSnap}
          className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#00F5D4]/20 via-[#00F5D4]/30 to-[#00F5D4]/20 hover:from-[#00F5D4]/30 hover:via-[#00F5D4]/40 hover:to-[#00F5D4]/30 active:scale-[0.99] border-2 border-[#00F5D4] rounded-lg text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(0,245,212,0.25)] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-ping" />
          <span>LOCK ACTIVE RING</span>
          <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-black/40 text-[#00F5D4] border border-[#00F5D4]/40 hidden sm:inline">
            [ SPACEBAR / CLICK ]
          </span>
        </button>
      </footer>
    </div>
  );
};
