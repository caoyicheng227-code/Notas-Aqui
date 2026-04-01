import { useState, useEffect, useRef } from 'react'
import vocabularyData from './data/vocabulary.json'
import TabBar from './components/TabBar'
import WordDetail from './components/WordDetail'
import Leitura from './components/Leitura'
import Exame from './components/Exame'
import Simulado from './components/Simulado'
import { IconBoat, IconSpeaker, IconHandStar, IconCaderno } from './components/Icons'
import { speakPortuguese, playSuccess, playError } from './utils/audio'
import './index.css'

// Check if localStorage is available (private browsing may block it)
function isStorageAvailable() {
    try {
        const t = '__storage_test__'
        localStorage.setItem(t, t)
        localStorage.removeItem(t)
        return true
    } catch { return false }
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// ── localStorage helpers ─────────────────────────────────────────
// Keys: NotasAqui_<Level>_Index | NotasAqui_Mastered | NotasAqui_Favorites
// Arena/Duelo has NO localStorage calls — fully decoupled by design.
const storageOk = isStorageAvailable()
function loadMastered() {
    if (!storageOk) return []
    try { return JSON.parse(localStorage.getItem('NotasAqui_Mastered')) || [] } catch { return [] }
}
function saveMastered(ids) {
    if (!storageOk) return
    try { localStorage.setItem('NotasAqui_Mastered', JSON.stringify(ids)) } catch { }
}
function loadFavorites() {
    if (!storageOk) return []
    try { return JSON.parse(localStorage.getItem('NotasAqui_Favorites')) || [] } catch { return [] }
}
function saveFavorites(ids) {
    if (!storageOk) return
    try { localStorage.setItem('NotasAqui_Favorites', JSON.stringify(ids)) } catch { }
}
// Level and Caderno index: strictly isolated per user request
function loadCadernoIndex(level, caderno) {
    if (!storageOk) return 0
    try { return parseInt(localStorage.getItem(`${level}_Book${caderno}_Index`)) || 0 } catch { return 0 }
}
// Helper to get consistent, capitalized Caderno titles from category field
function getCadernoName(category, level, index) {
    // 1. The first book is ALWAYS "Básico" per user request
    if (index === 1) return "Básico";

    if (!category || category === '?') return `Caderno ${index}`;

    // 2. Normalize mapping for consistent titles across all levels
    const nameMap = {
        'food': 'Alimentação',
        'viagem': 'Viagem e Turismo',
        'compras e lazer': 'Lazer e Compras',
        'social': 'Interação Social',
        'items': 'Objetos Comuns',
        'place': 'Lugares e Espaços',
        'time': 'Tempo e Datas',
        'abstract': 'Conceitos Gerais',
        'people': 'Pessoas e Seres',
        'action': 'Ações e Verbos',
        'politics': 'Política e Sociedade',
        'academic': 'Meio Acadêmico',
        'study': 'Estudos',
        'work': 'Mundo do Trabalho',
        'política e economia': 'Política e Economia',
        'ciência': 'Ciência e Tecnologia',
        'literary': 'Literatura',
        'advanced': 'Conceitos Avançados',
        'saúde e corpo': 'Saúde e Corpo',
        'habitação': 'Habitação',
        'sociedade e cultura': 'Sociedade e Cultura',
        'meio ambiente': 'Meio Ambiente',
        'tecnologia e mídia': 'Tecnologia e Mídia',
        'sentimentos e opiniões': 'Sentimentos e Opiniões',
        'direito e justiça': 'Direito e Justiça',
        'artes e literatura': 'Artes e Literatura',
        'filosofia e religião': 'Filosofia e Religião',
        'história e evolução': 'História e Evolução'
    };

    const raw = nameMap[category.toLowerCase()] || category;

    // 3. Title Case: Capitalize substantive words, keep connectors lowercase
    const connectors = ['e', 'o', 'a', 'do', 'da', 'de', 'em', 'um', 'uma'];
    return raw.split(' ').map((word, i) => {
        const lower = word.toLowerCase();
        if (i > 0 && connectors.includes(lower)) return lower;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function saveCadernoIndex(level, caderno, index) {
    if (!storageOk) return
    // Write immediately — called on every word advance and level/caderno switch
    try { localStorage.setItem(`${level}_Book${caderno}_Index`, String(index)) } catch { }
}

// ── Skip-forward logic: find first non-mastered word from index i ─
function findDisplayIndex(words, fromIndex, masteredIds) {
    const n = words.length
    let i = fromIndex
    // Advance past mastered words
    while (i < n && masteredIds.includes(words[i].id)) i++
    // If we hit the end, wrap from 0
    if (i >= n) {
        i = words.findIndex(w => !masteredIds.includes(w.id))
        if (i === -1) i = fromIndex // all mastered edge case
    }
    return i
}

const InstallPrompt = () => {
    const [show, setShow] = useState(false)
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile && !isStandalone) {
            setShow(true)
        }
    }, [])

    if (!show) return null
    return (
        <div style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--primary-deep)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px', // matches ui rounding
            fontSize: '0.85rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: 1000,
            width: '85%',
            maxWidth: '350px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fade-in 0.5s ease-out'
        }} onClick={() => setShow(false)}>
            点击下方分享图标，选择“添加到主屏幕”以获得完整体验
            <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid var(--primary-deep)'
            }} />
        </div>
    )
}

