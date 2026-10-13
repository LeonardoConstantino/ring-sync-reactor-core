/**
 * Web Audio API procedural sound synthesizer for Ring Sync: Reactor Core
 * Provides authentic punchy cyberpunk hydraulic clicks, resonant harmonics,
 * lowpass filter sweeps for slow-motion, combo chord risers, and reactor drones.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private isSlowMoActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master lowpass filter (allows low-pass cutoff drop during slow-mo)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSlowMo(active: boolean) {
    this.initContext();
    if (!this.ctx || !this.filterNode) return;
    this.isSlowMoActive = active;

    const t = this.ctx.currentTime;
    if (active) {
      // Sweep filter down to muffled underwater/dilation frequency with resonance
      this.filterNode.frequency.setTargetAtTime(650, t, 0.08);
      this.filterNode.Q.setTargetAtTime(3.5, t, 0.08);
      this.playSlowMoWhoosh();
    } else {
      // Restore normal frequency
      this.filterNode.frequency.setTargetAtTime(20000, t, 0.12);
      this.filterNode.Q.setTargetAtTime(1.0, t, 0.12);
    }
  }

  /**
   * Sound: Hydraulic Mechanical Click + Crystalline Resonant Harmonic on successful snap
   */
  public playSnapSuccess(streak: number = 1) {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    // 1. Mechanical Clunk (Short low sine thump + transient)
    const thumpOsc = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thumpOsc.type = 'triangle';
    thumpOsc.frequency.setValueAtTime(160, t);
    thumpOsc.frequency.exponentialRampToValueAtTime(35, t + 0.09);
    thumpGain.gain.setValueAtTime(0.5, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    thumpOsc.connect(thumpGain);
    thumpGain.connect(dest);
    thumpOsc.start(t);
    thumpOsc.stop(t + 0.1);

    // 2. Harmonic Crystalline chime based on streak
    // Scale: C5, D5, E5, G5, A5, C6
    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const noteIndex = Math.min(streak - 1, baseFreqs.length - 1);
    const chimeFreq = baseFreqs[Math.max(0, noteIndex)];

    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(chimeFreq, t);
    chimeGain.gain.setValueAtTime(0.35, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(dest);
    chimeOsc.start(t);
    chimeOsc.stop(t + 0.36);

    // 3. High overtone sparkle
    const sparkOsc = this.ctx.createOscillator();
    const sparkGain = this.ctx.createGain();
    sparkOsc.type = 'sine';
    sparkOsc.frequency.setValueAtTime(chimeFreq * 2, t);
    sparkGain.gain.setValueAtTime(0.18, t);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    sparkOsc.connect(sparkGain);
    sparkGain.connect(dest);
    sparkOsc.start(t);
    sparkOsc.stop(t + 0.22);
  }

  /**
   * Sound: Error Clank & Electrical Arc Buzz
   */
  public playErrorStrike() {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    // Low distorted buzzer
    const buzzOsc = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();
    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.setValueAtTime(95, t);
    buzzOsc.frequency.linearRampToValueAtTime(60, t + 0.25);
    buzzGain.gain.setValueAtTime(0.4, t);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    buzzOsc.connect(buzzGain);
    buzzGain.connect(dest);
    buzzOsc.start(t);
    buzzOsc.stop(t + 0.26);

    // Dissonant sharp clash
    const clashOsc = this.ctx.createOscillator();
    const clashGain = this.ctx.createGain();
    clashOsc.type = 'square';
    clashOsc.frequency.setValueAtTime(140, t);
    clashOsc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    clashGain.gain.setValueAtTime(0.25, t);
    clashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    clashOsc.connect(clashGain);
    clashGain.connect(dest);
    clashOsc.start(t);
    clashOsc.stop(t + 0.16);
  }

  /**
   * Sound: Temporal Dilation Activation Whoosh
   */
  public playSlowMoWhoosh() {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Sound: Reactor Stabilized Major Chord Resolution
   */
  public playReactorStabilized() {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    // Major chord: C4, E4, G4, C5, E5
    const chordNotes = [261.63, 329.63, 392.0, 523.25, 659.25];
    chordNotes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.06 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t + idx * 0.06);
      osc.stop(t + 1.7);
    });
  }

  /**
   * Sound: Reactor Meltdown / Game Over
   */
  public playMeltdown() {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    // Bass drop
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    dropOsc.type = 'sawtooth';
    dropOsc.frequency.setValueAtTime(180, t);
    dropOsc.frequency.exponentialRampToValueAtTime(25, t + 0.9);
    dropGain.gain.setValueAtTime(0.5, t);
    dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    dropOsc.connect(dropGain);
    dropGain.connect(dest);
    dropOsc.start(t);
    dropOsc.stop(t + 0.92);

    // Glitch click burst
    for (let i = 0; i < 4; i++) {
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(100 + Math.random() * 300, t + i * 0.07);
      clickGain.gain.setValueAtTime(0.2, t + i * 0.07);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(dest);
      clickOsc.start(t + i * 0.07);
      clickOsc.stop(t + i * 0.07 + 0.05);
    }
  }

  /**
   * Periodic Pressure Throb
   */
  public playPressurePulse(pressureRate: number) {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq = 55 + Math.min(60, pressureRate * 40);
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Clean UI Button Click
   */
  public playButtonClick() {
    this.initContext();
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.filterNode;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.05);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const sound = new SoundEngine();
