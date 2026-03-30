import { useState } from 'react';
import leituraData from '../data/leitura.json';
import { speakPortuguese } from '../utils/audio';
import { IconSpeaker } from './Icons';

export default function Leitura({ currentLevel }) {
    const [showChinese, setShowChinese] = useState(true);
    const [speechRate, setSpeechRate] = useState(0.9);

    // Filter passages for the current level
    const passages = leituraData.filter(p => p.level === currentLevel);

    const handleReadAloud = (text) => {
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
        utterance.rate = speechRate;
        window.speechSynthesis.speak(utterance);
    };

    if (passages.length === 0) {
        return (
            <div className="empty-state handwritten">
                <p>Nenhum texto disponível para este nível ainda.</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>(暂无此等级阅读文本)</p>
            </div>
        );
    }

    return (
        <div className="leitura-container">
            <div className="leitura-controls" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 10px'
            }}>
                <button
                    style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '2px solid var(--primary-deep)',
                        backgroundColor: 'white',
                        color: 'var(--primary-deep)',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowChinese(!showChinese)}
                >
                    {showChinese ? 'Ocultar Chinês' : 'Mostrar Chinês'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>Velocidade:</span>
                    <select
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: '2px solid var(--primary-deep)',
                            backgroundColor: 'white',
                            color: 'var(--primary-deep)'
                        }}
                    >
                        <option value={0.7}>Lento (0.7x)</option>
                        <option value={0.9}>Normal (0.9x)</option>
                        <option value={1.2}>Rápido (1.2x)</option>
                    </select>
                </div>
            </div>

            <div className="passages-list" style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '40px' }}>
                {passages.map((passage) => (
                    <div key={passage.id} className="word-card" style={{ padding: '24px', textAlign: 'left', minHeight: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <h2 className="handwritten" style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>
                                {passage.title.pt}
                            </h2>
                            <button
                                onClick={() => handleReadAloud(passage.content.map(c => c.pt).join(' '))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-deep)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '50%',
                                }}
                                title="Ouvir texto completo"
                            >
                                <IconSpeaker />
                            </button>
                        </div>
                        {showChinese && (
                            <h3 style={{ fontSize: '1.1rem', color: '#666', marginTop: '-10px', marginBottom: '20px', fontWeight: 'normal' }}>
                                {passage.title.cn}
                            </h3>
                        )}

                        <div className="passage-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {passage.content.map((sentence, idx) => (
                                <div key={idx} className="sentence-block" style={{
                                    padding: '12px',
                                    backgroundColor: 'rgba(46, 90, 136, 0.03)',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid var(--primary-deep)'
                                }}>
                                    <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5', color: '#333' }}>
                                        {sentence.pt}
                                    </p>
                                    {showChinese && (
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#666' }}>
                                            {sentence.cn}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
