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

// ── Web Audio API Context ─────────────────────────────────────────
let _ctx = null;
function getCtx() {
    if (!_ctx) {
        try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch { return null; }
    }
    return _ctx;
}

// Unlock iOS/Android suspended context, then run callback
function withCtx(fn) {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => fn(ctx)).catch(() => { });
    } else {
        fn(ctx);
    }
}

// ── Success: 带回响的清脆铃声 ─────────────────────────────────────
// 主音:  Sine  880→1100Hz (0.1s sweep)
// 泛音:  Triangle 1760Hz, 30% 音量
// 包络:  0.15s 高音量 → 0.35s 指数衰减，总时长 0.5s
export function playSuccess() {
    withCtx((ctx) => {
        const now = ctx.currentTime;
        const totalDur = 0.5;
        const attackEnd = now + 0.15;
        const endTime = now + totalDur;

        // ── 主音振荡器 (Sine) ──
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(1100, now + 0.1); // smooth sweep
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.setValueAtTime(0.5, attackEnd);
        gain1.gain.exponentialRampToValueAtTime(0.001, endTime);
        osc1.start(now);
        osc1.stop(endTime);

        // ── 泛音振荡器 (Triangle) — 增加厚度 ──
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, now); // 高八度固定
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.15, now);     // 主音的 30%
        gain2.gain.setValueAtTime(0.15, attackEnd);
        gain2.gain.exponentialRampToValueAtTime(0.001, endTime);
        osc2.start(now);
        osc2.stop(endTime);
    });
}

// ── Error: 干脆木头敲击"咚" ────────────────────────────────────
// 波形:   Square + BiquadFilter 低通 300Hz (去高频刺耳)
// 频率:   140Hz 稳定
// 包络:   0.02s 线性淡入 (防爆音) → 平稳指数衰减，总时长 0.3s
export function playError() {
    withCtx((ctx) => {
        const now = ctx.currentTime;
        const fadeIn = now + 0.02;
        const endTime = now + 0.3;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);

        // 低通滤波：截止 300Hz，去掉方波高频泛音的刺耳感
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.Q.setValueAtTime(1.0, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // 极短淡入防爆音，然后指数衰减
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.45, fadeIn);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.start(now);
        osc.stop(endTime);
    });
}
