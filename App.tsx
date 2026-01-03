import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Sparkles, RefreshCw, Volume2, Info, Loader2, Play, Zap, Trophy, Timer as TimerIcon, StopCircle, Star, Lock, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import GameBoard from './components/GameBoard';
import { COLORS } from './constants';
import { getLevel, TOTAL_LEVELS } from './services/levelManager';
import { LevelConfig } from './types';
import { loadProgress, saveProgress, LevelProgress } from './services/storageService';

const LEVELS_PER_PAGE = 25;

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  
  // Game Mode State
  const [gameMode, setGameMode] = useState<'journey' | 'rush'>('journey');
  const [gameState, setGameState] = useState<'intro' | 'level-select' | 'playing' | 'level-complete' | 'game-over'>('intro');
  
  // Rush Mode State
  const [rushTime, setRushTime] = useState(60);
  const [rushScore, setRushScore] = useState(0);

  // Journey Progress State
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({});
  const [lastMistakes, setLastMistakes] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLevelProgress(loadProgress());
  }, []);

  // Timer logic for Pulse Rush
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && gameMode === 'rush') {
        timer = setInterval(() => {
            setRushTime((prev) => {
                if (prev <= 1) {
                    setGameState('game-over');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameMode]);

  const activeLevel = useMemo(() => {
    return getLevel(currentLevelIndex);
  }, [currentLevelIndex]);

  const handleStartJourney = () => {
    setGameMode('journey');
    setGameState('level-select');
    // Calculate current page based on furthest progress
    const levelsPlayed = Object.keys(levelProgress).map(Number);
    const maxLevel = levelsPlayed.length > 0 ? Math.max(...levelsPlayed) : 0;
    setPage(Math.floor(maxLevel / LEVELS_PER_PAGE));
  };

  const handleLevelSelect = (index: number) => {
      setCurrentLevelIndex(index);
      setGameState('playing');
  };

  const handleStartRush = () => {
      setGameMode('rush');
      setRushTime(60);
      setRushScore(0);
      // Start at a random "easy" level
      setCurrentLevelIndex(Math.floor(Math.random() * 50));
      setGameState('playing');
  };

  const handleLevelComplete = (mistakes: number) => {
    setLastMistakes(mistakes);

    if (gameMode === 'rush') {
        // Instant transition for Rush
        setRushScore(s => s + 1);
        setRushTime(t => Math.min(t + 10, 90)); // Add 10s, cap at 90s
        // Random next level
        setCurrentLevelIndex(Math.floor(Math.random() * 100));
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
    } else if (gameMode === 'journey') {
        // Star Logic
        let stars = 1;
        if (mistakes === 0) stars = 3;
        else if (mistakes <= 2) stars = 2;

        const currentBest = levelProgress[currentLevelIndex] || 0;
        if (stars > currentBest) {
            const newProgress = { ...levelProgress, [currentLevelIndex]: stars };
            setLevelProgress(newProgress);
            saveProgress(newProgress);
        }
        setGameState('level-complete');
    }
  };

  const handleNextLevel = () => {
    const nextIdx = (currentLevelIndex + 1) % TOTAL_LEVELS;
    setCurrentLevelIndex(nextIdx);
    setGameState('playing');
  };

  const getTimerColor = () => {
      if (rushTime > 30) return 'text-green-400';
      if (rushTime > 10) return 'text-amber-400';
      return 'text-red-500 animate-pulse';
  };

  const getEarnedStars = () => {
      if (lastMistakes === 0) return 3;
      if (lastMistakes <= 2) return 2;
      return 1;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-900 overflow-hidden relative">
      
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGameState('intro')}>
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-1 bg-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PULSE & PATH
            </h1>
        </div>
        
        {/* Rush Mode HUD */}
        {gameState === 'playing' && gameMode === 'rush' && (
            <div className="flex gap-6 items-center">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 font-mono">SCORE</span>
                    <span className="text-xl font-bold text-white leading-none">{rushScore}</span>
                </div>
                <div className="flex flex-col items-end w-16">
                    <span className="text-xs text-slate-500 font-mono">TIME</span>
                    <span className={`text-xl font-bold leading-none ${getTimerColor()}`}>{rushTime}s</span>
                </div>
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto">
        
        {gameState === 'intro' && (
            <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500 w-full max-w-4xl">
                <div className="space-y-4">
                    <h2 className="text-4xl font-light text-slate-200">Select Mode</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Choose your path through the rhythm.
                    </p>
                </div>

                <div className="flex justify-center gap-6 w-full max-w-2xl mx-auto">
                     {/* Campaign Mode Card */}
                     <button 
                        onClick={handleStartJourney}
                        className="group relative flex flex-col items-center p-8 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 text-left flex-1"
                    >
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-cyan-400" fill="currentColor" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Journey</h3>
                        <p className="text-slate-400 text-sm mb-6 text-center">
                            Travel through {TOTAL_LEVELS} curated levels of increasing harmony.
                        </p>
                        <div className="mt-auto w-full">
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-cyan-500 h-full transition-all duration-500" 
                                    style={{ width: `${(Object.keys(levelProgress).length / TOTAL_LEVELS) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-cyan-500 mt-2 font-mono block text-center">
                                PROGRESS {Object.keys(levelProgress).length} / {TOTAL_LEVELS}
                            </span>
                        </div>
                    </button>

                     {/* Pulse Rush Mode Card */}
                     <button 
                        onClick={handleStartRush}
                        className="group relative flex flex-col items-center p-8 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20 text-left flex-1"
                    >
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8 text-amber-400" fill="currentColor" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Pulse Rush</h3>
                        <p className="text-slate-400 text-sm mb-6 text-center">
                            Race against the fading pulse. Solve fast to gain time.
                        </p>
                         <div className="mt-auto px-3 py-1 bg-amber-900/30 border border-amber-500/30 rounded-full text-xs text-amber-300 font-mono">
                            ARCADE MODE
                        </div>
                    </button>
                </div>
            </div>
        )}

        {gameState === 'level-select' && (
            <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setGameState('intro')} className="text-slate-400 hover:text-white flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-cyan-400 tracking-widest">SELECT LEVEL</h2>
                    <div className="w-20"></div> {/* Spacer */}
                </div>

                <div className="grid grid-cols-5 gap-3 md:gap-4">
                    {Array.from({ length: LEVELS_PER_PAGE }).map((_, i) => {
                        const levelIndex = page * LEVELS_PER_PAGE + i;
                        if (levelIndex >= TOTAL_LEVELS) return null;

                        const stars = levelProgress[levelIndex];
                        const isLocked = levelIndex !== 0 && !levelProgress[levelIndex - 1] && !levelProgress[levelIndex];

                        return (
                            <button
                                key={levelIndex}
                                disabled={isLocked}
                                onClick={() => handleLevelSelect(levelIndex)}
                                className={`
                                    relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-200
                                    ${isLocked 
                                        ? 'bg-slate-900/50 border-slate-800 text-slate-700 cursor-not-allowed' 
                                        : 'bg-slate-800 border-slate-700 hover:border-cyan-500 hover:bg-slate-700 hover:shadow-lg hover:shadow-cyan-900/20 text-white'
                                    }
                                `}
                            >
                                {isLocked ? (
                                    <Lock className="w-6 h-6 opacity-40" />
                                ) : (
                                    <>
                                        <span className="text-xl font-bold font-mono">{levelIndex + 1}</span>
                                        <div className="flex gap-0.5 mt-2">
                                            {[1, 2, 3].map(s => (
                                                <Star 
                                                    key={s} 
                                                    className={`w-3 h-3 ${s <= (stars || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center items-center gap-8 mt-8">
                    <button 
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="font-mono text-slate-500">
                        PAGE {page + 1} / {Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE)}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(Math.ceil(TOTAL_LEVELS/LEVELS_PER_PAGE)-1, p + 1))}
                        disabled={page >= Math.ceil(TOTAL_LEVELS/LEVELS_PER_PAGE)-1}
                        className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        )}

        {gameState === 'playing' && (
            <div className="w-full max-w-2xl space-y-4">
                <div className="flex justify-between items-end px-2">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-bold text-white">
                                {gameMode === 'rush' ? 'Pulse Rush' : `Level ${currentLevelIndex + 1}`}
                            </h2>
                            <span className="text-slate-500 text-sm">
                                {gameMode === 'rush' ? ' // SPEED' : `/ ${TOTAL_LEVELS}`}
                            </span>
                        </div>
                        <h3 className="text-lg text-cyan-400">{activeLevel.name}</h3>
                        <p className="text-sm text-slate-400">{activeLevel.description}</p>
                    </div>
                    <div className="flex gap-2">
                         {gameMode === 'journey' && (
                            <button 
                                onClick={() => setGameState('level-select')}
                                className="text-slate-500 hover:text-white transition-colors p-2"
                                title="Level Select"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => setGameState('intro')}
                            className="text-slate-500 hover:text-white transition-colors p-2"
                            title="Back to Menu"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <GameBoard 
                    key={activeLevel.id} // Force reset on level change
                    level={activeLevel} 
                    onLevelComplete={handleLevelComplete} 
                />
                
                <div className="text-center text-xs text-slate-600 font-mono mt-8">
                    WAIT FOR THE PULSE • SWIPE TO CONNECT
                </div>
            </div>
        )}

        {gameState === 'game-over' && (
             <div className="text-center space-y-8 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
                   <StopCircle className="w-12 h-12 text-red-400" />
                </div>
                
                <div className="space-y-2">
                   <h2 className="text-4xl font-bold text-white">Time's Up!</h2>
                   <p className="text-slate-400">The rhythm has faded.</p>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 min-w-[300px]">
                    <div className="text-sm text-slate-500 mb-1">TOTAL LEVELS CLEARED</div>
                    <div className="text-5xl font-bold text-amber-400">{rushScore}</div>
                </div>

                <div className="flex gap-4 justify-center">
                   <button 
                       onClick={() => setGameState('intro')}
                       className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                   >
                       Menu
                   </button>
                   <button 
                       onClick={handleStartRush}
                       className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-900/50 transition-all hover:scale-105"
                   >
                       Try Again
                   </button>
                </div>
           </div>
        )}

        {gameState === 'level-complete' && (
            <div className="text-center space-y-8 animate-in zoom-in duration-300">
                 <div className="w-24 h-24 bg-green-500/20 rounded-full mx-auto flex items-center justify-center animate-pulse">
                    <Sparkles className="w-12 h-12 text-green-400" />
                 </div>
                 
                 <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-white">Synced!</h2>
                    <p className="text-slate-400">The circuit is complete.</p>
                 </div>

                 {gameMode === 'journey' && (
                     <div className="flex flex-col items-center gap-2">
                         <div className="flex gap-2">
                             {[1, 2, 3].map(s => (
                                 <Star 
                                     key={s} 
                                     className={`w-8 h-8 transition-all duration-500 ${s <= getEarnedStars() ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-700'}`} 
                                 />
                             ))}
                         </div>
                         <p className="text-sm text-slate-500 mt-2">
                             {lastMistakes === 0 ? "PERFECT FLOW" : `${lastMistakes} MISSED BEAT${lastMistakes > 1 ? 'S' : ''}`}
                         </p>
                     </div>
                 )}

                 <div className="flex gap-4 justify-center mt-6">
                    {gameMode === 'journey' && (
                         <button 
                            onClick={() => setGameState('level-select')}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Levels
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setGameState('playing'); 
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Replay
                    </button>
                    <button 
                        onClick={handleNextLevel}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-900/50 transition-all hover:scale-105"
                    >
                        Next Level
                    </button>
                 </div>
            </div>
        )}

      </main>

      <footer className="p-4 text-center text-slate-600 text-xs">
         Pulse & Path &copy; {new Date().getFullYear()} • Built with React
      </footer>
    </div>
  );
};

export default App;