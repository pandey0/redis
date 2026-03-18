import React from 'react';

interface MissionVisualizerProps {
  levelId: number;
}

export const MissionVisualizer: React.FC<MissionVisualizerProps> = ({ levelId }) => {
  const renderVisual = () => {
    switch (levelId) {
      case 1: // Speed of Light
        return (
          <svg viewBox="0 0 400 120" className="mission-svg">
            <rect x="20" y="20" width="100" height="60" rx="8" className="svg-box ram" />
            <text x="70" y="55" className="svg-text">RAM</text>
            <path d="M120 50 L280 50" className="svg-arrow fast" />
            <circle cx="200" cy="50" r="5" className="svg-pulse" />
            <rect x="280" y="20" width="100" height="60" rx="8" className="svg-box db" />
            <text x="330" y="55" className="svg-text">DB</text>
            <text x="200" y="100" className="svg-subtext">⚡ 100ns Path vs 🐌 10ms Path</text>
          </svg>
        );
      case 2: // Strings / SDS
        return (
          <svg viewBox="0 0 400 120" className="mission-svg">
            <rect x="20" y="30" width="60" height="40" rx="4" className="svg-header" />
            <text x="50" y="55" className="svg-text-small">LEN: 3</text>
            <rect x="80" y="30" width="60" height="40" rx="4" className="svg-header" />
            <text x="110" y="55" className="svg-text-small">FREE: 0</text>
            <rect x="140" y="30" width="120" height="40" rx="4" className="svg-buffer" />
            <text x="200" y="55" className="svg-text">"100\0"</text>
            <text x="200" y="90" className="svg-subtext">Simple Dynamic String (SDS)</text>
          </svg>
        );
      case 3: // Lists
        return (
          <svg viewBox="0 0 400 120" className="mission-svg">
            <rect x="30" y="40" width="80" height="40" rx="20" className="svg-node" />
            <text x="70" y="65" className="svg-text-small">Head</text>
            <path d="M110 60 L150 60" className="svg-link" />
            <rect x="150" y="40" width="80" height="40" rx="20" className="svg-node" />
            <text x="190" y="65" className="svg-text-small">Node 2</text>
            <path d="M230 60 L270 60" className="svg-link" />
            <rect x="270" y="40" width="80" height="40" rx="20" className="svg-node" />
            <text x="310" y="65" className="svg-text-small">Tail</text>
            <text x="200" y="100" className="svg-subtext">QuickList Linked Chain</text>
          </svg>
        );
      case 6: // Leaderboard
        return (
          <svg viewBox="0 0 400 150" className="mission-svg">
            <rect x="50" y="100" width="100" height="30" rx="4" fill="rgba(88, 166, 255, 0.1)" stroke="var(--accent-color)" />
            <text x="100" y="120" className="svg-text-small" fill="white">Rank 3</text>
            <rect x="150" y="70" width="100" height="60" rx="4" fill="rgba(88, 166, 255, 0.2)" stroke="var(--accent-color)" />
            <text x="200" y="100" className="svg-text-small" fill="white">Rank 2</text>
            <rect x="250" y="40" width="100" height="90" rx="4" fill="rgba(0, 242, 255, 0.3)" stroke="var(--accent-color)" />
            <text x="300" y="85" className="svg-text-small" fill="white">Rank 1</text>
            <text x="200" y="145" className="svg-subtext">Sorted Set SkipList Ranks</text>
          </svg>
        );
      case 11: // Cluster
        return (
          <svg viewBox="0 0 400 150" className="mission-svg">
            <circle cx="200" cy="75" r="50" fill="none" stroke="var(--border-color)" strokeDasharray="5,5" />
            <rect x="180" y="10" width="40" height="30" rx="4" fill="var(--accent-color)" />
            <rect x="260" y="80" width="40" height="30" rx="4" fill="var(--accent-color)" />
            <rect x="100" y="80" width="40" height="30" rx="4" fill="var(--accent-color)" />
            <text x="200" y="140" className="svg-subtext">16,384 Hash Slots Ring</text>
          </svg>
        );
      default:
        return null;
    }
  };

  const content = renderVisual();
  if (!content) return null;

  return (
    <div className="mission-visualizer-container">
      {content}
    </div>
  );
};
