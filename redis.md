# Redis Learning Guide

## 1. What is Redis?

**Redis (Remote Dictionary Server)** is an **in-memory data structure store** used as:

* Database
* Cache
* Message broker
* Real-time data store

Unlike traditional databases that store data on disk, Redis stores data **in RAM**, making it **extremely fast (microseconds latency).**

Typical use cases:

* API caching
* session storage
* pub/sub messaging
* leaderboards
* rate limiting
* job queues

---

# 2. Why Redis is Fast

Redis is fast because:

1. Data is stored **in memory (RAM)**
2. Uses **single-threaded event loop**
3. Uses **efficient data structures**
4. Minimal disk access

Typical latency:

* ~1 millisecond or less

---

# 3. Installing Redis

### Ubuntu

```bash
sudo apt update
sudo apt install redis-server
```

Start Redis

```bash
redis-server
```

Test Redis

```bash
redis-cli ping
```

Output:

```
PONG
```

---

# 4. Redis Architecture

Redis works as a **client-server model**.

```
Application
     |
     v
Redis Client
     |
     v
Redis Server (In Memory)
```

Multiple applications can connect to the same Redis server.

---

# 5. Redis Data Types

Redis is not just key-value.

It supports multiple data structures.

| Type        | Description             |
| ----------- | ----------------------- |
| String      | Basic key value         |
| List        | Ordered collection      |
| Set         | Unique unordered values |
| Sorted Set  | Ordered by score        |
| Hash        | Object-like structure   |
| Stream      | Event stream            |
| Bitmap      | Bit-level storage       |
| HyperLogLog | Approximate counting    |

---

# 6. Redis Keys

All Redis data is stored as:

```
key -> value
```

Example

```
user:1:name -> "Arpit"
```

Keys are typically **namespaced**.

Example:

```
user:1001
session:token
cart:45
```

---

# 7. Redis String Commands

Strings are the **most basic Redis data type**.

### Set value

```
SET name "Arpit"
```

### Get value

```
GET name
```

### Delete key

```
DEL name
```

### Check if key exists

```
EXISTS name
```

### Increment

```
INCR counter
```

### Decrement

```
DECR counter
```

Example

```
SET visits 1
INCR visits
```

---

# 8. Expiring Keys (TTL)

Redis allows automatic expiration.

Example:

```
SET session:123 "user_data"
EXPIRE session:123 60
```

This key will expire in **60 seconds**.

Check TTL

```
TTL session:123
```

---

# 9. Redis Lists

Lists are ordered collections.

Example use cases:

* message queues
* activity logs

### Add to left

```
LPUSH tasks "task1"
```

### Add to right

```
RPUSH tasks "task2"
```

### View list

```
LRANGE tasks 0 -1
```

### Pop element

```
LPOP tasks
```

---

# 10. Redis Sets

Sets store **unique values**.

Example:

```
SADD users "arpit"
SADD users "rahul"
```

View members:

```
SMEMBERS users
```

Check membership:

```
SISMEMBER users "arpit"
```

---

# 11. Redis Hashes

Hashes store **objects**.

Example:

```
HSET user:1 name "Arpit"
HSET user:1 age 22
```

Get all fields:

```
HGETALL user:1
```

Get specific field:

```
HGET user:1 name
```

---

# 12. Redis Sorted Sets

Sorted sets store data with a **score**.

Example leaderboard.

```
ZADD leaderboard 100 arpit
ZADD leaderboard 80 rahul
```

View leaderboard:

```
ZRANGE leaderboard 0 -1 WITHSCORES
```

Top score:

```
ZREVRANGE leaderboard 0 2 WITHSCORES
```

---

# 13. Redis Pub/Sub

Redis supports messaging.

Publisher:

```
PUBLISH chat "hello"
```

Subscriber:

```
SUBSCRIBE chat
```

Used for:

* live notifications
* chat systems
* event systems

---

# 14. Redis Persistence

Although Redis is in-memory, it supports persistence.

### RDB (Snapshot)

Saves snapshots periodically.

### AOF (Append Only File)

Logs every write operation.

---

# 15. Redis Use Cases

### Caching

Example:

```
GET user_profile
```

If not found:

```
Fetch from database
Store in Redis
```

---

### Rate Limiting

```
INCR api:requests:user1
EXPIRE api:requests:user1 60
```

---

### Session Store

```
SET session:abc user123 EX 3600
```

---

### Queue System

```
LPUSH queue job1
BRPOP queue
```

---

# 16. Redis with Python

Install library

```
pip install redis
```

Example:

```python
import redis

r = redis.Redis(host='localhost', port=6379)

r.set("name", "Arpit")
print(r.get("name"))
```

---

# 17. Redis with Node.js

Install

```
npm install redis
```

Example:

```javascript
import { createClient } from "redis";

const client = createClient();

await client.connect();

await client.set("name", "Arpit");

const value = await client.get("name");

console.log(value);
```

---

# 18. Redis Interview Level Concepts

Important concepts:

* Redis eviction policies
* Redis clustering
* Redis replication
* Redis transactions
* Redis pipelines
* Redis Lua scripting
* Redis streams

---

# 19. Real World System Example

Example architecture:

```
User Request
      |
      v
API Server
      |
      +------ Redis Cache
      |
      +------ Database
```

Flow:

1. Check Redis
2. If cache miss -> fetch DB
3. Store in Redis
4. Return response

---

# 20. What to Learn Next

After basics:

1. Redis caching patterns
2. Redis streams
3. Redis cluster
4. Redis pub/sub systems
5. Redis rate limiting
6. Redis distributed locks
7. Redis for real-time analytics

---

# End of Redis Basics

```
```


# Redis Deep Dive — Part 1

# Redis Internal Architecture

Understanding Redis architecture is the **key difference between a Redis user and a Redis engineer.**

---

# 1. High Level Redis Architecture

Redis follows a **single-process event-driven architecture**.

```
Client
   |
   v
TCP Connection
   |
   v
Redis Event Loop
   |
   +---- Command Parser
   |
   +---- In-Memory Data Store
   |
   +---- Persistence Engine
```

Redis handles **thousands of clients concurrently using a single thread**.

---

# 2. Why Redis Uses Single Thread

Most people assume:

> Single thread = slow

But Redis proves the opposite.

Reasons:

### 1. No Locking

Multi-threaded systems require:

* mutex
* locks
* context switching

Redis avoids all of that.

```
Thread A -> lock key
Thread B -> wait
Thread C -> wait
```

Redis avoids this entire problem.

---

### 2. CPU Cache Friendly

A single thread means:

* better CPU cache locality
* fewer context switches

This dramatically improves speed.

---

### 3. Network Bottleneck

In most cases Redis performance is limited by:

```
network I/O
```

not CPU.

So multi-threading wouldn't improve much.

---

# 3. Redis Event Loop

Redis uses a **non-blocking event loop** similar to:

* Node.js
* Nginx

It is built on **epoll / kqueue / select** depending on OS.

### Event loop workflow

```
while(server_running):

    check_new_connections()

    read_client_requests()

    execute_commands()

    write_responses()
```

This allows Redis to handle **100k+ connections**.

---

# 4. Redis Request Lifecycle

Let's trace a real request.

Client command:

```
SET user:1 "Arpit"
```

Flow inside Redis:

```
Client
  |
TCP packet
  |
Socket
  |
Event Loop
  |
Command Parser
  |
Command Execution
  |
Memory Store
  |
Response
```

---

# 5. Redis Memory Store

All Redis data is stored in RAM.

Internally Redis uses optimized data structures.

Examples:

