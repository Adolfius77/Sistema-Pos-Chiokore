// Procedural Sound Generator using Web Audio API (Offline, No Assets Required)
class SoundManager {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    isAudioEnabled() {
        const saved = localStorage.getItem("AUDIO_ENABLED");
        return saved === null ? true : saved === "true";
    }

    playClick() {
        if (!this.isAudioEnabled()) return;
        this.init();
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            // Pop/click sound: very short, fast decay
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
            
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {
            console.warn("La Web Audio API está bloqueada o no es compatible:", e);
        }
    }

    playAdd() {
        if (!this.isAudioEnabled()) return;
        this.init();

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            // Corto beep agudo al agregar item
            osc.type = "sine";
            osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {
            console.warn("La Web Audio API está bloqueada o no es compatible:", e);
        }
    }

    playSuccess() {
        if (!this.isAudioEnabled()) return;
        this.init();

        try {
            // Sonido de éxito: Acordes ascendentes
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.06, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
        } catch (e) {
            console.warn("La Web Audio API está bloqueada o no es compatible:", e);
        }
    }
}

export const sound = new SoundManager();
