export const speakPortuguese = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v =>
        v.lang === 'pt-PT' || v.lang === 'pt_PT' ||
        (v.lang.startsWith('pt') && v.name.toLowerCase().includes('portugal'))
    ) || voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
};

// ── Blob WAV Audio (iOS/Android compatible) ──────────────────────
// Generates a short WAV as a Blob URL — created once, reused every click.
// new Audio(url).play() called inside click handler satisfies mobile autoplay policy.

function makeWavUrl(frequency, duration, descend = false) {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * duration);
    const buf = new ArrayBuffer(44 + numSamples * 2);
    const v = new DataView(buf);
    const ws = (off, s) => [...s].forEach((c, i) => v.setUint8(off + i, c.charCodeAt(0)));
    ws(0, 'RIFF'); v.setUint32(4, 36 + numSamples * 2, true);
    ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true);   // PCM, 1 channel
    v.setUint16(22, 1, true);                               // mono
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * 2, true);                  // byteRate
    v.setUint16(32, 2, true);                               // blockAlign
    v.setUint16(34, 16, true);                              // 16-bit
    ws(36, 'data'); v.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const fade = Math.exp(-t * 10);
        const freq = descend ? frequency * Math.exp(-t * 4) : frequency * (1 + t * 0.5);
        const sample = Math.sin(2 * Math.PI * freq * t) * fade;
        v.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, sample * 22000)), true);
    }
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// Pre-generate URLs once at import time (no delay on first click)
let _successUrl = null;
let _errorUrl = null;
function getSuccessUrl() {
    if (!_successUrl) {
        // "硬币弹起" / 清脆水滴：900→1100Hz 极短正弦波
        try { _successUrl = makeWavUrl(900, 0.09, false); } catch { _successUrl = ''; }
    }
    return _successUrl;
}
function getErrorUrl() {
    if (!_errorUrl) {
        try { _errorUrl = makeWavUrl(300, 0.2, true); } catch { _errorUrl = ''; }
    }
    return _errorUrl;
}

// Play via new Audio() — MUST be called inside a click/touch handler
export function playSuccess() {
    const url = getSuccessUrl();
    if (!url) return;
    try {
        const a = new Audio(url);
        a.volume = 0.5;
        a.play().catch(() => { });
    } catch { }
}

export function playError() {
    const url = getErrorUrl();
    if (!url) return;
    try {
        const a = new Audio(url);
        a.volume = 0.5;
        a.play().catch(() => { });
    } catch { }
}
