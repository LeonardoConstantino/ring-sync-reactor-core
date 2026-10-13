import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SECTORS } from './domain/sectors';
import { LevelConfig, SectorConfig, ScoreBreakdown, GameSettings, GameState } from './types/game';
import { GameEngine } from './engine/gameLoop';
import { CanvasRenderer } from './engine/canvasRenderer';
import { sound } from './engine/audio';
import { computeStageScore } from './domain/scoring';

// UI Components
import { TopNav } from './components/TopNav';
import { HUD } from './components/HUD';
import { SectorSelectModal } from './components/SectorSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { RecordsModal } from './components/RecordsModal';
import { OverloadSurvival } from './components/OverloadSurvival';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  soundEnabled: true,
  screenShake: true,
  touchAssist: false,
  reducedMotion: false,
  showDegreeTelemetry: true,
};

export default function App() {
  // Navigation & Game State
  const [currentSector, setCurrentSector] = useState<SectorConfig>(SECTORS[0]);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(SECTORS[0].stages[0]);
  const [activeModal, setActiveModal] = useState<
    'NONE' | 'SECTORS' | 'SURVIVAL' | 'TRAINING' | 'RECORDS' | 'HOW_TO_PLAY' | 'SETTINGS' | 'PAUSE' | 'STAGE_CLEAR' | 'GAME_OVER'
  >('NONE');

  // Stage clear & game over payload
  const [lastScoreData, setLastScoreData] = useState<ScoreBreakdown | null>(null);
  const [gameOverCause, setGameOverCause] = useState<'meltdown' | 'strikes'>('strikes');

  // Live HUD States
  const [score, setScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [slowMoCharges, setSlowMoCharges] = useState<number>(3);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [slowMoTimer, setSlowMoTimer] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);

  // Survival Mode
  const [isSurvivalMode, setIsSurvivalMode] = useState<boolean>(false);
  const [survivalWave, setSurvivalWave] = useState<number>(1);
  const [survivalHighScore, setSurvivalHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('ring_sync_overload_highscore') || '0', 10);
  });
  const [survivalMaxWave, setSurvivalMaxWave] = useState<number>(() => {
    return parseInt(localStorage.getItem('ring_sync_overload_maxwave') || '0', 10);
  });

  // Settings & Persistent Records
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('ring_sync_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [unlockedStageIds, setUnlockedStageIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ring_sync_unlocked_stages');
      return saved ? new Set(JSON.parse(saved)) : new Set(['1-1']);
    } catch {
      return new Set(['1-1']);
    }
  });

  const [stageRecords, setStageRecords] = useState<
    Record<string, { highscore: number; rank: 'S' | 'A' | 'B' | 'C' | 'D' }>
  >(() => {
    try {
      const saved = localStorage.getItem('ring_sync_stage_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer>(new CanvasRenderer());
  const animationFrameRef = useRef<number | null>(null);

  // Save progression helper
  const unlockStage = useCallback((stageId: string) => {
    setUnlockedStageIds((prev) => {
      const updated = new Set(prev);
      updated.add(stageId);
      localStorage.setItem('ring_sync_unlocked_stages', JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const saveStageRecord = useCallback((stageId: string, finalScore: number, rank: 'S' | 'A' | 'B' | 'C' | 'D') => {
    setStageRecords((prev) => {
      const current = prev[stageId];
      if (!current || finalScore > current.highscore) {
        const updated = {
          ...prev,
          [stageId]: { highscore: finalScore, rank },
        };
        localStorage.setItem('ring_sync_stage_records', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  // Update Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('ring_sync_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  }, []);

  // Start Level
  const startLevel = useCallback(
    (lvl: LevelConfig, sec: SectorConfig, isSurvival = false) => {
      setCurrentLevel(lvl);
      setCurrentSector(sec);
      setIsSurvivalMode(isSurvival);
      setActiveModal('NONE');

      if (engineRef.current) {
        engineRef.current.stop();
      }

      const engine = new GameEngine(lvl, sec, settings, {
        onScoreUpdate: (s) => setScore(s),
        onComboUpdate: (c) => setComboStreak(c),
        onTempUpdate: (t) => setTemperature(t),
        onSlowMoChargesUpdate: (charges) => setSlowMoCharges(charges),
        onLevelComplete: (stats) => {
          if (isSurvival) {
            // Next endless wave
            setSurvivalWave((prev) => {
              const nextWave = prev + 1;
              if (nextWave > survivalMaxWave) {
                setSurvivalMaxWave(nextWave);
                localStorage.setItem('ring_sync_overload_maxwave', nextWave.toString());
              }
              return nextWave;
            });

            // Escalating procedural level
            const nextLvlConfig: LevelConfig = {
              ...lvl,
              name: `Overload Wave ${survivalWave + 1}`,
              ringCount: Math.min(6, 3 + Math.floor(survivalWave / 3)),
              baseSpeeds: Array.from({ length: Math.min(6, 3 + Math.floor(survivalWave / 3)) }, (_, i) => 
                (70 + survivalWave * 6) * (i % 2 === 0 ? 1 : -1)
              ),
              pressureFactor: Math.min(0.65, 0.2 + survivalWave * 0.03),
            };
            startLevel(nextLvlConfig, sec, true);
          } else {
            const scoreResult = computeStageScore({
              level: lvl,
              ringsLocked: stats.ringsLocked,
              penaltyCount: stats.penaltyCount,
              usedSlowMo: stats.usedSlowMo,
              timeTakenSec: stats.timeTakenSec,
              maxStreak: stats.maxStreak,
            });

            setLastScoreData(scoreResult);
            saveStageRecord(lvl.id, scoreResult.totalScore, scoreResult.rank);

            // Unlock next stage if exists
            const currentStageIdx = lvl.stageIndex;
            if (currentStageIdx < sec.stages.length - 1) {
              const nextStage = sec.stages[currentStageIdx + 1];
              unlockStage(nextStage.id);
            } else {
              // Last stage in sector: unlock first stage of next sector
              const nextSecIdx = sec.id; // next sector 1-indexed
              if (nextSecIdx < SECTORS.length) {
                const nextSectorFirstStage = SECTORS[nextSecIdx].stages[0];
                unlockStage(nextSectorFirstStage.id);
              }
            }

            setActiveModal('STAGE_CLEAR');
          }
        },
        onGameOver: (cause) => {
          setGameOverCause(cause);
          setActiveModal('GAME_OVER');
        },
      });

      if (canvasRef.current) {
        engine.setDimensions(canvasRef.current.width, canvasRef.current.height);
      }

      engine.start();
      engineRef.current = engine;
      setSlowMoCharges(engine.slowMoCharges);
      setComboStreak(0);
      setTemperature(0);
      setStrikes(0);
    },
    [settings, survivalWave, survivalMaxWave, unlockStage, saveStageRecord]
  );

  // Initialize first level on mount
  useEffect(() => {
    startLevel(SECTORS[0].stages[0], SECTORS[0], false);

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Sync window resize to Canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (engineRef.current) {
        engineRef.current.setDimensions(canvas.width, canvas.height);
      }
      rendererRef.current.initSkyline(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const renderLoop = () => {
      if (!isSubscribed) return;

      const engine = engineRef.current;
      if (engine) {
        // Sync states to HUD
        setScore(Math.round(engine.ringsLockedRecord.length * 1000 + engine.comboStreak * 500));
        setTemperature(engine.temperature);
        setStrikes(engine.strikes);
        setIsSlowMo(engine.isSlowMo);
        setSlowMoTimer(engine.slowMoTimer);
        setElapsedTime(engine.elapsedTime);

        // Render Canvas
        rendererRef.current.render({
          canvas,
          ctx,
          width: canvas.width,
          height: canvas.height,
          rings: engine.rings,
          activeRingIndex: engine.activeRingIndex,
          particles: engine.particles,
          electricArcs: engine.electricArcs,
          currentLevel,
          sector: currentSector,
          temperature: engine.temperature,
          strikes: engine.strikes,
          isSlowMo: engine.isSlowMo,
          slowMoTimer: engine.slowMoTimer,
          elapsedTime: engine.elapsedTime,
          screenShake: engine.screenShake,
          comboStreak: engine.comboStreak,
          isStabilized: engine.isStabilized,
          reducedMotion: settings.reducedMotion,
          showDegreeTelemetry: settings.showDegreeTelemetry,
        });
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentLevel, currentSector, settings]);

  // Key Down Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Spacebar: Snap lock
      if (e.code === 'Space') {
        e.preventDefault();
        if (activeModal === 'NONE') {
          engineRef.current?.attemptSnapLock();
        }
      }

      // S key or Shift: Slow-Mo
      if (e.key === 's' || e.key === 'S' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (activeModal === 'NONE') {
          engineRef.current?.triggerSlowMo();
        }
      }

      // Escape or P: Pause
      if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (activeModal === 'NONE') {
          engineRef.current?.stop();
          setActiveModal('PAUSE');
        } else if (activeModal === 'PAUSE') {
          engineRef.current?.start();
          setActiveModal('NONE');
        }
      }

      // R: Quick Restart
      if (e.key === 'r' || e.key === 'R') {
        if (activeModal === 'NONE' || activeModal === 'PAUSE' || activeModal === 'GAME_OVER') {
          startLevel(currentLevel, currentSector, isSurvivalMode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, currentLevel, currentSector, isSurvivalMode, startLevel]);

  // Next level handler
  const handleNextLevel = () => {
    const currIdx = currentLevel.stageIndex;
    if (currIdx < currentSector.stages.length - 1) {
      const nextStage = currentSector.stages[currIdx + 1];
      startLevel(nextStage, currentSector, false);
    } else {
      // Advance to next sector
      const nextSecIdx = currentSector.id; // 1-indexed
      if (nextSecIdx < SECTORS.length) {
        const nextSec = SECTORS[nextSecIdx];
        startLevel(nextSec.stages[0], nextSec, false);
      } else {
        setActiveModal('SECTORS');
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#0A0A0F] text-[#F4F7F5] select-none">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        currentView={activeModal}
        onNavigate={(view) => {
          if (view === 'GAME') {
            setActiveModal('NONE');
            engineRef.current?.start();
          } else if (view === 'SECTORS') {
            engineRef.current?.stop();
            setActiveModal('SECTORS');
          } else if (view === 'SURVIVAL') {
            engineRef.current?.stop();
            setActiveModal('SURVIVAL');
          } else if (view === 'TRAINING') {
            // Deploy training level 1-1
            startLevel(SECTORS[0].stages[0], SECTORS[0], false);
          } else if (view === 'RECORDS') {
            engineRef.current?.stop();
            setActiveModal('RECORDS');
          } else if (view === 'HOW_TO_PLAY') {
            engineRef.current?.stop();
            setActiveModal('HOW_TO_PLAY');
          }
        }}
        onOpenSettings={() => {
          engineRef.current?.stop();
          setActiveModal('SETTINGS');
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Canvas & HUD Container */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {/* Hardware accelerated 2D Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          onClick={() => {
            if (activeModal === 'NONE') {
              engineRef.current?.attemptSnapLock();
            }
          }}
        />

        {/* Ambient CRT Scanline Overlay */}
        <div className="absolute inset-0 crt-overlay pointer-events-none" />

        {/* Radial Dark Vignette */}
        <div className="absolute inset-0 reactor-vignette pointer-events-none" />

        {/* Active In-Game Emergency HUD */}
        {activeModal === 'NONE' && (
          <HUD
            level={currentLevel}
            sector={currentSector}
            score={score}
            elapsedTime={elapsedTime}
            pressureFactor={currentLevel.pressureFactor}
            slowMoCharges={slowMoCharges}
            isSlowMo={isSlowMo}
            slowMoTimer={slowMoTimer}
            comboStreak={comboStreak}
            temperature={temperature}
            strikes={strikes}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => {
              engineRef.current?.stop();
              setActiveModal('PAUSE');
            }}
            onTriggerSlowMo={() => {
              engineRef.current?.triggerSlowMo();
            }}
            onTriggerSnap={() => {
              engineRef.current?.attemptSnapLock();
            }}
          />
        )}

        {/* MODAL OVERLAYS */}
        {activeModal === 'SECTORS' && (
          <SectorSelectModal
            unlockedStageIds={unlockedStageIds}
            stageRecords={stageRecords}
            onSelectLevel={(lvl) => {
              const sec = SECTORS.find((s) => s.stages.some((st) => st.id === lvl.id)) || SECTORS[0];
              startLevel(lvl, sec, false);
            }}
            onClose={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
          />
        )}

        {activeModal === 'STAGE_CLEAR' && lastScoreData && (
          <LevelCompleteModal
            scoreData={lastScoreData}
            level={currentLevel}
            hasNextLevel={
              currentLevel.stageIndex < currentSector.stages.length - 1 ||
              currentSector.id < SECTORS.length
            }
            onNextLevel={handleNextLevel}
            onRetry={() => startLevel(currentLevel, currentSector, isSurvivalMode)}
            onSectorMap={() => setActiveModal('SECTORS')}
          />
        )}

        {activeModal === 'GAME_OVER' && (
          <GameOverModal
            level={currentLevel}
            cause={gameOverCause}
            onRetry={() => startLevel(currentLevel, currentSector, isSurvivalMode)}
            onSectorMap={() => setActiveModal('SECTORS')}
          />
        )}

        {activeModal === 'PAUSE' && (
          <PauseModal
            level={currentLevel}
            onResume={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
            onRestart={() => startLevel(currentLevel, currentSector, isSurvivalMode)}
            onSectorMap={() => setActiveModal('SECTORS')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeModal === 'SETTINGS' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetProgress={() => {
              if (window.confirm('Reset all mission telemetry and unlocked sectors?')) {
                localStorage.removeItem('ring_sync_unlocked_stages');
                localStorage.removeItem('ring_sync_stage_records');
                setUnlockedStageIds(new Set(['1-1']));
                setStageRecords({});
                startLevel(SECTORS[0].stages[0], SECTORS[0], false);
              }
            }}
            onClose={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
          />
        )}

        {activeModal === 'HOW_TO_PLAY' && (
          <HowToPlayModal
            onClose={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
            onDeployTutorial={() => {
              startLevel(SECTORS[0].stages[0], SECTORS[0], false);
            }}
          />
        )}

        {activeModal === 'RECORDS' && (
          <RecordsModal
            stageRecords={stageRecords}
            onClose={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
          />
        )}

        {activeModal === 'SURVIVAL' && (
          <OverloadSurvival
            highScore={survivalHighScore}
            highestWave={survivalMaxWave}
            onStartSurvival={() => {
              setSurvivalWave(1);
              const survivalLvl: LevelConfig = {
                id: 'SURVIVAL-1',
                sectorIndex: 0,
                stageIndex: 0,
                name: 'Overload Singularity Wave 1',
                sectorName: 'Infinite Overload',
                sectorTheme: 'omega',
                ringCount: 3,
                baseSpeeds: [75, -80, 85],
                directions: [1, -1, 1],
                snapAngles: [0, 90, 180],
                snapTolerances: [12, 12, 12],
                pressureFactor: 0.22,
                briefing: 'Endless cascading overload sequence. Stabilize as many concentric rings as possible.',
              };
              startLevel(survivalLvl, SECTORS[3], true);
            }}
            onClose={() => {
              setActiveModal('NONE');
              engineRef.current?.start();
            }}
          />
        )}
      </main>
    </div>
  );
}
