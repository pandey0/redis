import React, { useState, useEffect, useRef } from 'react';
import { Level } from '../../data/levels';

interface LevelContentProps {
  level: Level;
  totalLevels: number;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
  currentChallengeIndex: number;
}

export const LevelContent: React.FC<LevelContentProps> = ({ 
  level, totalLevels, onNext, onPrevious, isLast, isFirst, currentChallengeIndex 
}) => {
  const [showHint, setShowHint] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const challenge = level.challenges[currentChallengeIndex];
  
  // Track previous mission and objective to detect changes
  const prevIndexRef = useRef(currentChallengeIndex);
  const prevLevelRef = useRef(level.id);

  useEffect(() => {
    // If the index increased OR we are on a new level, show verified
    if (currentChallengeIndex !== prevIndexRef.current || level.id !== prevLevelRef.current) {
      setJustVerified(true);
      const timer = setTimeout(() => setJustVerified(false), 2500);
      
      prevIndexRef.current = currentChallengeIndex;
      prevLevelRef.current = level.id;
      
      return () => clearTimeout(timer);
    }
  }, [currentChallengeIndex, level.id]);

  useEffect(() => {
    setShowHint(false);
  }, [currentChallengeIndex, level.id]);

  return (
    <div className="theory-panel">
      <div className="level-nav" style={{marginBottom: '25px'}}>
        <button onClick={onPrevious} disabled={isFirst}>PREV</button>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px'}}>MISSION PROGRESS</div>
          <div style={{fontSize: '14px', fontWeight: '900', color: 'var(--accent-color)'}}>{level.id} / {totalLevels}</div>
        </div>
        <button onClick={onNext} disabled={isLast}>NEXT</button>
      </div>
      
      <div className="level-content">
        <h1 style={{fontFamily: 'Orbitron', letterSpacing: '1px', fontSize: '20px'}}>{level.title}</h1>
        <div className="content-text" dangerouslySetInnerHTML={{ 
          __html: level.content.replace(/\n/g, '<br/>')
            .replace(/### (.*)/g, '<h3 style="color: var(--accent-color); font-size: 14px; margin-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;">$1</h3>')
            .replace(/\*\*(.*)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>')
            .replace(/`(.*?)`/g, '<code style="color: var(--warning-color); background: rgba(255,204,0,0.05); padding: 1px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
        }} />
      </div>

      {challenge && (
        <div className={`mission-briefing ${justVerified ? 'objective-flash' : ''}`}>
          <div className="briefing-header">
            <span className="briefing-title">Current Objective {currentChallengeIndex + 1}/{level.challenges.length}</span>
            {justVerified ? (
              <span className="mission-status-badge status-verified" style={{background: 'var(--success-color)', color: '#000'}}>VERIFIED ✓</span>
            ) : (
              <span className="mission-status-badge status-awaiting">AWAITING INPUT</span>
            )}
          </div>

          <div className="progress-tracker">
            {level.challenges.map((_, i) => (
              <div 
                key={i} 
                className={`progress-pip ${i < currentChallengeIndex ? 'completed' : i === currentChallengeIndex ? 'active' : ''}`}
              />
            ))}
          </div>

          <div className="briefing-text" style={{fontSize: '14px', color: '#fff'}}>
            {challenge.description}
          </div>

          <div 
            className="hint-trigger" 
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? `HINT: ${challenge.hint}` : 'Click for tactical hint...'}
          </div>
        </div>
      )}
    </div>
  );
};