function App() {
    const [activeTab, setActiveTab] = useState('livro')
    const [exameMode, setExameMode] = useState('treino') // NEW: Treino vs Simulado toggle
    const [currentLevel, setCurrentLevel] = useState('A1')
    const [currentCaderno, setCurrentCaderno] = useState(1)
    const [showCadernoMenu, setShowCadernoMenu] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0) // Loaded dynamically per level/caderno
    const [showDetail, setShowDetail] = useState(false)
    const [selectedWord, setSelectedWord] = useState(null)
    const [choices, setChoices] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [masteredIds, setMasteredIdsState] = useState(loadMastered)
    const [favoriteIds, setFavoriteIdsState] = useState(loadFavorites)

    // Track previous level for saving on switch
    const prevLevelRef = useRef(currentLevel)

    const levelWords = vocabularyData.filter(w => w.cefr_level === currentLevel)
    const startIdx = (currentCaderno - 1) * 100
    const filteredWords = levelWords.slice(startIdx, startIdx + 100)

    const displayIndex = findDisplayIndex(filteredWords, currentIndex, masteredIds)
    const currentWord = filteredWords[displayIndex] || filteredWords[0]

    // Sailing progress: based on word position within Caderno (100 words)
    const progressPercent = filteredWords.length > 0
        ? Math.max(0, (displayIndex / 100) * 100)
        : 0

    // ── localStorage persistence wrappers ─────────────────────────
    const setMasteredIds = (ids) => {
        setMasteredIdsState(ids)
        saveMastered(ids)
    }
    const setFavoriteIds = (ids) => {
        setFavoriteIdsState(ids)
        saveFavorites(ids)
    }

    // ── Auto-save index on EVERY change (covers refresh, level switch, answer) ──
    useEffect(() => {
        saveCadernoIndex(currentLevel, currentCaderno, currentIndex)
    }, [currentIndex, currentLevel, currentCaderno])

    // ── Load index on level switch ─────────────────────────────────
    const handleLevelChange = (newLevel) => {
        if (newLevel === currentLevel) return
        prevLevelRef.current = newLevel
        const defaultCaderno = 1
        const stored = loadCadernoIndex(newLevel, defaultCaderno)
        const levelWords = vocabularyData.filter(w => w.cefr_level === newLevel)
        const startIdx = (defaultCaderno - 1) * 100
        const newWords = levelWords.slice(startIdx, startIdx + 100)
        const safeIndex = findDisplayIndex(newWords, stored, masteredIds)
        setCurrentLevel(newLevel)
        setCurrentCaderno(defaultCaderno)
        setCurrentIndex(safeIndex)
        setFeedback(null)
    }

    // ── Load index on Caderno switch ───────────────────────────────
    const handleCadernoChange = (newCaderno) => {
        if (newCaderno === currentCaderno) return
        const stored = loadCadernoIndex(currentLevel, newCaderno)
        const levelWords = vocabularyData.filter(w => w.cefr_level === currentLevel)
        const startIdx = (newCaderno - 1) * 100
        const newWords = levelWords.slice(startIdx, startIdx + 100)
        const safeIndex = findDisplayIndex(newWords, stored, masteredIds)
        setCurrentCaderno(newCaderno)
        setCurrentIndex(safeIndex)
        setFeedback(null)
    }

    // ── Generate quiz choices ─────────────────────────────────────
    // Draw distractors from the SAME caderno pool first so translations
    // are contextually distinct and there is always exactly one correct answer.
    const generateChoices = (word) => {
        if (!word) return
        const targetTranslation = word.translation?.trim();

        // Primary pool: same caderno (filteredWords), exclude the current word
        // IMPORTANT: Also filter out any words that have the EXACT SAME translation as the target
        const samePool = filteredWords.filter(v => v.id !== word.id && v.translation?.trim() !== targetTranslation);

        // If not enough words in the caderno, supplement from same CEFR level (still avoiding duplicate translations)
        let distractorPool = samePool
        if (samePool.length < 3) {
            const sameLevelOthers = vocabularyData
                .filter(v => v.cefr_level === currentLevel && v.id !== word.id && v.translation?.trim() !== targetTranslation && !samePool.some(s => s.id === v.id))
            distractorPool = [...samePool, ...sameLevelOthers]
        }

        // Shuffle and pick 3 unique distractors
        const others = distractorPool
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)

        const all = [word, ...others].sort(() => 0.5 - Math.random())
        setChoices(all)
        setFeedback(null)
    }

    useEffect(() => {
        // Initial load of index for current level/caderno
        const stored = loadCadernoIndex(currentLevel, currentCaderno)
        const levelWords = vocabularyData.filter(w => w.cefr_level === currentLevel)
        const startIdx = (currentCaderno - 1) * 100
        const newWords = levelWords.slice(startIdx, startIdx + 100)
        const safeIndex = findDisplayIndex(newWords, stored, masteredIds)
        setCurrentIndex(safeIndex)
    }, [currentLevel, currentCaderno, masteredIds]) // Re-run if level/caderno or mastered words change

    useEffect(() => {
        if (activeTab === 'livro' && currentWord) {
            generateChoices(currentWord)
            speakPortuguese(currentWord.word)
        }
    }, [currentWord?.id, activeTab])

    // ── Answer handling ───────────────────────────────────────────
    const handleChoice = (choice) => {
        if (feedback === 'correct') return
        if (choice.id === currentWord.id) {
            playSuccess()
            setFeedback('correct')
            setTimeout(() => {
                const nextRaw = displayIndex + 1
                const nextIdx = nextRaw < filteredWords.length ? nextRaw : 0
                saveCadernoIndex(currentLevel, currentCaderno, nextIdx)
                setCurrentIndex(nextIdx)
            }, 1000)
        } else {
            playError()
            setFeedback(choice.id)
        }
    }

    // ── Mastered toggle ───────────────────────────────────────────
    const handleMaster = (wordId) => {
        const updated = masteredIds.includes(wordId)
            ? masteredIds.filter(id => id !== wordId)
            : [...masteredIds, wordId]
        setMasteredIds(updated)
    }

    // ── Un-master from Exame results ─────────────────────────────
    const handleUnmaster = (wordId) => {
        const updated = masteredIds.filter(id => id !== wordId)
        setMasteredIds(updated)
    }

    // ── Favorite toggle ───────────────────────────────────────────
    const handleFavorite = (wordId) => {
        const updated = favoriteIds.includes(wordId)
            ? favoriteIds.filter(id => id !== wordId)
            : [...favoriteIds, wordId]
        setFavoriteIds(updated)
    }

    return (
        <>
            <main style={{ flex: 1, paddingBottom: '90px' }}>
                {/* Level selector */}
                <div className="level-selector">
                    {LEVELS.map(lvl => (
                        <div
                            key={lvl}
                            className={`level-btn ${currentLevel === lvl ? 'active' : ''}`}
                            onClick={() => handleLevelChange(lvl)}
                        >
                            {lvl}
                        </div>
                    ))}
                </div>

                {/* Sailing progress bar */}
                <div className="sailing-progress">
                    <div className="wave-line"></div>
                    <div
                        className="boat-icon"
                        style={{
                            position: 'absolute',
                            left: `${Math.min(95, (currentIndex / (filteredWords.length || 1)) * 100)}%`,
                            transition: 'left 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}
                    >
                        <div className="boat-icon-inner">
                            <IconBoat />
                        </div>
                    </div>
                </div>

                {/* ── APRENDER TAB ── */}
                {activeTab === 'livro' && (
                    <div className="quiz-container animate-fade">
                        {!currentWord ? (
                            <div className="sticky-note" style={{ padding: '40px', textAlign: 'center' }}>
                                <p className="handwritten">Nenhum vocabulário aqui...</p>
                            </div>
                        ) : (
                            <>
                                <div className="sticky-note" style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '30px' }}>
                                    <div className="handwritten" style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: '12px' }}>
                                        Nível {currentLevel} — {getCadernoName(filteredWords[0]?.category, currentLevel, currentCaderno)} — {displayIndex + 1} / {filteredWords.length}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                        <h1 className="handwritten" style={{
                                            fontSize: currentWord.word.length > 14
                                                ? 'clamp(1.4rem, 6vw, 2rem)'
                                                : currentWord.word.length > 10
                                                    ? 'clamp(1.8rem, 7vw, 2.4rem)'
                                                    : '3rem',
                                            color: 'var(--primary-deep)',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            maxWidth: '100%',
                                            textAlign: 'center',
                                            lineHeight: 1.2
                                        }}>
                                            {currentWord.word}
                                        </h1>
                                        <button
                                            onClick={() => speakPortuguese(currentWord.word)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-deep)', marginTop: '8px' }}
                                        >
                                            <IconSpeaker />
                                        </button>
                                    </div>
                                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div
                                            className="caderno-trigger"
                                            onClick={() => setShowCadernoMenu(true)}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginTop: '1px' }}
                                        >
                                            <IconCaderno size={20} color="var(--primary-deep)" />
                                        </div>
                                        <div
                                            className="priberam-trigger"
                                            onClick={() => { setSelectedWord(currentWord); setShowDetail(true); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span style={{
                                                fontFamily: 'Avenir, sans-serif',
                                                color: '#E91E63',
                                                fontSize: '0.85rem',
                                                fontWeight: '800',
                                                letterSpacing: '-0.2px'
                                            }}>priberam</span>
                                        </div>
                                    </div>
                                    {/* Mastered badge */}
                                    {masteredIds.includes(currentWord.id) && (
                                        <div style={{
                                            position: 'absolute', top: '20px', left: '20px',
                                            fontSize: '0.75rem', color: '#4caf50',
                                            border: '1px solid #4caf50', borderRadius: '12px',
                                            padding: '2px 8px'
                                        }}>✓ Dominado</div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {choices.map(choice => (
                                        <button
                                            key={choice.id}
                                            className={`option-btn ${feedback === 'correct' && choice.id === currentWord.id ? 'correct' :
                                                feedback === choice.id ? 'wrong' : ''
                                                }`}
                                            onClick={() => handleChoice(choice)}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{choice.translation}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── LEITURA TAB ── */}
                {activeTab === 'leitura' && (
                    <Leitura currentLevel={currentLevel} />
                )}

                {/* ── FAVORITOS TAB ── */}
                {activeTab === 'favoritos' && (
                    <div className="quiz-container animate-fade">
                        <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Favoritos <IconHandStar color="var(--primary-deep)" filled={false} /></h2>
                        <div style={{ marginTop: '20px' }}>
                            {favoriteIds.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Lista vazia...</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {favoriteIds.map(id => {
                                        const word = vocabularyData.find(v => v.id === id)
                                        if (!word) return null
                                        return (
                                            <div key={id} className="sticky-note" onClick={() => { setSelectedWord(word); setShowDetail(true); }} style={{ padding: '20px', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h3 className="handwritten">{word.word}</h3>
                                                        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{word.translation}</p>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid var(--text-soft)', borderRadius: '10px', color: 'var(--text-soft)' }}>
                                                        {word.cefr_level}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── EXAME TAB ── */}
                {activeTab === 'exame' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Sub-nav Toggle (Mirrors Ajuste de Velocidade style) */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '10px', padding: '15px 0 5px 0'
                        }}>
                            <button
                                onClick={() => setExameMode('treino')}
                                style={{
                                    fontFamily: 'Avenir, sans-serif',
                                    backgroundColor: exameMode === 'treino' ? 'var(--primary-deep)' : 'transparent',
                                    color: exameMode === 'treino' ? 'white' : 'var(--text-soft)',
                                    border: `1px solid ${exameMode === 'treino' ? 'var(--primary-deep)' : 'var(--text-soft)'}`,
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '500'
                                }}
                            >
                                Treino
                            </button>
                            <button
                                onClick={() => setExameMode('simulado')}
                                style={{
                                    fontFamily: 'Avenir, sans-serif',
                                    backgroundColor: exameMode === 'simulado' ? 'var(--primary-deep)' : 'transparent',
                                    color: exameMode === 'simulado' ? 'white' : 'var(--text-soft)',
                                    border: `1px solid ${exameMode === 'simulado' ? 'var(--primary-deep)' : 'var(--text-soft)'}`,
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '500'
                                }}
                            >
                                Simulado
                            </button>
                        </div>

                        {/* Dynamic Content */}
                        {exameMode === 'treino' ? (
                            <Exame masteredIds={masteredIds} onUnmaster={handleUnmaster} currentLevel={currentLevel} />
                        ) : (
                            <Simulado currentLevel={currentLevel} />
                        )}
                    </div>
                )}
            </main>

            <InstallPrompt />
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {showDetail && selectedWord && (
                <WordDetail
                    word={{
                        ...selectedWord,
                        isMastered: masteredIds.includes(selectedWord.id),
                        isFavorite: favoriteIds.includes(selectedWord.id)
                    }}
                    onClose={() => setShowDetail(false)}
                    onMaster={() => handleMaster(selectedWord.id)}
                    onFavorite={() => handleFavorite(selectedWord.id)}
                />
            )}

            {/* ── CADERNO MODAL ── */}
            {showCadernoMenu && (
                <div className="detail-overlay animate-fade" onClick={() => setShowCadernoMenu(false)}>
                    <div className="detail-modal" onClick={e => e.stopPropagation()} style={{ padding: '30px', maxWidth: '300px', textAlign: 'center' }}>
                        <h2 className="handwritten" style={{ color: 'var(--primary-deep)', marginBottom: '20px' }}>
                            Cadernos de Estudo
                        </h2>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Nível {currentLevel} • 500 palavras
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {[1, 2, 3, 4, 5].map(c => {
                                const s = (c - 1) * 100
                                const block = levelWords.slice(s, s + 100)
                                const name = getCadernoName(block[0]?.category, currentLevel, c)
                                return (
                                    <button
                                        key={c}
                                        onClick={() => { handleCadernoChange(c); setShowCadernoMenu(false); }}
                                        className={`option-btn ${currentCaderno === c ? 'correct' : ''}`}
                                        style={{ padding: '12px', fontSize: '1rem' }}
                                    >
                                        {name} ({block.length} 词)
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            onClick={() => setShowCadernoMenu(false)}
                            className="option-btn"
                            style={{ width: '100%', marginTop: '20px', padding: '10px' }}
                        >
                            <span className="handwritten" style={{ fontSize: '1.2rem' }}>Voltar</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default App
