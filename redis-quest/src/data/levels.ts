export interface Challenge {
  description: string;
  expectedCommand: string;
  hint: string;
}

export interface Level {
  id: number;
  title: string;
  content: string;
  challenges: Challenge[];
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Mission 1: The Speed of Light",
    content: `
      ### Why is Redis so fast?
      Redis stores all data in **RAM**, not on disk. RAM access is measured in **nanoseconds**, while disk is measured in **milliseconds**.
      
      ### Core Architectural Pillar:
      **Single-Threaded Event Loop**: Redis uses one main thread to handle all commands. This avoids the overhead of **locks** and **context switching** found in multi-threaded databases.
    `,
    challenges: [
      {
        description: "Let's start by checking the heartbeat of the server. The `PING` command is used to test if a connection is still alive. \n\n[EXAMPLE]: Type `PING` and the server will respond with `PONG`.",
        expectedCommand: "PING",
        hint: "Just type PING in the terminal."
      }
    ]
  },
  {
    id: 2,
    title: "Mission 2: The String King (SDS)",
    content: `
      ### Strings & SDS
      Strings are the basic building blocks. Internally, Redis uses **SDS (Simple Dynamic Strings)**.
      
      ### Key Commands:
      - \`SET key value\`: Store data.
      - \`GET key\`: Retrieve data.
      - \`INCR key\`: Atomic increment for counters.
    `,
    challenges: [
      {
        description: "The `SET` command stores a value. Let's initialize a rate limit counter. \n\n[SYNTAX]: `SET key value` \n[EXAMPLE]: `SET mykey 10` \n\nGoal: Store '100' in a key named 'api:limit'.",
        expectedCommand: "SET api:limit 100",
        hint: "Type: SET api:limit 100"
      },
      {
        description: "The `INCR` command increases a number by 1 atomically. This is perfect for tracking API hits. \n\n[SYNTAX]: `INCR key` \n[EXAMPLE]: `INCR mycounter` \n\nGoal: Increment the 'api:limit' you just created.",
        expectedCommand: "INCR api:limit",
        hint: "Type: INCR api:limit"
      }
    ]
  },
  {
    id: 3,
    title: "Mission 3: The Task Queue (Lists)",
    content: `
      ### Redis Lists
      Lists are ordered collections. They are implemented as **QuickLists**.
      
      ### Use Case: Message Queues
      - \`LPUSH\`: Add to the front (Left).
      - \`RPUSH\`: Add to the back (Right).
    `,
    challenges: [
      {
        description: "Use `LPUSH` to add an item to the start of a list. This is how you build a 'First-In, Last-Out' stack or a queue. \n\n[SYNTAX]: `LPUSH listname value` \n[EXAMPLE]: `LPUSH tasks 'mow lawn'` \n\nGoal: Add 'job:1' to a list called 'work-queue'.",
        expectedCommand: "LPUSH work-queue job:1",
        hint: "Type: LPUSH work-queue job:1"
      }
    ]
  },
  {
    id: 4,
    title: "Mission 4: The Object Map (Hashes)",
    content: `
      ### Redis Hashes
      Hashes are maps between string fields and string values. Perfect for **Objects**.
    `,
    challenges: [
      {
        description: "Instead of storing a JSON string, use `HSET` to store individual fields. This is more memory-efficient. \n\n[SYNTAX]: `HSET key field value` \n[EXAMPLE]: `HSET car color red` \n\nGoal: Create a user hash 'user:101' with a field 'name' set to 'Arpit'.",
        expectedCommand: "HSET user:101 name Arpit",
        hint: "Type: HSET user:101 name Arpit"
      }
    ]
  },
  {
    id: 5,
    title: "Mission 5: Unique ID Lab (Sets)",
    content: `
      ### Redis Sets
      Sets are unordered collections of **unique** strings. No duplicates allowed!
    `,
    challenges: [
      {
        description: "The `SADD` command adds a member to a set. If the member already exists, Redis ignores it. \n\n[SYNTAX]: `SADD setname member` \n[EXAMPLE]: `SADD tags tech` \n\nGoal: Add 'user_a' to a set called 'unique_visitors'.",
        expectedCommand: "SADD unique_visitors user_a",
        hint: "Type: SADD unique_visitors user_a"
      }
    ]
  },
  {
    id: 6,
    title: "Mission 6: The Global Leaderboard (Sorted Sets)",
    content: `
      ### Sorted Sets (ZSet)
      Every member has a **Score**. Redis keeps them sorted by that score automatically.
    `,
    challenges: [
      {
        description: "Use `ZADD` to build a real-time leaderboard. The score comes before the member name. \n\n[SYNTAX]: `ZADD setname score member` \n[EXAMPLE]: `ZADD highscores 99 goku` \n\nGoal: Add 'player1' to 'leaderboard' with a score of '500'.",
        expectedCommand: "ZADD leaderboard 500 player1",
        hint: "Type: ZADD leaderboard 500 player1"
      }
    ]
  },
  {
    id: 7,
    title: "Mission 7: Under the Hood (Memory Architecture)",
    content: `
      ### The redisObject
      Every value is wrapped in a \`redisObject\` struct. 
    `,
    challenges: [
      {
        description: "Redis uses a custom string structure to avoid C string limitations. What is this structure called? \n\n[HINT]: Look at the 'Encoding' in X-Ray vision for a string. \n\nGoal: Type 'SDS' to confirm knowledge.",
        expectedCommand: "SDS",
        hint: "Type: SDS"
      }
    ]
  },
  {
    id: 8,
    title: "Mission 8: Persistence Shield (RDB & AOF)",
    content: `
      ### Data Safety
      Redis can save to disk using Snapshots (RDB) or Logs (AOF).
    `,
    challenges: [
      {
        description: "Which persistence method logs every single write operation to ensure zero data loss? \n\n[CHOICE]: RDB (Snapshots) or AOF (Append Only File). \n\nGoal: Type 'AOF' to proceed.",
        expectedCommand: "AOF",
        hint: "Type: AOF"
      }
    ]
  },
  {
    id: 9,
    title: "Mission 9: The Shadow Clone (Replication)",
    content: `
      ### Scaling Reads
      Master handles writes, Replicas handle reads.
    `,
    challenges: [
      {
        description: "Replicas are usually set to a specific mode to prevent data inconsistency. Are they 'Read-Only' or 'Writable'? \n\nGoal: Type 'Read-Only' if you think replicas should only be read from.",
        expectedCommand: "Read-Only",
        hint: "Type: Read-Only"
      }
    ]
  },
  {
    id: 10,
    title: "Mission 10: The Watchtower (Sentinel)",
    content: `
      ### Failover
      Sentinel promotes a Replica if the Master dies.
    `,
    challenges: [
      {
        description: "Sentinel needs a minimum number of 'votes' to decide a Master is dead. What is this count called? \n\n[HINT]: It starts with Q. \n\nGoal: Type 'Quorum'.",
        expectedCommand: "Quorum",
        hint: "Type: Quorum"
      }
    ]
  },
  {
    id: 11,
    title: "Mission 11: The Sharded Kingdom (Cluster)",
    content: `
      ### Hash Slots
      Redis Cluster uses slots to distribute data.
    `,
    challenges: [
      {
        description: "How many total hash slots does a Redis Cluster have? \n\n[HINT]: It's a fixed number used to map keys to nodes. \n\nGoal: Type '16384'.",
        expectedCommand: "16384",
        hint: "Type: 16384"
      }
    ]
  },
  {
    id: 12,
    title: "Mission 12: The Atomic Vault (Transactions)",
    content: `
      ### MULTI & EXEC
      Group commands to run them all at once without interruption.
    `,
    challenges: [
      {
        description: "Transactions in Redis are started with a specific keyword. It puts Redis into 'queueing' mode. \n\n[SYNTAX]: Type the command to start a transaction. \n\nGoal: Type 'MULTI'.",
        expectedCommand: "MULTI",
        hint: "Type: MULTI"
      }
    ]
  },
  {
    id: 13,
    title: "Mission 13: The Radio Tower (Pub/Sub & Streams)",
    content: `
      ### Messaging
      Use Pub/Sub for chats, Streams for event logs.
    `,
    challenges: [
      {
        description: "Which command is used to add a new message to a Stream? \n\n[SYNTAX]: `XADD stream_name * field value` \n\nGoal: Type 'XADD' to acknowledge.",
        expectedCommand: "XADD",
        hint: "Type: XADD"
      }
    ]
  },
  {
    id: 14,
    title: "Mission 14: The Librarian (Eviction & LRU)",
    content: `
      ### Memory Management
      What happens when RAM is full?
    `,
    challenges: [
      {
        description: "The most common eviction policy removes keys that haven't been used for the longest time. What is the 3-letter acronym for this? \n\nGoal: Type 'LRU'.",
        expectedCommand: "LRU",
        hint: "Type: LRU"
      }
    ]
  },
  {
    id: 15,
    title: "Mission 15: The Future (AI & Vectors)",
    content: `
      ### AI Embeddings
      Search for data by 'meaning' instead of exact keywords.
    `,
    challenges: [
      {
        description: "Redis uses an algorithm to find the closest vectors in a multi-dimensional space. What is this 3-letter algorithm called? \n\n[HINT]: K-Nearest Neighbors. \n\nGoal: Type 'KNN'.",
        expectedCommand: "KNN",
        hint: "Type: KNN"
      }
    ]
  }
];
