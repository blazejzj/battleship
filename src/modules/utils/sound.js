// ASSETS
import shotSound from '../../assets/sounds/shot.mp3';
import hitSound from '../../assets/sounds/hit.mp3';
import missSound from '../../assets/sounds/miss.mp3';

class SoundManager {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playSound(soundUrl) {
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
      this.audioCtx.resume();
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

  async background() {
    const audioModule = await import('../../assets/sounds/backgroundOcean.mp3');
    const audio = new Audio(audioModule.default);
    audio.loop = true;
    audio.play();
  }

  BackgroundOnFirstTouch() {
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      document.addEventListener('touchstart', this.background.bind(this), { once: true });
    } else {
      document.addEventListener('click', this.background.bind(this), { once: true });
    }
  }
}

export default new SoundManager();