| Redis Type | Internal Structure          |
| ---------- | --------------------------- |
| String     | SDS (Simple Dynamic String) |
| List       | QuickList                   |
| Hash       | HashTable                   |
| Set        | HashTable                   |
| Sorted Set | Skip List                   |

---

# 6. Simple Dynamic Strings (SDS)

Redis does **NOT use normal C strings**.

Normal C string:

```
char *str
```

Problems:

* requires scanning for length
* buffer overflow risk

Redis uses:

```
struct SDS {
    len
    free
    buf[]
}
```

Example:

```
len = 5
free = 10
buf = "hello"
```

Advantages:

* O(1) length lookup
* safe memory
* efficient resizing

---

# 7. Redis Object Model

Every value stored in Redis is wrapped in a Redis object.

```
redisObject
    |
    +---- type
    +---- encoding
    +---- reference count
    +---- pointer to data
```

Example:

```
SET name "arpit"
```

Redis creates:

```
redisObject(type=string)
```

---

# 8. Redis Command Execution

Every Redis command maps to a C function.

Example:

```
SET key value
```

calls:

```
setCommand()
```

Similarly:

```
GET key
```

calls:

```
getCommand()
```

Commands execute **atomically** because Redis is single threaded.

Meaning:

```
no two commands execute at same time
```

---

# 9. Redis Networking Layer

Redis communicates via **RESP protocol**

RESP = Redis Serialization Protocol

Example request:

```
*3
$3
SET
$4
name
$5
arpit
```

Response:

```
+OK
```

RESP supports:

* strings
* integers
* arrays
* errors
* bulk strings

---

# 10. Redis Performance

Typical performance:

| Operation | Speed         |
| --------- | ------------- |
| GET       | ~100k ops/sec |
| SET       | ~100k ops/sec |
| Pipeline  | ~1M ops/sec   |

Latency:

```
~1 ms
```

---

# 11. Redis Memory Allocation

Redis manages memory using:

```
jemalloc
```

This helps:

* reduce fragmentation
* faster allocation
* stable performance

---

# 12. Redis Command Table

Internally Redis keeps a **command lookup table**.

Example:

```
SET -> setCommand
GET -> getCommand
INCR -> incrCommand
```

This allows **O(1) command lookup**.

---

# 13. Redis Key Space

All keys exist inside the **keyspace dictionary**.

```
keyspace = {
   "user:1": object,
   "session:22": object,
   "counter": object
}
```

Internally implemented using:

```
Hash Table
```

So lookup is:

```
O(1)
```

---

# 14. Why Redis Is Extremely Fast

Redis performance comes from:

1. In-memory storage
2. Single-threaded execution
3. Efficient data structures
4. Event-driven networking
5. Minimal overhead

---

# Key Takeaway

Redis is essentially:

```
An in-memory data structure engine
running on an event-driven single-threaded server
optimized for extremely fast operations.
```

---

# Next Topic

Redis Deep Dive — Part 2

We will study:

1. Redis Data Structures Internals
2. Skip Lists
3. QuickLists
4. HashTable rehashing
5. Sorted set implementation
6. Memory optimizations

This is where Redis becomes **really interesting**.


# Redis Deep Dive — Part 2

# Redis Data Structures Internals

Redis is extremely fast not just because it uses RAM, but because it uses **very carefully engineered internal data structures**.

Each Redis data type is implemented using **specialized optimized structures**.

---

# 1. Redis Data Structure Overview

| Redis Type | Internal Implementation     |
| ---------- | --------------------------- |
| String     | SDS (Simple Dynamic String) |
| List       | QuickList                   |
| Set        | Hash Table                  |
| Hash       | Hash Table / Ziplist        |
| Sorted Set | Skip List + Hash Table      |
| Streams    | Radix Tree + Listpack       |

Redis dynamically changes internal structures based on **size and usage**.

This is called:

```text
ENCODING OPTIMIZATION
```

---

# 2. Redis Strings (SDS)

Redis strings use **SDS — Simple Dynamic Strings**.

### Why not normal C strings?

C strings:

```c
char *str
```

Problems:

1. Length requires O(n)
2. Buffer overflow risks
3. Memory inefficiency

---

### SDS Structure

```text
struct sdshdr {
    int len
    int free
    char buf[]
}
```

Example:

```text
len = 5
free = 10
buf = "hello"
```

Advantages:

* O(1) length lookup
* binary safe
* dynamic resizing
* prevents buffer overflow

---

# 3. Redis Lists — QuickList

Redis originally used:

```text
Linked List
```

But linked lists waste memory.

Then Redis introduced:

```text
Ziplist
```

But ziplists had performance issues.

Modern Redis uses:

```text
QuickList
```

---

### QuickList Structure

A QuickList is:

```text
LinkedList of Ziplists
```

Diagram:

```text
QuickList

Node -> Ziplist -> elements
Node -> Ziplist -> elements
Node -> Ziplist -> elements
```

Example:

```text
tasks = ["task1","task2","task3"]
```

Internally:

```text
Node1 -> [task1 task2 task3]
```

---

### Why QuickList is Efficient

Advantages:

1. Reduced pointer overhead
2. Better cache locality
3. Faster traversal
4. Lower memory usage

---

# 4. Redis Hash Tables

Used for:

* Sets
* Hashes
* Keyspace dictionary

Redis hash table structure:

```text
dict
   |
   +-- hash table
   +-- size
   +-- used slots
```

Each entry:

```text
dictEntry
    |
    +-- key
    +-- value
    +-- next (collision chain)
```

---

### Collision Handling

Redis uses:

```text
Separate chaining
```

Example:

```text
hash(key) -> bucket

bucket -> entry -> entry -> entry
```

---

# 5. Incremental Rehashing

When a hash table grows, Redis must rehash.

Normal systems:

```text
rehash everything at once
```

This causes:

```text
latency spikes
```

Redis solution:

```text
INCREMENTAL REHASHING
```

---

### How It Works

Redis keeps **two hash tables temporarily**.

```text
ht[0] -> old table
ht[1] -> new table
```

Rehashing happens gradually.

Each command moves some keys.

Example:

```text
SET key1
→ move few entries
```

Result:

```text
no long blocking operations
```

---

# 6. Redis Sets

Sets internally use:

```text
Hash Table
```

Example:

```text
SADD users arpit
```

Stored internally as:

```text
users -> hash table
```

Lookup:

```text
SISMEMBER users arpit
```

Complexity:

```text
O(1)
```

---

# 7. Redis Sorted Sets (ZSET)

Sorted sets are one of Redis's **most powerful structures**.

Example:

```text
ZADD leaderboard 100 arpit
```

Internally Redis uses **two structures**.

```text
Hash Table
+
Skip List
```

---

### Why Two Structures?

Hash Table:

```text
member -> score
```

Skip List:

```text
sorted by score
```

This enables:

* fast lookup
* fast ranking
* fast range queries

---

# 8. Skip Lists

Skip lists are an alternative to balanced trees.

Structure:

```text
Layer 3:      --------> 100
Layer 2:  ----> 50 ----> 100
Layer 1:  10 -> 20 -> 50 -> 70 -> 100
```

Search complexity:

```text
O(log n)
```

Advantages over trees:

* simpler implementation
* good performance
* easier concurrency (though Redis is single threaded)

---

# 9. Redis Hashes

Hashes store objects.

Example:

```text
HSET user:1 name Arpit
HSET user:1 age 22
```

Internally Redis may use:

```text
Ziplist / Listpack
```

for small hashes.

Example internal storage:

```text
[name, Arpit, age, 22]
```

Advantages:

* compact memory usage
* faster for small objects

If hash grows large:

```text
convert to hash table
```

---

# 10. Redis Memory Optimization

Redis automatically changes encoding.

