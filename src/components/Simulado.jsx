import { useState, useEffect } from 'react';
import simuladoA2 from '../data/simulado_a2.json';
import simuladoC1 from '../data/simulado_c1.json';
import simuladoC2 from '../data/simulado_c2.json';

const EXAM_INFO = {
    'A1': { name: 'ACESSO', time: '1h 25m', areas: ['Compreensão da Leitura (30%)', 'Expressão Escrita (20%)', 'Compreensão Oral (30%)', 'Expressão Oral (20%)'] },
    'A2': { name: 'CIPLE', time: '1h 55m', areas: ['Compreensão da Leitura e Interação Escrita (45%)', 'Compreensão Oral (30%)', 'Expressão Oral (25%)'] },
    'B1': { name: 'DEPLE', time: '2h 25m', areas: ['Compreensão da Leitura (30%)', 'Produção e Interação Escritas (20%)', 'Compreensão Oral (30%)', 'Expressão Oral (20%)'] },
    'B2': { name: 'DIPLE', time: '3h 15m', areas: ['Compreensão da Leitura (25%)', 'Produção e Interação Escritas (25%)', 'Compreensão Oral (30%)', 'Expressão Oral (20%)'] },
    'C1': { name: 'DAPLE', time: '3h 30m', areas: ['Compreensão da Leitura (25%)', 'Produção e Interação Escritas (15%)', 'Compreensão Oral (25%)', 'Competência Estrutural (15%)', 'Expressão Oral (20%)'] },
    'C2': { name: 'DUPLE', time: '3h 50m', areas: ['Compreensão da Leitura (25%)', 'Produção e Interação Escritas (15%)', 'Compreensão Oral (25%)', 'Competência Estrutural (15%)', 'Expressão Oral (20%)'] }
};

const GRADING = [
    { label: 'Suficiente', range: '55% - 69%', color: '#4caf50' },
    { label: 'Bom', range: '70% - 84%', color: '#2196f3' },
    { label: 'Muito Bom', range: '85% - 100%', color: '#9c27b0' }
];

