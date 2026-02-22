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

// ── 百词斩风格正确音：双振荡器 + 指数衰减 ─────────────────────
// Tone1: 950→1300Hz 上升正弦（上升感）
// Tone2: 1900Hz 泛音（高八度，增加清亮度）
// Envelope: 0.05s 保持最大 → 0.2s 指数衰减，总时长 0.25s
function makeSuccessWav() {
    const sampleRate = 22050;
    const duration = 0.25;
    const attackTime = 0.05;    // flat peak duration
    const numSamples = Math.floor(sampleRate * duration);
    const buf = new ArrayBuffer(44 + numSamples * 2);
    const dv = new DataView(buf);
    const ws = (off, s) => [...s].forEach((c, i) => dv.setUint8(off + i, c.charCodeAt(0)));
    ws(0, 'RIFF'); dv.setUint32(4, 36 + numSamples * 2, true);
    ws(8, 'WAVE'); ws(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    ws(36, 'data'); dv.setUint32(40, numSamples * 2, true);

    // Phase accumulators for accurate frequency sweep
    let phase1 = 0, phase2 = 0;
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;

        // Tone1: 950→1300Hz linear sweep over 0.1s then hold at 1300Hz
        const f1 = t < 0.1 ? 950 + (1300 - 950) * (t / 0.1) : 1300;
        // Tone2: fixed 1900Hz overtone
        const f2 = 1900;

        // Envelope: flat during attack, exponential decay after
        const env = t < attackTime
            ? 1.0
            : Math.exp(-((t - attackTime) / 0.2) * 5);

        // Mix: tone1 full + tone2 at 45% for brightness without harshness
        const s1 = Math.sin(phase1) * env;
        const s2 = Math.sin(phase2) * env * 0.45;
        const mixed = (s1 + s2) * 14000;

        dv.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, mixed)), true);

        phase1 += 2 * Math.PI * f1 / sampleRate;
        phase2 += 2 * Math.PI * f2 / sampleRate;
    }
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// Pre-generate URLs once at import time (no delay on first click)
let _successUrl = null;
let _errorUrl = null;
function getSuccessUrl() {
    if (!_successUrl) {
        try { _successUrl = makeSuccessWav(); } catch { _successUrl = ''; }
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