Example:

Small hash:

```text
Ziplist
```

Large hash:

```text
HashTable
```

Small sorted set:

```text
Ziplist
```

Large sorted set:

```text
SkipList
```

This optimization dramatically reduces memory.

---

# 11. Redis Streams (Brief)

Redis Streams are used for:

* event logs
* messaging
* Kafka-like workloads

Internally streams use:

```text
Radix Tree
+
Listpack
```

Radix tree helps with:

```text
ordered message storage
```

---

# 12. Time Complexity of Redis Operations

| Operation | Complexity   |
| --------- | ------------ |
| GET       | O(1)         |
| SET       | O(1)         |
| LPUSH     | O(1)         |
| SADD      | O(1)         |
| ZADD      | O(log N)     |
| ZRANGE    | O(log N + M) |

---

# Key Insight

Redis is not just:

```text
Key → Value
```

It is actually:

```text
Key → Optimized Data Structure
```

Which is why Redis can power:

* real time analytics
* leaderboards
* message queues
* rate limiting
* caching

---

# Next Topic

Redis Deep Dive — Part 3

We will cover **Redis Persistence**.

1. RDB Snapshots
2. AOF (Append Only File)
3. Hybrid persistence
4. Crash recovery
5. Disk I/O optimization
6. fsync policies

This is where Redis becomes a **real database**.


# Redis Deep Dive — Part 3

# Redis Persistence

Redis is an **in-memory database**, meaning all data is stored in RAM.

But RAM is **volatile**.

If the server crashes:

```text
all memory is lost
```

To solve this, Redis provides **persistence mechanisms** that save data to disk.

Redis supports three persistence approaches:

| Method | Description                  |
| ------ | ---------------------------- |
| RDB    | Periodic snapshots           |
| AOF    | Log of every write operation |
| Hybrid | Combination of RDB + AOF     |

---

# 1. RDB Persistence (Snapshotting)

RDB stands for:

```text
Redis Database Snapshot
```

Redis periodically saves the entire dataset to disk.

Example file:

```text
dump.rdb
```

---

## How RDB Works

Redis performs a **point-in-time snapshot** of memory.

Flow:

```text
Redis Memory
     |
     v
fork()
     |
     v
Child Process
     |
     v
Write snapshot to disk
```

Important:

```text
The main Redis process continues serving requests
```

So Redis **does not block**.

---

## Fork Mechanism

When snapshotting begins:

```text
fork()
```

creates a child process.

Memory uses:

```text
Copy-On-Write (COW)
```

Meaning:

* parent and child share memory pages
* only modified pages are copied

This makes snapshotting **very efficient**.

---

## RDB Configuration

In `redis.conf`:

```text
save 900 1
save 300 10
save 60 10000
```

Meaning:

| Condition               | Snapshot |
| ----------------------- | -------- |
| 1 change in 900 sec     | Save     |
| 10 changes in 300 sec   | Save     |
| 10000 changes in 60 sec | Save     |

---

## Advantages of RDB

* Very fast recovery
* Compact file
* Minimal runtime overhead
* Good for backups

---

## Disadvantages of RDB

Data loss window.

Example:

```text
snapshot every 5 minutes
```

If Redis crashes:

```text
last 5 minutes of data may be lost
```

---

# 2. AOF Persistence (Append Only File)

AOF logs **every write command**.

Example file:

```text
appendonly.aof
```

Instead of storing data snapshots, Redis stores **operations**.

Example commands:

```text
SET user:1 "Arpit"
INCR visits
LPUSH tasks task1
```

These commands are appended to the AOF file.

---

## AOF Workflow

```text
Client Command
      |
      v
Execute in Redis
      |
      v
Append command to AOF file
```

On restart:

```text
Redis replays the commands
```

to rebuild memory.

---

## Example AOF File

```text
SET name "arpit"
SET age 22
INCR visits
LPUSH tasks "task1"
```

Redis replays them sequentially.

---

# 3. AOF fsync Policies

Disk writes are expensive.

Redis allows control over durability vs performance.

Configuration:

```text
appendfsync always
appendfsync everysec
appendfsync no
```

---

## Always

```text
appendfsync always
```

Behavior:

* sync to disk after every command

Pros:

* safest

Cons:

* slow

---

## Every Second (Recommended)

```text
appendfsync everysec
```

Behavior:

* fsync every second

Pros:

* good durability
* good performance

Data loss risk:

```text
~1 second
```

---

## No

```text
appendfsync no
```

Behavior:

* OS decides when to flush

Pros:

* fastest

Cons:

* risk of data loss

---

# 4. AOF Rewrite (Log Compaction)

Over time AOF grows large.

Example:

```text
INCR counter
INCR counter
INCR counter
```

AOF might contain:

```text
SET counter 1
INCR counter
INCR counter
INCR counter
```

But the final value is:

```text
counter = 4
```

So Redis rewrites the log.

---

## AOF Rewrite Process

Redis generates a **new compact AOF**.

Example rewritten file:

```text
SET counter 4
```

This process:

```text
does not block Redis
```

because it uses **background rewrite**.

---

# 5. Hybrid Persistence (Best Option)

Modern Redis uses:

```text
RDB + AOF
```

Hybrid AOF file structure:

```text
[RDB snapshot]
[recent commands]
```

Benefits:

* fast startup
* minimal data loss
* smaller files

---

# 6. Redis Crash Recovery

On restart Redis loads data.

Startup process:

```text
Check AOF
    |
    |-- exists → load AOF
    |
    |-- else → load RDB
```

AOF has priority because:

```text
it is more durable
```

---

# 7. Persistence Tradeoffs

| Feature        | RDB   | AOF    |
| -------------- | ----- | ------ |
| Recovery speed | Fast  | Slower |
| File size      | Small | Large  |
| Durability     | Lower | Higher |
| CPU overhead   | Low   | Higher |

---

# 8. When to Use Each

### RDB Only

Use when:

* Redis used mainly as cache
* backups needed
* fast restart required

---

### AOF

Use when:

* Redis used as primary DB
* minimal data loss required

---

### Hybrid (Recommended)

Use when:

```text
Redis powers production systems
```

---

# 9. Example Production Config

Typical production Redis config:

```text
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

---

# Key Insight

Redis persistence is based on two ideas:

```text
Snapshots
+
Operation Logs
```

Exactly the same concepts used in:

* databases
* distributed systems
* Kafka
* event sourcing systems

---

# Next Topic

Redis Deep Dive — Part 4

We will cover:

1. Redis Replication
2. Master–Replica architecture
3. Partial resynchronization
4. Replication backlog
5. Failover

This is where Redis becomes a **distributed system**.


# Redis Deep Dive — Part 4

# Redis Replication & High Availability

Redis replication allows **multiple Redis servers to synchronize data**.

This enables:

* high availability
* read scaling
* backup nodes
* failover systems

---

# 1. Redis Replication Architecture

Redis replication uses a **master–replica architecture**.

Diagram:

```text id="xrr63y"
          Clients
             |
             v
          MASTER
         (writes)
        /       \
       v         v
   REPLICA1   REPLICA2
   (reads)     (reads)
```

Rules:

* **Writes go to master**
* **Replicas copy master data**
* Replicas are usually **read-only**

---

# 2. Setting Up Replication

To make a Redis server a replica:

```text id="upk85p"
replicaof <master-ip> <port>
```

Example:

```text id="zqk3pe"
replicaof 192.168.1.10 6379
```

Now the replica will start syncing with the master.

---

# 3. Initial Synchronization

When a replica connects to a master:

Steps:

```text id="ut6d1d"
1. Replica connects to master
2. Replica sends SYNC request
3. Master generates RDB snapshot
4. Snapshot sent to replica
5. Replica loads snapshot
6. Live commands streamed
```

Diagram:

```text id="hmvmzw"
MASTER MEMORY
     |
     v
