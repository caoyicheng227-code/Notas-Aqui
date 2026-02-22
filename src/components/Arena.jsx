import { useState, useEffect } from 'react';
import { IconBoats, IconBoat } from './Icons';

export default function Arena() {
    const [progress, setProgress] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (gameStarted) {
            const interval = setInterval(() => {
                setOpponentProgress(p => Math.min(p + Math.random() * 5, 100));
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [gameStarted]);

    const handleStart = () => {
        setGameStarted(true);
        setProgress(0);
        setOpponentProgress(0);
    };

    return (
        <div className="quiz-container animate-fade">
            <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)' }}>Duelo de Barcos</h2>

            {!gameStarted ? (
                <div className="sticky-note" style={{ marginTop: '20px', padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <IconBoats />
                    </div>
                    <p className="handwritten" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Iniciar um novo duelo</p>
                    <div style={{ fontSize: '1.5rem', padding: '15px', border: '2px dashed var(--primary-deep)', borderRadius: '8px', margin: '20px 0' }}>
                        Código: 888 999
                    </div>
                    <button className="action-btn handwritten" style={{ width: '100%', padding: '15px' }} onClick={handleStart}>
                        Navegar Agora
                    </button>
                </div>
            ) : (
                <div className="sticky-note" style={{ marginTop: '20px', padding: '24px' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span className="handwritten">O Teu Barco</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="sailing-progress" style={{ margin: '0' }}>
                            <div className="wave-line"></div>
                            <div className="boat-icon" style={{ left: `calc(${progress}% - 16px)`, color: 'var(--primary-deep)' }}>
                                <IconBoat />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span className="handwritten" style={{ color: 'var(--accent-red)' }}>Oponente</span>
                            <span>{Math.round(opponentProgress)}%</span>
                        </div>
                        <div className="sailing-progress" style={{ margin: '0' }}>
                            <div className="wave-line"></div>
                            <div className="boat-icon" style={{ left: `calc(${opponentProgress}% - 16px)`, color: 'var(--accent-red)' }}>
                                <IconBoat />
                            </div>
                        </div>
                    </div>

                    <div className="sticky-note" style={{ textAlign: 'center', padding: '20px' }}>
                        <h1 className="handwritten" style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>saudade</h1>
                        <p style={{ color: 'var(--text-soft)', marginBottom: '20px' }}>Qual é o significado?</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <button className="option-btn" onClick={() => setProgress(p => Math.min(p + 15, 100))} style={{ flex: '1 1 45%' }}>
                                思念；留恋
                            </button>
                            <button className="option-btn" style={{ flex: '1 1 45%' }}>
                                快乐
                            </button>
                        </div>
                    </div>

                    {progress >= 100 && (
                        <div style={{ marginTop: '20px', color: 'var(--primary-deep)', fontWeight: 'bold', textAlign: 'center' }} className="animate-fade">
                            Vitória! Chegaste ao porto! ⚓️
                        </div>
                    )}
                    {opponentProgress >= 100 && progress < 100 && (
                        <div style={{ marginTop: '20px', color: 'var(--accent-red)', fontWeight: 'bold', textAlign: 'center' }} className="animate-fade">
                            O oponente venceu esta regata.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
