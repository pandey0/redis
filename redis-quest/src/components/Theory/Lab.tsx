import React, { useState, useEffect } from 'react';
import { Terminal } from '../Terminal/Terminal';
import { MemoryPool } from '../Visualizer/MemoryPool';

interface LabScenario {
  id: string;
  title: string;
  description: string;
  analogy: {
    story: string;
    logic: string;
  };
  productionFlow: string[];
  problem: string;
  hint: string;
  solution: string[];
  deepDive: {
    problem: string;
    logic: string;
    production: string;
  };
}

const SCENARIOS: LabScenario[] = [
  {
    id: 'session-store',
    title: '🚀 Session Store (The Speed Shield)',
    description: 'When a user logs in, dont hit the slow Database for every page click. Store the session in Redis.',
    analogy: {
      story: "Think of an Exclusive Club. The main Guest List (Database) is a massive book locked in a safe. Once a guest arrives, the bouncer gives them a Wristband (Redis Token).",
      logic: "The bartender just looks at the Wristband. It takes 1 second instead of checking the heavy book every time."
    },
    productionFlow: [
      "1. User → Logs In",
      "2. Server → SET session:token user_data EX 3600",
      "3. Subsequent Requests → Server checks Redis only"
    ],
    problem: 'Simulate a user session that lasts 10 seconds.',
    hint: 'Use SET with EX option.',
    solution: ["SET session:user123 '{name:\"Arpit\"}' EX 10"],
    deepDive: {
      problem: "Databases are slow. 10,000 clicks/sec will crash them.",
      logic: "Redis RAM access is <1ms. Perfect for session tokens.",
      production: "Used by: Netflix, Spotify, Amazon."
    }
  },
  {
    id: 'rate-limit',
    title: '🛡️ Stop the API Flood (Security)',
    description: 'A malicious bot is hammering your login server.',
    analogy: {
      story: "Imagine a Movie Theater window. A person runs to the window 100 times a second. The clerk is exhausted.",
      logic: "Security says: 'If you come more than 5 times, you are blocked for 10 seconds.'"
    },
    productionFlow: [
      "1. Request → INCR user:limit",
      "2. If count > 5, Return 429 Error",
      "3. Redis → Cleans up old counters automatically via EXPIRE"
    ],
    problem: 'Simulate a flood and then set a reset timer.',
    hint: 'Use SET then EXPIRE.',
    solution: ["SET user:123:login 10", "EXPIRE user:123:login 5"],
    deepDive: {
      problem: "Attackers can brute-force passwords without limits.",
      logic: "Atomic counters + TTL handles millions of checks/sec.",
      production: "Used by: GitHub, Twitter, Cloudflare."
    }
  },
  {
    id: 'leaderboard',
    title: '🏆 Real-time Leaderboard',
    description: 'Rank millions of players by score instantly.',
    analogy: {
      story: "Think of an Arcade High Score screen. In a normal DB, you'd have to sort the whole table every time. In Redis, the scoreboard 'auto-sorts' as soon as you add a name.",
      logic: "Redis uses a 'SkipList' to keep scores in order while you sleep."
    },
    productionFlow: [
      "1. Player finishes level → ZADD scores 5000 'player1'",
      "2. UI calls → ZREVRANGE scores 0 9 WITHSCORES",
      "3. Result → Top 10 shown in real-time"
    ],
    problem: 'Add three players with different scores and see the auto-sorting.',
    hint: 'Use ZADD [key] [score] [member].',
    solution: ["ZADD games:top 100 arpit", "ZADD games:top 500 gemini", "ZADD games:top 250 goku"],
    deepDive: {
      problem: "SQL 'ORDER BY' is slow on large tables.",
      logic: "Redis Sorted Sets (ZSET) keep data sorted at O(log N) complexity.",
      production: "Used by: Fortnite, Candy Crush, Duolingo."
    }
  },
  {
    id: 'geo-radius',
    title: '🚖 Ride Finder (Uber-style)',
    description: 'Find drivers within 5km of a passenger.',
    analogy: {
      story: "Think of a physical Map with pins. Instead of looking at every pin on the globe, you just draw a circle with a compass and see what's inside.",
      logic: "Redis converts coordinates into a 'GeoHash' (a single number) for super fast searching."
    },
    productionFlow: [
      "1. Driver app → GEOADD drivers lon lat id",
      "2. Passenger app → GEORADIUS drivers lon lat 5 km",
      "3. Result → List of nearby drivers in milliseconds"
    ],
    problem: 'Add a driver and check if they are near (Simulation uses string keys for this lab).',
    hint: 'Note: In this lab, we use keys to simulate the driver presence.',
    solution: ["SET driver:101 'active' EX 10"],
    deepDive: {
      problem: "Calculating distances for 1 million drivers is CPU intensive.",
      logic: "Redis Geo indexes use Z-order curves to find neighbors fast.",
      production: "Used by: Uber, Lyft, DoorDash."
    }
  },
  {
    id: 'pub-sub',
    title: '💬 Live Chat (Messaging)',
    description: 'Send messages to millions of users instantly.',
    analogy: {
      story: "Think of a Radio Station. One person speaks into the mic (Publish), and anyone with their radio tuned to that frequency (Subscribe) hears it instantly.",
      logic: "Redis doesn't store the message; it just 'pushes' it to everyone listening."
    },
    productionFlow: [
      "1. User A → PUBLISH chat:room1 'Hello!'",
      "2. User B (Subscribed to chat:room1) → Receives message",
      "3. Result → Real-time communication without refreshes"
    ],
    problem: 'Simulate sending a message to a channel.',
    hint: 'Use PUBLISH [channel] [message].',
    solution: ["PUBLISH news:alerts 'Emergency Update!'"],
    deepDive: {
      problem: "Refreshing a page to see new messages is slow and heavy.",
      logic: "Fire-and-forget messaging with sub-millisecond latency.",
      production: "Used by: Discord, Slack, Twitch."
    }
  },
  {
    id: 'dist-lock',
    title: '🔒 Distributed Lock',
    description: 'Preventing double-selling of the last unit of an item.',
    analogy: {
      story: "A Shared Office Bathroom. The first person to turn the handle locks the door. Others see 'Locked'.",
      logic: "The door must unlock automatically if the person inside disappears."
    },
    productionFlow: [
      "1. Server A → SET lock:item NX PX 10000",
      "2. Server B → Tries same, fails",
      "3. Server A → Processes, then DEL lock:item"
    ],
    problem: 'Acquire a safe, auto-expiring lock.',
    hint: 'Use SET with NX and PX.',
    solution: ["SET lock:order 'server_a' NX PX 10000"],
    deepDive: {
      problem: "Two servers might sell the same 'Last iPhone'.",
      logic: "Atomic 'NX' flag ensures only one creator.",
      production: "Used by: E-commerce inventory systems."
    }
  }
];