Generate RDB Snapshot
     |
     v
Send to Replica
     |
     v
Replica loads snapshot
```

This is called:

```text id="x6g8zj"
FULL RESYNCHRONIZATION
```

---

# 4. Continuous Replication

After sync, replication becomes **stream-based**.

Every write command on master is sent to replicas.

Example:

Client command:

```text id="q8c6ha"
SET user:1 "arpit"
```

Master executes:

```text id="kqfr9u"
SET user:1 "arpit"
```

Then sends the same command to replicas.

---

# 5. Replication Backlog

Network failures may interrupt replication.

Example:

```text id="ej5tf1"
Replica disconnects for 5 seconds
```

Instead of full sync, Redis uses:

```text id="j0xklq"
PARTIAL RESYNC
```

Redis maintains a **replication backlog buffer**.

Structure:

```text id="1wtb0o"
Master
   |
Replication Buffer
   |
Recent Commands
```

If replica reconnects quickly:

```text id="a1m3v7"
only missing commands are sent
```

This is much faster.

---

# 6. Replication IDs

Each Redis master has:

```text id="h6ogv2"
Replication ID
```

Example:

```text id="t2sve9"
replication_id = abc123
```

Replica tracks:

```text id="0shsxb"
replication offset
```

Example:

```text id="oqv9x1"
offset = 452000
```

When reconnecting:

```text id="m31b4v"
send missing commands from offset
```

---

# 7. Asynchronous Replication

Redis replication is **asynchronous**.

Meaning:

```text id="4h23yq"
master does not wait for replicas
```

Example flow:

```text id="g3n51d"
Client → Master write
Master executes immediately
Master later sends update to replicas
```

Pros:

* very fast writes

Cons:

```text id="0or02b"
replicas may lag behind
```

---

# 8. Read Scaling

Because replicas hold full copies of data:

They can serve **read traffic**.

Architecture:

```text id="t1vt1c"
Clients
   |
   +---- Master (writes)
   |
   +---- Replica1 (reads)
   |
   +---- Replica2 (reads)
```

Benefits:

* reduces load on master
* improves scalability

---

# 9. Redis Failover Problem

If the master crashes:

```text id="9ieybn"
system becomes unavailable
```

Because:

* replicas are read-only
* no automatic promotion

This problem is solved by:

```text id="6av36a"
Redis Sentinel
```

or

```text id="h9v45j"
Redis Cluster
```

---

# 10. Redis Sentinel

Sentinel provides **automatic failover**.

Responsibilities:

```text id="yw4xyv"
1. Monitor Redis nodes
2. Detect failures
3. Promote replicas
4. Notify clients
```

Architecture:

```text id="5f5k2f"
        Sentinel
        Sentinel
        Sentinel
            |
            v
         MASTER
        /      \
       v        v
   REPLICA   REPLICA
```

---

# 11. Failover Process

If master crashes:

Steps:

```text id="fx6u8h"
1. Sentinel detects failure
2. Sentinels vote
3. One replica promoted to master
4. Other replicas sync to new master
5. Clients reconnect
```

Diagram:

```text id="4aw35y"
Old Master (DOWN)

Replica1 → Promoted to Master

Replica2 → Becomes Replica of Replica1
```

---

# 12. Sentinel Quorum

To prevent false failovers:

Multiple sentinels must agree.

Example:

```text id="zpnjlj"
quorum = 3
```

At least **3 sentinels must detect failure**.

---

# 13. Replication Latency

Replication delay depends on:

* network latency
* replication backlog size
* write throughput

Typical delay:

```text id="92ywpa"
milliseconds
```

---

# 14. Redis Replication Limitations

Important limitations:

### No strong consistency

Because replication is async.

Example:

```text id="5x8q6c"
write success on master
replica still outdated
```

---

### Writes only on master

Redis does not support:

```text id="m2ppro"
multi-master replication
```

(Except with special setups.)

---

# 15. Production Redis Architecture

Typical production architecture:

```text id="j4ps9e"
           Clients
              |
              v
           Master
          /      \
         v        v
     Replica1   Replica2
          |
      Sentinel Cluster
```

---

# Key Insight

Redis replication works by **streaming commands from master to replicas**.

Key principles:

```text id="g0i8w0"
Snapshot + Command Stream
```

Exactly the same idea used in:

* MySQL replication
* Kafka log replication
* event sourcing systems

---

# Next Topic

Redis Deep Dive — Part 5

We will study **Redis Cluster (Sharding)**.

Topics:

1. Horizontal scaling
2. Hash slots
3. Key distribution
4. Cluster communication
5. Resharding
6. Gossip protocol

This is the **real large-scale Redis architecture used by companies**.


# Redis Deep Dive — Part 5

# Redis Cluster (Horizontal Scaling)

A single Redis instance has limits:

* limited RAM
* limited CPU
* single machine failure risk

To scale beyond one machine, Redis uses **Redis Cluster**.

Cluster enables:

```text
Horizontal scaling
+
High availability
+
Automatic sharding
```

---

# 1. What is Sharding?

Sharding means **splitting data across multiple servers**.

Example:

```text
User Data
```

Instead of storing everything on one server:

```text
Server1 → users 1–1M
Server2 → users 1M–2M
Server3 → users 2M–3M
```

Each server stores **a subset of data**.

---

# 2. Redis Cluster Architecture

Redis Cluster divides data across nodes.

Example cluster:

```text
         Client
           |
           v
   +----------------+
   | Redis Cluster  |
   +----------------+
      |    |    |
      v    v    v
    Node1 Node2 Node3
```

Each node stores **different keys**.

---

# 3. Hash Slots (Core Idea)

Redis Cluster does not shard by key ranges.

Instead it uses **hash slots**.

Total slots:

```text
16384 hash slots
```

Every key maps to **one slot**.

Example:

```text
hash(key) % 16384 = slot
```

---

# 4. Slot Distribution

Example cluster:

```text
Node1 → slots 0–5000
Node2 → slots 5001–10000
Node3 → slots 10001–16383
```

Key routing:

```text
SET user:1
```

Compute:

```text
CRC16("user:1") % 16384
```

Example result:

```text
slot = 7342
```

Stored on:

```text
Node2
```

---

# 5. Client Routing

Redis clients must know the cluster topology.

Workflow:

```text
Client → any node
Node → responds with correct node
Client → sends request to correct node
```

Example response:

```text
MOVED 7342 192.168.1.20:6379
```

Meaning:

```text
slot 7342 is on another node
```

Client retries request.

---

# 6. Cluster Node Communication

Cluster nodes communicate using a **gossip protocol**.

Nodes periodically exchange information:

```text
node health
slot ownership
replication state
cluster topology
```

Example communication:

```text
PING
PONG
FAIL
MEET
```

This keeps the cluster **synchronized**.

---

# 7. Master and Replica Nodes

Each master node can have replicas.

Example cluster:

```text
Master1 → Replica1
Master2 → Replica2
Master3 → Replica3
```

Diagram:

```text
         Master1
           |
        Replica1

         Master2
           |
        Replica2

         Master3
           |
        Replica3
