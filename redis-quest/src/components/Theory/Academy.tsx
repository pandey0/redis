import React from 'react';

interface AcademyProps {
  onClose: () => void;
}

export const Academy: React.FC<AcademyProps> = ({ onClose }) => {
  return (
    <div className="academy-overlay">
      <div className="academy-container" style={{flexDirection: 'column', height: '100%'}}>
        <header className="sidebar-header" style={{borderRight: 'none', background: 'var(--panel-bg)', backdropFilter: 'var(--glass-blur)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <h3 style={{fontSize: '18px'}}>REDIS MASTER GUIDE</h3>
            <span style={{fontSize: '10px', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 8px', borderRadius: '4px'}}>
              PDF VERSION 📄
            </span>
          </div>
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            <a 
              href="/redis-guide.pdf" 
              download 
              style={{fontSize: '12px', color: 'var(--success-color)', textDecoration: 'none', border: '1px solid var(--success-color)', padding: '5px 12px', borderRadius: '6px'}}
            >
              Download PDF ⬇
            </a>
            <button className="close-btn" onClick={onClose} style={{fontSize: '32px'}}>×</button>
          </div>
        </header>
        
        <main className="academy-main" style={{padding: 0, overflow: 'hidden', flex: 1}}>
          <iframe 
            src="/redis-guide.pdf#toolbar=0" 
            width="100%" 
            height="100%" 
            style={{border: 'none'}}
            title="Redis Master Guide PDF"
          />
        </main>
      </div>
    </div>
  );
};
