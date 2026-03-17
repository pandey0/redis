import { useState, useEffect } from 'react';
import { useRedisSimulator } from './hooks/useRedisSimulator';
import { useRealRedis } from './hooks/useRealRedis';
import { Terminal } from './components/Terminal/Terminal';
import { MemoryPool } from './components/Visualizer/MemoryPool';
import { LevelContent } from './components/Theory/LevelContent';
import { Academy } from './components/Theory/Academy';
import { levels } from './data/levels';
import './App.css';

function App() {
  const simulator = useRedisSimulator();
  const realRedis = useRealRedis();
  const [useReal, setUseReal] = useState(false);
  const [xRayMode, setXRayMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  
  const { store, execute } = useReal ? realRedis : simulator;

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const level = levels[currentLevelIndex];
  const challenge = level.challenges[currentChallengeIndex];

  const handleExecute = (cmd: string) => {
    setIsProcessing(true);
    const resultPromise = execute(cmd);
    
    const handleResult = (res: string) => {
      setIsProcessing(false);
      
      const normalize = (s: string) => s.trim().toUpperCase().replace(/\s+/g, ' ').replace(/['"]/g, '');
      const userInput = normalize(cmd);
      const expected = normalize(challenge?.expectedCommand || '');

      if (challenge && userInput === expected) {
        setXp(prev => prev + 10);
        
        const isLastObjective = currentChallengeIndex === level.challenges.length - 1;
        const successMsg = isLastObjective 
          ? `\n[SUCCESS] MISSION ${level.id} COMPLETE! 🏆\n----------------------------`
          : `\n[SUCCESS] OBJECTIVE ${currentChallengeIndex + 1}/${level.challenges.length} VERIFIED! 🔓\n----------------------------`;
        
        if (!isLastObjective) {
          setCurrentChallengeIndex(prev => prev + 1);
        } else {
          setShowCelebration(true);
        }
        return `${res}${successMsg}`;
      }
      return res;
    };

    if (resultPromise instanceof Promise) {
      return resultPromise.then(handleResult);
    }
    return handleResult(resultPromise as string);
  };

  const nextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setCurrentChallengeIndex(0);
    }
  };

  const prevLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
      setCurrentChallengeIndex(0);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">REDIS QUEST</div>
        
        <div className="mode-selector">
          <button 
            className={!useReal ? 'active' : ''} 
            onClick={() => setUseReal(false)}
          >Simulator</button>
          <button 
            className={useReal ? 'active' : ''} 
            onClick={() => setUseReal(true)}
          >Real Redis {useReal && (realRedis.isConnected ? '🟢' : '🔴')}</button>
        </div>

        <div className="mode-selector">
          <button 
            className="btn-academy"
            onClick={() => setShowAcademy(true)}
          >
            Redis Academy 📚
          </button>
        </div>

        <div className="mode-selector">
          <button 
            className={xRayMode ? 'active' : ''} 
            onClick={() => setXRayMode(!xRayMode)}
          >
            {xRayMode ? 'Hide Internals' : 'X-Ray Vision 👁️'}
          </button>
        </div>

        <div className="event-loop-container">
          <div className={`loop-spinner ${isProcessing ? 'processing' : ''}`}></div>
          <div className={`loop-status ${isProcessing ? 'processing' : ''}`} style={{fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)'}}>
            {isProcessing ? 'CPU: BUSY' : 'CPU: IDLE'}
          </div>
        </div>

        <div className="stats" style={{display: 'flex', gap: '15px', fontSize: '12px', fontWeight: 'bold'}}>
          <div className="stat-item">XP: <span style={{color: 'var(--success-color)'}}>{xp}</span></div>
          <div className="stat-item">MISSION: <span style={{color: 'var(--accent-color)'}}>{currentLevelIndex + 1}/{levels.length}</span></div>
        </div>
      </header>
      
      <main className="app-main">
        {/* Column 1: Theory */}
        <section className="panel">
          <LevelContent 
            level={level} 
            totalLevels={levels.length}
            onNext={nextLevel} 
            onPrevious={prevLevel}
            isFirst={currentLevelIndex === 0}
            isLast={currentLevelIndex === levels.length - 1}
            currentChallengeIndex={currentChallengeIndex}
          />
        </section>

        {/* Column 2: Terminal */}
        <section className="panel terminal-panel">
          <div className="terminal-header">Interactive Terminal</div>
          <Terminal onExecute={handleExecute} />
        </section>

        {/* Column 3: Visualizer */}
        <section className="panel">
          <MemoryPool store={store} xRayMode={xRayMode} />
        </section>
      </main>

      {showAcademy && (
        <Academy onClose={() => setShowAcademy(false)} />
      )}

      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-card">
            <h2 style={{color: 'var(--accent-color)', fontSize: '32px', marginBottom: '10px'}}>MISSION COMPLETE! 🎉</h2>
            <p style={{marginBottom: '30px', opacity: 0.8}}>You have unlocked new Redis secrets.</p>
            <button onClick={() => {setShowCelebration(false); nextLevel();}} className="btn-primary">Initialize Next Mission</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