```

Replicas provide **failover support**.

---

# 8. Automatic Failover

If a master node fails:

```text
Replica promoted → new master
```

Process:

```text
1. Cluster detects failure
2. Replicas vote
3. One replica promoted
4. Slots reassigned
```

Example:

```text
Master2 crashes
Replica2 becomes Master2
```

Cluster continues operating.

---

# 9. Resharding (Moving Data)

When new nodes are added:

```text
cluster reshard
```

Slots are redistributed.

Example:

Before:

```text
Node1 → 8000 slots
Node2 → 8000 slots
```

After adding Node3:

```text
Node1 → 5500
Node2 → 5500
Node3 → 5500
```

Redis migrates keys gradually.

---

# 10. Hash Tags

Sometimes multiple keys must be on the same node.

Example:

```text
user:1
user:1:orders
user:1:cart
```

Use **hash tags**.

Example:

```text
{user1}:profile
{user1}:orders
{user1}:cart
```

Redis hashes only:

```text
user1
```

So all keys land on the **same slot**.

---

# 11. Multi-Key Operations Limitation

Cluster limitation:

Multi-key commands must use **same slot**.

Example invalid operation:

```text
MGET user:1 product:2
```

Because:

```text
different slots
```

Solution:

```text
hash tags
```

---

# 12. Cluster Failure Detection

Cluster nodes constantly check each other.

States:

```text
PFAIL → Possibly failing
FAIL → Confirmed failure
```

If enough nodes agree:

```text
node marked as FAIL
```

Failover begins.

---

# 13. Redis Cluster Characteristics

| Feature            | Redis Cluster |
| ------------------ | ------------- |
| Sharding           | Yes           |
| Automatic failover | Yes           |
| Replication        | Yes           |
| Horizontal scaling | Yes           |
| Consistency        | Eventual      |

---

# 14. Typical Production Redis Cluster

Example production setup:

```text
3 Master Nodes
3 Replica Nodes
```

Architecture:

```text
Master1 → Replica1
Master2 → Replica2
Master3 → Replica3
```

Total nodes:

```text
6 nodes
```

This provides:

* redundancy
* scaling
* fault tolerance

---

# 15. Redis Cluster Limitations

Important limitations:

### No multi-key cross slot transactions

Example:

```text
MSET key1 key2
```

Only allowed if:

```text
same slot
```

---

### Slightly higher latency

Because client may need:

```text
redirection
```

---

# Key Insight

Redis Cluster works using:

```text
Consistent hashing
+
Slot distribution
+
Gossip protocol
+
Replica failover
```

This design allows Redis to scale to **terabytes of data**.

---

# Next Topic

Redis Deep Dive — Part 6

We will cover **Redis Performance Engineering**.

Topics:

1. Redis pipelining
2. Redis transactions
3. Lua scripting
4. Redis memory eviction
5. LRU / LFU caching
6. Performance tuning

These are the techniques used by **high performance systems**.


# Redis Deep Dive — Part 6

# Redis Performance Engineering

Redis is already extremely fast, but with proper techniques it can handle:

```text
millions of operations per second
```

Key performance techniques:

1. Pipelining
2. Transactions
3. Lua scripting
4. Memory eviction policies
5. Efficient key design
6. Connection management

---

# 1. Redis Pipelining

Normally Redis processes commands sequentially.

Example without pipelining:

```text
Client → SET key1 value
wait response

Client → SET key2 value
wait response

Client → SET key3 value
wait response
```

Problem:

```text
network round-trip time (RTT)
```

dominates performance.

---

## Pipelining Concept

Pipelining allows sending **multiple commands without waiting for responses**.

Example:

```text
Client sends:

SET key1 value
SET key2 value
SET key3 value
SET key4 value
SET key5 value
```

Redis processes them sequentially but responses are returned together.

---

## Performance Impact

Without pipeline:

```text
100k ops/sec
```

With pipeline:

```text
1M+ ops/sec
```

Pipelining drastically reduces network overhead.

---

## Python Example

```python
import redis

r = redis.Redis()

pipe = r.pipeline()

pipe.set("key1", "value1")
pipe.set("key2", "value2")
pipe.set("key3", "value3")

pipe.execute()
```

---

# 2. Redis Transactions

Redis supports transactions using:

```text
MULTI
EXEC
```

Example:

```text
MULTI
SET balance 100
INCR visits
EXEC
```

All commands execute **atomically**.

Meaning:

```text
no other client can interleave commands
```

---

## Important Limitation

Redis transactions do **not support rollbacks**.

Example:

```text
MULTI
SET a 10
INVALID COMMAND
EXEC
```

Redis will execute valid commands and ignore invalid ones.

---

# 3. WATCH (Optimistic Locking)

Redis supports optimistic concurrency control.

Example:

```text
WATCH balance
```

If the key changes before transaction:

```text
EXEC fails
```

Example workflow:

```text
WATCH balance
GET balance

MULTI
SET balance new_value
EXEC
```

If another client modifies the key:

```text
EXEC → aborts
```

---

# 4. Lua Scripting

Redis allows running **Lua scripts inside the server**.

Benefits:

* atomic execution
* reduces network calls
* extremely fast

Example:

```lua
EVAL "
local current = redis.call('GET', KEYS[1])
if current then
    return redis.call('INCR', KEYS[1])
else
    return 0
end
" 1 counter
```

Redis executes the script **atomically**.

---

## Why Lua Scripts Are Powerful

Instead of:

```text
GET counter
INCR counter
```

You can run logic **inside Redis**.

This reduces:

```text
network latency
```

---

# 5. Redis Memory Eviction

When Redis memory is full:

```text
new writes fail
```

Unless eviction is enabled.

Configuration:

```text
maxmemory 2gb
maxmemory-policy allkeys-lru
```

---

# 6. Eviction Policies

Redis supports several eviction strategies.

| Policy          | Description                    |
| --------------- | ------------------------------ |
| noeviction      | return error                   |
| allkeys-lru     | remove least recently used key |
| volatile-lru    | remove LRU keys with TTL       |
| allkeys-random  | random key eviction            |
| volatile-random | random TTL key                 |
| allkeys-lfu     | least frequently used          |
| volatile-lfu    | LFU keys with TTL              |

---

## LRU (Least Recently Used)

Removes keys **not used recently**.

Example:

```text
cache:product:1
cache:product:2
cache:product:3
```

Least accessed key gets removed first.

---

## LFU (Least Frequently Used)

Removes keys accessed **least often**.

Example:

```text
productA accessed 100 times
productB accessed 2 times
```

Redis evicts:

```text
productB
```

---

# 7. Redis Key Design

Bad key design causes:

* memory waste
* slower lookups

Good pattern:

```text
object:id:field
```

Example:

```text
user:1001:name
user:1001:email
cart:1001:items
```

This improves:

* readability
* debugging
* maintenance

---

# 8. Redis Connection Management

Opening connections repeatedly is expensive.

Bad pattern:

```text
connect
command
disconnect
```

Correct approach:

```text
connection pool
```

Example:

```python
pool = redis.ConnectionPool(host='localhost', port=6379)
r = redis.Redis(connection_pool=pool)
```

---

# 9. Redis Hot Keys Problem

A **hot key** is accessed extremely frequently.

Example:

```text
GET homepage_cache
```

Millions of requests.

Problem:

```text
single node overload
```

Solutions:

```text
replication
client-side caching
key sharding
```

---

# 10. Redis Big Key Problem

Big keys contain too much data.

Example:

```text
SET huge_json 10MB
```

Problems:

* slow transfer
* memory spikes
* blocking operations

Solutions:

```text
split keys
use hashes
store references
```

---

# 11. Redis Latency Monitoring

Redis provides tools:

```text
LATENCY DOCTOR
```

Example:

```text
LATENCY LATEST
```

Shows:

* slow commands
* blocking operations

---

# 12. Redis Benchmarking

Testing Redis performance:

```text
redis-benchmark
```

Example:

```text
redis-benchmark -n 100000 -c 50
```

Parameters:

| Flag | Meaning            |
| ---- | ------------------ |
| -n   | total requests     |
| -c   | concurrent clients |

---

# Key Insight

Redis performance depends more on:

```text
network round trips
```

than raw CPU.

So the biggest optimizations are:

```text
pipelining
Lua scripting
efficient key design
```

---

# Next Topic

Redis Deep Dive — Part 7

We will explore **Redis Advanced Systems Use Cases**:

1. Distributed locks
2. Rate limiting
3. Message queues
4. Redis Streams
5. Leaderboards
6. Real-time analytics

These are the **actual production patterns used by large systems**.


# Redis Deep Dive — Part 7

# Redis System Design Patterns

Redis is often used as an **infrastructure component** rather than just a database.

Common production patterns:

1. Distributed Locks
2. Rate Limiting
3. Message Queues
4. Redis Streams
5. Leaderboards
6. Real-time analytics
7. Caching patterns

---

# 1. Distributed Locks

In distributed systems, multiple servers may try to access the same resource.

Example:

```text id="y11h21"
Server A → process order
Server B → process order
```

Without locking:

```text id="b3d1fe"
duplicate processing
```

Redis provides distributed locking.

---

## Basic Lock Implementation

Command:

```text id="kfgw2o"
SET lock_key value NX PX 30000
```

Meaning:

| Option | Meaning                        |
| ------ | ------------------------------ |
| NX     | only set if key does not exist |
| PX     | expiration time                |

Example:

```text id="35ybcr"
SET order_lock "serverA" NX PX 10000
```

If successful:

```text id="mnv8yt"
lock acquired
```

---

## Unlocking Safely

Unlock using Lua script:

```lua id="ztwypp"
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
```

This ensures **only the lock owner releases it**.

---

# 2. Rate Limiting

Used to prevent API abuse.

Example:

```text id="7sqbbi"
100 requests per minute per user
```

---

## Simple Rate Limiter

```text id="1ry0d9"
INCR api:user123
EXPIRE api:user123 60
```

Workflow:

```text id="l0n4p5"
if count > 100 → block request
```

---

## Sliding Window Rate Limiter

More precise rate limiting.

Example:

```text id="ix9rqm"
ZADD requests timestamp request_id
ZREMRANGEBYSCORE requests 0 old_timestamp
ZCARD requests
```

Redis sorted sets store request timestamps.

---

# 3. Message Queue

Redis can function as a **lightweight message broker**.

Example:

```text id="glv4la"
LPUSH jobs job1
```

Worker:

```text id="8h2m1p"
BRPOP jobs
```

Flow:

```text id="3eulz4"
Producer → Redis Queue → Worker
```

---

## Queue Architecture

```text id="kigxgj"
Producer
   |
   v
