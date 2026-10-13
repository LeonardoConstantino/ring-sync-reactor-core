export type GameState = 
  | 'TITLE_MENU'
  | 'SECTOR_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'STAGE_CLEAR'
  | 'GAME_OVER'
  | 'SURVIVAL_MODE'
  | 'TRAINING_MODE';

export type RingState = 'PENDING' | 'ACTIVE' | 'LOCKED' | 'FAILED_STUTTER';

export interface RingData {
  id: number;
  radius: number;
  thickness: number;
  baseSpeed: number; // degrees per second
  currentSpeed: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  currentAngle: number; // degrees [0, 360)
  snapZoneAngle: number; // degrees [0, 360)
  snapTolerance: number; // degrees (+/- tolerance)
  state: RingState;
  lockedAngle?: number;
  
  // Visual & mechanical traits
  color?: string;
  glowColor?: string;
  notchCount?: number;
  isGhost?: boolean; // Boss 1: flashes visibility
  ghostVisibleTimer?: number;
  isDirectionSwap?: boolean; // Boss 2: swaps
  swapCooldown?: number;
  isMirror?: boolean; // Boss 4: mirror ring
  hiddenTarget?: boolean; // Boss 3: hidden zone indicator
  
  // Animation states
  flashTimer: number; // 0 to 1
  stutterOffset: number; // for mis-time recoil
}

export interface LevelConfig {
  id: string; // e.g. "1-1", "1-BOSS"
  sectorIndex: number; // 0 to 4
  stageIndex: number; // 0 to 5
  name: string;
  sectorName: string;
  sectorTheme: 'substation' | 'cooling' | 'reactor' | 'omega' | 'mainframe';
  ringCount: number;
  baseSpeeds: number[]; // degrees per second per ring
  directions: (1 | -1)[];
  snapAngles: number[]; // degrees
  snapTolerances: number[]; // degrees (+/-)
  pressureFactor: number; // acceleration per second
  bossType?: 'none' | 'ghost' | 'direction_swap' | 'hidden_order' | 'mirror' | 'total_collapse';
  briefing: string;
  warningAlert?: string;
}

export interface SectorConfig {
  id: number;
  code: string; // "SECTOR 01"
  name: string;
  location: string;
  theme: 'substation' | 'cooling' | 'reactor' | 'omega' | 'mainframe';
  hazard: string;
  accentColor: string;
  glowColor: string;
  stages: LevelConfig[];
}

export interface ScoreBreakdown {
  rawPoints: number;
  comboBonusPoints: number;
  speedMultiplier: number;
  slowMoBonusPoints: number;
  penaltyDeductions: number;
  totalScore: number;
  theoreticalMaxScore: number;
  accuracyPercentage: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  isSyncPerfect: boolean;
  timeTakenSec: number;
  usedSlowMo: boolean;
  maxStreak: number;
}

export interface GameSettings {
  masterVolume: number;
  soundEnabled: boolean;
  screenShake: boolean;
  touchAssist: boolean; // expands snap zone by 20% for easier touch play
  reducedMotion: boolean;
  showDegreeTelemetry: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  type: 'spark' | 'smoke' | 'electric' | 'steam' | 'burst';
}

export interface ElectricArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
  roughness: number;
}
