import { useState } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { IconHandCheck, IconHandCross, IconHandStar } from './Icons';

// Build a cloze sentence by blanking out the target word (and inflections)
function buildCloze(wordObj, examplePt) {
    if (!examplePt) return null;
    const base = wordObj.word.toLowerCase();
    const stem = base.slice(0, Math.max(4, Math.floor(base.length * 0.7)));
    const regex = new RegExp(`\\b${stem}\\w*`, 'gi');
    const blanked = examplePt.replace(regex, '________');
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
    const [phase, setPhase] = useState('idle');
    const [examWords, setExamWords] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [results, setResults] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastCorrect, setLastCorrect] = useState(null);

    const masteredPool = vocabularyData.filter(w => masteredIds.includes(w.id));

    const startExam = () => {
        if (masteredPool.length === 0) return;
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
        const newResults = [...results, { word, userAnswer: userInput.trim(), correct }];
        setResults(newResults);

        if (correct) {
            setUserInput('');
            setLastCorrect(null);
            setTimeout(() => {
                if (currentQ + 1 >= examWords.length) setPhase('results');
                else setCurrentQ(q => q + 1);
            }, 700);
        } else {
            setShowAnswer(true);
        }
    };

    const nextQuestion = () => {
        setShowAnswer(false);
        setUserInput('');
        setLastCorrect(null);
        if (currentQ + 1 >= examWords.length) setPhase('results');
        else setCurrentQ(q => q + 1);
    };

    const restartExam = () => {
        setPhase('idle');
        setExamWords([]);
        setResults([]);
        setUserInput('');
    };

    // ── IDLE ──────────────────────────────────────────────────────
    if (phase === 'idle') {
        return (
            <div className="quiz-container animate-fade">
                <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)', marginBottom: '20px' }}>
                    Exame Final
                </h2>
                <div className="sticky-note" style={{ padding: '28px 20px', textAlign: 'center' }}>
                    {/* Doodle pencil icon */}
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>

                    <p className="handwritten" style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--primary-deep)' }}>
                        Palavras dominadas: <strong>{masteredPool.length}</strong>
                    </p>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.6' }}>
                        10道随机填空题，仅凭中文例句和葡语语境作答。
                    </p>

                    {masteredPool.length === 0 ? (
                        <div style={{ padding: '14px', border: '2px dashed var(--text-soft)', borderRadius: '8px', color: 'var(--text-soft)' }}>
                            <p>还没有 Dominado 的单词</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>去 Aprender 页，打开单词详情 → 点击"Dominar"</p>
                        </div>
                    ) : (
                        <button
                            className="action-btn handwritten"
                            style={{ width: '100%', padding: '14px', fontSize: '1rem', background: 'var(--primary-deep)', color: 'white', borderRadius: '10px' }}
                            onClick={startExam}
                        >
                            Começar Exame
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── TESTING ───────────────────────────────────────────────────
    if (phase === 'testing') {
        const word = examWords[currentQ];
        const example = word.examples?.[0];
        const cloze = example ? buildCloze(word, example.pt) : null;

        return (
            <div className="quiz-container animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 2px' }}>
                    <span className="handwritten" style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                        {currentQ + 1} / {examWords.length}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
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

                <div className="sticky-note" style={{ padding: '20px', flex: 1 }}>
                    {/* Chinese hint */}
                    {example?.cn && (
                        <div style={{
                            background: 'rgba(3,169,244,0.07)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '14px',
                            borderLeft: '3px solid var(--accent-blue)'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '3px' }}>中文提示</p>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{example.cn}</p>
                        </div>
                    )}

                    {/* Cloze sentence */}
                    {cloze ? (
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '6px' }}>填入葡语单词</p>
                            <p style={{ fontFamily: 'var(--example-font)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '2' }}>
                                {cloze.split('________').map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span style={{
                                                display: 'inline-block',
                                                minWidth: '72px',
                                                borderBottom: `2px solid ${showAnswer ? '#ef5350' : 'var(--primary-deep)'}`,
                                                marginBottom: '-2px',
                                                color: showAnswer ? '#ef5350' : 'transparent',
                                                fontStyle: 'normal',
                                                fontWeight: 'bold'
                                            }}>
                                                {showAnswer ? word.word : ''}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </p>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '6px' }}>输入葡语单词</p>
                            <p className="handwritten" style={{ color: 'var(--primary-deep)' }}>"{word.translation}"</p>
                        </div>
                    )}

                    {/* Correct flash */}
                    {lastCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4caf50', marginBottom: '12px' }}>
                            <IconHandCheck size={24} />
                            <span className="handwritten" style={{ fontSize: '1rem' }}>Correto!</span>
                        </div>
                    )}

                    {/* Input area — sticky so keyboard doesn't push it off screen */}
                    {!showAnswer ? (
                        <div className="exam-input-row">
                            <input
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="Escreve a palavra..."
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                style={{
                                    flex: 1,
                                    padding: '11px 14px',
                                    border: `2px solid ${lastCorrect === false ? '#ef5350' : 'var(--primary-deep)'}`,
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--example-font)',
                                    outline: 'none',
                                    background: lastCorrect === false ? '#fff5f5' : 'white',
                                    minWidth: 0 // prevent flex overflow
                                }}
                            />
                            <button
                                onClick={handleSubmit}
                                style={{
                                    padding: '11px 18px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'var(--primary-deep)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >→</button>
                        </div>
                    ) : (
                        /* Wrong answer reveal */
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                background: '#fff5f5',
                                border: '1.5px solid #ef5350',
                                borderRadius: '8px',
                                marginBottom: '12px'
                            }}>
                                <IconHandCross size={24} />
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: '#ef5350' }}>你的答案：<span style={{ textDecoration: 'line-through' }}>{results[results.length - 1]?.userAnswer}</span></p>
                                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-deep)', marginTop: '4px' }}>
                                        正确答案：{word.word}
                                    </p>
                                </div>
                            </div>
                            <button onClick={nextQuestion} className="action-btn handwritten" style={{ width: '100%', padding: '12px' }}>
                                {currentQ + 1 >= examWords.length ? '查看结果 →' : '下一题 →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── RESULTS ───────────────────────────────────────────────────
    const score = results.filter(r => r.correct).length;
    const total = results.length;

    return (
        <div className="quiz-container animate-fade">
            <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)', marginBottom: '16px' }}>
                Resultado
            </h2>

            {/* Score */}
            <div className="sticky-note" style={{ padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: score >= 7 ? '#4caf50' : score >= 4 ? '#ff9800' : '#ef5350' }}>
                    {score} / {total}
                </div>
                <p className="handwritten" style={{ color: 'var(--text-soft)', marginTop: '6px', fontSize: '0.95rem' }}>
                    {score === total ? '完美！棒棒哒！' : score >= 7 ? '非常好，继续加油！' : score >= 4 ? '还不错，继续练习！' : '加油，多练习！'}
                </p>
            </div>

            {/* Per-word results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {results.map((r, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: r.correct ? '#f1f8f1' : '#fff5f5',
                        border: `1.5px solid ${r.correct ? '#4caf50' : '#ef5350'}`,
                        borderRadius: '8px'
                    }}>
                        {r.correct
                            ? <IconHandCheck size={22} />
                            : <IconHandCross size={22} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--primary-deep)', fontSize: '0.95rem' }}>{r.word.word}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.word.translation}</p>
                            {!r.correct && (
                                <p style={{ fontSize: '0.78rem', color: '#ef5350' }}>你答了: "{r.userAnswer}"</p>
                            )}
                        </div>
                        {!r.correct && (
                            <button
                                onClick={() => onUnmaster(r.word.id)}
                                style={{
                                    padding: '5px 10px',
                                    border: '1.5px solid #ef5350',
                                    borderRadius: '6px',
                                    background: 'white',
                                    color: '#ef5350',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >重学</button>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={restartExam} className="action-btn handwritten" style={{ flex: 1, padding: '13px' }}>
                    重新开始
                </button>
                {score < total && (
                    <button onClick={startExam} className="action-btn handwritten" style={{ flex: 1, padding: '13px', background: 'var(--primary-deep)', color: 'white' }}>
                        再考一次
                    </button>
                )}
            </div>
        </div>
    );
}
