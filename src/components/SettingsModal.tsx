import React from 'react';
import { GameSettings } from '../types/game';
import { Volume2, VolumeX, Eye, Smartphone, Zap, Sliders, Trash2 } from 'lucide-react';
import { sound } from '../engine/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0F]/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#12131C] border border-white/15 rounded-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00F5D4]" />
            <h2 className="text-lg font-display font-bold">System Calibration Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono-tech text-slate-400 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/30 cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono-tech">
          {/* Master Volume */}
          <div className="space-y-1.5 bg-black/30 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00F5D4]" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
                Audio Synthesizer Volume
              </span>
              <span className="text-white tabular-nums">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                sound.setVolume(vol);
                onUpdateSettings({ masterVolume: vol, soundEnabled: vol > 0 });
              }}
              className="w-full accent-[#00F5D4] cursor-pointer"
            />
          </div>

          {/* Touch / Timing Assist */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00F5D4]" />
                Touch Assist Tolerance
              </div>
              <div className="text-[11px] text-slate-400">
                Adds +2.5° wider snap margin for high-latency or touchscreen inputs
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ touchAssist: !settings.touchAssist })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.touchAssist ? 'bg-[#00F5D4]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  settings.touchAssist ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
                Screen Shake Juice
              </div>
              <div className="text-[11px] text-slate-400">
                Camera tremors on mis-alignments and high streak combos
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.screenShake ? 'bg-[#00F5D4]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  settings.screenShake ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                Reduced Motion
              </div>
              <div className="text-[11px] text-slate-400">
                Suppresses background rain & atmospheric camera jitter
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.reducedMotion ? 'bg-[#00F5D4]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Degree Telemetry */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
            <div>
              <div className="font-semibold text-white">Degree Angle Telemetry</div>
              <div className="text-[11px] text-slate-400">
                Shows exact numerical angle [0–360°] under active ring
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ showDegreeTelemetry: !settings.showDegreeTelemetry })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showDegreeTelemetry ? 'bg-[#00F5D4]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  settings.showDegreeTelemetry ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onResetProgress}
            className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Local Save Data</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
