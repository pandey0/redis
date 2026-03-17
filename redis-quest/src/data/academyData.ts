export interface AcademySection {
  id: string;
  title: string;
  content: string;
  category: 'Basics' | 'Architecture' | 'Advanced' | 'System Design' | 'AI';
}

export const academySections: AcademySection[] = [
  {
    id: 'intro',
    title: '1. What is Redis?',
    category: 'Basics',
    content: `
      **Redis (Remote Dictionary Server)** is an **in-memory data structure store** used as a Database, Cache, and Message Broker.
      
      ### Why RAM?
      Unlike traditional databases (MySQL, MongoDB) that store data on disk, Redis stores everything in **RAM**. 
      - **Disk Latency**: ~10ms
      - **RAM Latency**: ~100ns
      - **Redis Latency**: <1ms
      
      This makes Redis roughly **100x to 1000x faster** than disk-based databases for simple operations.
    `
  },
  {
    id: 'fast',
    title: '2. Why Redis is Fast',
    category: 'Basics',
    content: `
      Redis performance isn't just about RAM. It's about engineering:
      
      1. **Single-Threaded Event Loop**: No CPU context switching or locking overhead.
      2. **Non-blocking I/O**: Uses \`epoll\`/\`kqueue\` to handle 100k+ concurrent connections.
      3. **Optimized Data Structures**: Every type (String, List, etc.) is specifically engineered for speed.
      4. **Minimal Protocol Overhead**: Uses a simple binary-safe protocol called **RESP**.
    `
  },
  {
    id: 'sds',
    title: '3. Internal: Simple Dynamic Strings (SDS)',
    category: 'Architecture',
    content: `
      Redis doesn't use standard C strings (\`char*\`). It uses **SDS**.
      
      ### Why SDS?
      - **O(1) Length**: Standard C strings require scanning the whole string to find the length. SDS stores the length in a header.
      - **Binary Safe**: Can store images or serialized objects because it doesn't rely on the null terminator (\`\\0\`).
      - **Pre-allocation**: Reduces the number of memory reallocations when a string grows.
    `
  },
  {
    id: 'persistence',
    title: '4. Persistence: RDB vs AOF',
    category: 'Architecture',
    content: `
      How does an in-memory DB survive a reboot?
      
      ### 1. RDB (Snapshots)
      Point-in-time snapshots of your data. Great for backups and fast restarts.
      
      ### 2. AOF (Append Only File)
      Logs every single write operation. Most durable but slower to reload.
      
      **Pro Tip**: Most production systems use **Hybrid Mode** (RDB + AOF).
    `
  },
  {
    id: 'replication',
    title: '5. Replication & High Availability',
    category: 'Advanced',
    content: `
      ### Master-Replica
      Replicas are exact copies of the Master. They provide **Read Scaling** and data redundancy.
      
      ### Redis Sentinel
      The "Watchman" of Redis. If the Master fails, Sentinel:
      1. Detects the failure.
      2. Promotes a Replica to be the new Master.
      3. Reconfigures other Replicas to follow the new leader.
    `
  },
  {
    id: 'cluster',
    title: '6. Redis Cluster (Sharding)',
    category: 'Advanced',
    content: `
      When 100GB of RAM isn't enough, you shard!
      
      - **Hash Slots**: Redis Cluster has exactly **16,384 slots**.
      - **Mapping**: \`slot = CRC16(key) % 16384\`.
      - **Gossip Protocol**: Nodes talk to each other to manage the cluster state without a central coordinator.
    `
  },
  {
    id: 'locks',
    title: '7. Distributed Locks (Redlock)',
    category: 'System Design',
    content: `
      In a distributed system, how do you ensure only one server processes an order?
      
      ### The Pattern:
      \`SET resource_name my_random_value NX PX 30000\`
      - **NX**: Only set if it doesn't exist.
      - **PX**: Auto-expire so the lock doesn't stay forever if the server crashes.
    `
  },
  {
    id: 'ai',
    title: '8. Redis in AI Infrastructure',
    category: 'AI',
    content: `
      Redis is becoming the **Central Nervous System** for AI:
      
      - **Vector Database**: Storing and searching LLM embeddings using KNN.
      - **LLM Cache**: Caching common AI responses to save API costs and latency.
      - **Agent Memory**: Fast short-term memory for AI agents to remember conversation context.
    `
  }
];