Redis List
   |
   v
Worker1
Worker2
Worker3
```

Multiple workers can process jobs.

---

# 4. Redis Streams (Kafka-like)

Streams support **event streaming systems**.

Example:

```text id="42u82r"
XADD events * user_id 100 action login
```

Stored as:

```text id="2n10sv"
event_id → fields
```

Example event:

```text id="d35yqr"
1678200000-0
user_id = 100
action = login
```

---

## Consumer Groups

Streams support **multiple consumers**.

Example:

```text id="ypikod"
XGROUP CREATE events group1 0
```

Consumers read:

```text id="n81s2c"
XREADGROUP GROUP group1 consumer1 COUNT 1 STREAMS events >
```

Benefits:

* parallel processing
* reliable delivery
* event replay

---

# 5. Leaderboards

Redis sorted sets power **leaderboards**.

Example:

```text id="d61zyx"
ZADD leaderboard 100 userA
ZADD leaderboard 200 userB
```

Top players:

```text id="ldp9y1"
ZREVRANGE leaderboard 0 9 WITHSCORES
```

Player rank:

```text id="hjndpf"
ZRANK leaderboard userA
```

Used in:

* gaming
* ranking systems
* analytics

---

# 6. Real-Time Analytics

Redis can track real-time metrics.

Example:

```text id="sbw2u4"
INCR page_views
```

Or per user:

```text id="fj41hs"
INCR page_views:user123
```

Time-based metrics:

```text id="g6vnsb"
pageviews:2026-03-17
```

---

# 7. Caching Patterns

Redis is commonly used as a **cache layer**.

Architecture:

```text id="xq83ca"
Client
   |
   v
Redis Cache
   |
   v
Database
```

---

## Cache Aside Pattern

Flow:

```text id="dxy9ia"
1. Check Redis
2. If miss → query DB
3. Store result in Redis
4. Return response
```

Example:

```text id="d0ewc2"
GET user:1
```

If missing:

```text id="txnb4q"
query database
SET user:1 result EX 3600
```

---

## Write Through Cache

Flow:

```text id="jz4b0f"
write to cache
write to database
```

Ensures cache consistency.

---

## Write Back Cache

Flow:

```text id="pgr97b"
write to cache
database updated later
```

Used in **high throughput systems**.

---

# 8. Session Store

Redis is often used for **user sessions**.

Example:

```text id="pgfwp8"
SET session:abc123 user_data EX 3600
```

Advantages:

* fast lookup
* automatic expiration
* scalable

---

# 9. Pub/Sub Messaging

Redis supports **publish-subscribe messaging**.

Publisher:

```text id="9obfc7"
PUBLISH chat "hello"
```

Subscriber:

```text id="x9yq4b"
SUBSCRIBE chat
```

Use cases:

* notifications
* chat systems
* live updates

---

# 10. Redis in Large Architectures

Typical modern architecture:

```text id="hy0d1p"
Users
  |
  v
API Gateway
  |
  v
Application Servers
  |
  +---- Redis Cache
  |
  +---- Redis Queue
  |
  +---- Redis Streams
  |
  +---- Database
```

Redis often becomes a **central infrastructure component**.

---

# Key Insight

Redis is used not just as a database but as:

```text id="px7h5e"
Cache
Queue
Lock manager
Stream processor
Real-time analytics engine
```

---

# Final Redis Knowledge Stack

To master Redis you should understand:

1. Redis architecture
2. Redis data structures
3. Persistence
4. Replication
5. Redis Cluster
6. Performance optimization
7. System design patterns

Once you understand these, you can design **high performance distributed systems using Redis**.

---

# What to Explore Next

Advanced Redis topics:

* Redis modules
* Redis AI
* Redis Bloom filters
* Redis time-series
* Redis graph database
* Redis vector search


# Redis Deep Dive — Part 8

# Redis in Modern AI Systems

Modern AI platforms use Redis as a **real-time infrastructure layer**.

Redis is used for:

1. Vector databases
2. Agent memory
3. AI pipelines
4. Task orchestration
5. Feature stores
6. Real-time analytics

---

# 1. Redis as a Vector Database

AI systems need to store **embeddings**.

Example embedding:

```text id="q9q7ok"
[0.12, 0.44, 0.98, ...]
```

Redis can store vectors using:

```text id="lgsjz0"
Redis Vector Similarity Search
```

Architecture:

```text id="sz1u3j"
User Query
     |
     v
Embedding Model
     |
     v
Vector
     |
     v
Redis Vector Index
     |
     v
Similar Documents
```

---

## Example Use Case

Semantic search.

Example:

User asks:

```text id="lyfbf5"
"best restaurants in Bangalore"
```

Steps:

```text id="imk2e4"
1. Convert query → embedding
2. Search vector index
3. Retrieve similar documents
```

---

## Redis Vector Query

Example:

```text id="pd99yt"
FT.SEARCH idx "*=>[KNN 10 @vector $query_vector]"
```

Returns the **closest vectors**.

---

# 2. Redis as Agent Memory

AI agents need **short-term memory**.

Example memory:

```text id="k8r5s0"
User: prefers vegetarian food
User: lives in Bangalore
```

Store in Redis:

```text id="x6yz1k"
SET agent:user123:memory {...}
```

Workflow:

```text id="5y8lcl"
User Query
   |
   v
