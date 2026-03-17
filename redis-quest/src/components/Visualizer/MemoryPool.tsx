import React, { useState, useEffect } from 'react';
import { RedisStore, RedisValue } from '../../hooks/useRedisSimulator';

interface MemoryPoolProps {
  store: RedisStore;
  xRayMode: boolean;
}

export const MemoryPool: React.FC<MemoryPoolProps> = ({ store, xRayMode }) => {
  return (
    <div className={`memory-pool ${xRayMode ? 'x-ray-active' : ''}`}>
      <div className="pool-header">
        <span>Redis Memory (RAM)</span>
        {xRayMode && <span style={{fontSize: '12px', color: '#ffcc00', marginLeft: '10px'}}>X-RAY VISION ACTIVE</span>}
      </div>
      <div className="pool-grid">
        {Object.entries(store).map(([key, value]) => (
          <MemoryItem key={key} name={key} value={value} xRayMode={xRayMode} />
        ))}
        {Object.keys(store).length === 0 && (
          <div className="empty-memory">Memory is empty. Start typing commands!</div>
        )}
      </div>
    </div>
  );
};

const MemoryItem: React.FC<{ name: string; value: RedisValue; xRayMode: boolean }> = ({ name, value, xRayMode }) => {
  const [isUpdated, setIsUpdated] = useState(false);
  
  useEffect(() => {
    setIsUpdated(true);
    const timer = setTimeout(() => setIsUpdated(false), 500);
    return () => clearTimeout(timer);
  }, [value.data]);

  return (
    <div className={`memory-item ${value.type} ${isUpdated ? 'updated' : ''}`}>
      {xRayMode && (
        <div className="redis-obj-header">
          <span>redisObject</span>
          <span className="obj-ptr">ptr: 0x{Math.random().toString(16).slice(2, 10)}</span>
        </div>
      )}
      <div className="item-meta">
        <span className="item-key">{name}</span>
        <span className="item-type">{value.type.toUpperCase()}</span>
      </div>
      <div className="item-data">
        {value.type === 'string' && <StringVisual data={value.data} len={value.len} free={value.free} xRay={xRayMode} />}
        {value.type === 'list' && <ListVisual data={value.data} xRay={xRayMode} />}
        {value.type === 'hash' && <HashVisual data={value.data} xRay={xRayMode} />}
        {value.type === 'zset' && <ZSetVisual data={value.data} xRay={xRayMode} />}
      </div>
      {xRayMode && (
        <div className="internal-struct">
          encoding: <span className="sds-field">{value.encoding}</span><br/>
          refcount: <span className="sds-field">{value.refcount ?? 1}</span><br/>
          idletime: <span className="sds-field">{value.idletime ?? 0}s</span>
        </div>
      )}
    </div>
  );
};

const StringVisual: React.FC<{ data: string; len?: number; free?: number; xRay?: boolean }> = ({ data, len, free, xRay }) => (
  <div className="sds-visual">
    {xRay ? (
      <div className="internal-struct" style={{border: 'none', marginTop: 0}}>
        struct <span className="sds-field">sdshdr</span> {'{'} <br/>
        &nbsp;&nbsp;len: <span className="sds-field">{len}</span>;<br/>
        &nbsp;&nbsp;free: <span className="sds-field">{free}</span>;<br/>
        &nbsp;&nbsp;buf: <span className="sds-field">"{data}\0"</span>;<br/>
        {'}'}
      </div>
    ) : (
      <div className="sds-buf">"{data}"</div>
    )}
  </div>
);

const ListVisual: React.FC<{ data: string[]; xRay?: boolean }> = ({ data, xRay }) => (
  <div className="list-visual">
    {xRay && <div className="sds-field" style={{fontSize: '10px', width: '100%', marginBottom: '5px'}}>quicklistNode *head</div>}
    {data.map((item, i) => (
      <div key={i} className="list-node">
        <span>{item}</span>
        {i < data.length - 1 && <span className="list-arrow">→</span>}
      </div>
    ))}
  </div>
);

const HashVisual: React.FC<{ data: Record<string, string>; xRay?: boolean }> = ({ data, xRay }) => (
  <div className="hash-visual">
    {xRay && <div className="sds-field" style={{fontSize: '10px', marginBottom: '5px'}}>struct dict {'{'} bucket_count: {Math.pow(2, Math.ceil(Math.log2(Object.keys(data).length || 1)))} {'}'}</div>}
    <table>
      <thead>
        <tr><th>Field</th><th>Value</th></tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([f, v]) => (
          <tr key={f}><td>{f}</td><td>{v}</td></tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ZSetVisual: React.FC<{ data: { member: string; score: number }[]; xRay?: boolean }> = ({ data, xRay }) => (
  <div className="zset-visual">
    {xRay && <div className="sds-field" style={{fontSize: '10px', marginBottom: '5px'}}>zset: dict + skiplist (levels: {Math.ceil(Math.log2(data.length || 1))})</div>}
    {data.map((item, i) => (
      <div key={i} className="zset-node">
        <span className="zset-score">{item.score}</span>
        <span className="zset-member">{item.member}</span>
      </div>
    ))}
  </div>
);
