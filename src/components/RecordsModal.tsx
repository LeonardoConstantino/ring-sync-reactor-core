import React from 'react';
import { SECTORS } from '../domain/sectors';
import { Award, Zap, Shield, CheckCircle, BarChart3 } from 'lucide-react';

interface RecordsModalProps {
  stageRecords: Record<string, { highscore: number; rank: 'S' | 'A' | 'B' | 'C' | 'D' }>;
  onClose: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  stageRecords,
  onClose,
}) => {
  const totalStages = SECTORS.reduce((acc, s) => acc + s.stages.length, 0);
  const clearedStages = Object.keys(stageRecords).length;
  const sRanks = Object.values(stageRecords).filter((r) => r.rank === 'S').length;
  const totalScore = Object.values(stageRecords).reduce((acc, r) => acc + r.highscore, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0A0F]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#12131D] border border-white/15 rounded-xl shadow-2xl p-5 sm:p-7 flex flex-col gap-5 text-white max-h-[90vh] overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Reactor Telemetry & Mission Records</h2>
              <p className="text-xs text-slate-400 font-mono-tech">Local High Scores and Rank Badges</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono-tech text-slate-400 hover:text-white px-2.5 py-1 rounded border border-white/10 hover:border-white/30 cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* High-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg flex flex-col">
            <span className="text-[10px] font-mono-tech tracking-wider text-slate-400">CORES STABILIZED</span>
            <span className="text-xl sm:text-2xl font-mono-tech font-bold text-white tabular-nums">
              {clearedStages} / {totalStages}
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg flex flex-col">
            <span className="text-[10px] font-mono-tech tracking-wider text-slate-400">S-RANK "PERFECT"</span>
            <span className="text-xl sm:text-2xl font-mono-tech font-bold text-[#00F5D4] tabular-nums flex items-center gap-1.5">
              <Award className="w-5 h-5 text-[#00F5D4]" />
              {sRanks}
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg flex flex-col">
            <span className="text-[10px] font-mono-tech tracking-wider text-slate-400">AGGREGATE SCORE</span>
            <span className="text-xl sm:text-2xl font-mono-tech font-bold text-slate-200 tabular-nums">
              {totalScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3.5 rounded-lg flex flex-col">
            <span className="text-[10px] font-mono-tech tracking-wider text-slate-400">SECTORS VISITED</span>
            <span className="text-xl sm:text-2xl font-mono-tech font-bold text-indigo-400 tabular-nums">
              {SECTORS.filter((s) => s.stages.some((st) => stageRecords[st.id])).length} / 5
            </span>
          </div>
        </div>

        {/* Detailed Stages List */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {SECTORS.map((sector) => {
            return (
              <div key={sector.id} className="bg-white/[0.02] border border-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-mono-tech text-[#00F5D4] tracking-wider uppercase">
                    {sector.code} — {sector.name}
                  </span>
                  <span className="text-[10px] font-mono-tech text-slate-500">
                    {sector.location}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sector.stages.map((st) => {
                    const rec = stageRecords[st.id];
                    return (
                      <div
                        key={st.id}
                        className="bg-black/30 border border-white/5 p-2.5 rounded flex items-center justify-between text-xs font-mono-tech"
                      >
                        <div>
                          <div className="text-[10px] text-slate-400">STAGE {st.stageIndex + 1}</div>
                          <div className="text-white font-semibold truncate max-w-[130px]">{st.name}</div>
                        </div>

                        {rec ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 tabular-nums">{rec.highscore.toLocaleString()}</span>
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border ${
                                rec.rank === 'S'
                                  ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4]'
                                  : rec.rank === 'A'
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                                  : 'bg-blue-500/20 border-blue-400 text-blue-400'
                              }`}
                            >
                              {rec.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600">Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-3 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono-tech rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
