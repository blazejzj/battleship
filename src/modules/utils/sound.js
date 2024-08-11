import shotSound from '../../assets/sounds/shot.mp3';
import hitSound from '../../assets/sounds/hit.mp3';
import missSound from '../../assets/sounds/miss.mp3';
import backgroundOcean from '../../assets/sounds/backgroundOcean.mp3';

class SoundManager {
  constructor() {
    this.audioCtx = null; // Initialize as null to create after user interaction
    this.backgroundSource = null; // To keep track of the background audio source
  }

  initAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(soundUrl) {
    this.initAudioContext(); // Initialize or resume AudioContext before playing sound
    const request = new XMLHttpRequest();
    request.open('GET', soundUrl, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      this.audioCtx.decodeAudioData(request.response, (buffer) => {
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      });
    };
    request.send();
  }

  shot() {
    this.playSound(shotSound);
  }

  hit() {
    this.playSound(hitSound);
  }

  miss() {
    this.playSound(missSound);
  }

  async playBackground() {
    this.initAudioContext(); // Ensure AudioContext is initialized
    const response = await fetch(backgroundOcean);
    const arrayBuffer = await response.arrayBuffer();
    this.audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
      this.backgroundSource = this.audioCtx.createBufferSource();
      this.backgroundSource.buffer = buffer;
      this.backgroundSource.loop = true;
      this.backgroundSource.connect(this.audioCtx.destination);
      this.backgroundSource.start(0);
    });
  }

  BackgroundOnFirstTouch() {
    const unlockAudio = () => {
      this.playBackground(); // Start background audio on user gesture
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    if (/Android|iPhone/i.test(navigator.userAgent)) {
      document.addEventListener('touchstart', unlockAudio, { once: true });
    } else {
      document.addEventListener('click', unlockAudio, { once: true });
    }
  }

  stopBackground() {
    if (this.backgroundSource) {
      this.backgroundSource.stop(); // Stop the background audio
      this.backgroundSource = null;
    }
  }
}

export default new SoundManager();