Agent retrieves memory
   |
   v
LLM generates response
```

Redis provides **fast retrieval**.

---

# 3. Conversation Memory

Chat systems often store conversation history.

Example:

```text id="nh0lzz"
LPUSH chat:user123 message
```

Retrieve last messages:

```text id="hpo5rl"
LRANGE chat:user123 0 10
```

Used by:

* ChatGPT-like systems
* AI assistants
* support chatbots

---

# 4. AI Task Queues

AI workloads often require background processing.

Example tasks:

* embedding generation
* summarization
* indexing documents
* model inference

Redis queues handle these tasks.

Architecture:

```text id="38q1om"
Client
   |
   v
Redis Queue
   |
   v
Worker Nodes
```

Example:

```text id="gbrhce"
LPUSH tasks embedding_job
```

Worker:

```text id="p8z9pj"
BRPOP tasks
```

---

# 5. AI Pipeline Orchestration

Complex AI systems use pipelines.

Example pipeline:

```text id="5dskg3"
Document Upload
       |
       v
Embedding Generation
       |
       v
Vector Storage
       |
       v
Search Index
```

Redis Streams coordinate pipeline stages.

Example:

```text id="ic7mb6"
XADD pipeline doc_id 123 stage embedding
```

Workers consume tasks.

---

# 6. Redis Streams for AI Pipelines

Streams support **event-driven AI pipelines**.

Example architecture:

```text id="ptkqdw"
Producer → Redis Stream → AI Workers
```

Example:

```text id="r4rlh4"
XADD ai_pipeline * step embedding doc_id 10
```

Consumers process:

```text id="pohh0a"
embedding worker
indexing worker
summarization worker
```

---

# 7. Feature Store for ML

Machine learning models require **feature storage**.

Example features:

```text id="c4ud3s"
user_age
user_click_rate
purchase_history
```

Store in Redis:

```text id="o3dyvl"
HSET features:user123 age 25 click_rate 0.42
```

Advantages:

* fast retrieval
* real-time updates
* scalable

---

# 8. Real-Time Recommendation Systems

Example recommendation architecture:

```text id="rbbh7r"
User Action
    |
    v
Event Stream
    |
    v
Redis
    |
    v
Recommendation Engine
```

Redis stores:

* user vectors
* item vectors
* interaction history

---

# 9. AI Rate Limiting

LLM APIs often require rate limits.

Example:

```text id="0nbk1a"
100 requests per minute per user
```

Redis implementation:

```text id="9sv7nm"
INCR llm:user123
EXPIRE llm:user123 60
```

---

# 10. Distributed AI Systems

Large AI systems require distributed infrastructure.

Example architecture:

```text id="42o9pi"
Users
  |
  v
API Gateway
  |
  v
AI Orchestrator
  |
  +---- Redis Cache
  |
  +---- Redis Queue
  |
  +---- Redis Streams
  |
  +---- Vector Database
  |
  +---- GPU Workers
```

Redis acts as **the coordination layer**.

---

# 11. Redis for Agent Frameworks

Agent frameworks (LangChain, LangGraph) use Redis for:

* state storage
* memory
* queueing tasks
* tool execution logs

Example:

```text id="1phdnh"
agent:state:task123
```

Redis enables **multi-agent coordination**.

---

# 12. Redis vs Traditional Databases for AI

| Feature             | Redis        | SQL DB       |
| ------------------- | ------------ | ------------ |
| Latency             | microseconds | milliseconds |
| Vector search       | yes          | limited      |
| Real-time pipelines | yes          | limited      |
| Event streaming     | yes          | limited      |

Redis is optimized for **real-time AI workloads**.

---

# Key Insight

Modern AI systems often rely on Redis because it provides:

```text id="s6k54o"
ultra-low latency
real-time data structures
event streaming
distributed coordination
```

Redis often becomes the **central nervous system** of AI infrastructure.

---

# Final Redis Mastery Roadmap

To truly master Redis:

1. Internal architecture
2. Data structures
3. Persistence
4. Replication
5. Redis cluster
6. Performance engineering
7. System design patterns
8. AI infrastructure use cases

Once you understand these, Redis becomes a **powerful system design tool**, not just a database.


# Redis Deep Dive — Part 9

# Real Production Architectures Using Redis

Many large tech companies rely on Redis as a **core infrastructure component**.

Companies using Redis extensively:

* Uber
* Netflix
* Discord
* Twitter/X
* Pinterest
* Shopify
* GitHub

Redis is usually not the main database but acts as a **high-speed infrastructure layer**.

---

# 1. Uber Architecture

Uber handles millions of real-time requests:

* ride matching
* location updates
* surge pricing
* trip tracking

Redis is used for **real-time geospatial queries and caching**.

---

## Uber Ride Matching

Architecture:

```text
Driver App → API Gateway
                |
                v
        Redis Geo Index
                |
                v
        Nearby Drivers
```

Redis stores driver locations using:

```text
GEOADD drivers longitude latitude driver_id
```

Example:

```text
GEOADD drivers 77.5946 12.9716 driver_123
```

Find nearby drivers:

```text
GEORADIUS drivers 77.5946 12.9716 5 km
```

Redis allows Uber to find nearby drivers **in milliseconds**.

---

# 2. Netflix Architecture

Netflix uses Redis for:

* caching metadata
* session storage
* real-time personalization

Architecture:

```text
Users
   |
   v
API Gateway
   |
   v
Microservices
   |
   +---- Redis Cache
   |
   +---- Cassandra Database
```

Example:

User opens Netflix homepage.

Workflow:

```text
1. Check Redis cache
2. If hit → return recommendations
3. If miss → query database
4. Store in Redis
```

This reduces **database load massively**.

---

# 3. Discord Architecture

Discord supports **millions of real-time chat messages**.

Redis is used for:

* message queues
* pub/sub messaging
* session storage

---

## Discord Messaging Flow

Architecture:

```text
User Message
     |
     v
Gateway Server
     |
     v
Redis Pub/Sub
     |
     v
Chat Servers
```

Example:

Publisher:

```text
PUBLISH channel:123 "hello world"
```

Subscribers receive messages instantly.

Redis provides **low latency real-time messaging**.

---

# 4. Twitter/X Architecture

Twitter uses Redis for:

* timeline caching
* rate limiting
* trending analytics

---

## Timeline Caching

Architecture:

```text
User Request
     |
     v
Redis Timeline Cache
     |
     v
Database
```

Example cache key:

```text
timeline:user123
```

When user opens Twitter:

```text
GET timeline:user123
```

This prevents expensive DB queries.

---

# 5. Pinterest Architecture

Pinterest uses Redis for **recommendation systems**.

Redis stores:

* user features
* content embeddings
* ranking scores

Example:

```text
ZADD ranking:user123 score pin_456
```

Get top pins:

```text
ZREVRANGE ranking:user123 0 20
```

Sorted sets power **real-time ranking systems**.

---

# 6. Shopify Architecture

Shopify handles massive e-commerce traffic.

Redis is used for:

* session storage
* product caching
* rate limiting

Example session:

```text
SET session:user123 session_data EX 3600
```

This allows Shopify to support **high traffic stores**.

---

# 7. GitHub Architecture

GitHub uses Redis for:

* caching repository metadata
* job queues
* background workers

Example job queue:

```text
LPUSH jobs build_repo
```

Workers process jobs asynchronously.

---

# 8. Cloudflare Architecture

Cloudflare uses Redis for **rate limiting and security**.

Example:

```text
INCR ip:192.168.1.10
EXPIRE ip:192.168.1.10 60
```

If requests exceed limit:

```text
block IP
```

Redis enables **real-time DDoS protection**.

---

# 9. Common Redis Patterns in Big Tech

Across companies, Redis is commonly used for:

| Use Case      | Example             |
| ------------- | ------------------- |
| Caching       | API responses       |
| Session Store | user sessions       |
| Rate Limiting | API throttling      |
| Queues        | background jobs     |
| Pub/Sub       | real-time messaging |
| Leaderboards  | rankings            |
| Geo Queries   | location services   |

---

# 10. Typical Modern Architecture with Redis

Example production system:

```text
Users
   |
   v