export const Lab: React.FC<{ onExecute: (cmd: string) => any, store: any }> = ({ onExecute, store }) => {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [traffic, setTraffic] = useState<number[]>(new Array(20).fill(0));
  const [latency, setLatency] = useState<number>(0);

  const handleLabExecute = async (cmd: string) => {
    const start = performance.now();
    const result = await onExecute(cmd);
    const end = performance.now();
    setLatency(end - start);
    return result;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      let val = 0;
      if (activeScenario.id === 'rate-limit') val = parseInt(store['user:123:login']?.data || '0');
      else if (activeScenario.id === 'session-store') val = store['session:user123'] ? 10 : 0;
      else if (activeScenario.id === 'leaderboard') val = Object.keys(store).filter(k => k.startsWith('games:')).length * 3;
      else if (activeScenario.id === 'geo-radius') val = store['driver:101'] ? 8 : 0;
      else if (activeScenario.id === 'pub-sub') val = 0;
      
      setTraffic(prev => [...prev.slice(1), val]);
    }, 500);
    return () => clearInterval(interval);
  }, [store, activeScenario]);

  const currentCount = traffic[traffic.length - 1];
  const isActive = currentCount > 0;
  const isDanger = activeScenario.id === 'rate-limit' && currentCount > 5;

  return (
    <div className="lab-layout">
      <aside className="lab-sidebar">
        <div className="sidebar-header">LAB SCENARIOS</div>
        <div className="nav-group">
          {SCENARIOS.map(s => (
            <div 
              key={s.id} 
              className={`nav-item ${activeScenario.id === s.id ? 'active' : ''}`}
              onClick={() => setActiveScenario(s)}
            >
              {s.title}
            </div>
          ))}
        </div>
        
        <div className="solution-panel">
          <div className="sidebar-header" style={{borderTop: '1px solid var(--border-color)', marginTop: '20px'}}>OPERATIONS GUIDE</div>
          <div style={{padding: '15px', fontSize: '11px', lineHeight: '1.6', color: 'var(--text-secondary)'}}>
            {activeScenario.solution.map((step, i) => <div key={i} style={{marginBottom: '8px', color: 'var(--text-primary)'}}>{step}</div>)}
          </div>
        </div>
      </aside>

      <div className="lab-content">
        <div style={{display: 'flex', gap: '10px', flex: 1, overflow: 'hidden'}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto'}}>
            <section className="panel lab-briefing" style={{borderBottom: 'none'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                <div style={{flex: 1}}>
                  <h2 style={{color: 'var(--accent-color)', margin: '0 0 5px 0'}}>{activeScenario.title}</h2>
                  
                  <div className="production-flow-box" style={{background: 'rgba(57, 255, 20, 0.05)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--success-color)', marginBottom: '15px'}}>
                    <div style={{fontSize: '9px', color: 'var(--success-color)', fontWeight: 'bold', marginBottom: '8px'}}>REAL-WORLD PRODUCTION FLOW</div>
                    {activeScenario.productionFlow.map((step, i) => (
                      <div key={i} style={{fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px'}}>
                        {step}
                      </div>
                    ))}
                  </div>

                  <div style={{background: 'rgba(0, 242, 255, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)'}}>
                    <div style={{fontSize: '10px', color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase'}}>Real-World Analogy</div>
                    <p style={{fontSize: '13px', lineHeight: '1.5', margin: '0 0 10px 0', color: 'var(--text-primary)'}}>{activeScenario.analogy.story}</p>
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--success-color)'}}>Logic: {activeScenario.analogy.logic}</div>
                  </div>
                </div>
                
                <div className="visual-sim" style={{marginLeft: '20px'}}>
                  {activeScenario.id === 'rate-limit' && <div className={`sim-icon ${isDanger ? 'attack' : ''}`}>🤖</div>}
                  {activeScenario.id === 'session-store' && <div className={`sim-icon ${isActive ? 'pulse' : ''}`} style={{color: isActive ? 'var(--success-color)' : 'inherit'}}>👤</div>}
                  {activeScenario.id === 'leaderboard' && <div className="sim-icon">🏆</div>}
                  {activeScenario.id === 'geo-radius' && <div className="sim-icon">🚖</div>}
                  {activeScenario.id === 'pub-sub' && <div className="sim-icon">📡</div>}
                  {activeScenario.id === 'dist-lock' && (
                    <div className="sim-icon-group">
                      <div className="sim-icon">🖥️</div>
                      <div className="sim-link">↔️</div>
                      <div className="sim-icon">📦</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="traffic-monitor" style={{borderColor: isDanger ? 'var(--error-color)' : 'var(--border-color)'}}>
                <div className="monitor-header">
                  <span>REAL-TIME TELEMETRY</span>
                  <span style={{color: isDanger ? 'var(--error-color)' : (isActive ? 'var(--success-color)' : 'var(--text-secondary)'), fontWeight: 'bold'}}>
                    {isDanger ? '🛑 CRITICAL: OVERLOAD' : (isActive ? '🟢 SESSION ACTIVE' : '⚪ SYSTEM IDLE')}
                  </span>
                </div>
                <div className="bars-container">
                  {traffic.map((val, i) => (
                    <div key={i} className="traffic-bar" style={{
                      height: `${Math.min(val * 10, 100)}%`,
                      background: val > 5 ? 'var(--error-color)' : 'var(--accent-color)',
                      opacity: 0.3 + (i / 20) * 0.7
                    }} />
                  ))}
                </div>
              </div>
            </section>

            <section className="panel terminal-panel" style={{minHeight: '200px'}}>
              <div className="terminal-header" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                <span>Operator Terminal - Root@RedisLab</span>
                <span style={{color: latency > 10 ? 'var(--warning-color)' : 'var(--success-color)', fontSize: '9px', fontWeight: 'bold'}}>
                  LATENCY: {latency.toFixed(2)}ms
                </span>
              </div>
              <Terminal onExecute={handleLabExecute} />
            </section>
          </div>

          <section className="panel" style={{width: '300px', padding: '20px', overflowY: 'auto'}}>
            <div className="briefing-title" style={{marginBottom: '15px', display: 'block'}}>Deep Dive: Engineering Logic</div>
            
            <div className="deep-dive-section">
              <h4 style={{color: 'var(--warning-color)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px'}}>The Danger</h4>
              <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px'}}>{activeScenario.deepDive.problem}</p>
              
              <h4 style={{color: 'var(--accent-color)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px'}}>The Internal Fix</h4>
              <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px'}}>{activeScenario.deepDive.logic}</p>
              
              <h4 style={{color: 'var(--success-color)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px'}}>Production Pattern</h4>
              <pre style={{fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', border: '1px solid var(--border-color)'}}>
                {activeScenario.deepDive.production}
              </pre>
            </div>
          </section>
        </div>
      </div>

      <aside className="lab-visualizer panel">
        <div className="pool-header" style={{padding: '15px 15px 0 15px'}}>LIVE MEMORY INSPECTOR</div>
        <MemoryPool store={store} xRayMode={true} />
      </aside>
    </div>
  );
};
