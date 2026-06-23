import { Redis } from '@upstash/redis';

// Provide a fallback dummy client for local development if env vars are missing,
// so the build doesn't crash completely, but warns.
const createRedisClient = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  if (!url || !token) {
    if (isProd) {
      // Return a proxy that throws on any method call or property access
      // to avoid failing during build/compilation, but fail-fast at runtime.
      return new Proxy({}, {
        get(target, prop) {
          throw new Error(`FATAL: Upstash Redis connection parameters (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) are missing in production environment. Redis operation attempted: ${String(prop)}`);
        }
      }) as unknown as Redis;
    }
    // Basic mock for local dev
    const store = new Map<string, any>();
    return {
      get: async (key: string) => store.get(key) || null,
      set: async (key: string, value: any, options?: any) => { 
        store.set(key, value); 
        return 'OK'; 
      },
      setex: async (key: string, ttl: number, value: any) => {
        store.set(key, value);
        setTimeout(() => store.delete(key), ttl * 1000);
        return 'OK';
      },
      incr: async (key: string) => {
        const val = (store.get(key) || 0) + 1;
        store.set(key, val);
        return val;
      },
      expire: async (key: string, ttl: number) => {
        setTimeout(() => store.delete(key), ttl * 1000);
        return 1;
      },
      del: async (key: string) => { 
        store.delete(key); 
        return 1; 
      },
      hincrby: async (key: string, field: string, incr: number) => { return 1; },
      hgetall: async (key: string) => ({}),
      pipeline: () => ({
        lpush: () => {},
        ltrim: () => {},
        exec: async () => []
      })
    } as unknown as Redis;
  }

  return new Redis({
    url,
    token,
  });
};

export const redis = createRedisClient();