Load Balancer
   |
   v
API Gateway
   |
   v
Application Servers
   |
   +---- Redis Cache
   |
   +---- Redis Queue
   |
   +---- Redis Streams
   |
   +---- Primary Database
```

Redis becomes the **high-speed middle layer**.

---

# 11. Why Companies Choose Redis

Redis advantages:

```text
microsecond latency
high throughput
rich data structures
simple deployment
horizontal scalability
```

These properties make Redis ideal for **real-time systems**.

---

# 12. Redis at Massive Scale

Large companies run **huge Redis clusters**.

Example:

```text
hundreds of Redis nodes
terabytes of RAM
millions of ops/sec
```

Redis clusters often support:

* global services
* AI pipelines
* real-time analytics

---

# Key Insight

Redis is rarely used as a standalone database.

Instead it acts as:

```text
the high-speed infrastructure layer
between applications and databases
```

This architecture enables **massive scalability**.

---

# Redis Knowledge Summary

You now understand:

1. Redis architecture
2. Redis data structures
3. Persistence mechanisms
4. Replication
5. Redis cluster
6. Performance engineering
7. System design patterns
8. AI infrastructure usage
9. Real-world architectures

With this knowledge you can design **production-grade distributed systems using Redis**.


# Redis Deep Dive — Part 10

# Advanced System Design Problems Solved Using Redis

Redis is often used to solve **distributed system problems**.

Below are common system design problems where Redis is the best tool.

---

# 1. Global Rate Limiting

Problem:

Limit API usage globally.

Example:

```text
100 requests per minute per user
```

Redis solution:

```text
INCR api:user123
EXPIRE api:user123 60
```

Flow:

```text
Client Request
      |
      v
Redis Counter
      |
      v
Allow / Reject Request
```

Used by:

* API gateways
* payment systems
* authentication services

---

# 2. Distributed Locking

Problem:

Multiple services try to update the same resource.

Example:

```text
two services processing the same order
```

Redis solution:

```text
SET lock:order123 serverA NX PX 10000
```

Meaning:

* only one service gets the lock
* lock expires automatically

Used in:

* payment systems
* inventory systems
* job schedulers

---

# 3. Distributed Job Queue

Problem:

Handle background jobs asynchronously.

Example:

```text
send emails
generate reports
process uploads
```

Redis solution:

```text
LPUSH jobs job_data
```

Workers consume jobs:

```text
BRPOP jobs
```

Architecture:

```text
Producer
   |
   v
Redis Queue
   |
   v
Worker Pool
```

---

# 4. Real-Time Leaderboards

Problem:

Maintain rankings in real time.

Example:

```text
gaming leaderboard
top influencers
top sellers
```

Redis solution:

```text
ZADD leaderboard 100 userA
ZADD leaderboard 200 userB
```

Top users:

```text
ZREVRANGE leaderboard 0 10 WITHSCORES
```

Ranking:

```text
ZRANK leaderboard userA
```

Time complexity:

```text
O(log N)
```

---

# 5. Real-Time Chat Systems

Problem:

Deliver messages instantly to millions of users.

Redis solution:

```text
Pub/Sub
```

Example:

Publisher:

```text
PUBLISH chat:room123 "hello"
```

Subscriber:

```text
SUBSCRIBE chat:room123
```

Architecture:

```text
User
 |
 v
Chat Server
 |
 v
Redis Pub/Sub
 |
 v
Connected Clients
```

Used by:

* Discord
* Slack
* messaging apps

---

# 6. Session Storage

Problem:

Store user session state.

Example:

```text
login session
authentication tokens
```

Redis solution:

```text
SET session:abc123 user_data EX 3600
```

Benefits:

* automatic expiration
* fast lookup
* scalable

Used by:

* web applications
* authentication services

---

# 7. Caching Layer

Problem:

Database becomes overloaded.

Solution:

Use Redis cache.

Architecture:

```text
Client
   |
   v
Redis Cache
   |
   v
Database
```

Flow:

```text
1. Check Redis
2. If cache miss → query DB
3. Store in Redis
```

This reduces DB load dramatically.

---

# 8. Distributed Counters

Problem:

Track metrics in real time.

Examples:

```text
page views
likes
downloads
```

Redis solution:

```text
INCR page_views
```

Example:

```text
pageviews:2026-03-17
```

Used in:

* analytics systems
* monitoring dashboards

---

# 9. Event Streaming Systems

Problem:

Process events in real time.

Example events:

```text
user_login
purchase
click_event
```

Redis solution:

```text
Redis Streams
```

Example:

```text
XADD events * user_id 123 action login
```

Workers consume events:

```text
XREADGROUP GROUP workers worker1 STREAMS events >
```

This enables **event-driven architectures**.

---

# 10. Real-Time Recommendation Systems

Problem:

Generate personalized recommendations quickly.

Example:

```text
recommended products
recommended videos
recommended posts
```

Redis solution:

Use sorted sets and feature storage.

Example:

```text
ZADD recommendations:user123 0.98 productA
ZADD recommendations:user123 0.76 productB
```

Get top recommendations:

```text
ZREVRANGE recommendations:user123 0 10
```

---

# 11. Distributed Task Scheduler

Problem:

Schedule tasks across multiple machines.

Example:

```text
send reminders
run background jobs
refresh caches
```

Redis solution:

```text
Sorted Sets with timestamps
```

Example:

```text
ZADD tasks timestamp task_id
```

Worker fetches tasks:

```text
ZRANGEBYSCORE tasks 0 current_time
```

---

# 12. Geo-Spatial Systems

Problem:

Find nearby objects.

Example:

```text
drivers near passenger
restaurants near location
```

Redis solution:

```text
GEOADD locations longitude latitude id
```

Query nearby:

```text
GEORADIUS locations lon lat 5 km
```

Used by:

* Uber
* food delivery apps
* logistics systems

---

# Redis System Design Superpower

Redis provides **building blocks for distributed systems**:

| Problem         | Redis Feature |
| --------------- | ------------- |
| Caching         | Strings       |
| Queues          | Lists         |
| Ranking         | Sorted Sets   |
| Messaging       | Pub/Sub       |
| Event Streaming | Streams       |
| Rate Limiting   | Counters      |
| Geo Queries     | Geo Index     |
| Scheduling      | Sorted Sets   |

---

# The Redis Mental Model

Think of Redis as:

```text
A real-time distributed data structure server
```

Instead of designing systems like:

```text
App → Database
```

Modern architecture:

```text
App
 |
 +---- Redis (real-time layer)
 |
 +---- Database (persistent layer)
```

Redis handles **speed**, database handles **durability**.

---

# Final Insight

Most large-scale systems follow this pattern:

```text
Users
  |
  v
API Servers
  |
  +---- Redis Layer
  |
  +---- Primary Database
```

Redis acts as:

```text
the performance accelerator for modern systems
```


