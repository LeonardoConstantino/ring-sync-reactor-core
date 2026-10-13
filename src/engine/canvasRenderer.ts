import { RingData, Particle, ElectricArc, LevelConfig, SectorConfig } from '../types/game';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: Canvas2DContext;
  width: number;
  height: number;
  rings: RingData[];
  activeRingIndex: number;
  particles: Particle[];
  electricArcs: ElectricArc[];
  currentLevel: LevelConfig;
  sector: SectorConfig;
  temperature: number; // 0 to 100
  strikes: number; // 0 to 3
  isSlowMo: boolean;
  slowMoTimer: number; // 0 to 3.0
  elapsedTime: number;
  screenShake: number; // intensity
  comboStreak: number;
  isStabilized: boolean;
  reducedMotion: boolean;
  showDegreeTelemetry: boolean;
}

type Canvas2DContext = CanvasRenderingContext2D;

export class CanvasRenderer {
  // Pre-cached procedural skyline buildings so they remain consistent across frames
  private skylineBuildings: { x: number; width: number; height: number; windows: { x: number; y: number; on: boolean; color: string }[] }[] = [];
  private rainDrops: { x: number; y: number; speed: number; length: number }[] = [];

  constructor() {
    this.initSkyline(1920, 1080);
  }

  public initSkyline(w: number, h: number) {
    this.skylineBuildings = [];
    const count = 32;
    const buildingWidth = w / (count * 0.7);

    for (let i = 0; i < count; i++) {
      const bHeight = 120 + Math.sin(i * 1.3) * 60 + Math.random() * 220;
      const bWidth = buildingWidth * (0.8 + Math.random() * 0.6);
      const bX = i * (buildingWidth * 0.75) - 60;

      const windows: { x: number; y: number; on: boolean; color: string }[] = [];
      const cols = Math.floor(bWidth / 14);
      const rows = Math.floor(bHeight / 18);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.45) {
            const isCyan = Math.random() > 0.6;
            windows.push({
              x: c * 14 + 4,
              y: r * 18 + 8,
              on: true,
              color: isCyan ? 'rgba(0, 245, 212, ' : 'rgba(255, 107, 0, ',
            });
          }
        }
      }

      this.skylineBuildings.push({
        x: bX,
        width: bWidth,
        height: bHeight,
        windows,
      });
    }

    // Init ambient atmospheric rain/steam
    this.rainDrops = [];
    for (let i = 0; i < 70; i++) {
      this.rainDrops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 180 + Math.random() * 240,
        length: 8 + Math.random() * 14,
      });
    }
  }

  public render(rc: RenderContext) {
    const { ctx, width, height, screenShake, reducedMotion } = rc;

    ctx.save();

    // 0. Screen shake calculation
    if (screenShake > 0 && !reducedMotion) {
      const shakeAmt = screenShake * 8;
      const ox = (Math.random() - 0.5) * shakeAmt;
      const oy = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(ox, oy);
    }

    // 1. Clear background
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, width, height);

    // 2. LAYER 03 - World Architecture & Cyberpunk Atmosphere
    this.renderWorldLayer(rc);

    // 3. LAYER 02 - System Atmosphere & Ambient Heat/Pressure
    this.renderSystemAtmosphere(rc);

    // 4. LAYER 01 - CORE: Rings, Snap Gates, Singularity Core
    this.renderReactorCore(rc);

    // 5. Electric Arcs & Particle Effects
    this.renderElectricArcs(rc);
    this.renderParticles(rc);

    // 6. Slow-Motion / Temporal Dilation Overlay
    if (rc.isSlowMo) {
      this.renderTemporalDilationFX(rc);
    }

    ctx.restore();
  }

  private renderWorldLayer(rc: RenderContext) {
    const { ctx, width, height, temperature, strikes, isStabilized } = rc;

    // Power grid status: 1.0 (full city power) down to 0.1 (blackout when failing)
    const powerRatio = isStabilized ? 1.0 : Math.max(0.15, 1.0 - (strikes * 0.28) - (temperature / 200));

    // Distant background gradient with hazard tint
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#060609');
    bgGrad.addColorStop(0.7, '#0C0D14');
    if (rc.sector.theme === 'cooling') {
      bgGrad.addColorStop(1, 'rgba(12, 34, 48, 0.4)');
    } else if (rc.sector.theme === 'reactor') {
      bgGrad.addColorStop(1, 'rgba(48, 18, 10, 0.4)');
    } else if (rc.sector.theme === 'omega') {
      bgGrad.addColorStop(1, 'rgba(38, 14, 54, 0.4)');
    } else {
      bgGrad.addColorStop(1, 'rgba(10, 16, 20, 0.4)');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant power transmission towers & city silhouettes
    ctx.save();
    ctx.fillStyle = '#0E1018';
    const horizonY = height * 0.88;

    for (const b of this.skylineBuildings) {
      const drawX = (b.x * (width / 1440)) % width;
      const drawW = b.width * (width / 1440);
      const drawH = b.height * (height / 900);
      const topY = horizonY - drawH;

      ctx.fillRect(drawX, topY, drawW, drawH);

      // Windows with power ratio flicker
      for (const w of b.windows) {
        if (w.on && Math.random() < powerRatio * 1.1) {
          const winAlpha = (0.2 + Math.random() * 0.4) * powerRatio;
          ctx.fillStyle = `${w.color}${winAlpha})`;
          ctx.fillRect(drawX + w.x, topY + w.y, 4, 6);
        }
      }
    }

    // Grid baseline
    ctx.strokeStyle = 'rgba(89, 97, 104, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Subtle atmospheric rain / steam lines
    if (!rc.reducedMotion) {
      ctx.strokeStyle = rc.sector.theme === 'cooling' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(244, 247, 245, 0.12)';
      ctx.lineWidth = 1;
      for (const r of this.rainDrops) {
        r.y += r.speed * 0.016 * (rc.isSlowMo ? 0.3 : 1);
        if (r.y > height) {
          r.y = -10;
          r.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.length);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderSystemAtmosphere(rc: RenderContext) {
    const { ctx, width, height, temperature, isStabilized } = rc;
    const cx = width / 2;
    const cy = height / 2;

    // Ambient heat vignette if temperature is rising
    if (temperature > 20 && !isStabilized) {
      const heatIntensity = (temperature - 20) / 80;
      const heatGrad = ctx.createRadialGradient(cx, cy, height * 0.3, cx, cy, height * 0.8);
      heatGrad.addColorStop(0, 'rgba(0,0,0,0)');
      heatGrad.addColorStop(0.7, `rgba(255, 34, 68, ${heatIntensity * 0.15})`);
      heatGrad.addColorStop(1, `rgba(255, 34, 68, ${heatIntensity * 0.35})`);
      ctx.fillStyle = heatGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private renderReactorCore(rc: RenderContext) {
    const { ctx, width, height, rings, activeRingIndex, temperature, isStabilized, comboStreak, showDegreeTelemetry } = rc;
    const cx = width / 2;
    const cy = height / 2;

    // 1. Central Singularity / Reactor Core Orb
    ctx.save();
    const corePulse = Math.sin(rc.elapsedTime * (isStabilized ? 2 : (2 + temperature * 0.08))) * 0.5 + 0.5;
    const coreRadius = 24 + corePulse * 6;

    // Core Outer Glow
    const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreRadius * 2.8);
    if (isStabilized) {
      coreGlow.addColorStop(0, '#FFFFFF');
      coreGlow.addColorStop(0.3, 'rgba(0, 245, 212, 0.9)');
      coreGlow.addColorStop(0.8, 'rgba(0, 245, 212, 0.25)');
      coreGlow.addColorStop(1, 'rgba(0, 245, 212, 0)');
    } else if (temperature > 66) {
      coreGlow.addColorStop(0, '#FFFFFF');
      coreGlow.addColorStop(0.3, 'rgba(255, 34, 68, 0.9)');
      coreGlow.addColorStop(0.8, 'rgba(255, 107, 0, 0.35)');
      coreGlow.addColorStop(1, 'rgba(255, 34, 68, 0)');
    } else {
      coreGlow.addColorStop(0, '#FFFFFF');
      coreGlow.addColorStop(0.4, 'rgba(0, 245, 212, 0.8)');
      coreGlow.addColorStop(0.8, 'rgba(0, 245, 212, 0.2)');
      coreGlow.addColorStop(1, 'rgba(0, 245, 212, 0)');
    }

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Core Solid Center
    ctx.fillStyle = isStabilized ? '#00F5D4' : (temperature > 66 ? '#FF2244' : '#00F5D4');
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Core inner glyph
    ctx.fillStyle = '#0A0A0F';
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Central crosshair & calibration ticks
    ctx.strokeStyle = 'rgba(244, 247, 245, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - coreRadius * 1.5, cy);
    ctx.lineTo(cx + coreRadius * 1.5, cy);
    ctx.moveTo(cx, cy - coreRadius * 1.5);
    ctx.lineTo(cx, cy + coreRadius * 1.5);
    ctx.stroke();

    ctx.restore();

    // 2. Render Concentric Rings
    rings.forEach((ring, idx) => {
      this.renderSingleRing(ctx, cx, cy, ring, idx, activeRingIndex, rc);
    });

    // 3. Telemetry Overlay (if active ring is rotating)
    if (showDegreeTelemetry && rings[activeRingIndex] && rings[activeRingIndex].state === 'ACTIVE') {
      const activeRing = rings[activeRingIndex];
      ctx.save();
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00F5D4';
      ctx.textAlign = 'center';
      const curAngStr = `${Math.round(activeRing.currentAngle)}°`;
      const snapAngStr = `TARGET: ${Math.round(activeRing.snapZoneAngle)}° [±${activeRing.snapTolerance}°]`;
      ctx.fillText(`${curAngStr}  ·  ${snapAngStr}`, cx, cy + activeRing.radius + 24);
      ctx.restore();
    }
  }

  private renderSingleRing(
    ctx: Canvas2DContext,
    cx: number,
    cy: number,
    ring: RingData,
    idx: number,
    activeRingIndex: number,
    rc: RenderContext
  ) {
    const { isStabilized, currentLevel } = rc;
    const isLocked = ring.state === 'LOCKED';
    const isActive = ring.state === 'ACTIVE';
    const isPending = ring.state === 'PENDING';
    const isStuttering = ring.state === 'FAILED_STUTTER';

    const r = ring.radius;
    const radCurrent = (ring.currentAngle * Math.PI) / 180;
    const radSnap = (ring.snapZoneAngle * Math.PI) / 180;
    const radTol = (ring.snapTolerance * Math.PI) / 180;

    ctx.save();

    // Recoil offset if stuttering on error
    if (isStuttering && ring.stutterOffset !== 0) {
      const jitter = (Math.random() - 0.5) * ring.stutterOffset * 6;
      ctx.translate(jitter, jitter);
    }

    // 1. Structural Background Track Arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isLocked
      ? 'rgba(0, 245, 212, 0.45)'
      : isActive
      ? 'rgba(89, 97, 104, 0.45)'
      : 'rgba(89, 97, 104, 0.2)';
    ctx.lineWidth = ring.thickness;
    ctx.stroke();

    // Calibration hash marks around ring every 30 degrees
    const hashCount = 24;
    ctx.strokeStyle = isActive ? 'rgba(0, 245, 212, 0.25)' : 'rgba(89, 97, 104, 0.2)';
    ctx.lineWidth = 1;
    for (let h = 0; h < hashCount; h++) {
      const ang = (h * (360 / hashCount) * Math.PI) / 180;
      const innerR = r - (h % 6 === 0 ? 8 : 4);
      const outerR = r + (h % 6 === 0 ? 8 : 4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
      ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
      ctx.stroke();
    }

    // 2. Snap Zone Gate Arc (The target zone!)
    let snapAlpha = 1.0;
    if (ring.isGhost && ring.ghostVisibleTimer !== undefined) {
      // Boss 1 Ghost cloaking: visible only during window
      const cycle = rc.elapsedTime % 3.0; // 3 sec cycle
      snapAlpha = cycle < 1.0 ? 1.0 : Math.max(0, 1.0 - (cycle - 1.0) * 4);
    }

    if (snapAlpha > 0.05 && !ring.hiddenTarget) {
      const snapStart = radSnap - radTol - Math.PI / 2;
      const snapEnd = radSnap + radTol - Math.PI / 2;

      // Snap zone outer glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, snapStart, snapEnd);
      ctx.strokeStyle = isLocked
        ? `rgba(0, 245, 212, ${0.9 * snapAlpha})`
        : isActive
        ? `rgba(0, 245, 212, ${0.85 * snapAlpha})`
        : `rgba(255, 107, 0, ${0.4 * snapAlpha})`;
      ctx.lineWidth = ring.thickness + 6;
      ctx.stroke();

      // Snap zone inner gate highlights (bracket gate brackets `[` and `]`)
      const gateTickLen = 9;
      const startAngleActual = radSnap - radTol - Math.PI / 2;
      const endAngleActual = radSnap + radTol - Math.PI / 2;

      ctx.strokeStyle = isLocked ? '#00F5D4' : '#F4F7F5';
      ctx.lineWidth = 2.5;

      // Start bracket
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(startAngleActual) * (r - gateTickLen),
        cy + Math.sin(startAngleActual) * (r - gateTickLen)
      );
      ctx.lineTo(
        cx + Math.cos(startAngleActual) * (r + gateTickLen),
        cy + Math.sin(startAngleActual) * (r + gateTickLen)
      );
      ctx.stroke();

      // End bracket
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(endAngleActual) * (r - gateTickLen),
        cy + Math.sin(endAngleActual) * (r - gateTickLen)
      );
      ctx.lineTo(
        cx + Math.cos(endAngleActual) * (r + gateTickLen),
        cy + Math.sin(endAngleActual) * (r + gateTickLen)
      );
      ctx.stroke();

      // Center alignment notch
      const centerAngleActual = radSnap - Math.PI / 2;
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(centerAngleActual) * (r - 4),
        cy + Math.sin(centerAngleActual) * (r - 4)
      );
      ctx.lineTo(
        cx + Math.cos(centerAngleActual) * (r + 4),
        cy + Math.sin(centerAngleActual) * (r + 4)
      );
      ctx.stroke();
    }

    // 3. Mirror Ghost Needle (Boss 04 mechanic)
    if (ring.isMirror && isActive && !isLocked) {
      const mirrorAngle = ((-ring.currentAngle * Math.PI) / 180) - Math.PI / 2;
      const mx = cx + Math.cos(mirrorAngle) * r;
      const my = cy + Math.sin(mirrorAngle) * r;

      ctx.fillStyle = 'rgba(147, 51, 234, 0.45)';
      ctx.beginPath();
      ctx.arc(mx, my, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(147, 51, 234, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 4. Rotating Needle / Alignment Node
    const needleAngleActual = (isLocked && ring.lockedAngle !== undefined)
      ? (ring.lockedAngle * Math.PI) / 180 - Math.PI / 2
      : radCurrent - Math.PI / 2;

    const nx = cx + Math.cos(needleAngleActual) * r;
    const ny = cy + Math.sin(needleAngleActual) * r;

    if (isLocked) {
      // Locked Node: Glowing solid Cyan / White diamond with lock burst ring
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(nx, ny, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Lock flash pulse
      if (ring.flashTimer > 0) {
        const pulseR = 10 + (1 - ring.flashTimer) * 35;
        ctx.strokeStyle = `rgba(0, 245, 212, ${ring.flashTimer * 0.9})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (isActive) {
      // Active Node: Glowing chevron / node aiming radially
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(needleAngleActual);

      // Node aura
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      aura.addColorStop(0, 'rgba(0, 245, 212, 0.9)');
      aura.addColorStop(0.5, 'rgba(0, 245, 212, 0.35)');
      aura.addColorStop(1, 'rgba(0, 245, 212, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Sharp arrowhead pointer
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    } else {
      // Pending Node: Muted circle
      ctx.fillStyle = 'rgba(89, 97, 104, 0.6)';
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Active Ring Target Ring Callout / Bracket Pulse
    if (isActive && !isLocked && !isStabilized) {
      const calloutPulse = Math.sin(rc.elapsedTime * 6) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(0, 245, 212, ${calloutPulse * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderElectricArcs(rc: RenderContext) {
    const { ctx, electricArcs } = rc;
    if (electricArcs.length === 0) return;

    ctx.save();
    for (const arc of electricArcs) {
      const alpha = arc.life / arc.maxLife;
      ctx.strokeStyle = arc.color || '#00F5D4';
      ctx.lineWidth = 2 * alpha;
      ctx.shadowColor = arc.color || '#00F5D4';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);

      // Jagged lightning line
      const segments = 6;
      for (let s = 1; s < segments; s++) {
        const t = s / segments;
        const midX = arc.x1 + (arc.x2 - arc.x1) * t;
        const midY = arc.y1 + (arc.y2 - arc.y1) * t;
        const perpX = -(arc.y2 - arc.y1);
        const perpY = arc.x2 - arc.x1;
        const norm = Math.hypot(perpX, perpY) || 1;
        const displace = (Math.random() - 0.5) * arc.roughness * (1 - Math.abs(t - 0.5) * 2);
        ctx.lineTo(midX + (perpX / norm) * displace, midY + (perpY / norm) * displace);
      }

      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderParticles(rc: RenderContext) {
    const { ctx, particles } = rc;
    if (particles.length === 0) return;

    ctx.save();
    for (const p of particles) {
      const lifeRatio = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * lifeRatio;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.type === 'burst' ? 1 + (1 - lifeRatio) * 2 : lifeRatio), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderTemporalDilationFX(rc: RenderContext) {
    const { ctx, width, height, slowMoTimer } = rc;
    ctx.save();

    // Deep blue temporal chromatic overlay with edge vignette
    const dilationGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.2,
      width / 2,
      height / 2,
      height * 0.75
    );
    dilationGrad.addColorStop(0, 'rgba(0, 180, 245, 0.04)');
    dilationGrad.addColorStop(0.7, 'rgba(0, 140, 255, 0.16)');
    dilationGrad.addColorStop(1, 'rgba(108, 74, 182, 0.35)');

    ctx.fillStyle = dilationGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle temporal warp rings
    const ringRadius = ((rc.elapsedTime * 240) % (height * 0.6)) + 40;
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
