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
      ### Baseline Health Check
      Redis is so fast because it works directly in RAM. Let's verify the connection speed.
    `,
    challenges: [
      {
        description: "Test the connection heartbeat. \n\n[SYNTAX]: `PING` \n[EXPECTED]: Server will respond with `PONG` in microseconds.",
        expectedCommand: "PING",
        hint: "Type PING"
      }
    ]
  },
  {
    id: 2,
    title: "Mission 2: Global API Rate Limiter",
    content: `
      ### Use Case: Brute-Force Protection
      Prevent attackers from guessing passwords by counting their attempts in RAM.
    `,
    challenges: [
      {
        description: "Initialize a counter for a user. Start with 1 attempt. \n\n[SYNTAX]: `SET key value` \n[GOAL]: Store '1' in 'login:user123'.",
        expectedCommand: "SET login:user123 1",
        hint: "Type: SET login:user123 1"
      },
      {
        description: "The user just tried again. Increment the counter atomically. \n\n[SYNTAX]: `INCR key` \n[GOAL]: Increment 'login:user123'.",
        expectedCommand: "INCR login:user123",
        hint: "Type: INCR login:user123"
      }
    ]
  },
  {
    id: 3,
    title: "Mission 3: Background Task Queue",
    content: `
      ### Use Case: Async Processing
      Offload heavy tasks (like sending emails) to a background queue.
    `,
    challenges: [
      {
        description: "Push a new 'welcome_email' task into the system queue. \n\n[SYNTAX]: `LPUSH list value` \n[GOAL]: Add 'email:send' to 'queue:email'.",
        expectedCommand: "LPUSH queue:email email:send",
        hint: "Type: LPUSH queue:email email:send"
      }
    ]
  },
  {
    id: 4,
    title: "Mission 4: High-Performance User Profiles",
    content: `
      ### Use Case: Fast Profile Retrieval
      Store user objects as Hashes to avoid expensive JSON parsing.
    `,
    challenges: [
      {
        description: "Create a profile. Set the 'name' to 'Arpit'. \n\n[SYNTAX]: `HSET key field value` \n[GOAL]: Set name in 'user:456'.",
        expectedCommand: "HSET user:456 name Arpit",
        hint: "Type: HSET user:456 name Arpit"
      },
      {
        description: "Update the user's status to 'Online'. \n\n[GOAL]: Set 'status' to 'online' in 'user:456'.",
        expectedCommand: "HSET user:456 status online",
        hint: "Type: HSET user:456 status online"
      }
    ]
  },
  {
    id: 5,
    title: "Mission 5: Unique Analytics Tracker",
    content: `
      ### Use Case: Real-time Unique Visitors
      Count unique users across your site without duplicates.
    `,
    challenges: [
      {
        description: "Track a visitor. If they return, Redis will ignore them. \n\n[SYNTAX]: `SADD set member` \n[GOAL]: Add 'user_a' to 'stats:unique'.",
        expectedCommand: "SADD stats:unique user_a",
        hint: "Type: SADD stats:unique user_a"
      }
    ]
  },
  {
    id: 6,
    title: "Mission 6: Tournament Leaderboard",
    content: `
      ### Use Case: Gaming Rankings
      Keep millions of players sorted by score in real-time.
    `,
    challenges: [
      {
        description: "Add a pro player to the board. \n\n[SYNTAX]: `ZADD set score member` \n[GOAL]: Add 'player1' with score 5000 to 'rankings'.",
        expectedCommand: "ZADD rankings 5000 player1",
        hint: "Type: ZADD rankings 5000 player1"
      }
    ]
  },
  {
    id: 7,
    title: "Mission 7: Memory Optimization Audit",
    content: `
      ### Internal Inspection
      Check how Redis is physically storing your data to optimize RAM usage.
    `,
    challenges: [
      {
        description: "Inspect the 'login:user123' counter. Is it an integer or a string? \n\n[SYNTAX]: `OBJECT ENCODING key` \n[GOAL]: Audit 'login:user123'.",
        expectedCommand: "OBJECT ENCODING login:user123",
        hint: "Type: OBJECT ENCODING login:user123"
      }
    ]
  },
  {
    id: 8,
    title: "Mission 8: Emergency Manual Backup",
    content: `
      ### Data Durability
      Even though Redis is in RAM, we must sometimes force a backup to disk.
    `,
    challenges: [
      {
        description: "Perform an immediate synchronous snapshot of the memory. \n\n[SYNTAX]: `SAVE` \n[GOAL]: Write memory to 'dump.rdb'.",
        expectedCommand: "SAVE",
        hint: "Type SAVE"
      }
    ]
  },
  {
    id: 9,
    title: "Mission 9: High Availability Audit",
    content: `
      ### Replication Monitoring
      Ensure your replicas are connected and syncing with the Master.
    `,
    challenges: [
      {
        description: "Check the replication health status. \n\n[SYNTAX]: `INFO replication` \n[GOAL]: Verify slave connections.",
        expectedCommand: "INFO replication",
        hint: "Type: INFO replication"
      }
    ]
  },
  {
    id: 10,
    title: "Mission 10: Failover Intelligence",
    content: `
      ### Redis Sentinel
      Query the 'Watchman' to find the current active master.
    `,
    challenges: [
      {
        description: "Ask Sentinel for the IP of the current master 'mymaster'. \n\n[SYNTAX]: `SENTINEL get-master-addr-by-name name` \n[GOAL]: Find the leader.",
        expectedCommand: "SENTINEL get-master-addr-by-name mymaster",
        hint: "Type: SENTINEL get-master-addr-by-name mymaster"
      }
    ]
  },
  {
    id: 11,
    title: "Mission 11: Cluster Sharding Topology",
    content: `
      ### Redis Cluster
      Horizontal scaling splits data across 16,384 slots. Let's see the map.
    `,
    challenges: [
      {
        description: "List the hash slot assignments for all nodes. \n\n[SYNTAX]: `CLUSTER SLOTS` \n[GOAL]: Map the data distribution.",
        expectedCommand: "CLUSTER SLOTS",
        hint: "Type: CLUSTER SLOTS"
      }
    ]
  },
  {
    id: 12,
    title: "Mission 12: Atomic Multi-Step Update",
    content: `
      ### Redis Transactions
      Execute a group of commands without anyone else interrupting.
    `,
    challenges: [
      {
        description: "Begin a transaction block. \n\n[SYNTAX]: `MULTI` \n[GOAL]: Put Redis in 'Queueing' mode.",
        expectedCommand: "MULTI",
        hint: "Type MULTI"
      }
    ]
  },
  {
    id: 13,
    title: "Mission 13: Real-time Event Logging",
    content: `
      ### Redis Streams
      Create an append-only log of every user action for auditing.
    `,
    challenges: [
      {
        description: "Log a login event for user 'arpit' into the stream. \n\n[SYNTAX]: `XADD key * field value` \n[GOAL]: Add to 'stream:auth'.",
        expectedCommand: "XADD stream:auth * user arpit",
        hint: "Type: XADD stream:auth * user arpit"
      }
    ]
  },
  {
    id: 14,
    title: "Mission 14: Resource Configuration",
    content: `
      ### Eviction Policies
      Control how Redis deletes data when the RAM is full.
    `,
    challenges: [
      {
        description: "Check the current memory ceiling. \n\n[SYNTAX]: `CONFIG GET maxmemory` \n[GOAL]: Audit RAM limits.",
        expectedCommand: "CONFIG GET maxmemory",
        hint: "Type: CONFIG GET maxmemory"
      }
    ]
  },
  {
    id: 15,
    title: "Mission 15: Module Discovery",
    content: `
      ### Advanced Extensions
      Discover loaded modules like Search or JSON.
    `,
    challenges: [
      {
        description: "List all active extensions in the server. \n\n[SYNTAX]: `MODULE LIST` \n[GOAL]: Identify extra capabilities.",
        expectedCommand: "MODULE LIST",
        hint: "Type: MODULE LIST"
      }
    ]
  }
];