export default function Simulado({ currentLevel }) {
    // Internal Level State for Simulado. Default to A2.
    const [simLevel, setSimLevel] = useState(['A1','A2','B1','B2','C1','C2'].includes(currentLevel) ? currentLevel : 'A2');
    const [isTesting, setIsTesting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showWritingGuide, setShowWritingGuide] = useState(false);
    const [answers, setAnswers] = useState({});
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [showLongTextModal, setShowLongTextModal] = useState(false);

    useEffect(() => {
        // Sync root level change if valid
        if (['A1','A2','B1','B2','C1','C2'].includes(currentLevel) && !isTesting) {
            setSimLevel(currentLevel);
        }
    }, [currentLevel, isTesting]);

    const info = EXAM_INFO[simLevel];

    // Dynamically match testData
    const testData = simLevel === 'A2' ? simuladoA2 :
        simLevel === 'C1' ? simuladoC1 :
            simLevel === 'C2' ? simuladoC2 : null;

    const hasAssets = !!testData;
    // Support both { parts: [...] } (A2 format) and flat array format (C1/C2 format)
    const rawParts = testData ? (Array.isArray(testData) ? testData : testData.parts) : [];
    const examParts = rawParts.filter(p => p.type !== 'escrita');


    if (showResults && testData) {
        let totalObjective = 0;
        let correctObjective = 0;

        examParts.forEach(part => {
            if (part.questions) {
                part.questions.forEach(q => {
                    if (typeof q.answer !== 'undefined') {
                        totalObjective++;
                        if (answers[q.id] === q.answer) correctObjective++;
                    }
                });
            }
            if (part.audio_groups) {
                part.audio_groups.forEach(group => {
                    group.questions.forEach(q => {
                        if (typeof q.answer !== 'undefined') {
                            totalObjective++;
                            if (answers[q.id] === q.answer) correctObjective++;
                        }
                    })
                })
            }
        });

        const percentage = totalObjective > 0 ? Math.round((correctObjective / totalObjective) * 100) : 0;
        let grade = "Insuficiente (< 55%)";
        let gradeColor = "var(--accent-red)";
        if (percentage >= 55 && percentage <= 69) { grade = "Suficiente (55-69%)"; gradeColor = "#4caf50"; }
        else if (percentage >= 70 && percentage <= 84) { grade = "Bom (70-84%)"; gradeColor = "#2196f3"; }
        else if (percentage >= 85) { grade = "Muito Bom (85-100%)"; gradeColor = "#9c27b0"; }

        return (
            <div className="simulado-test animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 5px 40px 5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 className="handwritten" style={{ color: 'var(--primary-deep)', margin: 0, fontSize: '1.8rem' }}>Resultados do {info.name}</h2>
                    <button
                        onClick={() => { setShowResults(false); setAnswers({}); setCurrentPartIndex(0); }}
                        style={{
                            fontFamily: 'Avenir, sans-serif',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--text-soft)',
                            color: 'var(--text-soft)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Voltar
                    </button>
                </div>

                <div className="sticky-note" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#fcfdfd' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-soft)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Nota Objetiva (Leitura e Áudio)
                    </div>
                    <div className="handwritten" style={{ fontSize: '4.5rem', color: gradeColor, margin: '15px 0' }}>
                        {percentage}%
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'inline-block', border: `2px solid ${gradeColor}`, padding: '8px 24px', borderRadius: '30px', backgroundColor: 'white' }}>
                        {grade}
                    </div>
                    <div style={{ marginTop: '20px', fontSize: '1.05rem', color: 'var(--text-soft)' }}>
                        Acertou <strong style={{ color: 'var(--primary-deep)' }}>{correctObjective}</strong> de <strong style={{ color: 'var(--primary-deep)' }}>{totalObjective}</strong> questões.
                    </div>
                </div>
            </div>
        );
    }

    if (isTesting && testData) {
        const part = examParts[currentPartIndex];

        // Safety Catch preventing blank screens if out of bounds
        if (!part) {
            return (
                <div className="simulado-test animate-fade" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2>🎉 Simulado Concluído</h2>
                    <button className="nav-btn-finish" onClick={() => { setShowResults(true); setIsTesting(false); }}>Ver Resultados</button>
                </div>
            );
        }

        const isLastPart = currentPartIndex >= examParts.length - 1;

        return (
            <div className="simulado-test animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 5px 40px 5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 className="handwritten" style={{ color: 'var(--primary-deep)', margin: 0, fontSize: '1.8rem' }}>{Array.isArray(testData) ? (simLevel === 'C1' ? 'DAPLE 2022' : 'DUPLE 2022') : testData.title}</h2>
                    <button
                        onClick={() => setIsTesting(false)}
                        style={{
                            fontFamily: 'Avenir, sans-serif',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--text-soft)',
                            color: 'var(--text-soft)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Sair
                    </button>
                </div>

                <div key={part.id} className="sticky-note" style={{ padding: '24px', marginBottom: '20px' }}>
                    <h3 className="handwritten" style={{ color: 'var(--primary-dark)', fontSize: '1.4rem', borderBottom: '1px solid var(--primary-light)', paddingBottom: '10px', marginBottom: '15px' }}>
                        {part.title}
                    </h3>

                    {/* Temporary Time Tip for Audio */}
                    {part.type === 'audio' && (
                        <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>
                            ⏳ Tem 1 minuto para ler as questões
                        </div>
                    )}

                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '15px' }}>
                        {part.instruction}
                    </p>

                    {/* Audio Component (Sticky) */}
                    {part.audio_url && (
                        <div style={{ position: 'sticky', top: '10px', zIndex: 10, padding: '10px 0', backgroundColor: '#fffdee', borderBottom: '2px solid var(--primary-light)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <audio controls src={part.audio_url} style={{ width: '100%' }} />
                        </div>
                    )}

                    {/* Generic Reading Text */}
                    {part.text && !['leitura_longa', 'cloze_banco', 'cloze_inline_mcq', 'cloze_inline_open', 'leitura_regras'].includes(part.type) && (
                        <div style={{ backgroundColor: 'rgba(235,235,245,0.4)', padding: '15px', borderRadius: '12px', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                            {part.text.split(/\n\n|\n/).map((para, idx) => (
                                para.trim() ? <p key={idx} style={{ margin: '0 0 12px 0' }}>{para.trim()}</p> : <div key={idx} style={{ height: '8px' }} />
                            ))}
                        </div>
                    )}

                    {/* 1. Leitura Longa (Modal Popup) */}
                    {part.type === 'leitura_longa' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                            {/* Read Full Text Button */}
                            <button
                                onClick={() => setShowLongTextModal(true)}
                                style={{
                                    alignSelf: 'flex-start',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #1a3a6e 0%, #2e5a88 100%)',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    letterSpacing: '0.3px',
                                    boxShadow: '0 4px 12px rgba(30,58,110,0.35)',
                                    fontFamily: 'Avenir, sans-serif',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📖 <span style={{ color: '#ffffff', fontWeight: '700' }}>Texto Completo — Ler o Texto</span>
                            </button>

                            {/* Questions */}
                            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {part.questions && part.questions.map((q) => (
                                    <div key={q.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', border: '1px solid var(--primary-light)' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '15px' }}>
                                            {q.question}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {q.options.map((opt, optIndex) => {
                                                const isSelected = answers[q.id] === optIndex;
                                                return (
                                                    <label key={optIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', padding: '10px', borderRadius: '8px', backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent', border: `1px solid ${isSelected ? 'var(--primary-deep)' : 'transparent'}`, transition: 'all 0.2s' }}>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            checked={isSelected}
                                                            onChange={() => setAnswers({ ...answers, [q.id]: optIndex })}
                                                            style={{ marginTop: '3px' }}
                                                        />
                                                        <span style={{ color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', fontWeight: isSelected ? '600' : 'normal', lineHeight: '1.4' }}>
                                                            {opt}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Text Modal Overlay */}
                            {showLongTextModal && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    zIndex: 1000,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        width: '100%',
                                        maxWidth: '1000px',
                                        height: '90vh',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Modal Header */}
                                        <div style={{
                                            padding: '20px 30px',
                                            borderBottom: '1px solid var(--primary-light)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: '#fafafa'
                                        }}>
                                            <h2 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.2rem', fontFamily: 'Avenir, sans-serif' }}>
                                                Texto Base - {part.title}
                                            </h2>
                                            <button
                                                onClick={() => setShowLongTextModal(false)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-soft)', padding: '5px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Modal Body (Line Numbers & Text) */}
                                        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '30px', backgroundColor: '#fff' }}>
                                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                                {part.text.split(/\n\n|\n/).map((para, idx) => {
                                                    const lineNum = idx + 1;
                                                    const showNum = lineNum % 5 === 0;
                                                    return para.trim() ? (
                                                        <div key={idx} style={{ display: 'flex', marginBottom: '8px', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                                            <div style={{ width: '40px', flexShrink: 0, textAlign: 'right', paddingRight: '15px', color: 'var(--primary-deep)', fontSize: '0.85rem', userSelect: 'none', fontVariantNumeric: 'tabular-nums', fontWeight: 'bold', paddingTop: '2px' }}>
                                                                {showNum ? lineNum : ''}
                                                            </div>
                                                            <div style={{ flex: 1, color: 'var(--text-main)', textAlign: 'left' }}>
                                                                {para.trim()}
                                                            </div>
                                                        </div>
                                                    ) : <div key={idx} style={{ height: '12px' }} />;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Leitura Regras (Card Matching) */}
                    {part.type === 'leitura_regras' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '20px' }}>
                            {/* Top: Rules Cards */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                {part.rules.map((rule, idx) => {
                                    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#ffebee']; // Pastel borders/bg
                                    const color = colors[idx % colors.length];
                                    return (
                                        <div key={rule.id} style={{ flex: '1 1 calc(33% - 15px)', minWidth: '200px', backgroundColor: color, border: `1px solid rgba(0,0,0,0.1)`, borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-dark)' }}>{rule.title}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{rule.text}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Bottom: Warnings List */}
                            <div style={{ backgroundColor: 'white', border: '1px solid var(--primary-light)', borderRadius: '12px', overflow: 'hidden' }}>
                                {part.questions && part.questions.map((q, qIndex) => (
                                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: qIndex !== part.questions.length - 1 ? '1px solid var(--primary-light)' : 'none', backgroundColor: qIndex % 2 === 0 ? '#fafafa' : '#fff' }}>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', flex: 1, paddingRight: '20px', lineHeight: '1.5' }}>
                                            {/* q.text for C1/C2 regras, q.question as fallback */}
                                            {q.text || q.question}
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {part.rules.map((rule, rIdx) => {
                                                const isSelected = answers[q.id] === rIdx;
                                                return (
                                                    <button
                                                        key={rule.id}
                                                        onClick={() => setAnswers({ ...answers, [q.id]: rIdx })}
                                                        style={{
                                                            minWidth: '34px', height: '32px',
                                                            padding: '0 8px',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${isSelected ? 'var(--primary-deep)' : 'rgba(0,0,0,0.2)'}`,
                                                            backgroundColor: isSelected ? 'var(--primary-deep)' : '#fff',
                                                            color: isSelected ? '#fff' : 'var(--text-main)',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'Avenir, sans-serif',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {rule.letter || rule.id}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Cloze com Banco de Opções (Parte 3) */}
                    {part.type === 'cloze_banco' && (() => {
                        // Support both 'optionsBank' (C1/C2) and 'options' (A2) fields
                        const opts = part.optionsBank || part.options || [];
                        // Build a map: hole number → question.id (e.g. "21" → "c1_q21")
                        const holeToQid = {};
                        if (part.questions) {
                            part.questions.forEach(q => {
                                // q.question might be "21." or "21" — extract the number
                                const numMatch = String(q.question).match(/\d+/);
                                if (numMatch) holeToQid[numMatch[0]] = q.id;
                            });
                        }
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                                {/* Text with Dropdowns */}
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '25px', borderRadius: '12px', fontSize: '1.05rem', lineHeight: '2.2', border: '1px solid var(--primary-light)' }}>
                                    {(() => {
                                        const segments = part.text.split(/\[(\d+)\]/g);
                                        return segments.map((seg, i) => {
                                            if (/^\d+$/.test(seg)) {
                                                const qId = holeToQid[seg] || `q${seg}`;
                                                const isAnswered = answers[qId] !== undefined;
                                                return (
                                                    <select
                                                        key={i}
                                                        value={answers[qId] !== undefined ? answers[qId] : ''}
                                                        onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value !== '' ? Number(e.target.value) : undefined })}
                                                        style={{
                                                            margin: '0 5px',
                                                            padding: '2px 8px',
                                                            fontFamily: 'Avenir, sans-serif',
                                                            fontSize: '0.95rem',
                                                            border: `1px solid ${isAnswered ? 'var(--primary-deep)' : '#ccc'}`,
                                                            borderRadius: '6px',
                                                            backgroundColor: isAnswered ? 'var(--primary-light)' : '#fff',
                                                            color: 'var(--primary-dark)',
                                                            cursor: 'pointer',
                                                            outline: 'none',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <option value="">— escolha —</option>
                                                        {opts.map((opt, oIdx) => (
                                                            <option key={oIdx} value={oIdx}>{opt.letter || opt.id}</option>
                                                        ))}
                                                    </select>
                                                );
                                            }
                                            return <span key={i}>{seg}</span>;
                                        });
                                    })()}
                                </div>

                                {/* Options Pool / Banco de Opções */}
                                <div style={{ backgroundColor: 'white', border: '1px solid var(--primary-light)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-soft)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Banco de Opções</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {opts.map((opt, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '12px', lineHeight: '1.5', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--primary-deep)', minWidth: '28px' }}>[{opt.letter || opt.id}]</div>
                                                <div>{opt.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}


                    {/* 4. Cloze Inline MCQ (Parte 4) */}
                    {part.type === 'cloze_inline_mcq' && (() => {
                        // Build hole number → actual question id map
                        const mcqHoleMap = {};
                        if (part.questions) {
                            part.questions.forEach(q => {
                                const m = String(q.question).match(/\d+/);
                                if (m) mcqHoleMap[m[0]] = q.id;
                            });
                        }
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                                {/* Text with static visual [holes] */}
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '25px', borderRadius: '12px', fontSize: '1.05rem', lineHeight: '2.2', border: '1px solid var(--primary-light)' }}>
                                    {(() => {
                                        const segments = part.text.split(/\[(\d+)\]/g);
                                        return segments.map((seg, i) => {
                                            if (/^\d+$/.test(seg)) {
                                                const qId = mcqHoleMap[seg] || `q${seg}`;
                                                const isAnswered = answers[qId] !== undefined;
                                                return (
                                                    <span key={i} style={{
                                                        display: 'inline-block',
                                                        minWidth: '35px',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        color: isAnswered ? 'white' : 'var(--text-soft)',
                                                        backgroundColor: isAnswered ? 'var(--primary-deep)' : '#e0e0e0',
                                                        borderRadius: '4px',
                                                        padding: '0 6px',
                                                        margin: '0 4px',
                                                        fontSize: '0.9rem',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {seg}
                                                    </span>
                                                );
                                            }
                                            return <span key={i}>{seg}</span>;
                                        });
                                    })()}
                                </div>

                                {/* Questions Grid 2x2 Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {part.questions.map(q => {
                                        const qNum = String(q.question).match(/\d+/)?.[0] || q.id;
                                        return (
                                            <div key={q.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--primary-light)' }}>
                                                <div style={{ width: '40px', fontWeight: 'bold', color: 'var(--text-soft)', fontSize: '1.1rem' }}>
                                                    {qNum}
                                                </div>
                                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                                    {q.options.map((opt, oIdx) => {
                                                        const isSelected = answers[q.id] === oIdx;
                                                        return (
                                                            <button
                                                                key={oIdx}
                                                                onClick={() => setAnswers({ ...answers, [q.id]: oIdx })}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    borderRadius: '20px',
                                                                    border: `1px solid ${isSelected ? 'var(--primary-deep)' : 'rgba(46,90,136,0.2)'}`,
                                                                    backgroundColor: isSelected ? 'var(--primary-deep)' : 'transparent',
                                                                    color: isSelected ? 'white' : 'var(--text-main)',
                                                                    fontFamily: 'Avenir, sans-serif',
                                                                    fontSize: '0.9rem',
                                                                    textAlign: 'left',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    opacity: isSelected ? 1 : 0.8
                                                                }}
                                                            >
                                                                {opt}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Inline Grammar (Estrutura) */}

                    {
                        part.type === 'estrutura' && (
                            <div style={{ fontSize: '1.1rem', lineHeight: '2.4', fontFamily: 'Avenir, sans-serif' }}>
                                {part.text_blocks.map((block, i) => {
                                    if (typeof block === 'string') return <span key={i}>{block}</span>;
                                    if (block.type === 'input') {
                                        return (
                                            <input
                                                key={block.id}
                                                type="text"
                                                placeholder={block.placeholder}
                                                value={answers[block.id] || ''}
                                                onChange={e => setAnswers({ ...answers, [block.id]: e.target.value })}
                                                style={{
                                                    width: '100px',
                                                    margin: '0 6px',
                                                    border: 'none',
                                                    borderBottom: '2px dashed var(--primary-deep)',
                                                    backgroundColor: 'rgba(255,255,255,0.6)',
                                                    textAlign: 'center',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    color: 'var(--primary-dark)',
                                                    fontFamily: 'Avenir, sans-serif'
                                                }}
                                            />
                                        )
                                    }
                                })}
                            </div>
                        )
                    }

                    {/* Textareas for Produção Escrita */}
                    {
                        part.type === 'escrita' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {part.text_blocks && part.text_blocks.map(block => (
                                    <textarea
                                        key={block.id}
                                        placeholder={block.placeholder}
                                        value={answers[block.id] || ''}
                                        onChange={e => setAnswers({ ...answers, [block.id]: e.target.value })}
                                        style={{
                                            width: 'calc(100% - 32px)',
                                            minHeight: '120px',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(46, 90, 136, 0.3)',
                                            fontSize: '1rem',
                                            fontFamily: 'Avenir, sans-serif',
                                            resize: 'vertical',
                                            outline: 'none',
                                            color: 'var(--text-main)',
                                            backgroundColor: 'white'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary-deep)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(46, 90, 136, 0.3)'}
                                    />
                                ))}
                            </div>
                        )
                    }

                    {/* Audio Groups Render (Thick Lines) */}
                    {
                        part.audio_groups && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '10px' }}>
                                {part.audio_groups.map((group, gIdx) => (
                                    <div key={gIdx} style={{ borderBottom: '4px solid #e0e0e0', paddingBottom: '25px' }}>
                                        <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>{group.title}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                            {group.questions.map(q => (
                                                <div key={q.id}>
                                                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-deep)', marginBottom: '12px', marginLeft: '10px' }}>
                                                        {q.question}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
                                                        {q.options.map((opt, optIndex) => {
                                                            const isSelected = answers[q.id] === optIndex;
                                                            return (
                                                                <button
                                                                    key={optIndex}
                                                                    onClick={() => setAnswers({ ...answers, [q.id]: optIndex })}
                                                                    style={{
                                                                        all: 'unset',
                                                                        display: 'block',
                                                                        width: 'calc(100% - 32px)',
                                                                        padding: '12px 16px',
                                                                        backgroundColor: isSelected ? 'var(--primary-deep)' : 'white',
                                                                        color: isSelected ? 'white' : 'var(--text-main)',
                                                                        border: `2px solid ${isSelected ? 'var(--primary-deep)' : '#eee'}`,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.95rem',
                                                                        transition: 'all 0.2s',
                                                                        boxShadow: isSelected ? '0 4px 12px rgba(89,114,213,0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                                                                    }}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {/* Standard Questions Render (excluding special types that handle their own questions) */}
                    {
                        part.questions && !part.audio_groups
                        && !['audio_match', 'leitura_longa', 'leitura_regras', 'cloze_banco', 'cloze_inline_mcq', 'cloze_inline_open'].includes(part.type)
                        && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                                {part.questions.map((q, qIndex) => (
                                    <div key={q.id} style={{
                                        backgroundColor: part.type === 'leitura_match' ? 'rgba(255,255,255,0.7)' : 'transparent',
                                        padding: part.type === 'leitura_match' ? '20px' : '0',
                                        borderRadius: part.type === 'leitura_match' ? '16px' : '0',
                                        border: part.type === 'leitura_match' ? '2px solid rgba(46,90,136,0.1)' : 'none',
                                        display: 'block',
                                        marginBottom: part.type === 'leitura_match' ? '25px' : '0'
                                    }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-deep)', marginBottom: '15px' }}>
                                            {q.question}
                                        </div>

                                        {/* Full Message Blocks for Leitura Match */}
                                        {part.type === 'leitura_match' && part.messages && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {part.messages.map((msg, optIndex) => {
                                                    const isSelected = answers[q.id] === optIndex;
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            onClick={() => setAnswers({ ...answers, [q.id]: optIndex })}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '12px',
                                                                padding: '16px',
                                                                backgroundColor: isSelected ? 'rgba(89, 114, 213, 0.05)' : 'white',
                                                                border: `2px solid ${isSelected ? 'var(--primary-deep)' : '#e0e0e0'}`,
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: isSelected ? '0 4px 12px rgba(89,114,213,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                                                            }}
                                                        >
                                                            <div style={{
                                                                backgroundColor: isSelected ? 'var(--primary-deep)' : '#f0f0f5',
                                                                color: isSelected ? 'white' : 'var(--text-main)',
                                                                fontWeight: 'bold',
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                {msg.id}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.95rem',
                                                                lineHeight: '1.5',
                                                                color: 'var(--text-main)',
                                                                marginTop: '4px'
                                                            }}>
                                                                {msg.text}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Standard Stacked List for Normal Reading Questions */}
                                        {part.type !== 'leitura_match' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
                                                {q.options.map((opt, optIndex) => {
                                                    const isSelected = answers[q.id] === optIndex;
                                                    return (
                                                        <button
                                                            key={optIndex}
                                                            onClick={() => setAnswers({ ...answers, [q.id]: optIndex })}
                                                            style={{
                                                                all: 'unset',
                                                                display: 'block',
                                                                width: 'calc(100% - 32px)',
                                                                padding: '12px 16px',
                                                                backgroundColor: isSelected ? 'var(--primary-deep)' : 'white',
                                                                color: isSelected ? 'white' : 'var(--text-main)',
                                                                border: `2px solid ${isSelected ? 'var(--primary-deep)' : '#eee'}`,
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.95rem',
                                                                transition: 'all 0.2s',
                                                                boxShadow: isSelected ? '0 4px 12px rgba(89,114,213,0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {/* Audio Match (Dropdown layout) */}
                    {
                        part.questions && part.type === 'audio_match' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                                {part.questions.map((q, qIndex) => (
                                    <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee' }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-deep)' }}>
                                            {q.question}
                                        </div>
                                        <select
                                            value={answers[q.id] !== undefined ? answers[q.id] : ''}
                                            onChange={(e) => setAnswers({ ...answers, [q.id]: Number(e.target.value) })}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: '2px solid rgba(46, 90, 136, 0.3)',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                backgroundColor: answers[q.id] !== undefined ? 'rgba(46, 90, 136, 0.05)' : 'white',
                                                color: 'var(--primary-dark)',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                maxWidth: '60%'
                                            }}
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {q.options.map((opt, optIndex) => (
                                                <option key={optIndex} value={optIndex}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div >

                {/* Pagination Controls */}
                < div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }
                }>
                    {currentPartIndex > 0 ? (
                        <button
                            className="nav-btn-secondary"
                            onClick={() => {
                                window.scrollTo(0, 0);
                                setCurrentPartIndex(currentPartIndex - 1);
                            }}
                        >
                            Parte Anterior
                        </button>
                    ) : <div style={{ flex: 1 }}></div>
                    }

                    {
                        !isLastPart ? (
                            <button
                                className="nav-btn-primary"
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    setCurrentPartIndex(currentPartIndex + 1);
                                }}
                            >
                                Seguinte
                            </button>
                        ) : (
                            <button
                                className="nav-btn-finish"
                                onClick={() => {
                                    setShowResults(true);
                                    setIsTesting(false);
                                }}
                            >
                                Terminar Simulado
                            </button>
                        )
                    }
                </div >
            </div >
        );
    }

    // Phase A: The Info Dashboard
    if (showWritingGuide) {
        return (
            <div className="simulado-dashboard animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="handwritten" style={{ color: 'var(--primary-deep)', margin: 0, fontSize: '1.8rem' }}>Guia de Produção Escrita</h2>
                    <button
                        onClick={() => setShowWritingGuide(false)}
                        style={{
                            fontFamily: 'Avenir, sans-serif',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--text-soft)',
                            color: 'var(--text-soft)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Voltar
                    </button>
                </div>

                <div className="sticky-note" style={{ padding: '24px', backgroundColor: '#fffdee' }}>
                    <h3 style={{ color: 'var(--primary-dark)', fontSize: '1.2rem', marginBottom: '15px' }}>
                        ✍️ Dicas e Exemplos ({info.name})
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}>
                        Nesta secção, encontra um modelo para a resposta da prova de Produção Escrita. É importante seguir
                        a estrutura, utilizar o vocabulário adequado ao nível e manter a coerência e coesão textual.
                        Preste atenção ao limite de palavras.
                    </p>

                    {simLevel === 'A1' && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 TEXTO 1 — Mensagem curta</strong><br />
                                <em>Deixe uma mensagem escrita para o seu colega de trabalho a informar que chegará atrasado/a à reunião e a explicar o motivo. (15–25 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Olá Tomás! Vou chegar um pouco atrasado à reunião — há muito trânsito. Comecem sem mim. Chego em 15 minutos. Desculpa!
                            </div>
                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 TEXTO 2 — Bilhete / Recado</strong><br />
                                <em>Escreva um bilhete para o seu vizinho a pedir-lhe que tome conta do seu gato durante o fim de semana. Indique as instruções necessárias. (30–45 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Olá Ana! Este fim de semana estou fora. Podes tomar conta do Bolinha, por favor? Ele come duas vezes por dia — de manhã e à noite. A ração está na cozinha. Muito obrigado! Beijinhos, Sara
                            </div>
                        </div>
                    )}

                    {simLevel === 'A2' && (

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 TEXTO 1:</strong><br />
                                <em>Você marcou um encontro com os seus amigos e não vai poder chegar à hora marcada. Eles acabam de enviar a seguinte mensagem para o seu telemóvel:<br /><br />"Olá! Já chegámos. Estamos à tua espera no café do parque. Ainda demoras?"</em><br />
                                <br />
                                <em>Agora, responda à mensagem dos seus amigos. O seu texto deve ter uma extensão de 25-35 palavras.</em><br />
                                <br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Olá! Peço imensa desculpa, mas vou chegar atrasada. Tive um problema no trabalho e perdi o autocarro.
                                Chego daqui a 20 minutos. Podem ir pedindo o menu, por favor. Até já!
                            </div>
                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 TEXTO 2:</strong><br />
                                <em>Você não conseguiu ir a casa dos seus amigos portugueses no fim de semana passado porque teve vários problemas. Escreva-lhes um email a contar o que lhe aconteceu. O email começa assim:</em><br />
                                <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', margin: '10px 0', fontFamily: 'monospace' }}>Caros Amigos,<br />Queria muito estar convosco no fim de semana, mas não consegui.</div>
                                <em>O seu texto deve ter uma extensão de cerca de 60-80 palavras.</em><br />
                                <br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Caros Amigos,<br />
                                Queria muito estar convosco no fim de semana, mas não consegui. Na sexta-feira à noite, o meu carro
                                avariou e tive de o levar à oficina no sábado de manhã. Além disso, no domingo, a minha mãe
                                ficou muito doente e precisei de ficar em casa a cuidar dela.<br />
                                Fiquei com muita pena de não vos ver. Espero que tenham passado um bom fim de semana.
                                Podemos combinar um encontro para o próximo sábado?<br />
                                Um abraço,<br />Ana
                            </div>
                        </div>
                    )}

                    {simLevel === 'B1' && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 PARTE 1 — Email informal</strong><br />
                                <em>Um amigo seu vai à Portugal pela primeira vez. Escreva-lhe um email onde: (1) dá boas-vindas e mostra entusiasmo; (2) sugere três coisas para visitar em Lisboa; (3) propõe um encontro. (80–100 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Olá Marco!<br /><br />
                                Que notícia fantástica! Fico mesmo entusiasmado por saberes que vens a Portugal. Tens de visitar o Mosteiro dos Jerónimos — é impressionante! Depois, sobe ao elétrico 28 e percorre o bairro de Alfama, cheio de história e fado. E não podes perder o Mercado da Ribeira para experimentar a gastronomia portuguesa.<br /><br />
                                Que tal marcarmos jantar no sábado à noite? Conheço um restaurante espetacular perto do Tejo. Responde-me logo! Grande abraço, João
                            </div>
                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 2 — Texto de opinião</strong><br />
                                <em>Escreva um texto onde expressa a sua opinião sobre a seguinte afirmação: "As redes sociais aproximam as pessoas." (100–120 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                As redes sociais são uma realidade incontornável do mundo atual. Por um lado, permitem manter contacto com amigos e família que vivem longe, partilhar momentos e criar novas amizades com pessoas de culturas diferentes. Nesse sentido, contribuem para aproximar as pessoas.<br /><br />
                                Por outro lado, o uso excessivo pode ter o efeito contrário. Muitos jovens preferem comunicar através de ecrãs em vez de se encontrarem pessoalmente, o que empobrece as relações humanas. Além disso, as redes sociais podem criar imagens falsas da realidade, gerando ansiedade e comparações prejudiciais.<br /><br />
                                Concluindo, as redes sociais podem aproximar, mas o equilíbrio é fundamental para que não substituam o contacto humano genuíno.
                            </div>
                        </div>
                    )}

                    {simLevel === 'B2' && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 PARTE 1 — Carta formal</strong><br />
                                <em>Escreva uma carta ao diretor de um hotel onde se queixou de vários problemas durante a sua estadia (quarto ruidoso, serviço de limpeza deficiente, pequeno-almoço limitado). Peça uma compensação adequada. (150–180 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Exmo. Senhor Diretor,<br /><br />
                                Venho por este meio manifestar a minha total insatisfação com a estadia que realizei neste estabelecimento entre os dias 10 e 14 do corrente mês.<br /><br />
                                Em primeiro lugar, o quarto que me foi atribuído ficava junto ao elevador, tornando impossível um descanso adequado devido ao ruído constante. Além disso, o serviço de limpeza demonstrou ser claramente insuficiente — o quarto não foi limpo em dois dos quatro dias. Por fim, o pequeno-almoço apresentava uma oferta extremamente limitada, longe do que o vosso website publicita.<br /><br />
                                Perante as situações descritas, solicito uma compensação adequada, nomeadamente um reembolso parcial correspondente a duas noites de estadia, bem como um voucher para uma estadia futura.<br /><br />
                                Aguardo a vossa resposta com brevidade. Com os melhores cumprimentos,<br />
                                [Nome do cliente]
                            </div>
                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 2 — Artigo de opinião</strong><br />
                                <em>Escreva um artigo de opinião para o jornal da sua escola/empresa sobre o tema: "O trabalho remoto é o futuro das organizações modernas?" (180–200 palavras)</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                <strong>Trabalho Remoto: Liberdade ou Isolamento?</strong><br /><br />
                                A pandemia de Covid-19 acelerou de forma dramática a adoção do trabalho remoto em empresas de todo o mundo. O que começou como uma medida de emergência transformou-se, para muitos, num modelo de trabalho preferencial e, aos olhos de alguns especialistas, num caminho sem retorno.<br /><br />
                                Os defensores do teletrabalho apontam para ganhos evidentes de produtividade, eliminação de deslocações desnecessárias e maior conciliação entre a vida pessoal e profissional. Do ponto de vista ambiental, a redução das emissões de CO₂ associadas às deslocações diárias é igualmente um argumento de peso.<br /><br />
                                Contudo, o trabalho remoto não está isento de riscos. A dissolução das fronteiras entre o espaço doméstico e profissional pode gerar stress crónico, e o isolamento social tem impactos comprovados na saúde mental dos trabalhadores. A criatividade e a inovação também tendem a florescer em ambientes de colaboração presencial.<br /><br />
                                Em suma, o futuro mais sustentável parece residir na hibridez — um modelo que concilie o melhor dos dois mundos.
                            </div>
                        </div>
                    )}

                    {simLevel === 'C1' && (

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 PARTE 1</strong><br />
                                <em>Escreva uma carta dirigida ao Presidente da Câmara Municipal na qual apresenta os argumentos contra a instalação das câmaras de vigilância e propõe alternativas. (200-230 palavras)</em><br />
                                <div style={{ backgroundColor: 'white', border: '1px solid var(--primary-light)', padding: '12px', margin: '10px 0', borderRadius: '8px' }}>
                                    O parlamento da sua cidade decidiu autorizar a instalação de câmaras de vigilância nas ruas, sobretudo porque os grafitis estão por todas as paredes da cidade e não foi ainda encontrada uma forma de combater eficazmente esta forma de vandalismo.
                                </div>
                                <strong>💡 Resposta Modelo:</strong><br />
                                Exmo. Senhor Presidente da Câmara Municipal,<br /><br />
                                Venho por este meio manifestar a minha profunda preocupação relativamente à recente deliberação da instalação generalizada de câmaras de vigilância nas ruas da nossa cidade. Embora compreenda a necessidade premente de combater o vandalismo traduzido em grafitis invasivos, acredito convictamente que a medida adotada acarretará custos inaceitáveis para os direitos de privacidade e liberdades cívicas dos nossos cidadãos.<br /><br />
                                Em primeiro lugar, a massificação da videovigilância em espaços públicos instaura uma atmosfera de controlo que desvirtua a essência de uma sociedade democrática e livre. A linha que separa a segurança do excesso de intromissão na vida pessoal é bastante ténue, e o impacto psicológico na sensação de liberdade da população é substancial e prejudicial.<br /><br />
                                Em vez de optarmos por vias exclusivamente punitivas e de vigilância estrita, proponho abordagens que atuem efetivamente na raiz do problema. A autarquia poderia desenvolver iniciativas de integração artística, criando, por exemplo, murais legalizados e zonas específicas dedicadas à "street art". Desta forma, conferiríamos aos jovens uma plataforma legal e estruturada para se expressarem e valorizarem genuinamente o espaço urbano que os rodeia.<br /><br />
                                Adicionalmente, creio ser fundamental apostar em programas de educação cívica nas escolas secundárias, incutindo um sentido de pertença e respeito duradouro pelo património comum.<br /><br />
                                Acredito que a segurança a longo prazo não se alcança mediante a vigilância constante, mas cultivando uma cidadania responsável. Subscrevo-me com os melhores cumprimentos,<br /><br />
                                [Um Munícipe Atento]
                            </div>

                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 2</strong><br />
                                <em>Escreva um texto sobre um dos três tópicos apresentados seguidamente. (200-230 palavras)</em><br />
                                <div style={{ backgroundColor: 'white', border: '1px solid var(--primary-light)', padding: '12px', margin: '10px 0', borderRadius: '8px' }}>
                                    <strong>A.</strong> Sempre que possível, os jovens deveriam frequentar um curso de línguas fora do seu país. É uma experiência quase sempre inesquecível. Faça um relato de uma experiência deste tipo que já tenha vivido. Contudo, se ainda não viveu uma experiência destas, e pudesse tê-la, como acha que isso seria benéfico para si?<br /><br />
                                    <strong>B.</strong> O ser humano precisa da Terra e dos seus recursos para viver. A Terra, ao invés, parece poder viver bem sem o ser humano. Até estaria bastante melhor e mais feliz se o ser humano nunca tivesse aparecido na face da terra. Concorda ou, pelo contrário, acredita que o ser humano é o salvador da Terra?<br /><br />
                                    <strong>C.</strong> Não acha que é desumano e pouco razoável dar tanta atenção à proteção dos direitos dos animais, numa altura em que há tantas pessoas a viver no limiar da pobreza, em condições precárias e sem ninguém se preocupar com elas? Apresente os seus argumentos contra ou a favor.
                                </div>
                                <strong>💡 Resposta Modelo (Opção B):</strong><br />
                                A dicotomia entre a presença humana e a resiliência do planeta Terra suscita reflexões profundas. É inegável que nós, humanos, estamos absolutamente dependentes da biosfera para a nossa sobrevivência diária. Contudo, a recíproca não é verdadeira: a Terra prosseguiria o seu curso de forma imperturbável caso a humanidade subitamente desaparecesse.<br /><br />
                                Historicamente, a nossa interferência tem-se configurado mais como uma ameaça acelerada do que como uma força de proteção sistémica. A Revolução Industrial inaugurou uma era de extração agressiva que culminou na atual emergência climática, desflorestação drástica e perda alarmante de biodiversidade. Perante estes factos flagrantes, dificilmente podemos arrogar-nos o título de "salvadores" do globo terrestre; somos, primeiramente, o seu principal destabilizador e explorador.<br /><br />
                                No entanto, afastar o ser humano da equação numa lógica estritamente fatalista ignora o potencial positivo intrínseco à nossa inteligência coletiva. A humanidade possui, hoje, uma inquestionável capacidade tecnológica que nos permitiria mitigar substancialmente os danos infligidos. Se soubermos alterar coletivamente os nossos modos de vida para soluções sustentáveis, energias renováveis consistentes e um consumo consciente e reduzido, poderemos transitar de parasitas destrutivos para guardiões da Terra.<br /><br />
                                Em conclusão, a Terra será sempre muito mais duradoura do que qualquer civilização humana e dispensaria perfeitamente a nossa tumultuosa estadia. Resta-nos adotar uma colossal humildade e uma vontade coletiva férrea para não destruirmos prematuramente a nossa única e indispensável "casa comum".
                            </div>

                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 3 (Reescreva as frases)</strong><br />
                                <em>Reescreva as frases, iniciando-as com a(s) palavra(s) dada(s). Abaixo, encontra as frases originais e as respostas corretas diretas.</em><br />
                                <div style={{ backgroundColor: '#fff', border: '1px solid var(--primary-light)', padding: '15px', margin: '10px 0', borderRadius: '8px', fontSize: '0.85rem' }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <li>
                                            <span style={{ color: '#666' }}>1. Convinha que terminássemos o projeto a tempo de podermos concorrer. // Era...</span><br />
                                            <strong>Era conveniente terminarmos o projeto a tempo de podermos concorrer.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>2. As decisões da direção poderão ter um impacto muito negativo. // É possível...</span><br />
                                            <strong>É possível que as decisões da direção tenham um impacto muito negativo.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>3. Como o tempo não estava famoso, acabaram por adiar a viagem. // A viagem...</span><br />
                                            <strong>A viagem acabou por ser adiada, dado que o tempo não estava famoso.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>4. Não sendo propriamente um mar de rosas, a situação está melhor do que prevíamos. // Apesar de...</span><br />
                                            <strong>Apesar de não ser propriamente um mar de rosas, a situação está melhor do que prevíamos.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>5. No caso de saírem na nova estação do metro, vejam os painéis de azulejos. // Se...</span><br />
                                            <strong>Se saírem na nova estação do metro, vejam os painéis de azulejos.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>6. "Só podia ter sido o Pedro o autor de tamanha façanha!" // Quem...</span><br />
                                            <strong>Quem haveria de ser o autor de tamanha façanha, senão o Pedro!</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>7. "Logo que terminarem as reuniões, vão à secretaria." // Assim que...</span><br />
                                            <strong>Assim que terminarem as reuniões, vão à secretaria.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>8. Andando pela cidade, todos se apercebem de como a calçada lisboeta é variada. // Ao...</span><br />
                                            <strong>Ao andarem pela cidade, todos se apercebem de como a calçada lisboeta é variada.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>9. Se não tivessem estado todos, a reunião não se teria realizado. // Caso...</span><br />
                                            <strong>Caso não tivessem estado todos, a reunião não se teria realizado.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>10. Avisámo-la repetidamente que não metesse a foice em seara alheia, mas ela não quis ouvir. // Por...</span><br />
                                            <strong>Por mais que a tenhamos avisado repetidamente que não metesse a foice em seara alheia, ela não quis ouvir.</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {simLevel === 'C2' && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-deep)', fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <strong>📝 PARTE 1 // Carta de Reclamação e Indemnização</strong><br />
                                <em>Há meses que os prédios da sua rua mudaram de cor e de aspeto: onde antes havia prédios de cores harmoniosas há agora um amontoado de riscos, assinaturas e desenhos multicoloridos. Para combater o que considera um flagelo e um atentado à propriedade privada, reuniu os moradores e decidiram apresentar uma queixa às autoridades.</em><br /><br />
                                <em>Escreva a carta descrevendo a situação atual, propondo algumas soluções para este problema e pedindo uma indemnização pelos danos.</em><br /><br />
                                <em style={{ color: 'var(--text-soft)' }}>O seu texto deve ter uma extensão de 220-250 palavras. Escreva o texto na folha de respostas.</em><br /><br />
                                <strong>💡 Resposta Modelo:</strong><br />
                                Exmos. Senhores,<br /><br />
                                Venho por meio desta carta, em nome dos moradores da Rua [Nome], manifestar a nossa indignação perante o estado de degradação estética a que foi submetido o nosso bairro nos últimos meses. Os nossos prédios, outrora de aspeto cuidado e harmonioso, encontram-se hoje cobertos de riscos, assinaturas e desenhos multicoloridos que desvalorizam visualmente toda a área.<br /><br />
                                Esta situação não constitui apenas um problema estético. Representa um claro atentado à propriedade privada e uma fonte de prejuízo económico considerável para os proprietários dos imóveis afetados, cujos valores comerciais foram objetivamente penalizados.<br /><br />
                                Propomos, a fim de debelar este flagelo, que as autoridades competentes implementem patrulhamento noturno regular nas zonas mais afetadas, instalem câmaras de videovigilância estratégicas e promovam campanhas de educação cívica junto da população mais jovem. A par destas medidas preventivas, sugerimos a criação de um programa municipal de apoio à restauração das fachadas vandalizadas.<br /><br />
                                Solicitamos ainda uma indemnização justa pelos danos materiais causados, cobrindo os custos de limpeza e repintura das fachadas, a qual deverá ser processada com a urgência que a situação exige.<br /><br />
                                Aguardamos uma resposta célere e construtiva,<br />
                                [Os Moradores da Rua]
                            </div>

                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 2 // Texto de Opinião (escolha um dos três)</strong><br />
                                <em>Escreva um texto sobre um dos três tópicos apresentados seguidamente.</em><br /><br />
                                <em style={{ color: 'var(--text-soft)' }}>O seu texto deve ter uma extensão de 250-300 palavras. Escreva o texto na folha de respostas.</em>
                                <div style={{ backgroundColor: 'white', border: '1px solid var(--primary-light)', padding: '14px', margin: '10px 0', borderRadius: '8px' }}>
                                    <strong>A.</strong> O património cultural é hoje um assunto transversal à sociedade, constituindo mesmo uma matéria de cidadania. A dinâmica do conceito de património permite a inclusão de um conjunto cada vez mais vasto de patrimônio a preservar, afetando não só a exclusividade de patrimônio monumental.<br /><br />
                                    <strong>B.</strong> Viajamos cada vez mais, embora tenhamos deixado de fazer sentido andar carregado com o que quer que se vende na loja do turista, no supermercado ou na loja de esquina do lugar onde se está. Há quem lhe chame «perda de identidade».<br /><br />
                                    <strong>C.</strong> A diferença entre um turista e um viajante é que um turista compra um bilhete de ida e volta, enquanto um viajante só compra bilhete de ida e nunca sabe quando vai regressar a casa.
                                </div>
                                <strong>💡 Resposta Modelo (Opção A — Patrimônio Cultural):</strong><br />
                                O conceito de patrimônio cultural sofreu uma metamorfose profunda ao longo das últimas décadas. Outrora restrito à dimensão monumental e arquitetónica — catedrais, edifícios históricos e vestígios arqueológicos —, ampliou-se consideravelmente para abarcar as mais diversas manifestações da identidade coletiva: linguagem, tradições orais, rituais, saberes ancestrais e expressões artísticas populares.<br /><br />
                                Esta expansão do conceito reveste-se de uma importância política e social inegável. Na era da globalização acelerada, as identidades culturais locais confrontam-se diariamente com uma homogeneização cultural crescente. Neste contexto, o patrimônio — entendido na sua aceção mais ampla e democrática — emerge como âncora essencial da memória coletiva e como estratégia de resistência legítima à diluição dos traços singulares de cada comunidade.<br /><br />
                                A preservação patrimonial não pode, porém, converter-se num museísmo estéril e excludente. O desafio contemporâneo consiste, justamente, em gerir de forma equilibrada a tensão entre preservação e evolução orgânica. O patrimônio vivo pressupõe comunidades ativas que o práticam, transmitem e reinterpretam criativamente, não meros espetadores passivos de artefatos paralisados no tempo.<br /><br />
                                Concluindo, o patrimônio cultural deve ser encarado como um bem de todos, cujo acesso, fruição e salvaguarda constituem direitos e responsabilidades partilhados por cada cidadão e pelas instituições que o servem.
                            </div>

                            <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '20px' }}>
                                <strong>📝 PARTE 3 // Reescreva as frases</strong><br />
                                <em>Reescreva as frases, iniciando-as com a(s) palavra(s) dada(s). As frases originais e as respostas corretas são apresentadas abaixo.</em><br />
                                <div style={{ backgroundColor: '#fff', border: '1px solid var(--primary-light)', padding: '15px', margin: '10px 0', borderRadius: '8px', fontSize: '0.85rem' }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <li>
                                            <span style={{ color: '#666' }}>1. Parece que eles foram denunciados pela forma como agem. // Eles…</span><br />
                                            <strong>Eles parecem ter sido denunciados pela forma como agem.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>2. Confirmaram que darão várias boas notícias em breve. // A…</span><br />
                                            <strong>A confirmação de que darão várias boas notícias em breve foi dada.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>3. Em advertência apresentada, para o facto de que não pode falar com ele, mas ela ignorou- o sempre. // Para…</span><br />
                                            <strong>Para o facto de que não podia falar com ele foi advertida, mas ela ignorou-o sempre.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>4. Nada me diz que, seja ela o destino do dinheiro. // O…</span><br />
                                            <strong>O destino do dinheiro ser ela nada me diz.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>5. Executando o projeto, disseram a sua execução. // Logo que…</span><br />
                                            <strong>Logo que o projeto foi executado, disseram a sua execução.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>6. A crise é a ameaça fez disparar o valor dos juros. // Os juros…</span><br />
                                            <strong>Os juros dispararam em virtude da crise que os ameaçou.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>7. Não sei se vem tu eu, o que conta é ir um de nós. // Independentemente…</span><br />
                                            <strong>Independentemente de seres tu ou eu, o que conta é ir um de nós.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>8. Visto que não houve quórum, a direção marcou a reunião para o dia seguinte. // Uma…</span><br />
                                            <strong>Uma vez que não houve quórum, a direção marcou a reunião para o dia seguinte.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>9. Intervindo como interviemos, o meu conselho é que não deixe de fazer. // Não…</span><br />
                                            <strong>Não deixe de fazê-lo, apesar de termos intervindo como interviemos.</strong>
                                        </li>
                                        <li>
                                            <span style={{ color: '#666' }}>10. Se tiveres alguma ideia brilhante, diz. // Caso…</span><br />
                                            <strong>Caso tenhas alguma ideia brilhante, diz.</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }

    return (
        <div className="simulado-dashboard animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
            <div className="sticky-note" style={{ padding: '30px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    Certificação CAPLE
                </div>
                <h1 className="handwritten" style={{ color: 'var(--primary-deep)', fontSize: '3.5rem', margin: '0 0 5px 0' }}>
                    {info.name}
                </h1>

                {/* Internal Level Selector */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginTop: '15px',
                    marginBottom: '10px',
                    padding: '0 10px'
                }}>
                    {['A1','A2','B1','B2','C1','C2'].map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => setSimLevel(lvl)}
                            style={{
                                fontFamily: 'Avenir, sans-serif',
                                backgroundColor: simLevel === lvl ? 'var(--primary-deep)' : 'transparent',
                                color: simLevel === lvl ? 'white' : 'var(--text-soft)',
                                border: `1px solid ${simLevel === lvl ? 'var(--primary-deep)' : 'var(--text-soft)'}`,
                                borderRadius: '12px',
                                padding: '6px 0',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: '100%'
                            }}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>

                <div style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '6px 16px',
                    backgroundColor: 'rgba(235, 235, 245, 0.5)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: 'var(--text-soft)'
                }}>
                    ⏱ Duração total: {info.time}
                </div>
            </div>

            <div style={{ padding: '0 10px' }}>
                <h3 style={{ color: 'var(--primary-deep)', fontSize: '1.1rem', marginBottom: '15px', fontFamily: 'Avenir, sans-serif' }}>
                    Estrutura do Exame
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {info.areas.map((area, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            fontSize: '0.95rem',
                            color: 'var(--primary-dark)',
                            fontFamily: 'Avenir, sans-serif',
                            fontWeight: '500'
                        }}>
                            <span style={{
                                width: '24px', height: '24px',
                                backgroundColor: 'var(--primary-light)',
                                color: 'white',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', marginRight: '12px', flexShrink: 0
                            }}>
                                {idx + 1}
                            </span>
                            {area}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 10px', marginTop: '10px' }}>
                <h3 style={{ color: 'var(--primary-deep)', fontSize: '1.1rem', marginBottom: '15px', fontFamily: 'Avenir, sans-serif' }}>
                    Classificação
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {GRADING.map((g, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'white',
                            padding: '12px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            textAlign: 'center',
                            display: 'flex', flexDirection: 'column', gap: '5px'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: g.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{g.label}</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: '600' }}>{g.range}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {hasAssets ? (
                        <button
                            onClick={() => setIsTesting(true)}
                            className="action-btn"
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: 'var(--primary-colors)',
                                border: '2px solid var(--primary-deep)',
                                color: 'var(--primary-deep)',
                                fontSize: '1.2rem',
                                borderRadius: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Começar Simulado
                        </button>
                    ) : (
                        <div style={{
                            padding: '16px',
                            backgroundColor: 'rgba(235,235,245,0.5)',
                            border: '2px dashed rgba(46,90,136,0.25)',
                            borderRadius: '16px',
                            color: 'var(--text-soft)',
                            fontSize: '0.95rem'
                        }}>
                            🚧 Simulado de {simLevel} em preparação — disponível em breve!
                        </div>
                    )}
                    <button
                        onClick={() => setShowWritingGuide(true)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: 'transparent',
                            border: '2px dashed var(--primary-deep)',
                            color: 'var(--primary-deep)',
                            fontSize: '1.05rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📖 Guia da Produção Escrita
                    </button>
                </div>
            </div>
        </div>
    );
}
