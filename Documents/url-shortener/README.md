# High-Performance URL Shortener Service

A lightweight, collision-free URL shortening web service built with Node.js, Express, SQLite, and Redis caching.

## 🚀 Features

- **Deterministic Base62 Encoding:** Converts auto-incremented database identifiers into collision-free alphanumeric keys.
- **In-Memory Caching (Cache-Aside):** Speeds up link redirection and offloads the database using Redis with a 1-hour TTL.
- **Graceful Fallback:** Automatically falls back to SQLite redirection if the Redis connection drops, preventing system downtime.
- **Clean Web Interface:** Minimalist, responsive UI to shorten links and copy results with one click.
- **Cross-Platform Compatibility:** Runs seamlessly across macOS, Linux, and Windows environments.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Cache:** Redis (via Upstash Cloud / `ioredis`)
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (Fetch API)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd url-shortener
npm install