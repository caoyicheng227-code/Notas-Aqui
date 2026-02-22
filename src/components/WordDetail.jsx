import { IconClose, IconSpeaker, IconCheck, IconStar } from './Icons';
import { speakPortuguese } from '../utils/audio';

export default function WordDetail({ word, onClose, onMaster, onFavorite }) {
    if (!word) return null;

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-modal animate-fade" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <IconClose />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 className="handwritten" style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>
                            {word.word}
                        </h2>
                        <button
                            onClick={() => speakPortuguese(word.word)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-deep)' }}
                        >
                            <IconSpeaker />
                        </button>
                    </div>
                </div>

                <div className="sticky-note" style={{ padding: '20px', marginBottom: '24px' }}>
                    <h4 className="handwritten" style={{ marginBottom: '8px', color: 'var(--primary-deep)' }}>Definição</h4>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{word.priberam_definition}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 className="handwritten" style={{ marginBottom: '12px', color: 'var(--primary-deep)' }}>Exemplos</h4>
                    <div style={{ padding: '12px', border: '1.5px dashed var(--primary-deep)', borderRadius: '8px' }}>
                        {word.examples.map((ex, i) => (
                            <div key={i} style={{ marginBottom: '8px' }}>
                                <p className="example-text" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{ex.pt}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{ex.cn}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {word.synonyms && word.synonyms.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 className="handwritten" style={{ marginBottom: '12px', color: 'var(--primary-deep)' }}>Sinónimos</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {word.synonyms.map((syn, i) => (
                                <span key={i} style={{
                                    padding: '4px 12px',
                                    border: '1px solid var(--primary-deep)',
                                    borderRadius: '16px',
                                    fontSize: '0.85rem',
                                    backgroundColor: 'rgba(46, 90, 136, 0.05)'
                                }}>
                                    {syn}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="action-bar">
                    <button
                        className={`action-btn ${word.isMastered ? 'active' : ''}`}
                        onClick={onMaster}
                    >
                        <IconCheck />
                        <span>{word.isMastered ? 'Dominado' : 'Dominar'}</span>
                    </button>
                    <button
                        className={`action-btn ${word.isFavorite ? 'active' : ''}`}
                        onClick={onFavorite}
                    >
                        <IconStar />
                        <span>{word.isFavorite ? 'Favorito' : 'Favoritos'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
