import shotSound from "../../assets/sounds/shot.mp3";
import hitSound from "../../assets/sounds/hit.flac";
import missSound from "../../assets/sounds/miss.mp3";
import backgroundOcean from "../../assets/sounds/backgroundOcean.wav";

class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.backgroundSource = null;
    }

    initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext ||
                window.webkitAudioContext)();
        } else if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
    }

    async playSound(soundUrl) {
        this.initAudioContext();

        try {
            const response = await fetch(soundUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(
                arrayBuffer
            );

            const source = this.audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioCtx.destination);
            source.start(0);
        } catch (error) {
            console.error("Error playing sound:", error);
        }
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
        this.initAudioContext();
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
        const unlockAudio = async () => {
            try {
                await this.playBackground();
            } catch (error) {
                console.error("Error playing background audio:", error);
            } finally {
                document.removeEventListener("click", unlockAudio);
                document.removeEventListener("touchstart", unlockAudio);
            }
        };

        if (/Android|iPhone/i.test(navigator.userAgent)) {
            document.addEventListener("touchstart", unlockAudio, {
                once: true,
            });
        } else {
            document.addEventListener("click", unlockAudio, { once: true });
        }
    }

    stopBackground() {
        if (this.backgroundSource) {
            this.backgroundSource.stop();
            this.backgroundSource = null;
        }
    }
}

export default new SoundManager();
