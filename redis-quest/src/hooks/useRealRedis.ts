import { useState, useCallback, useEffect } from 'react';
import { RedisStore } from './useRedisSimulator';

const API_URL = 'http://localhost:3001';

export const useRealRedis = () => {
  const [store, setStore] = useState<RedisStore>({});
  const [lastMessage, setLastMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const fetchStore = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/store`);
      if (res.ok) {
        const data = await res.json();
        setStore(data);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
    const interval = setInterval(fetchStore, 1000);
    return () => clearInterval(interval);
  }, [fetchStore]);

  const execute = useCallback(async (commandStr: string) => {
    try {
      const res = await fetch(`${API_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandStr })
      });
      const data = await res.json();
      setLastMessage(data.result);
      fetchStore();
      return data.result;
    } catch (err: any) {
      const msg = `(error) Could not connect to real Redis backend. ${err.message}`;
      setLastMessage(msg);
      return msg;
    }
  }, [fetchStore]);

  return { store, lastMessage, execute, isConnected };
};
