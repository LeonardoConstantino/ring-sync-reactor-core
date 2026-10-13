import React from 'react';
import { HelpCircle, Zap, ShieldAlert, Award, Clock, ArrowRight } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
  onDeployTutorial: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onDeployTutorial,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0A0F]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#12131D] border border-white/15 rounded-xl shadow-2xl p-5 sm:p-7 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Reactor Stabilization Field Manual</h2>
              <p className="text-xs text-slate-400 font-mono-tech">Operational Protocols & Calibrations</p>
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

        <div className="space-y-4 text-xs font-mono-tech leading-relaxed text-slate-300">
          {/* Section 1: The Core Mechanic */}
          <div className="bg-black/30 border border-white/5 p-4 rounded-lg space-y-1.5">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F5D4]" />
              01. The Alignment Mechanism
            </h3>
            <p>
              Each reactor containment chamber is stabilized by concentric rotating rings. Watch the highlighted <span className="text-[#00F5D4] font-semibold">Active Ring</span>. When its glowing needle enters the designated <span className="text-white font-semibold">Snap Gate</span> (bracketed arc), press <span className="text-white bg-white/10 px-1.5 py-0.5 rounded">[ SPACEBAR ]</span> or tap the <span className="text-[#00F5D4]">LOCK RING</span> button.
            </p>
          </div>

          {/* Section 2: Pressure System */}
          <div className="bg-black/30 border border-white/5 p-4 rounded-lg space-y-1.5">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              02. Pressure Acceleration & Core Heat
            </h3>
            <p>
              Time is volatile: <span className="text-slate-200">the longer you hesitate, the faster the rings spin</span>. 
              Each mis-timed lock incurs a <span className="text-red-400 font-semibold">+33.4% core temperature spike</span> and a penalty. Three strikes or 100% heat causes immediate <span className="text-red-400 font-semibold">Reactor Meltdown</span>.
            </p>
          </div>

          {/* Section 3: Combos & Temporal Dilation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-black/30 border border-white/5 p-3.5 rounded-lg space-y-1">
              <h4 className="text-xs font-display font-bold text-[#00F5D4] flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Combo Multiplier
              </h4>
              <p className="text-[11px] text-slate-400">
                Locking rings in rhythmic succession builds your combo multiplier up to <span className="text-white font-bold">×3.0</span>. Higher combos release high-voltage electric arcs.
              </p>
            </div>

            <div className="bg-black/30 border border-white/5 p-3.5 rounded-lg space-y-1">
              <h4 className="text-xs font-display font-bold text-[#38BDF8] flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Temporal Dilation [S]
              </h4>
              <p className="text-[11px] text-slate-400">
                Press <span className="text-white bg-white/10 px-1 py-0.5 rounded">[ S ]</span> to decelerate time to 0.3× for 3 seconds (3 charges max). Clearing a stage without slow-mo yields a <span className="text-[#38BDF8] font-bold">+25% bonus score</span>!
              </p>
            </div>
          </div>

          {/* Section 4: Boss Anomalies */}
          <div className="bg-[#1A0E13] border border-[#FF2244]/30 p-4 rounded-lg space-y-2">
            <h3 className="text-sm font-display font-bold text-[#FF2244] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              03. Sector Boss Anomalies
            </h3>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li><strong className="text-white">Sector 01 Boss:</strong> Ghost Calibrator — Snap gates cloak invisibly 2s out of every 3s.</li>
              <li><strong className="text-white">Sector 02 Boss:</strong> Vortex Invertor — Rings unpredictably reverse direction.</li>
              <li><strong className="text-white">Sector 03 Boss:</strong> Cipher Core — Order indicators are scrambled.</li>
              <li><strong className="text-white">Sector 04 Boss:</strong> Phantom Mirror — Counter-rotating phantom twin rings.</li>
              <li><strong className="text-white">Sector 05 Boss:</strong> Total Collapse — All hazard anomalies active simultaneously!</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            Return
          </button>

          <button
            type="button"
            onClick={onDeployTutorial}
            className="px-4 py-2 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black font-display font-bold text-xs tracking-wide rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,245,212,0.3)]"
          >
            <span>Play Calibration Stage (1-1)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
