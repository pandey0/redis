# 🚩 Redis Quest: Interactive Learning Platform

Welcome to **Redis Quest**! This is a gamified, interactive application designed to help you visualize and master Redis, from basic commands to advanced architecture like Clusters and AI Vector search.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker & Docker Compose** (Required for the "Real Redis" mode)

### 1. Clone and Install
```bash
# Navigate to the project folder
cd redis-quest

# Install dependencies
npm install
```

### 2. Run the Application

You have two ways to experience Redis Quest:

#### Option A: The Simulator (No Docker needed)
Perfect for a quick start without installing Redis locally.
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173)
- Ensure the mode at the top is set to **"Simulator"**.

#### Option B: Real Redis Mode (Recommended)
Visualizes data from an actual running Redis instance.
```bash
# Start the Redis stack (Redis Server + Backend Proxy)
docker compose up --build -d

# Start the React frontend
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173)
- Click the **"Real Redis"** button in the header.
- Look for the green indicator (🟢) to confirm connection.

---

## 🎮 How to Play

1.  **Read the Mission**: The left panel contains theory and concepts extracted from the Redis Deep Dive guide.
2.  **Take the Challenge**: At the bottom of the left panel, you'll see an "Active Challenge".
3.  **Execute Commands**: Type the required Redis command in the **Terminal** (bottom center).
4.  **Visualize**: Watch the **Memory Pool** (right panel) update in real-time. It shows internal encodings like `SDS`, `QuickList`, and `SkipList`.
5.  **Level Up**: Complete challenges to earn XP and unlock the next mission!

---

## 🛠 Project Structure

- `/src/hooks/useRedisSimulator.ts`: The logic for the virtual Redis engine.
- `/src/hooks/useRealRedis.ts`: Logic to connect to the live Docker backend.
- `/server/index.ts`: Node.js proxy that communicates with the real Redis instance.
- `/src/data/levels.ts`: Contains all the educational content and challenges.
- `docker-compose.yml`: Orchestrates the Redis container and the proxy server.

---

## 🛑 Troubleshooting

- **Indicator is Red (🔴) in Real Redis mode**:
    - Ensure Docker is running: `docker ps` should show `redis-quest-backend-1` and `redis-quest-redis-1`.
    - Check backend logs: `docker compose logs backend`.
- **Port Conflicts**:
    - If port `5173`, `3001`, or `6379` is already in use, ensure you stop other services running on those ports.

---

## 📜 License
Educational project based on the Redis Learning Guide.
