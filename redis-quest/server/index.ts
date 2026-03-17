import express from 'express';
import { createClient } from 'redis';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function start() {
  await client.connect();
  console.log('Connected to Redis');

  app.post('/command', async (req: any, res: any) => {
    const { command } = req.body;
    if (!command) return res.status(400).send({ error: 'No command provided' });

    try {
      const parts = command.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Simple implementation: send raw command
      const result = await client.sendCommand(parts);
      
      // Format response
      let formattedResult = result;
      if (Array.isArray(result)) {
        formattedResult = result.map((v, i) => `${i + 1}) "${v}"`).join('\n');
      } else if (typeof result === 'number') {
        formattedResult = `(integer) ${result}`;
      } else if (result === null) {
        formattedResult = '(nil)';
      } else if (typeof result === 'string') {
        formattedResult = result === 'OK' ? 'OK' : `"${result}"`;
      }
      
      res.send({ result: formattedResult });
    } catch (err: any) {
      console.error('Command Error:', err);
      res.send({ result: `(error) ${err.message}` });
    }
  });

  // Helper endpoint to get all keys and their details
  app.get('/store', async (req: any, res: any) => {
    try {
      const keys = await client.keys('*');
      const store: any = {};
      
      for (const key of keys) {
        const type = await client.type(key);
        const encoding = await client.sendCommand(['OBJECT', 'ENCODING', key]) as string;
        const refcount = await client.sendCommand(['OBJECT', 'REFCOUNT', key]) as number;
        const idletime = await client.sendCommand(['OBJECT', 'IDLETIME', key]) as number;
        
        let data: any = null;

        if (type === 'string') {
          data = await client.get(key);
        } else if (type === 'list') {
          data = await client.lRange(key, 0, -1);
        } else if (type === 'hash') {
          data = await client.hGetAll(key);
        } else if (type === 'zset') {
          const raw = await client.zRangeWithScores(key, 0, -1);
          data = raw.map(v => ({ member: v.value, score: v.score }));
        } else if (type === 'set') {
          data = await client.sMembers(key);
        }

        store[key] = {
          type,
          data,
          encoding: encoding || 'unknown',
          refcount,
          idletime,
          len: Array.isArray(data) ? data.length : (typeof data === 'object' ? Object.keys(data).length : (data?.toString().length || 0))
        };
      }
      res.send(store);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`Redis Quest Backend listening on port ${port}`);
  });
}

start();
