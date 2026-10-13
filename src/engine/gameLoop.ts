import { RingData, LevelConfig, Particle, ElectricArc, GameSettings, SectorConfig } from '../types/game';
import { sound } from './audio';

export interface GameLoopCallbacks {
  onScoreUpdate: (score: number) => void;
  onComboUpdate: (combo: number) => void;
  onTempUpdate: (temp: number) => void;
  onSlowMoChargesUpdate: (charges: number) => void;
  onLevelComplete: (stats: {
    ringsLocked: { ringIndex: number; streakAtLock: number; speedAtLock: number }[];
    penaltyCount: number;
    usedSlowMo: boolean;
    timeTakenSec: number;
    maxStreak: number;
  }) => void;
  onGameOver: (cause: 'meltdown' | 'strikes') => void;
}

export class GameEngine {
  public rings: RingData[] = [];
  public activeRingIndex: number = 0;
  public particles: Particle[] = [];
  public electricArcs: ElectricArc[] = [];
  public elapsedTime: number = 0;
  public temperature: number = 0; // 0 to 100
  public strikes: number = 0; // 0 to 3
  public comboStreak: number = 0;
  public maxStreak: number = 0;
  public slowMoCharges: number = 3;
  public isSlowMo: boolean = false;
  public slowMoTimer: number = 0;
  public usedSlowMoInStage: boolean = false;
  public screenShake: number = 0;
  public isStabilized: boolean = false;
  public penaltyCount: number = 0;
  public ringsLockedRecord: { ringIndex: number; streakAtLock: number; speedAtLock: number }[] = [];

  private level: LevelConfig;
  private sector: SectorConfig;
  private settings: GameSettings;
  private callbacks: GameLoopCallbacks;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;
  private width: number = 800;
  private height: number = 600;

  // Boss timers
  private bossSwapTimer: number = 0;
  private nextSwapInterval: number = 3.5;

  constructor(
    level: LevelConfig,
    sector: SectorConfig,
    settings: GameSettings,
    callbacks: GameLoopCallbacks
  ) {
    this.level = level;
    this.sector = sector;
    this.settings = settings;
    this.callbacks = callbacks;
    this.initLevel();
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.recalculateRingRadii();
  }

  public initLevel() {
    this.rings = [];
    this.particles = [];
    this.electricArcs = [];
    this.elapsedTime = 0;
    this.temperature = 0;
    this.strikes = 0;
    this.comboStreak = 0;
    this.maxStreak = 0;
    this.isSlowMo = false;
    this.slowMoTimer = 0;
    this.usedSlowMoInStage = false;
    this.screenShake = 0;
    this.isStabilized = false;
    this.penaltyCount = 0;
    this.ringsLockedRecord = [];
    this.activeRingIndex = 0;
    this.bossSwapTimer = 0;

    const count = this.level.ringCount;
    for (let i = 0; i < count; i++) {
      const isBossGhost = this.level.bossType === 'ghost' || this.level.bossType === 'total_collapse';
      const isBossSwap = this.level.bossType === 'direction_swap' || this.level.bossType === 'total_collapse';
      const isBossMirror = this.level.bossType === 'mirror';
      const isHiddenOrder = this.level.bossType === 'hidden_order';

      this.rings.push({
        id: i,
        radius: 100, // will be scaled in recalculateRingRadii
        thickness: Math.max(3, Math.min(6, 18 / count)),
        baseSpeed: this.level.baseSpeeds[i] || 60,
        currentSpeed: this.level.baseSpeeds[i] || 60,
        direction: this.level.directions[i] || (i % 2 === 0 ? 1 : -1),
        currentAngle: Math.floor(Math.random() * 360),
        snapZoneAngle: this.level.snapAngles[i] ?? 0,
        snapTolerance: this.level.snapTolerances[i] ?? 12,
        state: i === 0 ? 'ACTIVE' : 'PENDING',
        flashTimer: 0,
        stutterOffset: 0,
        isGhost: isBossGhost,
        ghostVisibleTimer: 0,
        isDirectionSwap: isBossSwap,
        isMirror: isBossMirror && i === 1,
        hiddenTarget: isHiddenOrder && i > 1,
      });
    }

    this.recalculateRingRadii();
  }

