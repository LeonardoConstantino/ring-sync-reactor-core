import React, { useState } from 'react';
import { SECTORS } from '../domain/sectors';
import { LevelConfig } from '../types/game';
import { Shield, ChevronRight, Lock, Award, Play, AlertTriangle } from 'lucide-react';

interface SectorSelectModalProps {
  unlockedStageIds: Set<string>;
  stageRecords: Record<string, { highscore: number; rank: 'S' | 'A' | 'B' | 'C' | 'D' }>;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const SectorSelectModal: React.FC<SectorSelectModalProps> = ({
  unlockedStageIds,
  stageRecords,
  onSelectLevel,
  onClose,
}) => {
  const [selectedSectorIdx, setSelectedSectorIdx] = useState<number>(0);
  const currentSector = SECTORS[selectedSectorIdx];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-[#0A0A0F]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#10111A] border border-white/15 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white animate-in fade-in duration-150">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0C0D15]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
            <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight">
              Grid Sector Deployment Map
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-mono-tech text-slate-400 hover:text-white border border-white/10 hover:border-white/30 rounded transition-colors cursor-pointer"
          >
            Close [Esc]
          </button>
        </div>

        {/* Sector Tabs (5 Sectors) */}
        <div className="flex border-b border-white/10 overflow-x-auto shrink-0 bg-black/40 scrollbar-none">
          {SECTORS.map((sec, idx) => {
            const isSelected = idx === selectedSectorIdx;
            // Check if first stage of sector is unlocked
            const isSectorUnlocked = idx === 0 || unlockedStageIds.has(sec.stages[0].id);

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectorIdx(idx)}
                className={`px-4 sm:px-6 py-3 text-left border-r border-white/10 transition-all flex flex-col gap-0.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#00F5D4]/10 border-b-2 border-b-[#00F5D4] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-tech tracking-wider text-slate-400">{sec.code}</span>
                  {!isSectorUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                </div>
                <span className="text-xs sm:text-sm font-display font-bold">{sec.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sector Overview Banner */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-tech text-[#00F5D4] uppercase tracking-wider">{currentSector.location}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono-tech">
              Critical Hazard: <span className="text-slate-200 font-semibold">{currentSector.hazard}</span>
            </p>
          </div>

          <div className="text-xs font-mono-tech text-slate-400">
            Stages Synchronized:{' '}
            <span className="text-[#00F5D4] font-bold">
              {currentSector.stages.filter((s) => stageRecords[s.id]).length} / {currentSector.stages.length}
            </span>
          </div>
        </div>

        {/* Stages Grid (6 stages per sector: 5 standard + 1 boss) */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {currentSector.stages.map((stage) => {
            const isUnlocked = unlockedStageIds.has(stage.id);
            const record = stageRecords[stage.id];
            const isBoss = stage.bossType && stage.bossType !== 'none';

            return (
              <div
                key={stage.id}
                className={`relative rounded-xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all ${
                  !isUnlocked
                    ? 'border-white/5 bg-black/20 opacity-55'
                    : isBoss
                    ? 'border-[#FF2244]/40 bg-[#1A0E13] hover:border-[#FF2244] shadow-[0_0_20px_rgba(255,34,68,0.1)]'
                    : 'border-white/15 bg-[#12131D] hover:border-[#00F5D4]/60 hover:bg-[#151724]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono-tech tracking-wider text-slate-400">
                      STAGE {stage.stageIndex + 1}
                    </span>

                    {isBoss ? (
                      <span className="text-[10px] font-mono-tech tracking-widest text-[#FF2244] bg-[#FF2244]/15 border border-[#FF2244]/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" /> BOSS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono-tech text-slate-500">
                        {stage.ringCount} Rings · ±{stage.snapTolerances[0]}°
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-display font-bold text-white mb-1">
                    {stage.name}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono-tech line-clamp-2 leading-relaxed">
                    {stage.briefing}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  {record ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-display font-bold text-xs border ${
                          record.rank === 'S'
                            ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4]'
                            : record.rank === 'A'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                            : 'bg-blue-500/20 border-blue-400 text-blue-400'
                        }`}
                      >
                        {record.rank}
                      </span>
                      <span className="text-xs font-mono-tech text-slate-300 tabular-nums">
                        {record.highscore.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono-tech text-slate-500">
                      {isUnlocked ? 'Uncalibrated' : 'Locked'}
                    </span>
                  )}

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onSelectLevel(stage)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isBoss
                          ? 'bg-[#FF2244] hover:bg-[#FF2244]/90 text-white shadow-[0_0_12px_rgba(255,34,68,0.4)]'
                          : 'bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black shadow-[0_0_12px_rgba(0,245,212,0.3)]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Deploy</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-mono-tech">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
