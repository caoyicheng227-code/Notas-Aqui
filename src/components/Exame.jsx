import { useState, useEffect } from 'react';
import vocabularyData from '../data/vocabulary.json';

// Build a cloze sentence by blanking out the target word (and inflections)
function buildCloze(wordObj, examplePt) {
    if (!examplePt) return null;
    const base = wordObj.word.toLowerCase();
    // Fuzzy: match the word stem (first 5 chars minimum) at word boundaries
    const stem = base.slice(0, Math.max(4, Math.floor(base.length * 0.7)));
    const regex = new RegExp(`\\b${stem}\\w*`, 'gi');
    const blanked = examplePt.replace(regex, '________');
    // If nothing was replaced, blank the first occurrence of any 4+ char token
    if (blanked === examplePt) {
        const words = examplePt.split(' ');
        let replaced = false;
        return words.map(w => {
            if (!replaced && w.length >= 4) { replaced = true; return '________'; }
            return w;
        }).join(' ');
    }
    return blanked;
}

export default function Exame({ masteredIds, onUnmaster }) {
    const [phase, setPhase] = useState('idle'); // idle | testing | results
    const [examWords, setExamWords] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [results, setResults] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastCorrect, setLastCorrect] = useState(null);

    const masteredPool = vocabularyData.filter(w => masteredIds.includes(w.id));

    const startExam = () => {
        if (masteredPool.length === 0) return;
        // Shuffle and pick up to 10 words that have example sentences
        const eligible = masteredPool.filter(w => w.examples && w.examples.length > 0);
        const pool = eligible.length > 0 ? eligible : masteredPool;
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setExamWords(selected);
        setCurrentQ(0);
        setResults([]);
        setUserInput('');
        setShowAnswer(false);
        setLastCorrect(null);
        setPhase('testing');
    };

    const handleSubmit = () => {
        if (!userInput.trim() || showAnswer) return;
        const word = examWords[currentQ];
        const correct = userInput.trim().toLowerCase() === word.word.toLowerCase();
        setLastCorrect(correct);

        if (correct) {
            const newResults = [...results, { word, userAnswer: userInput.trim(), correct: true }];
            setResults(newResults);
            setUserInput('');
            setLastCorrect(null);
            setTimeout(() => {
                if (currentQ + 1 >= examWords.length) {
                    setPhase('results');
                } else {
                    setCurrentQ(currentQ + 1);
                }
            }, 700);
        } else {
            // Show correct answer
            setShowAnswer(true);
            const newResults = [...results, { word, userAnswer: userInput.trim(), correct: false }];
            setResults(newResults);
        }
    };

    const nextQuestion = () => {
        setShowAnswer(false);
        setUserInput('');
        setLastCorrect(null);
        if (currentQ + 1 >= examWords.length) {
            setPhase('results');
        } else {
            setCurrentQ(currentQ + 1);
        }
    };

    const restartExam = () => {
        setPhase('idle');
        setExamWords([]);
        setResults([]);
        setUserInput('');
    };

    // ── IDLE PHASE ──
    if (phase === 'idle') {
        return (
            <div className="quiz-container animate-fade">
                <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)', marginBottom: '24px' }}>
                    Exame Final ✍️
                </h2>
                <div className="sticky-note" style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                    <p className="handwritten" style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>
                        Palavras dominadas: <strong>{masteredPool.length}</strong>
                    </p>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
                        O sistema seleciona 10 palavras aleatórias das que marcaste como "Dominado" e testa-te com frases lacunares.
                    </p>

                    {masteredPool.length === 0 ? (
                        <div style={{ padding: '16px', border: '2px dashed var(--text-soft)', borderRadius: '8px', color: 'var(--text-soft)' }}>
                            <p>Ainda não dominaste nenhuma palavra.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Vai ao Aprender, abre um cartão e clica em "Dominar"!</p>
                        </div>
                    ) : (
                        <button
                            className="action-btn handwritten"
                            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: 'var(--primary-deep)', color: 'white', borderRadius: '10px' }}
                            onClick={startExam}
                        >
                            ⚓ Começar Exame
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── TESTING PHASE ──
    if (phase === 'testing') {
        const word = examWords[currentQ];
        const example = word.examples?.[0];
        const cloze = example ? buildCloze(word, example.pt) : null;

        return (
            <div className="quiz-container animate-fade">
                {/* Progress indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                    <span className="handwritten" style={{ color: 'var(--text-soft)' }}>
                        Questão {currentQ + 1} / {examWords.length}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {examWords.map((_, i) => (
                            <div key={i} style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: i < results.length
                                    ? (results[i].correct ? '#4caf50' : '#ef5350')
                                    : i === currentQ ? 'var(--primary-deep)' : '#ddd'
                            }} />
                        ))}
                    </div>
                </div>

                <div className="sticky-note" style={{ padding: '24px', marginBottom: '16px' }}>
                    {/* Chinese hint */}
                    {example?.cn && (
                        <div style={{
                            background: 'rgba(3, 169, 244, 0.08)',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            borderLeft: '3px solid var(--accent-blue)'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '4px' }}>中文提示</p>
                            <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{example.cn}</p>
                        </div>
                    )}

                    {/* Cloze sentence */}
                    {cloze && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '8px' }}>完成葡语句子</p>
                            <p style={{
                                fontFamily: 'var(--example-font)',
                                fontSize: '1rem',
                                fontStyle: 'italic',
                                lineHeight: '1.8',
                                color: 'var(--text-main)'
                            }}>
                                {cloze.split('________').map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span style={{
                                                display: 'inline-block',
                                                minWidth: '80px',
                                                borderBottom: '2px solid var(--primary-deep)',
                                                marginBottom: '-2px',
                                                color: showAnswer ? '#ef5350' : 'transparent'
                                            }}>
                                                {showAnswer ? word.word : ''}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </p>
                        </div>
                    )}

                    {!cloze && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '8px' }}>输入葡语单词</p>
                            <p className="handwritten" style={{ color: 'var(--primary-deep)' }}>"{word.translation}"</p>
                        </div>
                    )}

                    {/* Input area */}
                    {!showAnswer ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="Escreve a palavra..."
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    border: `2px solid ${lastCorrect === false ? '#ef5350' : 'var(--primary-deep)'}`,
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--example-font)',
                                    outline: 'none',
                                    background: lastCorrect === false ? '#fff5f5' : 'white'
                                }}
                            />
                            <button
                                onClick={handleSubmit}
                                style={{
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'var(--primary-deep)',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                →
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                padding: '12px 16px',
                                background: '#fff5f5',
                                border: '2px solid #ef5350',
                                borderRadius: '8px',
                                marginBottom: '12px'
                            }}>
                                <p style={{ fontSize: '0.8rem', color: '#ef5350', marginBottom: '4px' }}>✗ Resposta incorreta</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                                    A tua resposta: <span style={{ textDecoration: 'line-through' }}>{results[results.length - 1]?.userAnswer}</span>
                                </p>
                                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-deep)', marginTop: '4px' }}>
                                    ✓ {word.word}
                                </p>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="action-btn handwritten"
                                style={{ width: '100%', padding: '12px' }}
                            >
                                {currentQ + 1 >= examWords.length ? 'Ver Resultados →' : 'Próxima →'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Correct feedback flash */}
                {lastCorrect === true && (
                    <div style={{ textAlign: 'center', color: '#4caf50', fontSize: '1.5rem', animation: 'ink-draw 0.3s ease' }}>
                        ✓ Correto!
                    </div>
                )}
            </div>
        );
    }

    // ── RESULTS PHASE ──
    const score = results.filter(r => r.correct).length;
    const total = results.length;

    return (
        <div className="quiz-container animate-fade">
            <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)', marginBottom: '20px' }}>
                Resultado do Exame
            </h2>

            {/* Score card */}
            <div className="sticky-note" style={{ padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: score >= 7 ? '#4caf50' : score >= 4 ? '#ff9800' : '#ef5350' }}>
                    {score} / {total}
                </div>
                <p className="handwritten" style={{ color: 'var(--text-soft)', marginTop: '8px' }}>
                    {score === total ? '完美！棒棒哒! ⚓' : score >= 7 ? '非常好！继续加油!' : score >= 4 ? '还不错，继续练习!' : '需要更多练习，加油!'}
                </p>
            </div>

            {/* Per-word results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {results.map((r, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: r.correct ? '#f1f8f1' : '#fff5f5',
                        border: `1.5px solid ${r.correct ? '#4caf50' : '#ef5350'}`,
                        borderRadius: '8px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>{r.correct ? '✅' : '❌'}</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--primary-deep)' }}>{r.word.word}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{r.word.translation}</p>
                            {!r.correct && (
                                <p style={{ fontSize: '0.8rem', color: '#ef5350' }}>
                                    你答了: "{r.userAnswer}"
                                </p>
                            )}
                        </div>
                        {!r.correct && (
                            <button
                                onClick={() => onUnmaster(r.word.id)}
                                style={{
                                    padding: '6px 12px',
                                    border: '1.5px solid #ef5350',
                                    borderRadius: '6px',
                                    background: 'white',
                                    color: '#ef5350',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                重学
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={restartExam}
                    className="action-btn handwritten"
                    style={{ flex: 1, padding: '14px' }}
                >
                    重新开始
                </button>
                {score < total && (
                    <button
                        onClick={startExam}
                        className="action-btn handwritten"
                        style={{ flex: 1, padding: '14px', background: 'var(--primary-deep)', color: 'white' }}
                    >
                        再考一次
                    </button>
                )}
            </div>
        </div>
    );
}