  private recalculateRingRadii() {
    const count = this.rings.length;
    if (count === 0) return;

    const minDim = Math.min(this.width, this.height);
    const maxRadius = Math.max(90, minDim * 0.42);
    const minRadius = Math.max(50, minDim * 0.16);

    const step = count > 1 ? (maxRadius - minRadius) / (count - 1) : 0;

    // Outer-to-inner: ring 0 is outermost, ring N-1 is innermost
    this.rings.forEach((ring, idx) => {
      ring.radius = maxRadius - (idx * step);
    });
  }

  public start() {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public triggerSlowMo(): boolean {
    if (this.slowMoCharges <= 0 || this.isSlowMo || this.isStabilized) return false;

    this.slowMoCharges -= 1;
    this.isSlowMo = true;
    this.slowMoTimer = 3.0; // 3 seconds
    this.usedSlowMoInStage = true;
    sound.setSlowMo(true);
    this.callbacks.onSlowMoChargesUpdate(this.slowMoCharges);
    return true;
  }

  /**
   * Main interaction: attempt to snap & lock the currently active ring!
   */
  public attemptSnapLock(): boolean {
    if (this.isStabilized || this.strikes >= 3 || this.temperature >= 100) return false;
    if (this.activeRingIndex >= this.rings.length) return false;

    const currentRing = this.rings[this.activeRingIndex];
    if (!currentRing || currentRing.state !== 'ACTIVE') return false;

    // Tolerance adjustment if touchAssist is enabled
    const tolerance = currentRing.snapTolerance + (this.settings.touchAssist ? 2.5 : 0);

    // Calculate angular delta between needle and snap target
    // Normalizing angles to [0, 360)
    const ringAngle = ((currentRing.currentAngle % 360) + 360) % 360;
    const targetAngle = ((currentRing.snapZoneAngle % 360) + 360) % 360;
    const diff = Math.abs(((ringAngle - targetAngle + 540) % 360) - 180);

    if (diff <= tolerance) {
      // SUCCESS!
      this.comboStreak += 1;
      if (this.comboStreak > this.maxStreak) {
        this.maxStreak = this.comboStreak;
      }
      this.callbacks.onComboUpdate(this.comboStreak);

      currentRing.state = 'LOCKED';
      currentRing.lockedAngle = currentRing.snapZoneAngle; // snap cleanly to target
      currentRing.flashTimer = 1.0;

      // Sound & Juice
      sound.playSnapSuccess(this.comboStreak);
      this.spawnLockSparks(currentRing);
      this.spawnElectricArcToCenter(currentRing);

      // Record for scoring
      this.ringsLockedRecord.push({
        ringIndex: this.activeRingIndex,
        streakAtLock: this.comboStreak,
        speedAtLock: currentRing.currentSpeed,
      });

      // Next Ring or Level Complete
      const nextIndex = this.activeRingIndex + 1;
      if (nextIndex >= this.rings.length) {
        // ALL RINGS SYNCHRONIZED! LEVEL COMPLETE!
        this.isStabilized = true;
        sound.playReactorStabilized();
        this.spawnMassiveVictoryBurst();

        // Finish slow mo if active
        if (this.isSlowMo) {
          this.isSlowMo = false;
          sound.setSlowMo(false);
        }

        setTimeout(() => {
          this.callbacks.onLevelComplete({
            ringsLocked: this.ringsLockedRecord,
            penaltyCount: this.penaltyCount,
            usedSlowMo: this.usedSlowMoInStage,
            timeTakenSec: this.elapsedTime,
            maxStreak: this.maxStreak,
          });
        }, 1100);
      } else {
        this.activeRingIndex = nextIndex;
        this.rings[nextIndex].state = 'ACTIVE';
      }

      return true;
    } else {
      // MIS-TIME / WRONG LOCK!
      this.comboStreak = 0;
      this.callbacks.onComboUpdate(0);
      this.penaltyCount += 1;
      this.strikes += 1;
      this.temperature = Math.min(100, this.temperature + 33.34);
      this.callbacks.onTempUpdate(this.temperature);

      // Stutter effect
      currentRing.state = 'FAILED_STUTTER';
      currentRing.stutterOffset = 1.0;
      setTimeout(() => {
        if (currentRing.state === 'FAILED_STUTTER') {
          currentRing.state = 'ACTIVE';
          currentRing.stutterOffset = 0;
        }
      }, 300);

      // Sound & Screen Shake
      sound.playErrorStrike();
      this.screenShake = 1.0;
      this.spawnErrorSparks(currentRing);

      // Game Over check
      if (this.strikes >= 3 || this.temperature >= 99) {
        sound.playMeltdown();
        this.stop();
        setTimeout(() => {
          this.callbacks.onGameOver(this.temperature >= 99 ? 'meltdown' : 'strikes');
        }, 600);
      }

      return false;
    }
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const deltaMs = Math.min(100, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;
    const dt = deltaMs / 1000;

    this.update(dt);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // Effective time delta with slow motion factor
    const timeScale = this.isSlowMo ? 0.3 : 1.0;
    const effectiveDt = dt * timeScale;

    this.elapsedTime += effectiveDt;

    // Slow-mo timer countdown
    if (this.isSlowMo) {
      this.slowMoTimer -= dt;
      if (this.slowMoTimer <= 0) {
        this.isSlowMo = false;
        this.slowMoTimer = 0;
        sound.setSlowMo(false);
      }
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 3.5);
    }

    // Boss 2: Direction Swap Timer
    if (this.level.bossType === 'direction_swap' || this.level.bossType === 'total_collapse') {
      this.bossSwapTimer += effectiveDt;
      if (this.bossSwapTimer >= this.nextSwapInterval) {
        this.bossSwapTimer = 0;
        this.nextSwapInterval = 2.5 + Math.random() * 2.5;
        // Invert direction of non-locked rings
        this.rings.forEach((r) => {
          if (r.state !== 'LOCKED') {
            r.direction = r.direction === 1 ? -1 : 1;
          }
        });
      }
    }

    // Pressure factor formula from GDD:
    // current_speed = base_speed * (1 + pressure_factor * elapsed_time)
    const pressureMultiplier = 1 + (this.level.pressureFactor * this.elapsedTime);

    // Update rings rotation
    this.rings.forEach((ring) => {
      // Flash decay
      if (ring.flashTimer > 0) {
        ring.flashTimer = Math.max(0, ring.flashTimer - dt * 2.5);
      }

      // Stutter decay
      if (ring.stutterOffset > 0) {
        ring.stutterOffset = Math.max(0, ring.stutterOffset - dt * 3);
      }

      if (ring.state !== 'LOCKED') {
        ring.currentSpeed = ring.baseSpeed * pressureMultiplier;
        const degDelta = ring.currentSpeed * effectiveDt * ring.direction;
        ring.currentAngle = ((ring.currentAngle + degDelta) % 360 + 360) % 360;
      }
    });

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= effectiveDt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * effectiveDt;
      p.y += p.vy * effectiveDt;
      p.vy += 40 * effectiveDt; // subtle gravity
    }

    // Update electric arcs
    for (let i = this.electricArcs.length - 1; i >= 0; i--) {
      const arc = this.electricArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.electricArcs.splice(i, 1);
      }
    }
  }

  private spawnLockSparks(ring: RingData) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rad = (ring.snapZoneAngle * Math.PI) / 180 - Math.PI / 2;
    const originX = cx + Math.cos(rad) * ring.radius;
    const originY = cy + Math.sin(rad) * ring.radius;

    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#00F5D4' : '#FFFFFF',
        alpha: 0.9,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type: 'spark',
      });
    }
  }

  private spawnElectricArcToCenter(ring: RingData) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rad = (ring.snapZoneAngle * Math.PI) / 180 - Math.PI / 2;
    const originX = cx + Math.cos(rad) * ring.radius;
    const originY = cy + Math.sin(rad) * ring.radius;

    this.electricArcs.push({
      x1: originX,
      y1: originY,
      x2: cx,
      y2: cy,
      color: '#00F5D4',
      life: 0.25,
      maxLife: 0.25,
      roughness: 35,
    });
  }

  private spawnErrorSparks(ring: RingData) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rad = (ring.currentAngle * Math.PI) / 180 - Math.PI / 2;
    const originX = cx + Math.cos(rad) * ring.radius;
    const originY = cy + Math.sin(rad) * ring.radius;

    const count = 15;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#FF2244' : '#FF6B00',
        alpha: 1,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'spark',
      });
    }
  }

  private spawnMassiveVictoryBurst() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const count = 80;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 260;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: i % 3 === 0 ? '#00F5D4' : (i % 3 === 1 ? '#F4F7F5' : '#38BDF8'),
        alpha: 1,
        life: 1.0 + Math.random() * 0.6,
        maxLife: 1.6,
        type: 'burst',
      });
    }
  }
}
