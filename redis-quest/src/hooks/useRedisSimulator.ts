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
        case 'SET': {
          const [key, val] = args;
          if (!key || !val) throw new Error('ERR wrong number of arguments for "SET" command');
          newStore[key] = {
            type: 'string',
            data: val,
            encoding: 'SDS',
            len: val.length,
            free: 0
          };
          message = 'OK';
          break;
        }
        case 'GET': {
          const [key] = args;
          if (!key) throw new Error('ERR wrong number of arguments for "GET" command');
          const entry = store[key];
          if (!entry) {
            message = '(nil)';
          } else if (entry.type !== 'string') {
            throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
          } else {
            message = `"${entry.data}"`;
          }
          break;
        }
        case 'INCR': {
          const [key] = args;
          if (!key) throw new Error('ERR wrong number of arguments for "INCR" command');
          const entry = store[key];
          let val = 0;
          if (entry) {
            if (entry.type !== 'string') throw new Error('WRONGTYPE ...');
            val = parseInt(entry.data, 10);
            if (isNaN(val)) throw new Error('ERR value is not an integer or out of range');
          }
          val += 1;
          newStore[key] = {
            type: 'string',
            data: val.toString(),
            encoding: 'int',
            len: val.toString().length,
            free: 0
          };
          message = `(integer) ${val}`;
          break;
        }
        case 'DEL': {
          const [key] = args;
          if (newStore[key]) {
            delete newStore[key];
            message = '(integer) 1';
          } else {
            message = '(integer) 0';
          }
          break;
        }
        case 'LPUSH': {
          const [key, ...vals] = args;
          if (!key || vals.length === 0) throw new Error('ERR wrong number of arguments');
          let entry = newStore[key];
          if (entry && entry.type !== 'list') throw new Error('WRONGTYPE ...');
          const list = entry ? [...entry.data] : [];
          vals.forEach(v => list.unshift(v));
          newStore[key] = {
            type: 'list',
            data: list,
            encoding: 'QuickList',
            len: list.length
          };
          message = `(integer) ${list.length}`;
          break;
        }
        case 'LRANGE': {
          const [key, start, stop] = args;
          const entry = store[key];
          if (!entry) {
            message = '(empty array)';
          } else if (entry.type !== 'list') {
            throw new Error('WRONGTYPE ...');
          } else {
            const list = entry.data;
            const s = parseInt(start, 10);
            const e = parseInt(stop, 10);
            const result = list.slice(s, e === -1 ? undefined : e + 1);
            message = result.map((v: string, i: number) => `${i + 1}) "${v}"`).join('\n');
          }
          break;
        }
        case 'HSET': {
          const [key, field, val] = args;
          if (!key || !field || !val) throw new Error('ERR wrong number of arguments');
          let entry = newStore[key];
          if (entry && entry.type !== 'hash') throw new Error('WRONGTYPE ...');
          const hash = entry ? { ...entry.data } : {};
          const isNew = !hash[field];
          hash[field] = val;
          newStore[key] = {
            type: 'hash',
            data: hash,
            encoding: Object.keys(hash).length < 5 ? 'Ziplist' : 'HashTable',
            len: Object.keys(hash).length
          };
          message = `(integer) ${isNew ? 1 : 0}`;
          break;
        }
        case 'HGETALL': {
          const [key] = args;
          const entry = store[key];
          if (!entry) {
            message = '(empty array)';
          } else if (entry.type !== 'hash') {
            throw new Error('WRONGTYPE ...');
          } else {
            const hash = entry.data;
            const result = [];
            let i = 1;
            for (const f in hash) {
              result.push(`${i++}) "${f}"`);
              result.push(`${i++}) "${hash[f]}"`);
            }
            message = result.join('\n');
          }
          break;
        }
        case 'ZADD': {
          const [key, score, member] = args;
          if (!key || !score || !member) throw new Error('ERR wrong number of arguments');
          let entry = newStore[key];
          if (entry && entry.type !== 'zset') throw new Error('WRONGTYPE ...');
          const zset = entry ? [...entry.data] : [];
          const scoreNum = parseFloat(score);
          if (isNaN(scoreNum)) throw new Error('ERR value is not a valid float');
          
          const index = zset.findIndex(item => item.member === member);
          if (index !== -1) {
            zset[index].score = scoreNum;
          } else {
            zset.push({ member, score: scoreNum });
          }
          zset.sort((a, b) => a.score - b.score);
          
          newStore[key] = {
            type: 'zset',
            data: zset,
            encoding: 'SkipList',
            len: zset.length
          };
          message = `(integer) ${index === -1 ? 1 : 0}`;
          break;
        }
        case 'ZRANGE': {
          const [key, start, stop, withScores] = args;
          const entry = store[key];
          if (!entry) {
            message = '(empty array)';
          } else if (entry.type !== 'zset') {
            throw new Error('WRONGTYPE ...');
          } else {
            const zset = entry.data;
            const s = parseInt(start, 10);
            const e = parseInt(stop, 10);
            const slice = zset.slice(s, e === -1 ? undefined : e + 1);
            const result = [];
            let i = 1;
            for (const item of slice) {
              result.push(`${i++}) "${item.member}"`);
              if (withScores?.toUpperCase() === 'WITHSCORES') {
                result.push(`${i++}) "${item.score}"`);
              }
            }
            message = result.join('\n');
          }
          break;
        }
        case 'FLUSHALL': {
          setStore({});
          setLastMessage('OK');
          return 'OK';
        }
        default:
          message = `(error) ERR unknown command '${cmd}'`;
      }
      setStore(newStore);
      setLastMessage(message);
      return message;
    } catch (err: any) {
      setLastMessage(`(error) ${err.message}`);
      return `(error) ${err.message}`;
    }
  }, [store]);

  return { store, lastMessage, execute };
};
