import dotenv from "dotenv"
dotenv.config()

// Mock Redis service for demo purposes (no Redis server required)
class MockRedis {
    constructor() {
        this.cache = new Map();
    }

    async get(key) {
        return this.cache.get(key) || null;
    }

    async set(key, value, expirationMode, time) {
        this.cache.set(key, value);

        // Optional: Auto-expire after time (if provided)
        if (expirationMode === 'EX' && time) {
            setTimeout(() => {
                this.cache.delete(key);
            }, time * 1000);
        }

        return 'OK';
    }

    async del(key) {
        return this.cache.delete(key) ? 1 : 0;
    }

    async exists(key) {
        return this.cache.has(key) ? 1 : 0;
    }

    async flushall() {
        this.cache.clear();
        return 'OK';
    }
}

export const redis = new MockRedis();