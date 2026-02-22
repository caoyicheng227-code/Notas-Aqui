export const speakPortuguese = (text) => {
    if (!('speechSynthesis' in window)) {
        console.warn('Text-to-speech not supported in this browser.');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to find a European Portuguese voice (pt-PT)
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(voice =>
        voice.lang === 'pt-PT' ||
        voice.lang === 'pt_PT' ||
        (voice.lang.startsWith('pt') && voice.name.toLowerCase().includes('portugal'))
    ) || voices.find(voice => voice.lang.startsWith('pt'));

    if (ptVoice) {
        utterance.voice = ptVoice;
    }

    utterance.lang = 'pt-PT';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
};

// ── Sound Effects (Web Audio API, zero-latency, no file needed) ──
let _audioCtx = null;
function getAudioCtx() {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch { return null; }
    }
    return _audioCtx;
}

export function playSuccess() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    // iOS Safari suspends AudioContext until a user gesture — resume it first
    const play = () => {
        const now = ctx.currentTime;
        [0, 0.1].forEach((offset, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + i * 200, now + offset);
            osc.frequency.exponentialRampToValueAtTime(900 + i * 200, now + offset + 0.15);
            gain.gain.setValueAtTime(0.35, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);
            osc.start(now + offset);
            osc.stop(now + offset + 0.35);
        });
    };
    if (ctx.state === 'suspended') {
        ctx.resume().then(play);
    } else {
        play();
    }
}

export function playError() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const play = () => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    };
    if (ctx.state === 'suspended') {
        ctx.resume().then(play);
    } else {
        play();
    }
}
