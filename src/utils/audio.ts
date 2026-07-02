// Dynamic Web Audio API Synthesizer & Audio Engine
// Generates energetic retro 8-bit / Synthwave background music (BGM) and premium sound effects (SFX)
// Zero external assets required, fully local, lightweight, and high-performance.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmIntervalId: any = null;
  private currentStep = 0;
  private isBgmPlaying = false;
  private bgmVolumeNode: GainNode | null = null;
  private masterVolumeNode: GainNode | null = null;
  
  // Custom audio file BGM variables
  private audioFileBuffer: AudioBuffer | null = null;
  private audioFileSource: AudioBufferSourceNode | null = null;
  private audioUrlElement: HTMLAudioElement | null = null;
  private useAudioFileBgm = false;
  private audioFileName = '';
  private loopStart = 0;
  private loopEnd = 28.00; // Loops at exactly 28 seconds as requested
  
  // Custom uploaded tracks list
  private customTracks: Array<{
    id: string;
    name: string;
    buffer: AudioBuffer | null;
    urlElement: HTMLAudioElement | null;
    loopStart: number;
    loopEnd: number;
    duration: number;
  }> = [];
  private activeTrackId = 'adventure';
  
  // Custom music settings
  private bpm = 144; // Default to highly exciting 144 BPM
  private volume = 0.3; // Default BGM volume
  private sfxVolume = 0.4; // Default SFX volume
  private activeSynthPreset: 'classic' | 'adventure' | 'cyberpunk' = 'adventure';

  // Bass notes for classic chiptune (Am - F - G - Em)
  private bassClassic = [
    [110, 110, 110, 110, 110, 110, 110, 110],
    [87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31],
    [98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0],
    [82.41, 82.41, 82.41, 82.41, 82.41, 82.41, 82.41, 82.41]
  ];

  // Upbeat classic melody arpeggios
  private melodyClassic = [
    [220, 261.63, 329.63, 440, 329.63, 261.63, 220, 329.63],
    [174.61, 218.27, 261.63, 349.23, 261.63, 218.27, 174.61, 261.63],
    [196.00, 246.94, 293.66, 392.00, 293.66, 246.94, 196.00, 293.66],
    [164.81, 196.00, 246.94, 329.63, 246.94, 196.00, 164.81, 246.94]
  ];

  // Heroic, exciting Adventure theme (Dm - Bb - F - C)
  private bassAdventure = [
    [146.83, 146.83, 146.83, 146.83, 146.83, 146.83, 146.83, 146.83], // Dm
    [116.54, 116.54, 116.54, 116.54, 116.54, 116.54, 116.54, 116.54], // Bb
    [174.61, 174.61, 174.61, 174.61, 174.61, 174.61, 174.61, 174.61], // F
    [130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81]  // C
  ];

  private melodyAdventure = [
    [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 440.00],
    [233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 233.08, 349.23],
    [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 523.25],
    [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00]
  ];

  // Fast-paced Action Cyberpunk (Em - C - D - Bm) with high octane double octave bass
  private bassCyberpunk = [
    [82.41, 164.81, 82.41, 164.81, 82.41, 164.81, 82.41, 164.81],
    [65.41, 130.81, 65.41, 130.81, 65.41, 130.81, 65.41, 130.81],
    [73.42, 146.83, 73.42, 146.83, 73.42, 146.83, 73.42, 146.83],
    [61.74, 123.47, 61.74, 123.47, 61.74, 123.47, 61.74, 123.47]
  ];

  private melodyCyberpunk = [
    [329.63, 493.88, 392.00, 659.25, 587.33, 493.88, 392.00, 587.33],
    [261.63, 392.00, 329.63, 523.25, 480.00, 392.00, 329.63, 480.00],
    [293.66, 440.00, 349.23, 587.33, 523.25, 440.00, 349.23, 523.25],
    [246.94, 369.99, 293.66, 493.88, 440.00, 369.99, 293.66, 440.00]
  ];

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup master gain node
      this.masterVolumeNode = this.ctx.createGain();
      this.masterVolumeNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterVolumeNode.connect(this.ctx.destination);

      // Setup BGM gain node
      this.bgmVolumeNode = this.ctx.createGain();
      this.bgmVolumeNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.bgmVolumeNode.connect(this.masterVolumeNode);
    }
    
    // Resume context if suspended (browser security policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set background music volume (0.0 to 1.0)
  public setBgmVolume(level: number) {
    this.volume = Math.max(0, Math.min(1, level));
    if (this.bgmVolumeNode && this.ctx) {
      this.bgmVolumeNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.audioUrlElement) {
      this.audioUrlElement.volume = this.volume;
    }
  }

  // Play a customizable synthesizer instrument step
  private playSynthNote(freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, vol: number, glideTo?: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      if (glideTo) {
        osc.frequency.exponentialRampToValueAtTime(glideTo, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.bgmVolumeNode || this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Synth failed to play note', e);
    }
  }

  // Play a high-energy synthesized drum sound (Kick / Snare / Hi-hat)
  private playDrum(drumType: 'kick' | 'snare' | 'hat', time: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.bgmVolumeNode || this.ctx.destination);

      if (drumType === 'kick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
        
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        
        osc.start(time);
        osc.stop(time + 0.15);
      } 
      else if (drumType === 'snare') {
        // High pass filtered noisy sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.linearRampToValueAtTime(120, time + 0.12);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        
        osc.start(time);
        osc.stop(time + 0.12);
      } 
      else if (drumType === 'hat') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(10000, time);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        osc.start(time);
        osc.stop(time + 0.05);
      }
    } catch (e) {
      // Drum error
    }
  }

  // Set the current synthesizer preset
  public setSynthPreset(presetName: 'classic' | 'adventure' | 'cyberpunk') {
    this.activeSynthPreset = presetName;
    if (presetName === 'classic') {
      this.bpm = 128;
    } else if (presetName === 'adventure') {
      this.bpm = 144;
    } else if (presetName === 'cyberpunk') {
      this.bpm = 156;
    }
    
    // If procedural BGM is active, restart the interval with the new BPM
    if (this.isBgmPlaying && !this.useAudioFileBgm) {
      const isCurrentlyPlaying = this.isBgmPlaying;
      this.stopBgm();
      if (isCurrentlyPlaying) {
        this.playBgm();
      }
    }
  }

  // Get active synth preset name
  public getSynthPreset() {
    return this.activeSynthPreset;
  }

  // Main background music scheduler
  private scheduleNextStep() {
    if (!this.ctx || !this.isBgmPlaying) return;

    const stepDuration = 60 / this.bpm / 2; // 8th notes
    const time = this.ctx.currentTime;

    // Chords alternate every 8 steps
    const chordIdx = Math.floor(this.currentStep / 8) % 4;
    const stepInChord = this.currentStep % 8;

    let bassProg = this.bassClassic;
    let melProg = this.melodyClassic;

    if (this.activeSynthPreset === 'adventure') {
      bassProg = this.bassAdventure;
      melProg = this.melodyAdventure;
    } else if (this.activeSynthPreset === 'cyberpunk') {
      bassProg = this.bassCyberpunk;
      melProg = this.melodyCyberpunk;
    }

    // 1. Play Bassline (Sawtooth, punchy retro feel)
    const bassFreq = bassProg[chordIdx][stepInChord];
    this.playSynthNote(bassFreq, 'sawtooth', stepDuration * 0.8, this.volume * 0.35);

    // 2. Play Drums (Energetic dance/synthwave beat)
    const beatStep = this.currentStep % 16;
    if (beatStep === 0 || beatStep === 4 || beatStep === 8 || beatStep === 12) {
      this.playDrum('kick', time);
    } else if (beatStep === 2 || beatStep === 6 || beatStep === 10 || beatStep === 14) {
      this.playDrum('hat', time);
    } else if (beatStep === 4 || beatStep === 12) {
      this.playDrum('snare', time);
    } else if (beatStep % 2 !== 0) {
      // Subdued offbeat hats
      if (Math.random() > 0.4) this.playDrum('hat', time);
    }

    // 3. Play Upbeat Lead Melody (Square wave, cheerful arcade chiptune style)
    // Only play on certain rhythmic steps to make it syncopated and highly energetic
    const activeMelodySteps = [0, 2, 3, 5, 6, 8, 10, 11, 13, 14];
    if (activeMelodySteps.includes(stepInChord)) {
      const melNote = melProg[chordIdx][stepInChord] * 1.5; // Shift octave up
      
      // Let's create an echoey high note effect occasionally
      const volMultiplier = stepInChord === 3 || stepInChord === 11 ? 0.3 : 0.22;
      this.playSynthNote(melNote, 'square', stepDuration * 0.6, this.volume * volMultiplier);
    }

    // Advance step
    this.currentStep = (this.currentStep + 1) % 32;
  }

  // Load background music from a File or a URL
  public async loadBgm(fileOrUrl: File | string, fileName?: string): Promise<boolean> {
    this.initCtx();
    
    // Clear previous URL element
    if (this.audioUrlElement) {
      try {
        this.audioUrlElement.pause();
        this.audioUrlElement.remove();
      } catch (e) {}
      this.audioUrlElement = null;
    }

    try {
      if (typeof fileOrUrl === 'string') {
        this.audioFileName = fileName || fileOrUrl.split('/').pop() || 'backsound.mp3';
        
        // Let's check if the URL is an external web resource. External resources are prone to CORS.
        // We will immediately try fetching it. If it fails, we fall back to streaming it directly via HTMLAudioElement.
        try {
          if (!this.ctx) throw new Error('No AudioContext');
          const response = await fetch(fileOrUrl);
          if (!response.ok) throw new Error('Gagal mengunduh file audio');
          const arrayBuffer = await response.arrayBuffer();
          this.audioFileBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.useAudioFileBgm = true;
          this.audioUrlElement = null;
        } catch (fetchErr) {
          console.warn('CORS atau kegagalan fetch, beralih ke HTMLAudioElement kustom untuk streaming:', fetchErr);
          
          // Construct HTMLAudioElement
          const audioEl = new Audio(fileOrUrl);
          audioEl.loop = true;
          audioEl.volume = this.volume;
          audioEl.crossOrigin = 'anonymous'; // request credentials if possible, though browser allows cross-origin simple stream plays
          this.audioUrlElement = audioEl;
          this.useAudioFileBgm = true;
          this.audioFileBuffer = null; // Mark that we are using the streaming element instead
        }
      } else {
        if (!this.ctx) return false;
        const arrayBuffer = await fileOrUrl.arrayBuffer();
        this.audioFileBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.useAudioFileBgm = true;
        this.audioUrlElement = null;
        this.audioFileName = fileName || fileOrUrl.name;

        // Check if track is already registered
        const alreadyExists = this.customTracks.find(t => t.name === this.audioFileName);
        if (!alreadyExists) {
          const id = `custom_${Date.now()}`;
          this.customTracks.push({
            id,
            name: this.audioFileName,
            buffer: this.audioFileBuffer,
            urlElement: null,
            loopStart: 0,
            loopEnd: this.audioFileBuffer.duration,
            duration: this.audioFileBuffer.duration
          });
          this.activeTrackId = id;
        } else {
          this.activeTrackId = alreadyExists.id;
        }
      }

      // If BGM is already playing, restart with the new backsound
      if (this.isBgmPlaying) {
        this.stopBgm();
        // Pause briefly before restarting
        setTimeout(() => {
          this.playBgm();
        }, 100);
      }
      return true;
    } catch (e) {
      console.warn('Gagal memuat backsound:', e);
      return false;
    }
  }

  // Try loading default background music files from local server path
  public async tryLoadDefaultBacksound(): Promise<boolean> {
    const paths = ['/assets/backsound.mp3', '/backsound.mp3'];
    for (const path of paths) {
      try {
        const success = await this.loadBgm(path, 'backsound.mp3');
        if (success) {
          console.log(`Berhasil memuat backsound bawaan dari path: ${path}`);
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  // Get current active BGM info
  public getBgmInfo() {
    return {
      useAudioFileBgm: this.useAudioFileBgm,
      fileName: this.audioFileName || (this.useAudioFileBgm ? 'backsound.mp3' : 'Sintesis Chiptune 8-Bit'),
      loopStart: this.loopStart,
      loopEnd: this.loopEnd,
      isLoaded: !!this.audioFileBuffer || !!this.audioUrlElement,
      duration: this.audioFileBuffer ? this.audioFileBuffer.duration : (this.audioUrlElement ? 300 : 0)
    };
  }

  public getCustomTracks() {
    return this.customTracks.map(t => ({
      id: t.id,
      name: t.name,
      loopStart: t.loopStart,
      loopEnd: t.loopEnd,
      duration: t.duration
    }));
  }

  public getActiveTrackId() {
    return this.activeTrackId;
  }

  public async selectTrack(trackId: string): Promise<boolean> {
    this.initCtx();
    this.activeTrackId = trackId;

    // Stop current custom audio file if playing
    if (this.audioUrlElement) {
      try {
        this.audioUrlElement.pause();
        this.audioUrlElement.remove();
      } catch (e) {}
      this.audioUrlElement = null;
    }
    if (this.audioFileSource) {
      try { this.audioFileSource.stop(); } catch (e) {}
      this.audioFileSource.disconnect();
      this.audioFileSource = null;
    }

    const custom = this.customTracks.find(t => t.id === trackId);
    if (custom) {
      this.useAudioFileBgm = true;
      this.audioFileBuffer = custom.buffer;
      this.audioUrlElement = null;
      this.audioFileName = custom.name;
      this.loopStart = custom.loopStart;
      this.loopEnd = custom.loopEnd;
    } else if (trackId === 'stream') {
      const success = await this.loadBgm('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Epic Techno-Arcade (Stream)');
      if (success) {
        this.loopStart = 0;
        this.loopEnd = 28.00;
        this.activeTrackId = 'stream';
      } else {
        return false;
      }
    } else if (trackId === 'classic' || trackId === 'adventure' || trackId === 'cyberpunk') {
      this.useAudioFileBgm = false;
      this.audioFileBuffer = null;
      this.audioFileName = '';
      this.setSynthPreset(trackId);
    }

    if (this.isBgmPlaying) {
      // Toggle play to apply new source/synth
      this.stopBgm();
      this.isBgmPlaying = true;
      if (this.useAudioFileBgm) {
        if (this.audioFileBuffer && this.ctx) {
          try {
            this.audioFileSource = this.ctx.createBufferSource();
            this.audioFileSource.buffer = this.audioFileBuffer;
            this.audioFileSource.loop = true;
            this.audioFileSource.loopStart = this.loopStart;
            this.audioFileSource.loopEnd = Math.min(this.loopEnd, this.audioFileBuffer.duration);
            this.audioFileSource.connect(this.bgmVolumeNode || this.ctx.destination);
            this.audioFileSource.start(0);
          } catch (e) {
            console.warn('Gagal memutar custom track buffer:', e);
            this.playSynthBgm();
          }
        } else {
          this.playSynthBgm();
        }
      } else {
        this.playSynthBgm();
      }
    }
    return true;
  }

  // Reset BGM back to synthetic chiptune default
  public resetBgmToDefault() {
    this.useAudioFileBgm = false;
    this.audioFileBuffer = null;
    this.audioFileName = '';
    this.activeTrackId = 'adventure';
    if (this.audioUrlElement) {
      try {
        this.audioUrlElement.pause();
        this.audioUrlElement.remove();
      } catch (e) {}
      this.audioUrlElement = null;
    }
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.playBgm();
    }
  }

  // Set looping configuration
  public setLoopTimes(start: number, end: number) {
    this.loopStart = Math.max(0, start);
    this.loopEnd = Math.max(start + 0.1, end);
    
    // Dynamically apply loop configuration if currently playing and using BufferSource
    if (this.isBgmPlaying && this.audioFileSource && this.audioFileBuffer) {
      try {
        this.audioFileSource.loopStart = this.loopStart;
        this.audioFileSource.loopEnd = Math.min(this.loopEnd, this.audioFileBuffer.duration);
      } catch (e) {}
    }
  }

  // Start background music loop
  public playBgm() {
    this.initCtx();
    if (this.isBgmPlaying) return;

    this.isBgmPlaying = true;

    if (this.useAudioFileBgm) {
      if (this.audioUrlElement) {
        try {
          this.audioUrlElement.volume = this.volume;
          this.audioUrlElement.play().catch(e => {
            console.warn("Gagal memutar HTMLAudioElement kustom, mencoba memicu di event interaksi:", e);
          });
        } catch (e) {
          console.warn("Gagal memainkan HTMLAudioElement kustom:", e);
        }
      } else if (this.audioFileBuffer && this.ctx) {
        try {
          // Disconnect and stop any old source
          if (this.audioFileSource) {
            try { this.audioFileSource.stop(); } catch (e) {}
            this.audioFileSource.disconnect();
          }

          this.audioFileSource = this.ctx.createBufferSource();
          this.audioFileSource.buffer = this.audioFileBuffer;
          this.audioFileSource.loop = true;
          
          // Loop from 0.00 to 28.00 seconds as specified by the user
          this.audioFileSource.loopStart = this.loopStart;
          this.audioFileSource.loopEnd = Math.min(this.loopEnd, this.audioFileBuffer.duration);

          this.audioFileSource.connect(this.bgmVolumeNode || this.ctx.destination);
          this.audioFileSource.start(0);
        } catch (e) {
          console.warn('Gagal memutar backsound file, kembali ke synthesizer BGM:', e);
          this.playSynthBgm();
        }
      } else {
        this.playSynthBgm();
      }
    } else {
      this.playSynthBgm();
    }
  }

  // Play synthetic 8-bit BGM as a lightweight procedural fallback
  private playSynthBgm() {
    this.currentStep = 0;
    const intervalMs = (60 / this.bpm / 2) * 1000;
    this.scheduleNextStep();
    this.bgmIntervalId = setInterval(() => {
      this.scheduleNextStep();
    }, intervalMs);
  }

  // Stop background music
  public stopBgm() {
    this.isBgmPlaying = false;
    
    // Stop HTMLAudioElement BGM
    if (this.audioUrlElement) {
      try {
        this.audioUrlElement.pause();
      } catch (e) {}
    }

    // Stop procedural synth scheduler
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }

    // Stop audio file stream
    if (this.audioFileSource) {
      try {
        this.audioFileSource.stop();
      } catch (e) {}
      this.audioFileSource.disconnect();
      this.audioFileSource = null;
    }
  }

  // Check if BGM is active
  public isPlayingBgm(): boolean {
    return this.isBgmPlaying;
  }

  // Premium, retro arcade-style sound effects
  public playSfx(type: 'click' | 'success' | 'fail' | 'level_up' | 'correct' | 'incorrect' | 'laser' | 'clean' | 'explosion' | 'coin' | 'quiz_success' | 'warning') {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.connect(gainNode);
      // Connect to master, bypassing BGM volume level so SFX stays crisp and audible
      gainNode.connect(this.masterVolumeNode || this.ctx.destination);

      const now = this.ctx.currentTime;

      switch (type) {
        case 'coin':
          // Retro game coin/point pickup sound
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now); // B5
          osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now + 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'quiz_success':
          // Harmonious positive fanfare
          osc.type = 'triangle';
          const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
          notes.forEach((freq, idx) => {
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          });
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now + 0.32);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'warning':
          // Urgent pulsing caution alarm
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.15);
          osc.frequency.setValueAtTime(440, now + 0.3);
          osc.frequency.setValueAtTime(554.37, now + 0.45);
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now + 0.45);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'success':
          // Retro game positive chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
          
          gainNode.gain.setValueAtTime(this.sfxVolume, now);
          gainNode.gain.setValueAtTime(this.sfxVolume, now + 0.24);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          
          osc.start(now);
          osc.stop(now + 0.45);
          break;

        case 'correct':
          // Crisp correct answer confirmation sound
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now); // E5
          osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'incorrect':
          // Downward buzzer sound
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.25);
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'fail':
          // Retro game over/defeat fanfare
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(293.66, now); // D4
          osc.frequency.setValueAtTime(277.18, now + 0.15); // C#4
          osc.frequency.setValueAtTime(261.63, now + 0.3); // C4
          osc.frequency.setValueAtTime(196.00, now + 0.45); // G3
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
          
          osc.start(now);
          osc.stop(now + 0.75);
          break;

        case 'level_up':
          // Uplifting powerup scale
          osc.type = 'square';
          const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99, 1046.50];
          scale.forEach((freq, idx) => {
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          });
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now + 0.4);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          
          osc.start(now);
          osc.stop(now + 0.8);
          break;

        case 'laser':
          // Classic space arcade laser zap
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'clean':
          // Magical sparkling wind swoosh (for neutralizing pollution)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
          
          gainNode.gain.setValueAtTime(0.02, now);
          gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, now + 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'explosion':
          // Retro low-frequency noise explosion (for boss damage)
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(20, now + 0.4);
          
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.9, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          
          osc.start(now);
          osc.stop(now + 0.4);
          break;
      }
    } catch (e) {
      console.warn('SFX playback failed', e);
    }
  }
}

// Export singleton instance of audio engine so it is accessible globally
export const audio = new AudioEngine();
