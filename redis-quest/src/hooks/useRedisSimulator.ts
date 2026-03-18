import { useState, useCallback } from 'react';

export type RedisType = 'string' | 'list' | 'hash' | 'zset' | 'set';

export interface RedisValue {
  type: RedisType;
  data: any;
  encoding: string;
  len?: number;
  free?: number;
  refcount?: number;
  idletime?: number;
}

export interface RedisStore {
  [key: string]: RedisValue;
}

export const useRedisSimulator = () => {
  const [store, setStore] = useState<RedisStore>({});
  const [lastMessage, setLastMessage] = useState<string>('');

  const execute = useCallback((commandStr: string) => {
    const parts = commandStr.trim().split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const args = parts.slice(1);

    let message = '';
    const newStore = { ...store };

    try {
      switch (cmd) {
        case 'PING':
          message = 'PONG';
          break;
        case 'SET': {
          const [key, val] = args;
          if (!key || !val) throw new Error('ERR wrong number of arguments for "SET" command');
          newStore[key] = {
            type: 'string',
            data: val,
            encoding: val.length < 44 ? 'embstr' : 'raw',
            len: val.length,
            free: 0,
            refcount: 1,
            idletime: 0
          };
          message = 'OK';
          break;
        }
        case 'GET': {
          const [key] = args;
          const entry = store[key];
          if (!entry) message = '(nil)';
          else if (entry.type !== 'string') throw new Error('WRONGTYPE ...');
          else message = `"${entry.data}"`;
          break;
        }
        case 'INCR': {
          const [key] = args;
          const entry = store[key];
          let val = entry ? parseInt(entry.data, 10) : 0;
          val += 1;
          newStore[key] = {
            type: 'string',
            data: val.toString(),
            encoding: 'int',
            len: val.toString().length,
            refcount: 1,
            idletime: 0
          };
          message = `(integer) ${val}`;
          break;
        }
        case 'LPUSH': {
          const [key, ...vals] = args;
          let entry = newStore[key];
          const list = entry ? [...entry.data] : [];
          vals.forEach(v => list.unshift(v));
          newStore[key] = { type: 'list', data: list, encoding: 'quicklist', len: list.length };
          message = `(integer) ${list.length}`;
          break;
        }
        case 'HSET': {
          const [key, field, val] = args;
          let entry = newStore[key];
          const hash = entry ? { ...entry.data } : {};
          const isNew = !hash[field];
          hash[field] = val;
          newStore[key] = { type: 'hash', data: hash, encoding: 'listpack', len: Object.keys(hash).length };
          message = `(integer) ${isNew ? 1 : 0}`;
          break;
        }
        case 'SADD': {
          const [key, member] = args;
          let entry = newStore[key];
          const set = entry ? new Set(entry.data) : new Set();
          const isNew = !set.has(member);
          set.add(member);
          newStore[key] = { type: 'set', data: Array.from(set), encoding: 'intset', len: set.size };
          message = `(integer) ${isNew ? 1 : 0}`;
          break;
        }
        case 'ZADD': {
          const [key, score, member] = args;
          let entry = newStore[key];
          const zset = entry ? [...entry.data] : [];
          const idx = zset.findIndex(i => i.member === member);
          if (idx !== -1) zset[idx].score = parseFloat(score);
          else zset.push({ member, score: parseFloat(score) });
          zset.sort((a, b) => a.score - b.score);
          newStore[key] = { type: 'zset', data: zset, encoding: 'skiplist', len: zset.length };
          message = `(integer) 1`;
          break;
        }
        case 'OBJECT': {
          const [sub, key] = args;
          const entry = store[key];
          if (!entry) message = '(nil)';
          else if (sub.toUpperCase() === 'ENCODING') message = `"${entry.encoding}"`;
          else if (sub.toUpperCase() === 'REFCOUNT') message = `(integer) ${entry.refcount || 1}`;
          else if (sub.toUpperCase() === 'IDLETIME') message = `(integer) ${entry.idletime || 0}`;
          break;
        }
        case 'INFO':
          message = '# Replication\nrole:master\nconnected_slaves:2\nmaster_replid:abc123xyz\nmaster_offset:456';
          break;
        case 'SAVE':
          message = 'OK';
          break;
        case 'MULTI':
          message = 'OK';
          break;
        case 'SENTINEL':
          message = '1) "127.0.0.1"\n2) "6379"';
          break;
        case 'CLUSTER':
          message = '1) 1) (integer) 0\n   2) (integer) 16383\n   3) 1) "127.0.0.1"\n      2) (integer) 6379';
          break;
        case 'XADD':
          message = `"${Date.now()}-0"`;
          break;
        case 'CONFIG':
          message = '1) "maxmemory"\n2) "0"';
          break;
        case 'MODULE':
          message = '(empty array)';
          break;
        case 'EXPIRE': {
          const [key, secs] = args;
          if (newStore[key]) {
            setTimeout(() => {
              setStore(curr => {
                const u = { ...curr };
                delete u[key];
                return u;
              });
            }, parseInt(secs) * 1000);
            message = '(integer) 1';
          } else message = '(integer) 0';
          break;
        }
        default:
          message = `(error) ERR unknown command '${cmd}'`;
      }
      setStore(newStore);
      setLastMessage(message);
      return message;
    } catch (err: any) {
      return `(error) ${err.message}`;
    }
  }, [store]);

  return { store, lastMessage, execute };
};
