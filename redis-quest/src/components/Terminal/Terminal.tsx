import React, { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  onExecute: (cmd: string) => string | Promise<string>;
}

export const Terminal: React.FC<TerminalProps> = ({ onExecute }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const currentInput = input;
      setInput('');
      
      const result = await onExecute(currentInput);
      setHistory(prev => [...prev, `> ${currentInput}`, result]);
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
      <div className="terminal-output" ref={scrollRef}>
        <div style={{color: 'var(--success-color)', marginBottom: '10px', fontSize: '11px'}}>
          [SYSTEM] Initializing Redis v7.2.0...<br/>
          [SYSTEM] Memory visualization bridge active.<br/>
          [SYSTEM] Use help for available commands.
        </div>
        {history.map((line, i) => (
          <div key={i} className={typeof line === 'string' && line.startsWith('>') ? 'terminal-cmd' : 'terminal-res'}>
            <pre style={{whiteSpace: 'pre-wrap'}}>{line}</pre>
          </div>
        ))}
      </div>
      <div className="terminal-input-wrapper">
        <span style={{color: 'var(--accent-color)', fontWeight: 'bold', marginRight: '10px', fontSize: '14px'}}>redis {'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          placeholder="Type command here..."
        />
      </div>
    </div>
  );
};
