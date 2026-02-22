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
