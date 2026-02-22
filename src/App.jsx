import { useState, useEffect, useRef } from 'react'
import vocabularyData from './data/vocabulary.json'
import TabBar from './components/TabBar'
import WordDetail from './components/WordDetail'
import Arena from './components/Arena'
import Exame from './components/Exame'
import { IconBoat, IconSpeaker } from './components/Icons'
import { speakPortuguese } from './utils/audio'
import './index.css'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// ── localStorage helpers ──────────────────────────────────────────
function loadMastered() {
    try { return JSON.parse(localStorage.getItem('notas_mastered')) || [] } catch { return [] }
}
function saveMastered(ids) {
    localStorage.setItem('notas_mastered', JSON.stringify(ids))
}
function loadFavorites() {
    try { return JSON.parse(localStorage.getItem('notas_favorites')) || [] } catch { return [] }
}
function saveFavorites(ids) {
    localStorage.setItem('notas_favorites', JSON.stringify(ids))
}
function loadLevelIndex(level) {
    try { return parseInt(localStorage.getItem(`notas_index_${level}`)) || 0 } catch { return 0 }
}
function saveLevelIndex(level, index) {
    localStorage.setItem(`notas_index_${level}`, index)
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

function App() {
    const [activeTab, setActiveTab] = useState('livro')
    const [currentLevel, setCurrentLevel] = useState('A1')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showDetail, setShowDetail] = useState(false)
    const [selectedWord, setSelectedWord] = useState(null)
    const [choices, setChoices] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [masteredIds, setMasteredIdsState] = useState(loadMastered)
    const [favoriteIds, setFavoriteIdsState] = useState(loadFavorites)

    // Track previous level for saving on switch
    const prevLevelRef = useRef(currentLevel)

    const filteredWords = vocabularyData.filter(w => w.cefr_level === currentLevel)
    const displayIndex = findDisplayIndex(filteredWords, currentIndex, masteredIds)
    const currentWord = filteredWords[displayIndex] || filteredWords[0]

    // Sailing progress: based on word position within level
    const progressPercent = filteredWords.length > 0
        ? Math.max(2, (displayIndex / filteredWords.length) * 96)
        : 2

    // ── localStorage persistence wrappers ─────────────────────────
    const setMasteredIds = (ids) => {
        setMasteredIdsState(ids)
        saveMastered(ids)
    }
    const setFavoriteIds = (ids) => {
        setFavoriteIdsState(ids)
        saveFavorites(ids)
    }

    // ── Save + load index on level switch ─────────────────────────
    const handleLevelChange = (newLevel) => {
        if (newLevel === currentLevel) return
        // Save current level's index
        saveLevelIndex(currentLevel, currentIndex)
        prevLevelRef.current = newLevel
        // Load new level's index
        const stored = loadLevelIndex(newLevel)
        const newWords = vocabularyData.filter(w => w.cefr_level === newLevel)
        const safeIndex = findDisplayIndex(newWords, stored, masteredIds)
        setCurrentLevel(newLevel)
        setCurrentIndex(safeIndex)
        setFeedback(null)
    }

    // ── Generate quiz choices ─────────────────────────────────────
    const generateChoices = (word) => {
        if (!word) return
        const others = vocabularyData
            .filter(v => v.id !== word.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        const all = [word, ...others].sort(() => 0.5 - Math.random())
        setChoices(all)
        setFeedback(null)
    }

    useEffect(() => {
        if (activeTab === 'livro' && currentWord) {
            generateChoices(currentWord)
            speakPortuguese(currentWord.word)
        }
    }, [displayIndex, currentLevel, activeTab])

    // ── Answer handling ───────────────────────────────────────────
    const handleChoice = (choice) => {
        if (feedback === 'correct') return
        if (choice.id === currentWord.id) {
            setFeedback('correct')
            setTimeout(() => {
                const nextRaw = displayIndex + 1
                const nextIdx = nextRaw < filteredWords.length ? nextRaw : 0
                saveLevelIndex(currentLevel, nextIdx)
                setCurrentIndex(nextIdx)
            }, 1000)
        } else {
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
                    <div className="boat-icon" style={{ left: `calc(${progressPercent}% - 16px)` }}>
                        <IconBoat />
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
                                        Nível {currentLevel} — {displayIndex + 1} / {filteredWords.length}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                        <h1 className="handwritten" style={{ fontSize: '3rem', color: 'var(--primary-deep)' }}>
                                            {currentWord.word}
                                        </h1>
                                        <button
                                            onClick={() => speakPortuguese(currentWord.word)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-deep)', marginTop: '8px' }}
                                        >
                                            <IconSpeaker />
                                        </button>
                                    </div>
                                    <div
                                        className="priberam-trigger"
                                        onClick={() => { setSelectedWord(currentWord); setShowDetail(true); }}
                                        style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }}
                                    >
                                        <span style={{
                                            fontFamily: 'Avenir, sans-serif',
                                            color: '#E91E63',
                                            fontSize: '0.85rem',
                                            fontWeight: '800',
                                            letterSpacing: '-0.2px'
                                        }}>priberam</span>
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

                {/* ── DUELO TAB ── */}
                {activeTab === 'duelo' && <Arena />}

                {/* ── FAVORITOS TAB ── */}
                {activeTab === 'favoritos' && (
                    <div className="quiz-container animate-fade">
                        <h2 className="handwritten" style={{ textAlign: 'center', color: 'var(--primary-deep)' }}>Favoritos ⭐</h2>
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
                    <Exame masteredIds={masteredIds} onUnmaster={handleUnmaster} />
                )}
            </main>

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
        </>
    )
}

export default App
