import React from 'react';
import { ScoreBreakdown, LevelConfig } from '../types/game';
import { CheckCircle2, Award, Zap, RotateCcw, ArrowRight, Grid } from 'lucide-react';

interface LevelCompleteModalProps {
  scoreData: ScoreBreakdown;
  level: LevelConfig;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onSectorMap: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  scoreData,
  level,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onSectorMap,
}) => {
  const isSyncPerfect = scoreData.isSyncPerfect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0F]/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#12131C] border border-white/15 rounded-xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,245,212,0.15)] flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5 border-b border-white/10 pb-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#00F5D4]">
            <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" />
            <span>Reactor Core Stabilized</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
            {level.name}
          </h2>

          <p className="text-xs text-slate-400 font-mono-tech">
            {level.sectorName} · Operations Restored
          </p>
        </div>

        {/* Rank Badge & Total Score */}
        <div className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-lg flex items-center justify-center font-display font-extrabold text-3xl border ${
                scoreData.rank === 'S'
                  ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.4)]'
                  : scoreData.rank === 'A'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                  : scoreData.rank === 'B'
                  ? 'bg-blue-500/20 border-blue-400 text-blue-400'
                  : 'bg-amber-500/20 border-amber-400 text-amber-400'
              }`}
            >
              {scoreData.rank}
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono-tech tracking-wider text-slate-400">FINAL SCORE</span>
              <span className="text-2xl sm:text-3xl font-mono-tech font-bold text-white tabular-nums">
                {scoreData.totalScore.toLocaleString()}
              </span>
              {isSyncPerfect && (
                <span className="text-xs font-mono-tech font-bold text-[#00F5D4] tracking-widest uppercase flex items-center gap-1 animate-pulse">
                  <Award className="w-3.5 h-3.5" /> SYNC PERFECT
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono-tech tracking-wider text-slate-400">EFFICIENCY</div>
            <div className="text-xl font-mono-tech font-bold text-slate-200 tabular-nums">
              {scoreData.accuracyPercentage}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono-tech">
              Max: {scoreData.theoreticalMaxScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Score Breakdown List */}
        <div className="space-y-2 text-xs font-mono-tech bg-white/[0.02] border border-white/5 p-3 rounded-lg">
          <div className="flex justify-between text-slate-300">
            <span>Base Synchrony</span>
            <span className="text-white tabular-nums">+{scoreData.rawPoints.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Max Combo Streak (×{scoreData.maxStreak})</span>
            <span className="text-[#00F5D4] tabular-nums">+{scoreData.comboBonusPoints.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Pressure Speed Multiplier</span>
            <span className="text-slate-200 tabular-nums">×{scoreData.speedMultiplier.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#38BDF8]" /> No-SlowMo Bonus (+25%)
            </span>
            <span className={scoreData.slowMoBonusPoints > 0 ? 'text-[#38BDF8] tabular-nums' : 'text-slate-500 tabular-nums'}>
              {scoreData.slowMoBonusPoints > 0 ? `+${scoreData.slowMoBonusPoints.toLocaleString()}` : '0 (Used)'}
            </span>
          </div>

          {scoreData.penaltyDeductions > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Failure Deductions</span>
              <span className="tabular-nums">-{scoreData.penaltyDeductions.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-2 flex justify-between text-slate-400 text-[11px]">
            <span>Elapsed Time</span>
            <span className="text-white tabular-nums">{scoreData.timeTakenSec.toFixed(1)}s</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onSectorMap}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Sector Grid</span>
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recalibrate</span>
          </button>

          {hasNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full sm:flex-1 py-2.5 px-4 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black font-display font-bold text-xs sm:text-sm tracking-wide rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Core</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSectorMap}
              className="w-full sm:flex-1 py-2.5 px-4 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black font-display font-bold text-xs sm:text-sm tracking-wide rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sector Complete!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
